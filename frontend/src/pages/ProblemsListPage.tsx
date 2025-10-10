import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ListTodo } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ProblemsFilters } from '../components/problems/ProblemsFilters';
import { ProblemsTable } from '../components/problems/ProblemsTable';
import { ProblemsTableSkeleton } from '../components/problems/ProblemsTableSkeleton';
import { Pagination, PaginationInfo } from '../components/ui/pagination';
import type { RootState } from '../store/store';
import { fetchProblems, setPage } from '../store/slices/problemsSlice';

export function ProblemsListPage() {
  const dispatch = useDispatch();
  const {
    problems,
    total,
    currentPage,
    totalPages,
    pageSize,
    filters,
    sort,
    loading,
  } = useSelector((state: RootState) => state.problems);

  // Fetch problems on mount and when filters/sort/page change
  useEffect(() => {
    dispatch(fetchProblems());
  }, [dispatch, filters, sort, currentPage]);

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header with Gradient */}
        <div className="mb-8 relative overflow-hidden">
          {/* Decorative gradient blob */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-primary opacity-20 blur-3xl rounded-full animate-float" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-success opacity-20 blur-3xl rounded-full animate-float" style={{ animationDelay: '1s' }} />

          <div className="relative">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl icon-container-primary">
                <ListTodo className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold text-gradient-primary">Problems</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Practice coding problems to improve your algorithmic thinking and problem-solving skills.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 bg-gradient-card border border-border rounded-xl p-6 shadow-card border-gradient-l-primary hover-lift">
              <ProblemsFilters />
            </div>
          </aside>

          {/* Problems Table */}
          <div className="lg:col-span-3 space-y-4">
            {/* Table Header with Count */}
            <div className="bg-gradient-card border border-border rounded-xl p-4 shadow-card border-gradient-l-success">
              <div className="flex items-center justify-between">
                <PaginationInfo
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalItems={total}
                />
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary-subtle text-primary text-sm font-semibold">
                    {total} {total === 1 ? 'problem' : 'problems'}
                  </span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-gradient-card border border-border rounded-xl overflow-hidden shadow-card hover-lift">
              {loading ? (
                <ProblemsTableSkeleton rows={pageSize} />
              ) : (
                <ProblemsTable problems={problems} sort={sort} />
              )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center py-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
