import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import {
	A2Renderer,
	Button,
	ButtonSchema,
	createRegistry,
	Flex,
	FlexSchema,
	Grid,
	GridSchema,
} from "../packages/core/src/index"

const registry = createRegistry({
	Button: { component: Button as Parameters<typeof createRegistry>[0][string]["component"], schema: ButtonSchema },
	Flex: { component: Flex as Parameters<typeof createRegistry>[0][string]["component"], schema: FlexSchema },
	Grid: { component: Grid as Parameters<typeof createRegistry>[0][string]["component"], schema: GridSchema },
})

const meta = {
	title: "Components/Layout",
	component: A2Renderer,
	parameters: { layout: "padded" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const FlexRow: Story = {
	args: {
		node: {
			type: "Flex",
			props: { direction: "row", gap: "md", align: "center" },
			children: [
				{ type: "Button", children: "First" },
				{ type: "Button", children: "Second" },
				{ type: "Button", children: "Third" },
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("First")).toBeInTheDocument()
		await expect(canvas.getByText("Second")).toBeInTheDocument()
		await expect(canvas.getByText("Third")).toBeInTheDocument()
	},
}

export const FlexColumn: Story = {
	args: {
		node: {
			type: "Flex",
			props: { direction: "column", gap: "sm" },
			children: [
				{ type: "Button", children: "Top" },
				{ type: "Button", children: "Middle" },
				{ type: "Button", children: "Bottom" },
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("Top")).toBeInTheDocument()
		await expect(canvas.getByText("Bottom")).toBeInTheDocument()
	},
}

export const FlexWrap: Story = {
	args: {
		node: {
			type: "Flex",
			props: { direction: "row", gap: "sm", wrap: true },
			children: [
				{ type: "Button", children: "A" },
				{ type: "Button", children: "B" },
				{ type: "Button", children: "C" },
				{ type: "Button", children: "D" },
			],
		},
	},
}

export const GridTwoColumns: Story = {
	args: {
		node: {
			type: "Grid",
			props: { columns: 2, gap: "md" },
			children: [
				{ type: "Button", children: "Cell 1" },
				{ type: "Button", children: "Cell 2" },
				{ type: "Button", children: "Cell 3" },
				{ type: "Button", children: "Cell 4" },
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("Cell 1")).toBeInTheDocument()
		await expect(canvas.getByText("Cell 4")).toBeInTheDocument()
	},
}

export const GridThreeColumns: Story = {
	args: {
		node: {
			type: "Grid",
			props: { columns: 3, gap: "lg" },
			children: [
				{ type: "Button", children: "Item 1" },
				{ type: "Button", children: "Item 2" },
				{ type: "Button", children: "Item 3" },
				{ type: "Button", children: "Item 4" },
				{ type: "Button", children: "Item 5" },
				{ type: "Button", children: "Item 6" },
			],
		},
	},
}

export const NestedFlexInGrid: Story = {
	args: {
		node: {
			type: "Grid",
			props: { columns: 2, gap: "md" },
			children: [
				{
					type: "Flex",
					props: { direction: "column", gap: "sm" },
					children: [
						{ type: "Button", children: "Col 1 A" },
						{ type: "Button", children: "Col 1 B" },
					],
				},
				{
					type: "Flex",
					props: { direction: "column", gap: "sm" },
					children: [
						{ type: "Button", children: "Col 2 A" },
						{ type: "Button", children: "Col 2 B" },
					],
				},
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("Col 1 A")).toBeInTheDocument()
		await expect(canvas.getByText("Col 2 B")).toBeInTheDocument()
	},
}
