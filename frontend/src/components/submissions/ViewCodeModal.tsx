import { useDispatch } from 'react-redux';
import { X, CheckCircle2, XCircle, AlertTriangle, Clock, Zap, Code2 } from 'lucide-react';
import { Modal, ModalHeader, ModalBody } from '../ui/modal';
import { Badge } from '../ui/badge';
import { closeModal } from '../../store/slices/submissionsSlice';
import type { SubmissionDetail } from '../../constants/mockSubmissionsData';
import { getLanguageDisplay, formatDate } from '../../constants/mockSubmissionsData';
import { cn } from '../../lib/utils';

interface ViewCodeModalProps {
  isOpen: boolean;
  submission: SubmissionDetail | null;
}

export function ViewCodeModal({ isOpen, submission }: ViewCodeModalProps) {
  const dispatch = useDispatch();

  if (!submission) return null;

  const handleClose = () => {
    dispatch(closeModal());
  };

  const statusConfig = {
    accepted: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      label: 'Accepted',
      className: 'bg-success/20 text-success border border-success/30 shadow-glow-sm',
      bgClass: 'bg-success/10',
    },
    wrong_answer: {
      icon: <XCircle className="w-5 h-5" />,
      label: 'Wrong Answer',
      className: 'bg-destructive/20 text-destructive border border-destructive/30',
      bgClass: 'bg-destructive/10',
    },
    time_limit_exceeded: {
      icon: <Clock className="w-5 h-5" />,
      label: 'Time Limit Exceeded',
      className: 'bg-warning/20 text-warning border border-warning/30',
      bgClass: 'bg-warning/10',
    },
    memory_limit_exceeded: {
      icon: <Zap className="w-5 h-5" />,
      label: 'Memory Limit Exceeded',
      className: 'bg-warning/20 text-warning border border-warning/30',
      bgClass: 'bg-warning/10',
    },
    runtime_error: {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Runtime Error',
      className: 'bg-destructive/20 text-destructive border border-destructive/30',
      bgClass: 'bg-destructive/10',
    },
    compilation_error: {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Compilation Error',
      className: 'bg-destructive/20 text-destructive border border-destructive/30',
      bgClass: 'bg-destructive/10',
    },
  };

  const config = statusConfig[submission.status];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" showCloseButton={false}>
      {/* Header */}
      <ModalHeader>
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-2">{submission.problem_title}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className={cn('flex items-center gap-1.5 font-semibold', config.className)}>
                {config.icon}
                {config.label}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Code2 className="w-3 h-3 mr-1" />
                {getLanguageDisplay(submission.language)}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatDate(submission.submitted_at)}</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </ModalHeader>

      {/* Body */}
      <ModalBody>
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Execution Time */}
            <div className={cn('p-3 rounded-lg border border-border', config.bgClass)}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Time</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {submission.execution_time ? `${submission.execution_time}ms` : 'N/A'}
              </p>
            </div>

            {/* Memory Used */}
            <div className={cn('p-3 rounded-lg border border-border', config.bgClass)}>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Memory</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {submission.memory_used ? `${submission.memory_used}MB` : 'N/A'}
              </p>
            </div>

            {/* Test Cases Passed */}
            <div className={cn('p-3 rounded-lg border border-border', config.bgClass)}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Passed</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {submission.test_cases_passed || 0} / {submission.test_cases_total || 0}
              </p>
            </div>

            {/* Status */}
            <div className={cn('p-3 rounded-lg border border-border', config.bgClass)}>
              <div className="flex items-center gap-2 mb-1">
                {config.icon}
                <span className="text-xs text-muted-foreground">Status</span>
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{config.label}</p>
            </div>
          </div>

          {/* Error Message (if any) */}
          {submission.error_message && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-destructive mb-1">Error</h4>
                  <p className="text-sm text-foreground font-mono">{submission.error_message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Code Section */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Submitted Code
            </h3>
            <div className="relative">
              <pre className="p-4 rounded-lg bg-muted/50 border border-border overflow-x-auto max-h-96">
                <code className="text-sm text-foreground font-mono whitespace-pre">{submission.code}</code>
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(submission.code)}
                className="absolute top-2 right-2 p-2 rounded-lg bg-background/80 hover:bg-background border border-border text-muted-foreground hover:text-foreground transition-colors text-xs"
                aria-label="Copy code"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
