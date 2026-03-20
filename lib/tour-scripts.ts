import type { DriveStep } from 'driver.js';

export type ExtendedDriveStep = DriveStep & { requireClick?: boolean; delayNext?: number };
export type ElementRecord = Record<string, ExtendedDriveStep[]>;

// English First Configurations
export const TOUR_SCRIPTS: ElementRecord = {
  // 1. Dashboard Context
  '/dashboard': [
    { 
      popover: { 
        title: 'Welcome to IZhubs ERP! 👋', 
        description: 'Instead of just reading, let\'s practice. We will guide you through the actual steps to manage your business.' 
      } 
    },
    {
      element: 'a[href="/contacts"]', 
      requireClick: true,
      popover: { 
        title: 'Step 1: Your Customers', 
        description: 'Click on the "Contacts" menu on the left sidebar to go to the customer management screen. (We wait for your click!)',
        side: 'right',
        align: 'start'
      } 
    }
  ],

  // 2. Contacts Context
  '/contacts': [
    { 
      popover: { 
        title: '360° Contact Management', 
        description: 'You made it! Here is where all your clients and leads are securely stored.' 
      } 
    },
    {
      element: '#btn-add-contact', 
      requireClick: true,
      delayNext: 800, // Đợi animation CSS của SlideOver chạy bung ra hoàn toàn (Radix UI)
      popover: { 
        title: 'Action: Add your first Lead', 
        description: 'Click the "New Contact" or Add button on this page. Let\'s see what happens!',
        side: 'bottom'
      } 
    },
    {
      element: '[role="dialog"]', // SlideOver hay Modal đều bắt được với [role="dialog"]
      popover: { 
        title: 'Fill out the form', 
        description: 'Here you can type in their name and email. Hit "Save" and the system will automatically create a profile for them!',
        side: 'left'
      } 
    }
  ],

  // 3. Deals (Kanban) Context
  '/deals': [
    { 
      popover: { 
        title: 'The Kanban Pipeline', 
        description: 'This is the core of your sales. Visualizing your deals makes closing them much easier.' 
      } 
    },
    {
      element: 'a[href="/deals"]',
      popover: { 
        title: 'Pipeline Board', 
        description: 'This screen is your Drag-and-Drop board.' 
      } 
    },
    {
      element: '#btn-add-deal',
      requireClick: true,
      delayNext: 800, // Đợi Modal DealFormModal mở ra trọn vẹn
      popover: { 
        title: 'Create a Deal', 
        description: 'Ready to pitch? Click the Add button to create a new Deal card.',
        side: 'bottom'
      } 
    },
    {
      element: '[role="dialog"]',
      popover: { 
        title: 'Deal Form', 
        description: 'Fill in the Deal Name and its estimated Value. You can customize Deal Stages later!',
        side: 'left'
      } 
    }
  ],

  // 4. Settings Context
  '/settings': [
    { 
      popover: { 
        title: 'Workspace Config', 
        description: 'Customize the DNA of your CRM here.' 
      } 
    },
    {
      element: '#theme-switcher-btn',
      requireClick: true,
      popover: { 
        title: 'Brand Aesthetics', 
        description: 'Click this Palette icon in the header to change the color theme of the whole platform!' 
      } 
    }
  ]
};

// Fallback for unknown routes
export const DEFAULT_TOUR: ExtendedDriveStep[] = [
  { 
    element: '#app-sidebar',
    popover: { 
      title: 'Navigation Area', 
      description: 'Use the left sidebar to navigate to core modules like Contacts, Deals, and Settings.',
      side: 'right',
      align: 'start'
    } 
  },
  {
    element: '.btn-help-tour',
    popover: { 
      title: 'Need Help?', 
      description: 'You can always click this Help icon (?) anytime to practice using the current screen.' 
    } 
  }
];
