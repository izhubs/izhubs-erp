'use client';

import * as React from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import styles from './IzFileUpload.module.scss';

interface IzFileUploadProps {
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  className?: string;
  label?: string;
}

export function IzFileUpload({
  onFilesSelected,
  accept,
  multiple = false,
  maxSizeMB = 10,
  className,
  label = 'Kéo thả hoặc click để tải file lên',
}: IzFileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const fileArr = Array.from(incoming);
    const valid = fileArr.filter((f) => f.size <= maxSizeMB * 1024 * 1024);
    const merged = multiple ? [...files, ...valid] : valid;
    setFiles(merged);
    onFilesSelected?.(merged);
  };

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onFilesSelected?.(next);
  };

  return (
    <div className={clsx(styles.wrapper, className)}>
      <div
        className={clsx(styles.zone, isDragging && styles.dragging)}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className={styles.input}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload size={24} className={styles.uploadIcon} />
        <p className={styles.zoneLabel}>{label}</p>
        <p className={styles.zoneHint}>Tối đa {maxSizeMB}MB mỗi file</p>
      </div>

      {files.length > 0 && (
        <ul className={styles.fileList}>
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className={styles.fileItem}>
              <FileText size={16} className={styles.fileIcon} />
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>
                {(file.size / 1024).toFixed(0)} KB
              </span>
              <CheckCircle2 size={16} className={styles.checkIcon} />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className={styles.removeBtn}
                aria-label="Xóa file"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
