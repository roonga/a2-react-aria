import type { A2Node } from "@a2ra/core"
import { A2Renderer, defaultRegistry } from "@a2ra/core"
import { useState } from "react"

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false)

	const handleCopy = () => {
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		})
	}

	return (
		<button
			type="button"
			onClick={handleCopy}
			title="Copy JSON"
			style={{
				position: "absolute",
				top: "0.6rem",
				right: "0.6rem",
				padding: "0.25rem 0.6rem",
				fontSize: "0.72rem",
				fontWeight: 500,
				borderRadius: "0.3rem",
				border: "1px solid var(--sl-color-hairline-light)",
				background: copied ? "var(--sl-color-accent-low)" : "var(--sl-color-bg-nav)",
				color: copied ? "var(--sl-color-accent-high)" : "var(--sl-color-gray-3)",
				cursor: "pointer",
				transition: "all 0.15s ease",
				outline: "none",
			}}
		>
			{copied ? "Copied!" : "Copy"}
		</button>
	)
}

const registry = defaultRegistry

interface Props {
	node: A2Node
}

const TAB_BASE = "px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer bg-transparent"
const TAB_ACTIVE = "border-[var(--sl-color-accent)] text-[var(--sl-color-accent)]"
const TAB_INACTIVE = "border-transparent text-[var(--sl-color-gray-3)] hover:text-[var(--sl-color-text)]"

function JsonView({ node }: { node: A2Node }) {
	const json = JSON.stringify(node, null, 2)
	return (
		<div style={{ position: "relative" }}>
			<CopyButton text={json} />
			<pre
				style={{
					margin: 0,
					padding: "1.25rem 1.5rem",
					paddingRight: "4.5rem",
					maxHeight: "20rem",
					overflowY: "auto",
					overflowX: "auto",
					fontSize: "0.82rem",
					lineHeight: 1.65,
					fontFamily: "'Cascadia Code','JetBrains Mono','Fira Code',ui-monospace,Consolas,monospace",
					color: "var(--sl-color-text)",
				}}
			>
				<code>
					{json.split("\n").map((line, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: JSON lines have no stable identity
						<ColorizedLine key={i} line={line} />
					))}
				</code>
			</pre>
		</div>
	)
}

function ColorizedLine({ line }: { line: string }) {
	const keyMatch = line.match(/^(\s*)("[\w-]+")\s*:/)
	if (!keyMatch)
		return (
			<span>
				{line}
				{"\n"}
			</span>
		)

	const indent = keyMatch[1]
	const key = keyMatch[2]
	const rest = line.slice(indent.length + key.length)

	const strVal = rest.match(/:\s*(".*?")([,]?)$/)
	const primVal = rest.match(/:\s*(true|false|null|-?\d[\d.eE+-]*)([,]?)$/)

	return (
		<span>
			{indent}
			<span style={{ color: "#f97316" }}>{key}</span>
			{strVal ? (
				<>
					{rest.slice(0, rest.indexOf(strVal[1]))}
					<span style={{ color: "#86efac" }}>{strVal[1]}</span>
					<span style={{ color: "var(--sl-color-gray-3)" }}>{strVal[2]}</span>
				</>
			) : primVal ? (
				<>
					{rest.slice(0, rest.indexOf(primVal[1]))}
					<span style={{ color: "#67e8f9" }}>{primVal[1]}</span>
					<span style={{ color: "var(--sl-color-gray-3)" }}>{primVal[2]}</span>
				</>
			) : (
				rest
			)}
			{"\n"}
		</span>
	)
}

export function ComponentPreview({ node }: Props) {
	const [tab, setTab] = useState<"preview" | "json">("preview")

	return (
		<div
			className="not-content"
			style={{
				border: "1px solid var(--sl-color-hairline-light)",
				borderRadius: "0.6rem",
				overflow: "hidden",
				marginBlock: "1.5rem",
				background: "var(--sl-color-bg-inline-code)",
			}}
		>
			{/* Tab bar */}
			<div
				style={{
					display: "flex",
					alignItems: "flex-end",
					borderBottom: "1px solid var(--sl-color-hairline)",
					background: "var(--sl-color-bg-nav)",
					paddingInline: "0.5rem",
				}}
			>
				{(["preview", "json"] as const).map((t) => (
					<button
						key={t}
						type="button"
						onClick={() => setTab(t)}
						className={`${TAB_BASE} ${tab === t ? TAB_ACTIVE : TAB_INACTIVE}`}
						style={{ outline: "none" }}
					>
						{t === "preview" ? "Preview" : "JSON"}
					</button>
				))}
			</div>

			{/* Preview pane */}
			{tab === "preview" && (
				<div
					style={{
						padding: "2.5rem 2rem",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						minHeight: "8rem",
					}}
				>
					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							gap: "0.75rem",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<A2Renderer node={node} registry={registry} />
					</div>
				</div>
			)}

			{/* JSON pane */}
			{tab === "json" && <JsonView node={node} />}
		</div>
	)
}
