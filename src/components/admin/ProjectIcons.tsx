import { type LucideProps } from 'lucide-react';
import {
  Sparkles, Car, Store, Bot, BookOpen, Wallet, Target, Rocket, Wrench,
  Smartphone, Globe, Lightbulb, Palette, BarChart3, Trophy, Zap,
  FlaskConical, Tent, Building, Sprout, Clock, FileEdit, CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

// Map icon keys to Lucide components
export const PROJECT_ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  car: Car,
  store: Store,
  bot: Bot,
  'book-open': BookOpen,
  wallet: Wallet,
  target: Target,
  rocket: Rocket,
  wrench: Wrench,
  smartphone: Smartphone,
  globe: Globe,
  lightbulb: Lightbulb,
  palette: Palette,
  'bar-chart': BarChart3,
  trophy: Trophy,
  zap: Zap,
  flask: FlaskConical,
  tent: Tent,
  building: Building,
  sprout: Sprout,
};

export const ICON_PICKER_KEYS = Object.keys(PROJECT_ICONS);

// Sprint status icons
export const STATUS_ICONS: Record<string, { Icon: LucideIcon; label: string; className: string }> = {
  not_filled: { Icon: Clock, label: 'Не заполнен', className: 'text-yellow-500' },
  draft: { Icon: FileEdit, label: 'Черновик', className: 'text-blue-500' },
  published: { Icon: CheckCircle2, label: 'Опубликован', className: 'text-green-500' },
};

// Render a project icon by key
export function ProjectIcon({ iconKey, size = 18, className = '' }: { iconKey: string; size?: number; className?: string }) {
  const IconComp = PROJECT_ICONS[iconKey];
  if (!IconComp) return <Sparkles size={size} className={className} />;
  return <IconComp size={size} className={className} />;
}

// Render a status chip
export function StatusChip({ status }: { status: string }) {
  const config = STATUS_ICONS[status];
  if (!config) return null;
  const { Icon, label, className } = config;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${className}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}
