export default function Divider({ label = "or continue with" }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 my-1">
      <div className="flex-1 h-px bg-[#e5e5e5]" />
      <span
        className="text-[11px] uppercase tracking-[0.12em] text-[#a3a3a3] whitespace-nowrap"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {label}
      </span>
      <div className="flex-1 h-px bg-[#e5e5e5]" />
    </div>
  )
}
