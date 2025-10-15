import { useDispatch, useSelector } from 'react-redux';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Select } from '../ui/dropdown';
import type { RootState } from '../../store/store';
import {
  setStatusFilter,
  setLanguageFilter,
  setProblemFilter,
  setDateRange,
  clearFilters,
} from '../../store/slices/submissionsSlice';

export function SubmissionsFilters() {
  const dispatch = useDispatch();
  const { filters } = useSelector((state: RootState) => state.submissions);

  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Wrong Answer', value: 'wrong_answer' },
    { label: 'Time Limit Exceeded', value: 'time_limit_exceeded' },
    { label: 'Memory Limit Exceeded', value: 'memory_limit_exceeded' },
    { label: 'Runtime Error', value: 'runtime_error' },
    { label: 'Compilation Error', value: 'compilation_error' },
  ];

  const languageOptions = [
    { label: 'All Languages', value: 'all' },
    { label: 'Python', value: 'python' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'Java', value: 'java' },
    { label: 'C++', value: 'cpp' },
    { label: 'Go', value: 'go' },
    { label: 'Rust', value: 'rust' },
  ];

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // Count active filters
  const activeFiltersCount =
    (filters.status !== 'all' ? 1 : 0) +
    (filters.language !== 'all' ? 1 : 0) +
    (filters.problem ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/20">
            <Filter className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Filters</h3>
        </div>
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{activeFiltersCount} active</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-7 px-2 text-xs hover:text-destructive"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Problem Search */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Problem
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.problem}
            onChange={(e) => dispatch(setProblemFilter(e.target.value))}
            placeholder="Search by problem name..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-smooth"
          />
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Status
        </label>
        <Select
          value={filters.status}
          onChange={(value) => dispatch(setStatusFilter(value as any))}
          options={statusOptions}
          placeholder="Select status"
        />
      </div>

      {/* Language Filter */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Language
        </label>
        <Select
          value={filters.language}
          onChange={(value) => dispatch(setLanguageFilter(value))}
          options={languageOptions}
          placeholder="Select language"
        />
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Date Range
        </label>
        <div className="space-y-2">
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) =>
              dispatch(
                setDateRange({
                  dateFrom: e.target.value || null,
                  dateTo: filters.dateTo,
                })
              )
            }
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-smooth"
            placeholder="From date"
          />
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) =>
              dispatch(
                setDateRange({
                  dateFrom: filters.dateFrom,
                  dateTo: e.target.value || null,
                })
              )
            }
            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-smooth"
            placeholder="To date"
          />
        </div>
      </div>

      {/* Clear All Button */}
      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleClearFilters}
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
