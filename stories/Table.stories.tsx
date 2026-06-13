import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { A2Renderer, createRegistry, Table } from "../packages/core/src/index"

const registry = createRegistry({
	Table: { component: Table as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/Table",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

const columns = [
	{ id: "name", label: "Name", isRowHeader: true },
	{ id: "role", label: "Role" },
	{ id: "status", label: "Status" },
]

const rows = [
	{ id: "1", data: { name: "Alice Chen", role: "Engineer", status: "Active" } },
	{ id: "2", data: { name: "Bob Smith", role: "Designer", status: "Active" } },
	{ id: "3", data: { name: "Carol Davis", role: "Manager", status: "On leave" } },
]

export const Default: Story = {
	args: {
		node: {
			type: "Table",
			props: { ariaLabel: "Team members", columns, rows },
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("grid", { name: /team members/i })).toBeInTheDocument()
		await expect(canvas.getByRole("columnheader", { name: /name/i })).toBeInTheDocument()
		await expect(canvas.getByRole("columnheader", { name: /role/i })).toBeInTheDocument()
		await expect(canvas.getByText("Alice Chen")).toBeInTheDocument()
	},
}

export const SingleSelection: Story = {
	args: {
		node: {
			type: "Table",
			props: { ariaLabel: "Selectable users", columns, rows, selectionMode: "single" },
		},
	},
	play: async ({ canvas }) => {
		const rows = canvas.getAllByRole("row")
		await expect(rows.length).toBeGreaterThan(1)
	},
}

export const MultiSelection: Story = {
	args: {
		node: {
			type: "Table",
			props: { ariaLabel: "Multi-select users", columns, rows, selectionMode: "multiple" },
		},
	},
}

export const EmptyTable: Story = {
	args: {
		node: {
			type: "Table",
			props: {
				ariaLabel: "Empty table",
				columns: [{ id: "col", label: "Column", isRowHeader: true }],
				rows: [],
			},
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("grid")).toBeInTheDocument()
		await expect(canvas.getByRole("columnheader", { name: /column/i })).toBeInTheDocument()
	},
}
