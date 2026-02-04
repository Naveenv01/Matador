import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant: 'success' | 'destructive' | 'warning' | 'info' | 'default';
  subtitle?: string;
}

const variantStyles = {
  success: 'border-success/20 bg-success/5',
  destructive: 'border-destructive/20 bg-destructive/5',
  warning: 'border-warning/20 bg-warning/5',
  info: 'border-info/20 bg-info/5',
  default: 'border-border bg-card',
};

const iconStyles = {
  success: 'text-success bg-success/10',
  destructive: 'text-destructive bg-destructive/10',
  warning: 'text-warning bg-warning/10',
  info: 'text-info bg-info/10',
  default: 'text-muted-foreground bg-muted',
};

const valueStyles = {
  success: 'text-success',
  destructive: 'text-destructive',
  warning: 'text-warning',
  info: 'text-info',
  default: 'text-foreground',
};

export function StatCard({ title, value, icon: Icon, variant, subtitle }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:scale-[1.02] animate-slide-up",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-4xl font-bold font-mono tracking-tight", valueStyles[variant])}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("rounded-lg p-3", iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
