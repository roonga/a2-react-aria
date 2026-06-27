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
			className="mb-2 rounded-md border border-(--color-border) bg-(--color-backgroundMuted) text-xs"
		>
			<summary className="flex cursor-pointer select-none list-none items-center gap-1.5 px-3 py-1.5 font-medium text-(--color-textMuted)">
				<span>{open ? "▾" : "▸"}</span>
				<span>Thinking</span>
			</summary>
			<p className="whitespace-pre-wrap px-3 pt-1 pb-2 text-(--color-text) italic leading-relaxed">{text.trim()}</p>
		</details>
	)
}
