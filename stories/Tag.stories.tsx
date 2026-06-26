import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { A2Renderer, createRegistry, Tag, TagGroup } from "../packages/core/src/index"

const registry = createRegistry({
	Tag: { component: Tag as Parameters<typeof createRegistry>[0][string]["component"] },
	TagGroup: { component: TagGroup as Parameters<typeof createRegistry>[0][string]["component"] },
})

const meta = {
	title: "Components/TagGroup",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		node: {
			type: "TagGroup",
			props: { label: "Categories" },
			children: [
				{ type: "Tag", props: { id: "news" }, children: "News" },
				{ type: "Tag", props: { id: "travel" }, children: "Travel" },
				{ type: "Tag", props: { id: "gaming" }, children: "Gaming" },
				{ type: "Tag", props: { id: "shopping" }, children: "Shopping" },
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("News")).toBeDefined()
		await expect(canvas.getByText("Travel")).toBeDefined()
	},
}

export const WithDescription: Story = {
	args: {
		node: {
			type: "TagGroup",
			props: { label: "Selected topics", description: "These topics will appear in your feed." },
			children: [
				{ type: "Tag", props: { id: "ai" }, children: "AI" },
				{ type: "Tag", props: { id: "design" }, children: "Design" },
				{ type: "Tag", props: { id: "dev" }, children: "Development" },
			],
		},
	},
}

export const WithDisabledItem: Story = {
	args: {
		node: {
			type: "TagGroup",
			props: { label: "Amenities" },
			children: [
				{ type: "Tag", props: { id: "wifi" }, children: "WiFi" },
				{ type: "Tag", props: { id: "parking", isDisabled: true }, children: "Parking" },
				{ type: "Tag", props: { id: "pool" }, children: "Pool" },
			],
		},
	},
}

export const NoLabel: Story = {
	args: {
		node: {
			type: "TagGroup",
			children: [
				{ type: "Tag", props: { id: "react" }, children: "React" },
				{ type: "Tag", props: { id: "typescript" }, children: "TypeScript" },
				{ type: "Tag", props: { id: "tailwind" }, children: "Tailwind" },
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("React")).toBeDefined()
	},
}
