import React, { forwardRef } from 'react';
import styles from './IzInput.module.scss';

export interface IzInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Hiển thị trạng thái lỗi (viền đỏ) */
  error?: string | boolean;
  /** Component Icon ở bên trái (Vd: <Search />) */
  leftIcon?: React.ReactNode;
  /** Component Icon ở bên phải (Vd: <EyeOff />) */
  rightIcon?: React.ReactNode;
}

const cx = (...args: any[]) => args.filter(Boolean).join(' ');

/**
 * IzInput: Thành phần gốc quản lý UI Input.
 * Không chứa logic Form state, chỉ tập trung vào hiển thị.
 */
export const IzInput = forwardRef<HTMLInputElement, IzInputProps>(
  ({ className, error, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className={styles.inputContainer}>
        {leftIcon && (
          <div className={cx(styles.iconOverlay, styles.left)}>
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cx(
            styles.input,
            error && styles.hasError,
            leftIcon && styles.hasLeftIcon,
            rightIcon && styles.hasRightIcon,
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className={cx(styles.iconOverlay, styles.right)}>
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

IzInput.displayName = 'IzInput';
