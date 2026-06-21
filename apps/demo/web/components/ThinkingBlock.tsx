import { useState } from "react"

interface ThinkingBlockProps {
	text: string
}

export function ThinkingBlock({ text }: ThinkingBlockProps) {
	const [open, setOpen] = useState(false)
	return (
		<details
			open={open}
			onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
			className="mb-2 rounded-md border border-[var(--color-border)] bg-[var(--color-backgroundMuted)] text-xs"
		>
			<summary className="cursor-pointer select-none px-3 py-1.5 font-medium text-[var(--color-textMuted)] list-none flex items-center gap-1.5">
				<span>{open ? "▾" : "▸"}</span>
				Thinking
			</summary>
			<p className="px-3 pb-2 pt-1 whitespace-pre-wrap text-[var(--color-text)] italic leading-relaxed">
				{text.trim()}
			</p>
		</details>
	)
}
