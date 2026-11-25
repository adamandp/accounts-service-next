export function Details({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0 space-y-1">
          <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
          <dd className="break-all text-sm">{value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
