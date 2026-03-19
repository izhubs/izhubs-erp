import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from './IzPagination.module.scss';
import { IzIconButton } from './IzIconButton';

export interface IzPaginationProps {
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  setPageIndex: (index: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalRows?: number;
}

export const IzPagination: React.FC<IzPaginationProps> = ({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  setPageIndex,
  nextPage,
  previousPage,
  pageSize,
  setPageSize,
  totalRows
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        {totalRows !== undefined && (
          <span className={styles.text}>
            Tổng: <strong>{totalRows}</strong> bản ghi
          </span>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.pageSizeSelect}>
          <span className={styles.text}>Hiển thị</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className={styles.select}
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.pageInfo}>
          <span className={styles.text}>
            Trang <strong>{pageIndex + 1}</strong> / <strong>{pageCount || 1}</strong>
          </span>
        </div>

        <div className={styles.btnGroup}>
          <IzIconButton
            icon={<ChevronsLeft size={16} />}
            aria-label="Trang đầu"
            onClick={() => setPageIndex(0)}
            disabled={!canPreviousPage}
            variant="outline"
          />
          <IzIconButton
            icon={<ChevronLeft size={16} />}
            aria-label="Trang trước"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            variant="outline"
          />
          <IzIconButton
            icon={<ChevronRight size={16} />}
            aria-label="Trang sau"
            onClick={() => nextPage()}
            disabled={!canNextPage}
            variant="outline"
          />
          <IzIconButton
            icon={<ChevronsRight size={16} />}
            aria-label="Trang cuối"
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={!canNextPage}
            variant="outline"
          />
        </div>
      </div>
    </div>
  );
};
