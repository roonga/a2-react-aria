"use client"

import { A2Renderer, createRegistry } from "@a2ui/core"
import type { A2Node } from "@a2ui/core"
import { useMemo, type ReactNode } from "react"
import { Button } from "./ui/Button"
import { Card } from "./ui/Card"
import { Flex } from "./ui/Flex"
import { Grid } from "./ui/Grid"
import { Text } from "./ui/Text"

type RegComp = Parameters<typeof createRegistry>[0][string]["component"]

interface Props {
	nodes: unknown[]
	onAction?: (text: string) => void
}

export default function A2UIBlock({ nodes, onAction }: Props) {
	const registry = useMemo(() => {
		const ActionButton = (({
			children,
			variant,
			size,
			disabled,
		}: {
			children?: ReactNode
			variant?: "primary" | "secondary" | "danger" | "ghost"
			size?: "sm" | "md" | "lg"
			disabled?: boolean
		}) => (
			<Button
				variant={variant}
				size={size}
				disabled={disabled}
				onPress={() => {
					if (typeof children === "string") onAction?.(children)
				}}
			>
				{children}
			</Button>
		)) as RegComp

		return createRegistry({
			Button: { component: ActionButton },
			Card: { component: Card as RegComp },
			Flex: { component: Flex as RegComp },
			Grid: { component: Grid as RegComp },
			Text: { component: Text as RegComp },
		})
	}, [onAction])

	if (!nodes?.length) return null
	return (
		<div className="mt-3 space-y-3">
			{nodes.map((node, i) => (
				<A2Renderer key={i} node={node as A2Node} registry={registry} />
			))}
		</div>
	)
}
