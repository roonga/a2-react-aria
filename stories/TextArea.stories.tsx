import type { Meta, StoryObj } from "@storybook/react"
import { expect, userEvent, within } from "storybook/test"
import { A2Renderer, createRegistry, TextArea, TextAreaSchema } from "../packages/core/src/index"

const registry = createRegistry({
	TextArea: {
		component: TextArea as Parameters<typeof createRegistry>[0][string]["component"],
		schema: TextAreaSchema,
	},
})

const meta = {
	title: "Components/TextArea",
	component: A2Renderer,
	parameters: { layout: "centered" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
	args: {
		node: {
			type: "TextArea",
			props: {
				label: "Comments",
				placeholder: "Tell us what you think…",
				rows: 4,
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const textarea = canvas.getByRole("textbox", { name: /comments/i })
		await expect(textarea).toBeInTheDocument()
		await expect(textarea.tagName).toBe("TEXTAREA")
		await userEvent.type(textarea, "Line one{enter}Line two")
		await expect(textarea).toHaveValue("Line one\nLine two")
	},
}

export const RequiredWithDescription: Story = {
	args: {
		node: {
			type: "TextArea",
			props: {
				label: "Feedback",
				description: "Required — max 500 characters.",
				isRequired: true,
				maxLength: 500,
				rows: 6,
			},
		},
	},
}

export const Disabled: Story = {
	args: {
		node: {
			type: "TextArea",
			props: {
				label: "Notes",
				defaultValue: "Read-only history entry.",
				isDisabled: true,
				rows: 3,
			},
		},
	},
}
