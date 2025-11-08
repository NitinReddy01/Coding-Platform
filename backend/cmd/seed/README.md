# Admin User Seeding

This directory contains tools for seeding an admin user into both Supabase Auth and the backend database.

## ✨ Automatic Seeding

**Good news!** Admin seeding runs **automatically** when you start the server:

```bash
cd backend
go run cmd/server/main.go
```

The server will:
1. Run database migrations
2. **Auto-seed admin user** (if doesn't exist)
3. Start HTTP server

If the admin already exists, seeding is skipped silently. **No action required!**

## Manual Seeding (Optional)

You can also run the seeding script manually:

```bash
cd backend
go run cmd/seed/main.go
```

This is useful for:
- Testing seeding logic
- Creating admin before first server run
- Re-seeding after database reset

## Admin User Credentials

**Default credentials:**
- Email: `nitin@gmail.com`
- Password: `admin123`
- Name: `Admin User`
- Role: `admin`

⚠️ **IMPORTANT**: Change the password after first login!

### Customizing Credentials

Edit `backend/internal/seed/admin.go`:

```go
const (
    AdminEmail    = "your-admin@example.com"
    AdminPassword = "your-secure-password"
    AdminName     = "Your Admin Name"
    AdminRole     = "admin"
)
```

## How It Works

### Smart Idempotent Seeding

The seeding logic checks:

1. **Does admin exist in Supabase?**
   - YES → Skip Supabase creation
   - NO → Create in Supabase

2. **Does admin exist in backend database?**
   - YES → Skip database creation
   - NO → Create in database

3. **Does admin have admin role?**
   - YES → Done!
   - NO → Assign admin role

This means:
- ✅ Safe to run multiple times
- ✅ No duplicate users
- ✅ Server can restart without issues
- ✅ Works with existing admins

### Server Startup Flow

```
Server Starts
    ↓
Run Migrations
    ↓
Connect to Database
    ↓
Seed Admin (silent if exists)
    ↓
Initialize Services
    ↓
Start HTTP Server
```

## Environment Variables

Required in `.env`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
DATABASE_URL=postgres://user:password@localhost:5432/coding_platform?sslmode=disable
```

## Troubleshooting

### Server fails to start with seeding error

Check logs for specific error. Common issues:

**"Failed to create Supabase admin user"**
- Verify `SUPABASE_SERVICE_KEY` is the **service role key**, not the anon key
- Check Supabase project URL is correct
- Ensure Auth is enabled in your Supabase project

**"Failed to create admin user in backend"**
- Ensure database migrations have run
- Verify `roles` table has an "admin" role
- Check database connection

### Want to disable auto-seeding?

Comment out the seeding call in `cmd/server/main.go`:

```go
// Seed admin user automatically on startup
// if err := seed.SeedAdminUser(config, false); err != nil {
//     log.Printf("⚠️  Warning: Failed to seed admin user: %v", err)
//     log.Println("Continuing server startup...")
// }
```

## Production Deployment

### Security Best Practices

1. **DO NOT commit** admin credentials to version control
2. Use environment variables for credentials
3. Change default password immediately after deployment
4. Use strong passwords (generate with `openssl rand -base64 32`)
5. Consider using a secrets manager (AWS Secrets Manager, HashiCorp Vault)

### Deployment Platforms

**Render/Heroku/Railway:**
- Seeding runs automatically on every deploy
- Set environment variables in platform settings
- Admin user created on first deploy
- Subsequent deploys skip seeding (user exists)

**Docker:**
- Seeding runs when container starts
- Set environment variables in docker-compose.yml or .env
- Safe to restart containers

**VPS/Bare Metal:**
- Seeding runs on server start
- Set environment variables in systemd service or .env
- Safe to restart service

## Next Steps

After seeding:
1. Login with admin credentials at `/login`
2. Navigate to profile settings
3. Change the default password
4. Create additional admin users if needed
5. Explore admin features
