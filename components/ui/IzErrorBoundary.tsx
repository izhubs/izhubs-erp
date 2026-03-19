'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { IzButton } from './IzButton';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class IzErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[IzErrorBoundary] Component crash in ${this.props.name || 'Component'}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <IzButton disabled variant="destructive" size="sm" title={this.state.error?.message}>
          ⚠️ Lỗi tải nút
        </IzButton>
      );
    }

    return this.props.children;
  }
}
