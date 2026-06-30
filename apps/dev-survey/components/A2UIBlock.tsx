"use client"

import { A2Renderer, createRegistry } from "@a2ra/core"
import { Button } from "./a2ui/button"
import { Card } from "./a2ui/card"
import { Checkbox, CheckboxGroup } from "./a2ui/checkbox"
import { Flex, Grid } from "./a2ui/layout"
import { Radio, RadioGroup } from "./a2ui/radio"
import { Select } from "./a2ui/select"
import { Text } from "./a2ui/text"
import { TextField } from "./a2ui/text-field"

const REGISTRY = createRegistry({
	Button: { component: Button },
	Card: { component: Card },
	Checkbox: { component: Checkbox },
	CheckboxGroup: { component: CheckboxGroup },
	Flex: { component: Flex },
	Grid: { component: Grid },
	Radio: { component: Radio },
	RadioGroup: { component: RadioGroup },
	Select: { component: Select },
	Text: { component: Text },
	TextField: { component: TextField },
})

interface Props {
	readonly nodes: unknown[]
	readonly onAction?: (text: string) => void
}

export default function A2UIBlock({ nodes, onAction }: Props) {
	return (
		<div className="w-full">
			<A2Renderer nodes={nodes} registry={REGISTRY} onAction={onAction} />
		</div>
	)
}
