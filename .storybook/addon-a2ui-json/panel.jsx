import { useParameter } from "@storybook/core/addons"

export const Panel = () => {
	const node = useParameter("a2ui", null)

	if (!node) {
		return <div style={{ padding: "1rem", color: "#666" }}>No a2UI JSON provided for this story.</div>
	}

	return (
		<div style={{ padding: "1rem" }}>
			<pre
				style={{
					background: "#f9fafb",
					border: "1px solid #e5e7eb",
					padding: "1rem",
					borderRadius: "6px",
					overflow: "auto",
					fontSize: "0.8125rem",
					lineHeight: "1.5",
					color: "#374151",
					fontFamily: '"Menlo", "Monaco", "Courier New", monospace',
				}}
			>
				{JSON.stringify(node, null, 2)}
			</pre>
		</div>
	)
}
