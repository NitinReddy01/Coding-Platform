/**
 * FileUploadZone component
 *
 * Drag-and-drop file upload zone with visual feedback and file preview.
 *
 * @module components/ui/FileUploadZone
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Button } from './button';

export interface FileUploadZoneProps {
  /** Accepted file types (e.g., ".in,.out" or "image/*") */
  accept?: string;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Maximum file size in bytes (default: 10MB) */
  maxSize?: number;
  /** Callback when files are selected */
  onFilesSelected: (files: File[]) => void;
  /** Currently uploaded files */
  files?: File[];
  /** Callback to remove a file */
  onFileRemove?: (index: number) => void;
  /** Custom label text */
  label?: string;
  /** Show file list */
  showFileList?: boolean;
}

/**
 * Drag-and-drop file upload component
 *
 * Features:
 * - Drag and drop support
 * - Click to browse files
 * - File type validation
 * - File size validation
 * - Visual feedback on drag over
 * - File preview list
 * - Remove uploaded files
 *
 * @example
 * ```tsx
 * const [files, setFiles] = useState<File[]>([]);
 *
 * <FileUploadZone
 *   accept=".in,.out"
 *   multiple
 *   onFilesSelected={(newFiles) => setFiles([...files, ...newFiles])}
 *   files={files}
 *   onFileRemove={(index) => setFiles(files.filter((_, i) => i !== index))}
 * />
 * ```
 */
export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  accept,
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB default
  onFilesSelected,
  files = [],
  onFileRemove,
  label = 'Upload Files',
  showFileList = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (fileList: FileList | null): File[] => {
    if (!fileList) return [];

    const validFiles: File[] = [];
    setError('');

    Array.from(fileList).forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        setError(`File ${file.name} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
        return;
      }

      // Check file type if accept is specified
      if (accept) {
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!acceptedTypes.some((type) => {
          if (type.includes('*')) {
            const baseType = type.split('/')[0];
            return file.type.startsWith(baseType);
          }
          return type === fileExtension || type === file.type;
        })) {
          setError(`File ${file.name} is not an accepted type`);
          return;
        }
      }

      validFiles.push(file);
    });

    return validFiles;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = validateFiles(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      onFilesSelected(droppedFiles);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = validateFiles(e.target.files);
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
          ${isDragging
            ? 'border-primary bg-primary/10 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-card-hover'
          }
        `}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center gap-3">
          {/* Upload Icon */}
          <div className={`text-4xl transition-transform ${isDragging ? 'scale-110' : ''}`}>
            📁
          </div>

          {/* Text */}
          <div>
            <p className="text-foreground font-medium mb-1">
              {isDragging ? 'Drop files here' : label}
            </p>
            <p className="text-muted-foreground text-sm">
              Drag and drop or click to browse
            </p>
            {accept && (
              <p className="text-muted-foreground text-xs mt-1">
                Accepted: {accept}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Prevent parent div's onClick from firing
              handleBrowseClick();
            }}
          >
            Browse Files
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm">
          {error}
        </div>
      )}

      {/* File List */}
      {showFileList && files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">
            Uploaded Files ({files.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                {onFileRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onFileRemove(index)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
