import { ReactNode } from "react";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  description: string;
};

export default function StatsCard({
  title,
  value,
  icon,
  description,
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)]">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            {value}
          </h2>
        </div>

        <div className="rounded-full bg-[var(--bg-surface-raised)] p-3">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm text-[var(--text-secondary)]">
        {description}
      </p>
    </div>
  );
}