import type { ReactNode } from "react";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-md border-2 border-line bg-card p-6 ${className}`}>
      {children}
    </section>
  );
}

export function PanelTitle({ children, meta }: { children: ReactNode; meta?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-[22px] font-bold">{children}</h2>
      {meta && <span className="text-sm font-medium text-sub">{meta}</span>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  className = "",
  labelClassName = "",
  valueClassName = "",
  trailing,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className={`rounded-md border-2 border-line bg-card px-6 py-6 ${className}`}>
      <p className={`text-base font-semibold text-sub ${labelClassName}`}>{label}</p>
      <div className="mt-3 flex items-end gap-2">
        <span className={`text-[52px] font-bold leading-none ${valueClassName}`}>{value}</span>
        {trailing}
      </div>
      {hint && <p className="mt-2 text-sm text-sub">{hint}</p>}
    </div>
  );
}

export function MiniStat({
  label,
  value,
  footer,
}: {
  label: string;
  value: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-md bg-paper px-5 py-5">
      <p className="text-sm font-semibold text-sub">{label}</p>
      <p className="mt-2 text-[40px] font-bold leading-none">{value}</p>
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
}

export function EmptyState({ title, note }: { title: string; note?: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-md border-2 border-line bg-paper px-6 py-10 text-center">
      <div>
        <p className="text-lg font-bold">{title}</p>
        {note && <p className="mt-2 text-base text-sub">{note}</p>}
      </div>
    </div>
  );
}
