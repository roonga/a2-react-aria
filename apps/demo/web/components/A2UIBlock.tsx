"use client"

import { A2Renderer, createRegistry } from "@a2ui/core"
import type { A2Node } from "@a2ui/core"
import { Button } from "./ui/Button"
import { Card } from "./ui/Card"
import { Flex } from "./ui/Flex"
import { Grid } from "./ui/Grid"
import { Text } from "./ui/Text"

type RegComp = Parameters<typeof createRegistry>[0][string]["component"]

const registry = createRegistry({
	Button: { component: Button as RegComp },
	Card: { component: Card as RegComp },
	Flex: { component: Flex as RegComp },
	Grid: { component: Grid as RegComp },
	Text: { component: Text as RegComp },
})

export default function A2UIBlock({ nodes }: { nodes: unknown[] }) {
  if (!nodes?.length) return null
  return (
    <div className="mt-3 space-y-3">
      {nodes.map((node, i) => (
        <A2Renderer key={i} node={node as A2Node} registry={registry} />
      ))}
    </div>
  )
}
