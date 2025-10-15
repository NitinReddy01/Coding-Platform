import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { History } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SubmissionsFilters } from '../components/submissions/SubmissionsFilters';
import { SubmissionsTable } from '../components/submissions/SubmissionsTable';
import { ViewCodeModal } from '../components/submissions/ViewCodeModal';
import { Pagination, PaginationInfo } from '../components/ui/pagination';
import type { RootState } from '../store/store';
import { fetchSubmissions, setPage } from '../store/slices/submissionsSlice';

export function SubmissionsHistoryPage() {
  const dispatch = useDispatch();
  const {
    submissions,
    total,
    currentPage,
    totalPages,
    pageSize,
    filters,
    sort,
    loading,
    selectedSubmission,
    isModalOpen,
    allSubmissions,
  } = useSelector((state: RootState) => state.submissions);

  // Fetch submissions on mount and when filters/sort/page change
  useEffect(() => {
    dispatch(fetchSubmissions());
  }, [dispatch, filters, sort, currentPage]);

  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate stats
  const totalSubmissions = allSubmissions.length;
  const acceptedSubmissions = allSubmissions.filter((s) => s.status === 'accepted').length;
  const acceptanceRate = totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header with Gradient */}
        <div className="mb-8 relative overflow-hidden">
          {/* Decorative gradient blobs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-accent opacity-20 blur-3xl rounded-full animate-float" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-primary opacity-20 blur-3xl rounded-full animate-float" style={{ animationDelay: '1s' }} />

          <div className="relative">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-xl icon-container-accent">
                <History className="w-8 h-8 text-accent" />
              </div>
              <h1 className="text-4xl font-bold text-gradient-accent">Submission History</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              View and analyze all your code submissions with detailed results.
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-card border border-border rounded-xl p-4 shadow-card border-gradient-l-accent hover-lift">
            <p className="text-sm text-muted-foreground mb-1">Total Submissions</p>
            <p className="text-2xl font-bold text-gradient-accent">{totalSubmissions}</p>
          </div>
          <div className="bg-gradient-card border border-border rounded-xl p-4 shadow-card border-gradient-l-success hover-lift">
            <p className="text-sm text-muted-foreground mb-1">Accepted</p>
            <p className="text-2xl font-bold text-gradient-success">{acceptedSubmissions}</p>
          </div>
          <div className="bg-gradient-card border border-border rounded-xl p-4 shadow-card border-gradient-l-primary hover-lift">
            <p className="text-sm text-muted-foreground mb-1">Acceptance Rate</p>
            <p className="text-2xl font-bold text-gradient-primary">{acceptanceRate}%</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 bg-gradient-card border border-border rounded-xl p-6 shadow-card border-gradient-l-accent hover-lift">
              <SubmissionsFilters />
            </div>
          </aside>

          {/* Submissions Table */}
          <div className="lg:col-span-3 space-y-4">
            {/* Table Header with Count */}
            <div className="bg-gradient-card border border-border rounded-xl p-4 shadow-card border-gradient-l-primary">
              <div className="flex items-center justify-between">
                <PaginationInfo
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalItems={total}
                />
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-accent-subtle text-accent text-sm font-semibold">
                    {total} {total === 1 ? 'submission' : 'submissions'}
                  </span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-gradient-card border border-border rounded-xl overflow-hidden shadow-card hover-lift">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
              ) : (
                <SubmissionsTable submissions={submissions} sort={sort} />
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

      {/* View Code Modal */}
      <ViewCodeModal isOpen={isModalOpen} submission={selectedSubmission} />
    </div>
  );
}
