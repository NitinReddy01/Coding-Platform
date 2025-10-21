/**
 * Problem Details Form Component
 *
 * Form section for entering basic problem information like title, description,
 * difficulty, constraints, and execution limits.
 *
 * @module components/problem-form/ProblemDetailsForm
 */

import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/select';
import type { ProblemFormData, FormErrors } from '../../types/problem-form';
import type { Difficulty } from '../../types/problem';

interface ProblemDetailsFormProps {
  data: ProblemFormData;
  errors: FormErrors;
  onUpdate: <K extends keyof ProblemFormData>(field: K, value: ProblemFormData[K]) => void;
}

/**
 * Form for problem basic details
 */
export const ProblemDetailsForm: React.FC<ProblemDetailsFormProps> = ({
  data,
  errors,
  onUpdate,
}) => {
  const difficultyOptions: { value: Difficulty; label: string }[] = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title" required>
          Problem Title
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="e.g., Two Sum"
          value={data.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          error={!!errors.title}
          maxLength={200}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-destructive">{errors.title}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {data.title.length}/200 characters
        </p>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" required>
          Problem Description
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the problem in detail. You can use markdown formatting."
          value={data.description}
          onChange={(e) => onUpdate('description', e.target.value)}
          error={!!errors.description}
          rows={10}
          className="font-mono text-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {data.description.length}/10000 characters | Markdown supported
        </p>
      </div>

      {/* Difficulty */}
      <div>
        <Label htmlFor="difficulty" required>
          Difficulty Level
        </Label>
        <Select
          value={data.difficulty}
          onChange={(e) => onUpdate('difficulty', e.target.value as Difficulty)}
        >
          {difficultyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        {errors.difficulty && (
          <p className="mt-1 text-sm text-destructive">{errors.difficulty}</p>
        )}
      </div>

      {/* Execution Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Limit */}
        <div>
          <Label htmlFor="time_limit" required>
            Time Limit (ms)
          </Label>
          <Input
            id="time_limit"
            type="number"
            placeholder="2000"
            value={data.time_limit}
            onChange={(e) => onUpdate('time_limit', parseInt(e.target.value) || 0)}
            error={!!errors.time_limit}
            min={100}
            max={10000}
            step={100}
          />
          {errors.time_limit && (
            <p className="mt-1 text-sm text-destructive">{errors.time_limit}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Range: 100-10000 ms
          </p>
        </div>

        {/* Memory Limit */}
        <div>
          <Label htmlFor="memory_limit" required>
            Memory Limit (MB)
          </Label>
          <Input
            id="memory_limit"
            type="number"
            placeholder="256"
            value={data.memory_limit}
            onChange={(e) => onUpdate('memory_limit', parseInt(e.target.value) || 0)}
            error={!!errors.memory_limit}
            min={16}
            max={512}
            step={16}
          />
          {errors.memory_limit && (
            <p className="mt-1 text-sm text-destructive">{errors.memory_limit}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Range: 16-512 MB
          </p>
        </div>
      </div>

      {/* Constraints (Optional) */}
      <div>
        <Label htmlFor="constraints">
          Constraints <span className="text-muted-foreground text-sm">(Optional)</span>
        </Label>
        <Textarea
          id="constraints"
          placeholder="e.g., 1 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9"
          value={data.constraints || ''}
          onChange={(e) => onUpdate('constraints', e.target.value || undefined)}
          error={!!errors.constraints}
          rows={4}
          className="font-mono text-sm"
        />
        {errors.constraints && (
          <p className="mt-1 text-sm text-destructive">{errors.constraints}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Input/output constraints, variable ranges, etc.
        </p>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex gap-2">
          <span className="text-primary">💡</span>
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium mb-1">
              Tips for Writing a Good Problem
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Use clear and concise language</li>
              <li>• Include examples in the description</li>
              <li>• Specify all edge cases in constraints</li>
              <li>• Set reasonable time and memory limits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
