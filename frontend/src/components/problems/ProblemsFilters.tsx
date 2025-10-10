import { useDispatch, useSelector } from 'react-redux';
import { Search, X, Filter } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Select } from '../ui/dropdown';
import { Button } from '../ui/button';
import type { RootState } from '../../store/store';
import {
  setSearch,
  setDifficulty,
  setStatus,
  addTag,
  removeTag,
  clearFilters,
} from '../../store/slices/problemsSlice';
import { getAllTags } from '../../constants/mockProblemsData';
import { cn } from '../../lib/utils';

interface ProblemsFiltersProps {
  className?: string;
}

export function ProblemsFilters({ className }: ProblemsFiltersProps) {
  const dispatch = useDispatch();
  const { filters } = useSelector((state: RootState) => state.problems);
  const allTags = getAllTags();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearch(e.target.value));
  };

  const handleDifficultyChange = (value: string) => {
    dispatch(setDifficulty(value as any));
  };

  const handleStatusChange = (value: string) => {
    dispatch(setStatus(value as any));
  };

  const handleTagToggle = (tagId: string) => {
    if (filters.tags.includes(tagId)) {
      dispatch(removeTag(tagId));
    } else {
      dispatch(addTag(tagId));
    }
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.difficulty !== 'all' ||
    filters.status !== 'all' ||
    filters.tags.length > 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-text" />
          <h2 className="text-lg font-semibold text-text">Filters</h2>
        </div>
        {hasActiveFilters && (
          <Button
            onClick={handleClearFilters}
            variant="ghost"
            size="sm"
            className="text-sm text-muted-text hover:text-text"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by title, ID, or tag..."
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-md text-sm text-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">Difficulty</label>
        <Select
          value={filters.difficulty}
          onChange={handleDifficultyChange}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Easy', value: 'easy' },
            { label: 'Medium', value: 'medium' },
            { label: 'Hard', value: 'hard' },
          ]}
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">Status</label>
        <Select
          value={filters.status}
          onChange={handleStatusChange}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Solved', value: 'solved' },
            { label: 'Attempted', value: 'attempted' },
            { label: 'Unsolved', value: 'unsolved' },
          ]}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Tags {filters.tags.length > 0 && `(${filters.tags.length})`}
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allTags.map((tag) => {
            const isSelected = filters.tags.includes(tag.id);
            return (
              <label
                key={tag.id}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleTagToggle(tag.id)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-sm text-text">{tag.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Active Filters */}
      {filters.tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text mb-2">Active Tags</label>
          <div className="flex flex-wrap gap-2">
            {filters.tags.map((tagId) => {
              const tag = allTags.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <Badge
                  key={tagId}
                  variant="secondary"
                  className="flex items-center gap-1 cursor-pointer hover:bg-destructive/10"
                  onClick={() => dispatch(removeTag(tagId))}
                >
                  {tag.name}
                  <X className="w-3 h-3" />
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
