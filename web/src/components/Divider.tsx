export default function Divider({ label = "or continue with" }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 my-1">
      <div className="flex-1 h-px bg-border" />
      <span className="font-body text-[11px] uppercase tracking-[0.12em] text-muted whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
