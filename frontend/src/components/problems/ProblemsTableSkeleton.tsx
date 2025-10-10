import { Skeleton } from '../ui/skeleton';

export function ProblemsTableSkeleton({ rows = 20 }: { rows?: number }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left">
              <span className="text-sm font-medium text-muted-text">Status</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-sm font-medium text-muted-text">#</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-sm font-medium text-muted-text">Title</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-sm font-medium text-muted-text">Difficulty</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-sm font-medium text-muted-text">Acceptance</span>
            </th>
            <th className="px-4 py-3 text-left hidden lg:table-cell">
              <span className="text-sm font-medium text-muted-text">Tags</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="border-b border-border">
              {/* Status */}
              <td className="px-4 py-4">
                <Skeleton variant="circular" width={20} height={20} />
              </td>

              {/* ID */}
              <td className="px-4 py-4">
                <Skeleton variant="text" width={30} />
              </td>

              {/* Title */}
              <td className="px-4 py-4">
                <Skeleton variant="text" width={200 + Math.random() * 100} />
              </td>

              {/* Difficulty */}
              <td className="px-4 py-4">
                <Skeleton variant="rectangular" width={60} height={22} className="rounded-full" />
              </td>

              {/* Acceptance */}
              <td className="px-4 py-4">
                <Skeleton variant="text" width={50} />
              </td>

              {/* Tags */}
              <td className="px-4 py-4 hidden lg:table-cell">
                <div className="flex gap-1">
                  <Skeleton variant="rectangular" width={60} height={20} className="rounded-full" />
                  <Skeleton variant="rectangular" width={80} height={20} className="rounded-full" />
                  <Skeleton variant="rectangular" width={50} height={20} className="rounded-full" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
