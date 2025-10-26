# User Code Submission Schema Plan

## 1. New Tables

### `submissions` table
Main submission tracking with polling support:

```sql
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    runtime_ms INTEGER,
    memory_used_mb DECIMAL(10,2),
    test_cases_passed INTEGER DEFAULT 0,
    test_cases_total INTEGER NOT NULL,
    error_message TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,

    CONSTRAINT valid_status CHECK (status IN (
        'pending', 'running', 'accepted', 'wrong_answer',
        'time_limit_exceeded', 'memory_limit_exceeded',
        'runtime_error', 'compilation_error'
    ))
);

CREATE INDEX idx_submissions_user_problem_status ON submissions(user_id, problem_id, status);
CREATE INDEX idx_submissions_status_submitted ON submissions(status, submitted_at);
CREATE INDEX idx_submissions_user_submitted ON submissions(user_id, submitted_at DESC);
```

**Fields:**
- `id` - Unique submission identifier
- `user_id` - Foreign key to users table
- `problem_id` - Foreign key to problems table
- `code` - User's submitted code
- `language` - Programming language (python, java, cpp, etc.)
- `status` - Current execution status for polling
- `runtime_ms` - Execution time in milliseconds (nullable until completed)
- `memory_used_mb` - Memory usage in MB (nullable until completed)
- `test_cases_passed` - Number of test cases passed (summary only)
- `test_cases_total` - Total number of test cases
- `error_message` - Error details if compilation/runtime error occurred
- `submitted_at` - When submission was created
- `completed_at` - When execution finished (nullable until completed)

**Indexes:**
- `(user_id, problem_id, status)` - Check if user has prior accepted submissions
- `(status, submitted_at)` - Worker polling for pending jobs
- `(user_id, submitted_at DESC)` - User submission history

---

### `user_statistics` table
Cached aggregated stats for performance:

```sql
CREATE TABLE user_statistics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_submissions INTEGER NOT NULL DEFAULT 0,
    total_accepted INTEGER NOT NULL DEFAULT 0,
    easy_solved INTEGER NOT NULL DEFAULT 0,
    medium_solved INTEGER NOT NULL DEFAULT 0,
    hard_solved INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Fields:**
- `user_id` - Primary key, foreign key to users table
- `total_submissions` - Total number of submissions ever made
- `total_accepted` - Total number of accepted submissions
- `easy_solved` - Count of unique easy problems solved
- `medium_solved` - Count of unique medium problems solved
- `hard_solved` - Count of unique hard problems solved
- `current_streak` - Current consecutive days with at least one accepted submission
- `longest_streak` - Longest streak ever achieved
- `last_activity_date` - Last date user had an accepted submission (for streak calculation)
- `updated_at` - Last update timestamp

**No additional indexes needed** - Single row per user, always queried by PK

---

### `daily_activity` table
For heatmap (unique problems attempted per day):

```sql
CREATE TABLE daily_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    problems_attempted INTEGER NOT NULL DEFAULT 0,
    submissions_count INTEGER NOT NULL DEFAULT 0,
    accepted_count INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT unique_user_date UNIQUE(user_id, activity_date)
);

CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, activity_date DESC);
```

**Fields:**
- `id` - Primary key
- `user_id` - Foreign key to users table
- `activity_date` - The date of activity
- `problems_attempted` - Count of unique problems worked on that day (for heatmap)
- `submissions_count` - Total submissions made that day
- `accepted_count` - Number of accepted submissions that day

**Constraints:**
- Unique on `(user_id, activity_date)` - One row per user per day

**Indexes:**
- `(user_id, activity_date DESC)` - Efficient heatmap queries for last 365 days

---

## 2. Updates to Existing Tables

### `problems` table
**Already has these fields** (just increment them):
- `submissions` (INTEGER) - Increment on every submission
- `accepted` (INTEGER) - Increment on first accepted submission per user

### `users` table (optional enhancement)
**Consider adding:**
```sql
ALTER TABLE users ADD COLUMN last_submission_at TIMESTAMP;
```
- `last_submission_at` - Quick access for recent activity filtering

---

## 3. Submission Flow (Polling-based)

### Step-by-step flow:

#### 1. User Submits Code
**Endpoint:** `POST /api/submissions`

**Request:**
```json
{
  "problem_id": "uuid",
  "code": "print(input())",
  "language": "python"
}
```

**Actions:**
1. Create submission record with `status='pending'`
2. Set `submitted_at` to current timestamp
3. Fetch test cases and set `test_cases_total`
4. Increment `problems.submissions` counter
5. Return submission ID to frontend

**Response:**
```json
{
  "submission_id": "uuid",
  "status": "pending"
}
```

---

#### 2. Worker Picks Up Job
**Worker polling query:**
```sql
SELECT * FROM submissions
WHERE status='pending'
ORDER BY submitted_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;
```

**Actions:**
1. Update submission to `status='running'`
2. Execute code in Docker container
3. Collect results (runtime, memory, test results)
4. Update submission with final status and metrics
5. Set `completed_at` timestamp

---

#### 3. Frontend Polls for Results
**Endpoint:** `GET /api/submissions/{id}`

**Polling strategy:**
- Poll every 1-2 seconds
- Max polling duration: 30 seconds
- Stop when status is not 'pending' or 'running'

**Response:**
```json
{
  "id": "uuid",
  "status": "accepted",
  "runtime_ms": 142,
  "memory_used_mb": 12.5,
  "test_cases_passed": 10,
  "test_cases_total": 10,
  "submitted_at": "2025-01-15T10:30:00Z",
  "completed_at": "2025-01-15T10:30:02Z"
}
```

---

#### 4. On Completion (Backend Triggers)

When submission completes, trigger these updates:

1. **Update problems table:**
   - Increment `submissions` count (already done on submit)
   - If first accepted for this user: increment `accepted` count

2. **Update user_statistics:**
   - Increment `total_submissions`
   - If accepted: increment `total_accepted` and difficulty counter
   - If accepted: run streak calculation logic
   - Update `updated_at`

3. **Upsert daily_activity:**
   - Calculate unique problems attempted today
   - Increment submissions count
   - If accepted: increment accepted count

---

## 4. Streak Calculation Logic

**Rule:** At least one accepted submission per day to maintain streak

### Algorithm on each accepted submission:

```
1. Fetch user_statistics for user
2. Get last_activity_date
3. Calculate streak:

   IF last_activity_date IS NULL:
       current_streak = 1

   ELSE IF last_activity_date == TODAY:
       // Already counted today, no change
       RETURN

   ELSE IF last_activity_date == YESTERDAY:
       current_streak = current_streak + 1

   ELSE:
       // Streak broken
       current_streak = 1

4. Update longest_streak:
   IF current_streak > longest_streak:
       longest_streak = current_streak

5. Update last_activity_date = TODAY

6. Save user_statistics
```

### Implementation Notes:

**Timezone Handling:**
- Use UTC consistently for all dates
- Or store user timezone and calculate dates in their local time

**Edge Cases:**
- Multiple accepted submissions same day: Only count once (check if last_activity_date == TODAY)
- Backdating prevention: Validate `submitted_at` is within reasonable range

**Grace Period (Optional):**
- Add 24-48 hour grace period for forgiveness
- Instead of YESTERDAY, check if `last_activity_date >= TODAY - 2 days`

---

## 5. Heatmap Data Structure

### API Endpoint
**Endpoint:** `GET /api/users/{id}/heatmap?days=365`

### Response Format:
```json
{
  "user_id": "uuid",
  "heatmap": [
    { "date": "2025-01-15", "count": 3 },
    { "date": "2025-01-16", "count": 5 },
    { "date": "2025-01-17", "count": 1 }
  ]
}
```

### Query:
```sql
SELECT activity_date, problems_attempted as count
FROM daily_activity
WHERE user_id = $1
  AND activity_date >= CURRENT_DATE - INTERVAL '365 days'
ORDER BY activity_date ASC;
```

### Update Logic (on each submission):

**Approach 1: Count-based (lightweight)**
```sql
INSERT INTO daily_activity (user_id, activity_date, problems_attempted, submissions_count, accepted_count)
VALUES ($user_id, CURRENT_DATE, 1, 1, $is_accepted)
ON CONFLICT (user_id, activity_date)
DO UPDATE SET
  submissions_count = daily_activity.submissions_count + 1,
  accepted_count = daily_activity.accepted_count + $is_accepted;
```

Then periodically recalculate `problems_attempted`:
```sql
UPDATE daily_activity
SET problems_attempted = (
  SELECT COUNT(DISTINCT problem_id)
  FROM submissions
  WHERE user_id = daily_activity.user_id
    AND DATE(submitted_at) = daily_activity.activity_date
)
WHERE activity_date = CURRENT_DATE;
```

**Approach 2: Real-time tracking (accurate)**
- Maintain a separate `daily_problems_attempted` table with `(user_id, activity_date, problem_id)` unique constraint
- On submission: `INSERT IGNORE` into this table
- Count rows per day for heatmap
- More storage but always accurate

---

## 6. Problem Statistics Updates

### On ANY submission:
```sql
UPDATE problems
SET submissions = submissions + 1
WHERE id = $problem_id;
```

### On FIRST accepted submission per user:

**Check if first acceptance:**
```sql
SELECT EXISTS(
  SELECT 1 FROM submissions
  WHERE user_id = $user_id
    AND problem_id = $problem_id
    AND status = 'accepted'
    AND id != $current_submission_id  -- Exclude current submission
  LIMIT 1
) as has_prior_acceptance;
```

**If false (first acceptance), increment counter:**
```sql
UPDATE problems
SET accepted = accepted + 1
WHERE id = $problem_id;
```

### User statistics updates on accepted:

**Increment difficulty-specific counter:**
```sql
-- First get problem difficulty
SELECT difficulty FROM problems WHERE id = $problem_id;

-- Update user stats
UPDATE user_statistics
SET
  total_accepted = total_accepted + 1,
  easy_solved = easy_solved + CASE WHEN $difficulty = 'easy' THEN 1 ELSE 0 END,
  medium_solved = medium_solved + CASE WHEN $difficulty = 'medium' THEN 1 ELSE 0 END,
  hard_solved = hard_solved + CASE WHEN $difficulty = 'hard' THEN 1 ELSE 0 END,
  updated_at = NOW()
WHERE user_id = $user_id;
```

**Note:** Only increment difficulty counters on first acceptance (check using same logic as above)

---

## 7. Additional Considerations

### Performance Optimizations:

1. **Worker Polling:**
   - Use `FOR UPDATE SKIP LOCKED` to prevent race conditions
   - Multiple workers can poll simultaneously without conflicts

2. **Index Strategies:**
   - `(status, submitted_at)` index critical for worker performance
   - `(user_id, problem_id, status)` for fast deduplication checks
   - Consider partial index: `WHERE status IN ('pending', 'running')` for worker

3. **Table Partitioning:**
   - If submissions grow large (>10M rows), partition by month:
   ```sql
   CREATE TABLE submissions_2025_01 PARTITION OF submissions
   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
   ```

4. **Caching:**
   - Cache `user_statistics` in Redis (TTL: 5 minutes)
   - Cache recent submissions per user (TTL: 30 seconds)
   - Invalidate on new submission

5. **Materialized Views:**
   - If leaderboard queries get slow, use materialized view:
   ```sql
   CREATE MATERIALIZED VIEW user_rankings AS
   SELECT user_id, total_accepted, current_streak, ...
   FROM user_statistics
   ORDER BY total_accepted DESC;

   REFRESH MATERIALIZED VIEW CONCURRENTLY user_rankings;
   ```

---

### Data Retention:

1. **Submissions:**
   - Keep all submissions indefinitely (user history)
   - Archive old submissions (>1 year) to cold storage if needed
   - Use partitioning for efficient archival

2. **Daily Activity:**
   - Retain all time (small storage footprint)
   - ~365 rows per user per year

3. **User Statistics:**
   - Never delete, only update

---

### Rate Limiting:

**Strategy:**
- Track submission count per user per minute
- Use Redis for rate limit state
- Enforce at API level before creating submission

**Implementation:**
```
Key: rate_limit:submission:{user_id}
Value: submission_count
TTL: 60 seconds

On submit:
1. INCR rate_limit:submission:{user_id}
2. If first increment: EXPIRE 60
3. If count > 10: Return 429 Too Many Requests
4. Otherwise: Create submission
```

**Limits:**
- 10 submissions per minute per user
- 100 submissions per hour per user (optional)

---

### Polling Optimization:

**Exponential Backoff:**
```javascript
const pollIntervals = [1000, 1500, 2000, 3000, 5000]; // ms
let attemptCount = 0;

function pollSubmission(id) {
  const interval = pollIntervals[Math.min(attemptCount, pollIntervals.length - 1)];
  setTimeout(async () => {
    const result = await fetchSubmission(id);
    if (result.status === 'pending' || result.status === 'running') {
      attemptCount++;
      pollSubmission(id);
    } else {
      displayResults(result);
    }
  }, interval);
}
```

**Max Polling Duration:**
- Stop after 30 seconds
- Show timeout error to user
- Submission may still complete in background

**Future Enhancement - WebSocket:**
- Replace polling with WebSocket for real-time updates
- Worker publishes results to Redis pub/sub
- API server subscribes and broadcasts to connected clients

---

### Future Contest Support:

**Schema Changes:**
```sql
ALTER TABLE submissions
ADD COLUMN contest_id UUID REFERENCES contests(id),
ADD COLUMN is_contest_submission BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_submissions_contest ON submissions(contest_id, user_id, submitted_at);
```

**Contest Statistics:**
- Separate counters for contest submissions in problems table
- Contest-specific leaderboards
- Time-based filtering for contest period
- Penalty calculation for wrong submissions during contest

**Daily Activity Filter:**
- Filter by contest date range for contest-specific heatmaps
- Example: "How active was user during contest week?"

---

### Edge Cases & Error Handling:

1. **Concurrent Submissions:**
   - User submits same problem twice quickly
   - Both counted in `problems.submissions`
   - Only first accepted increments `problems.accepted`
   - Use database transaction isolation to prevent race

2. **Problem Difficulty Change:**
   - Historical stats don't retroactively change
   - User keeps credit for difficulty at submission time
   - Consider adding `difficulty_at_submission` to submissions table

3. **User Timezone Changes:**
   - Use consistent timezone (UTC) for all date calculations
   - Display dates in user's local timezone on frontend only

4. **Deleted Problems:**
   - `ON DELETE CASCADE` removes all submissions
   - Or use soft delete: `problems.deleted_at` and filter queries
   - Consider archiving before deletion

5. **Deleted Users:**
   - `ON DELETE CASCADE` removes all related data
   - Or anonymize: Keep submissions but set user_id to NULL
   - Update problem statistics accordingly

6. **Worker Crashes:**
   - Submission stuck in 'running' status
   - Implement timeout watchdog:
   ```sql
   UPDATE submissions
   SET status = 'runtime_error',
       error_message = 'Execution timeout',
       completed_at = NOW()
   WHERE status = 'running'
     AND submitted_at < NOW() - INTERVAL '5 minutes';
   ```

7. **Database Failures:**
   - Submission created but worker can't read it
   - Use message queue (RabbitMQ, Redis) instead of database polling
   - Ensures at-least-once delivery

---

## 8. Migration Order

### Step 1: Create New Tables
```sql
-- migrations/YYYYMMDDHHMMSS_create_submissions.sql
CREATE TABLE submissions (...);
CREATE INDEX ...;
```

### Step 2: Create User Statistics
```sql
-- migrations/YYYYMMDDHHMMSS_create_user_statistics.sql
CREATE TABLE user_statistics (...);

-- Initialize with zeros for existing users
INSERT INTO user_statistics (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;
```

### Step 3: Create Daily Activity
```sql
-- migrations/YYYYMMDDHHMMSS_create_daily_activity.sql
CREATE TABLE daily_activity (...);
CREATE INDEX ...;
```

### Step 4: Update Existing Tables (Optional)
```sql
-- migrations/YYYYMMDDHHMMSS_add_user_last_submission.sql
ALTER TABLE users ADD COLUMN last_submission_at TIMESTAMP;
```

### Step 5: Backfill Data (If Historical Data Exists)
```sql
-- If you have prior submission data in another system:
-- Backfill user_statistics from historical data
-- Backfill daily_activity
-- Update problem counters
```

### Step 6: Create Database Functions (Optional)
```sql
-- Function to update statistics on submission completion
CREATE OR REPLACE FUNCTION update_submission_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Update user stats, problem stats, daily activity
    -- Calculate streaks
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submission_completed
AFTER UPDATE ON submissions
FOR EACH ROW
WHEN (NEW.status != OLD.status)
EXECUTE FUNCTION update_submission_statistics();
```

---

## 9. API Endpoints Needed

### Submission Endpoints:

**1. Submit Code**
- `POST /api/submissions`
- Body: `{ problem_id, code, language }`
- Returns: `{ submission_id, status }`

**2. Poll Submission Status**
- `GET /api/submissions/{id}`
- Returns: Full submission object with results

**3. Get User Submissions**
- `GET /api/users/{id}/submissions?page=1&limit=20&problem_id=uuid`
- Returns: Paginated list of submissions
- Filters: problem_id, status, language, date range

**4. Get Problem Submissions (Admin)**
- `GET /api/problems/{id}/submissions?page=1&limit=20`
- Returns: All submissions for a problem
- Requires admin role

---

### Statistics Endpoints:

**5. Get User Statistics**
- `GET /api/users/{id}/statistics`
- Returns: User stats from `user_statistics` table
```json
{
  "total_submissions": 150,
  "total_accepted": 45,
  "easy_solved": 20,
  "medium_solved": 20,
  "hard_solved": 5,
  "current_streak": 7,
  "longest_streak": 14,
  "last_activity_date": "2025-01-22"
}
```

**6. Get User Heatmap**
- `GET /api/users/{id}/heatmap?days=365`
- Returns: Daily activity for heatmap visualization
```json
{
  "heatmap": [
    { "date": "2025-01-15", "count": 3 },
    ...
  ]
}
```

**7. Get User Solved Problems**
- `GET /api/users/{id}/solved?difficulty=easy`
- Returns: List of problems user has solved (accepted)
- Filters: difficulty, tags

---

## 10. Summary

### Core Tables:
1. **submissions** - Main submission tracking with polling support
2. **user_statistics** - Cached user stats for performance
3. **daily_activity** - Heatmap data (unique problems per day)

### Key Features:
- **Polling-based execution** - Frontend polls submission status
- **Streak tracking** - At least one accepted per day
- **Heatmap** - Unique problems attempted per day
- **Problem stats** - Auto-increment submissions/accepted counters

### Performance Considerations:
- Strategic indexing for worker polling and deduplication
- Cached statistics to avoid expensive aggregations
- Rate limiting to prevent abuse
- Partitioning for large-scale data

### Future-Proof:
- Ready for contest support (add contest_id column)
- Can migrate to WebSocket for real-time updates
- Extensible for leaderboards and rankings

---

## Next Steps

1. Review and approve this schema design
2. Create goose migration files for each table
3. Implement submission API endpoints
4. Update worker to poll from database
5. Implement statistics calculation logic
6. Build frontend polling mechanism
7. Add rate limiting middleware
8. Test end-to-end submission flow
