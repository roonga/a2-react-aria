import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import { A2Renderer, Breadcrumb, BreadcrumbSchema, createRegistry } from "../packages/core/src/index"

const registry = createRegistry({
	Breadcrumb: {
		component: Breadcrumb as Parameters<typeof createRegistry>[0][string]["component"],
		schema: BreadcrumbSchema,
	},
})

const meta = {
	title: "Components/Breadcrumb",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		node: {
			type: "Breadcrumb",
			props: {
				ariaLabel: "Page navigation",
				items: [
					{ id: "home", label: "Home", href: "/" },
					{ id: "products", label: "Products", href: "/products" },
					{ id: "current", label: "Wireless Headphones" },
				],
			},
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole("link", { name: /home/i })).toBeInTheDocument()
		await expect(canvas.getByRole("link", { name: /products/i })).toBeInTheDocument()
		await expect(canvas.getByRole("link", { name: /wireless headphones/i })).toBeInTheDocument()
	},
}

export const SingleItem: Story = {
	args: {
		node: {
			type: "Breadcrumb",
			props: {
				ariaLabel: "Page navigation",
				items: [{ id: "home", label: "Home" }],
			},
		},
	},
	play: async ({ canvas }) => {
		const link = canvas.getByRole("link", { name: /home/i })
		await expect(link).toHaveAttribute("data-current", "true")
	},
}

export const Disabled: Story = {
	args: {
		node: {
			type: "Breadcrumb",
			props: {
				ariaLabel: "Navigation",
				isDisabled: true,
				items: [
					{ id: "home", label: "Home", href: "/" },
					{ id: "settings", label: "Settings", href: "/settings" },
					{ id: "profile", label: "Profile" },
				],
			},
		},
	},
	play: async ({ canvas }) => {
		const links = canvas.getAllByRole("link")
		for (const link of links) {
			await expect(link).toHaveAttribute("data-disabled", "true")
		}
	},
}
