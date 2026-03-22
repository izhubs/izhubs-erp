import {
  LayoutDashboard, Users, Briefcase, FileText,
  Activity, Settings, BarChart2, Zap,
  ChevronLeft, ChevronRight, Upload, ShoppingCart,
  Building2, CalendarHeart, UtensilsCrossed, Box,
  Star, Globe, Headphones, Package, PieChart,
  Layers, Bell, Lock, Database, Cpu,
  ClipboardList, // Added for izform
  UserPlus, CheckSquare, FolderKanban, // Added for generic and Project icons
  LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Users, Briefcase, FileText,
  Activity, Settings, BarChart2, Zap,
  ChevronLeft, ChevronRight, Upload, ShoppingCart,
  Building2, CalendarHeart, UtensilsCrossed, Box,
  Star, Globe, Headphones, Package, PieChart,
  Layers, Bell, Lock, Database, Cpu,
  ClipboardList,
  UserPlus, CheckSquare, FolderKanban,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
}

export function Icon({ name, size = 18, className, fallback = '📦' }: IconProps) {
  const LucideComponent = ICON_MAP[name];
  if (!LucideComponent) {
    return (
      <span className={className} style={{ fontSize: size }} role="img" aria-label={name}>
        {fallback}
      </span>
    );
  }
  return <LucideComponent size={size} className={className} />;
}
