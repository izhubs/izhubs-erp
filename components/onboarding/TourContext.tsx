'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { TOUR_SCRIPTS, DEFAULT_TOUR, ExtendedDriveStep } from '../../lib/tour-scripts';
import PostTourSummary from './PostTourSummary';

interface TourContextType {
  startTour: (force?: boolean) => void;
  isTouring: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTouring, setIsTouring] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Derive base path to match the script definitions (e.g., /deals/123 -> /deals)
  const getContextKey = (path: string) => {
    if (path.startsWith('/dashboard')) return '/dashboard';
    if (path.startsWith('/contacts')) return '/contacts';
    if (path.startsWith('/deals')) return '/deals';
    if (path.startsWith('/settings')) return '/settings';
    return 'default';
  };

  const startTour = useCallback((force: boolean = false) => {
    const contextKey = getContextKey(pathname);
    const hasSeenKey = `tour_seen_${contextKey}`;
    
    // Skip if already seen and not forced
    if (!force && localStorage.getItem(hasSeenKey)) {
      return;
    }

    const steps: ExtendedDriveStep[] = contextKey === 'default' ? DEFAULT_TOUR : TOUR_SCRIPTS[contextKey];
    if (!steps || steps.length === 0) return;

    setIsTouring(true);
    
    setTimeout(() => {
      let tourObj: any;

      // Xử lý các bước bắt buộc tương tác (requireClick)
      const processedSteps = steps.map((step) => {
        if (typeof window !== 'undefined' && step.requireClick) {
          return {
            ...step,
            onPopoverRender: (popover: any) => {
              // Ẩn nút Next để ép click vào phần tử UI
              const nextBtn = popover.wrapper.querySelector('.driver-popover-next-btn');
              if (nextBtn) nextBtn.style.display = 'none';
            },
            onHighlighted: (...args: any[]) => {
              const element = args[0] as HTMLElement;
              if (element) {
                element.classList.add('tour-pulse-active');
                element.addEventListener('click', () => {
                  element.classList.remove('tour-pulse-active');
                  if (tourObj) {
                    if (step.delayNext) setTimeout(() => tourObj.moveNext(), step.delayNext);
                    else tourObj.moveNext();
                  }
                }, { once: true });
              }
              if (step.onHighlighted) step.onHighlighted.apply(null, args as any);
            },
            onDeselected: (...args: any[]) => {
              const element = args[0] as HTMLElement;
              if (element) element.classList.remove('tour-pulse-active');
              if (step.onDeselected) step.onDeselected.apply(null, args as any);
            }
          };
        }
        return step;
      });

      tourObj = driver({
        showProgress: true,
        allowClose: true, 
        nextBtnText: 'Next',
        prevBtnText: 'Previous',
        doneBtnText: 'Got it!',
        steps: processedSteps as any,
        onDestroyStarted: () => {
          localStorage.setItem(hasSeenKey, 'true');
          tourObj.destroy();
          setIsTouring(false);
          setShowSummary(true); 
        }
      });
      tourObj.drive();
    }, 500);

  }, [pathname]);

  // Auto-trigger when navigating to a new module for the first time
  useEffect(() => {
    // Avoid triggering on purely auth paths
    if (pathname && !pathname.includes('/login') && !pathname.includes('/register') && !pathname.includes('/onboarding')) {
      startTour(false);
    }
  }, [pathname, startTour]);

  return (
    <TourContext.Provider value={{ startTour, isTouring }}>
      {children}
      {showSummary && <PostTourSummary onClose={() => setShowSummary(false)} />}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    return { startTour: () => { console.warn('TourProvider is missing'); }, isTouring: false };
  }
  return context;
}
