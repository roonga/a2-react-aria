import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"
import {
	A2Renderer,
	Breadcrumb,
	BreadcrumbSchema,
	Button,
	ButtonSchema,
	Card,
	CardSchema,
	Checkbox,
	CheckboxGroup,
	CheckboxGroupSchema,
	CheckboxSchema,
	createRegistry,
	DatePicker,
	DatePickerSchema,
	Flex,
	FlexSchema,
	Form,
	FormSchema,
	Grid,
	GridSchema,
	Radio,
	RadioGroup,
	RadioGroupSchema,
	RadioSchema,
	Select,
	SelectSchema,
	Tabs,
	TabsSchema,
	Text,
	TextField,
	TextFieldSchema,
	TextSchema,
} from "../packages/core/src/index"

const registry = createRegistry({
	Breadcrumb: {
		component: Breadcrumb as Parameters<typeof createRegistry>[0][string]["component"],
		schema: BreadcrumbSchema,
	},
	Button: {
		component: Button as Parameters<typeof createRegistry>[0][string]["component"],
		schema: ButtonSchema,
	},
	Card: {
		component: Card as Parameters<typeof createRegistry>[0][string]["component"],
		schema: CardSchema,
	},
	Checkbox: {
		component: Checkbox as Parameters<typeof createRegistry>[0][string]["component"],
		schema: CheckboxSchema,
	},
	CheckboxGroup: {
		component: CheckboxGroup as Parameters<typeof createRegistry>[0][string]["component"],
		schema: CheckboxGroupSchema,
	},
	DatePicker: {
		component: DatePicker as Parameters<typeof createRegistry>[0][string]["component"],
		schema: DatePickerSchema,
	},
	Flex: {
		component: Flex as Parameters<typeof createRegistry>[0][string]["component"],
		schema: FlexSchema,
	},
	Form: {
		component: Form as Parameters<typeof createRegistry>[0][string]["component"],
		schema: FormSchema,
	},
	Grid: {
		component: Grid as Parameters<typeof createRegistry>[0][string]["component"],
		schema: GridSchema,
	},
	Radio: {
		component: Radio as Parameters<typeof createRegistry>[0][string]["component"],
		schema: RadioSchema,
	},
	RadioGroup: {
		component: RadioGroup as Parameters<typeof createRegistry>[0][string]["component"],
		schema: RadioGroupSchema,
	},
	Select: {
		component: Select as Parameters<typeof createRegistry>[0][string]["component"],
		schema: SelectSchema,
	},
	Tabs: {
		component: Tabs as Parameters<typeof createRegistry>[0][string]["component"],
		schema: TabsSchema,
	},
	Text: {
		component: Text as Parameters<typeof createRegistry>[0][string]["component"],
		schema: TextSchema,
	},
	TextField: {
		component: TextField as Parameters<typeof createRegistry>[0][string]["component"],
		schema: TextFieldSchema,
	},
})

const meta = {
	title: "Demo/Restaurant Booking",
	component: A2Renderer,
	parameters: { layout: "padded" },
	args: { registry },
} satisfies Meta<typeof A2Renderer>

export default meta
type Story = StoryObj<typeof meta>

function makeRestaurantCard(name: string, cuisineArea: string, rating: string) {
	return {
		type: "Card",
		props: { padding: "md", shadow: "sm", radius: "md", border: true },
		children: [
			{ type: "Text", props: { as: "h3", size: "md", weight: "semibold" }, children: name },
			{ type: "Text", props: { as: "p", size: "sm", color: "muted" }, children: cuisineArea },
			{ type: "Text", props: { as: "p", size: "sm" }, children: rating },
			{
				type: "Flex",
				props: { justify: "between", align: "center" },
				children: [
					{ type: "Text", props: { as: "span", size: "sm", color: "primary" }, children: "Available tonight" },
					{ type: "Button", props: { variant: "primary", size: "sm" }, children: "Book" },
				],
			},
		],
	}
}

export const SearchScreen: Story = {
	args: {
		node: {
			type: "Flex",
			props: { direction: "column", gap: "lg" },
			children: [
				{
					type: "Text",
					props: { as: "h1", size: "2xl", weight: "bold" },
					children: "Find Your Table",
				},
				{
					type: "Text",
					props: { as: "p", color: "muted" },
					children: "Search restaurants across Australia",
				},
				{
					type: "Card",
					props: { padding: "lg", shadow: "sm", radius: "lg" },
					children: [
						{
							type: "Grid",
							props: { columns: 2, gap: "md" },
							children: [
								{
									type: "TextField",
									props: { label: "Location", placeholder: "Suburb or city" },
								},
								{
									type: "Select",
									props: {
										label: "Party size",
										items: [
											{ value: "1", label: "1 guest" },
											{ value: "2", label: "2 guests" },
											{ value: "4", label: "4 guests" },
											{ value: "6", label: "6 guests" },
											{ value: "8", label: "8 guests" },
										],
									},
								},
								{ type: "DatePicker", props: { label: "Date" } },
								{
									type: "Select",
									props: {
										label: "Cuisine",
										items: [
											{ value: "any", label: "Any cuisine" },
											{ value: "italian", label: "Italian" },
											{ value: "indian", label: "Indian" },
											{ value: "japanese", label: "Japanese" },
											{ value: "thai", label: "Thai" },
											{ value: "modern-aus", label: "Modern Australian" },
										],
									},
								},
							],
						},
						{
							type: "Flex",
							props: { justify: "end" },
							children: [
								{
									type: "Button",
									props: { variant: "primary", size: "lg" },
									children: "Search Restaurants",
								},
							],
						},
					],
				},
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("Find Your Table")).toBeDefined()
		await expect(canvas.getByRole("button", { name: /search restaurants/i })).toBeDefined()
	},
}

export const RestaurantListing: Story = {
	args: {
		node: {
			type: "Flex",
			props: { direction: "column", gap: "lg" },
			children: [
				{
					type: "Breadcrumb",
					props: {
						items: [
							{ id: "home", label: "Home", href: "/" },
							{ id: "results", label: "Search Results" },
						],
					},
				},
				{
					type: "Text",
					props: { as: "h2", size: "xl", weight: "semibold" },
					children: "8 restaurants near Sydney CBD",
				},
				{
					type: "Tabs",
					props: {
						tabs: [
							{ id: "all", label: "All" },
							{ id: "italian", label: "Italian" },
							{ id: "japanese", label: "Japanese" },
							{ id: "thai", label: "Thai" },
						],
						defaultSelectedKey: "all",
					},
				},
				{
					type: "Grid",
					props: { columns: 3, gap: "md" },
					children: [
						makeRestaurantCard("La Dolce Vita", "Italian · CBD", "⭐ 4.8 · $$"),
						makeRestaurantCard("Sakura Garden", "Japanese · Surry Hills", "⭐ 4.6 · $$$"),
						makeRestaurantCard("Thai Orchid", "Thai · Newtown", "⭐ 4.7 · $$"),
					],
				},
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("La Dolce Vita")).toBeDefined()
		await expect(canvas.getByText("Sakura Garden")).toBeDefined()
		await expect(canvas.getByText("Thai Orchid")).toBeDefined()
	},
}

export const BookingForm: Story = {
	args: {
		node: {
			type: "Flex",
			props: { direction: "column", gap: "lg" },
			children: [
				{
					type: "Breadcrumb",
					props: {
						items: [
							{ id: "home", label: "Home", href: "/" },
							{ id: "results", label: "Search Results", href: "/results" },
							{ id: "book", label: "Book Table" },
						],
					},
				},
				{
					type: "Card",
					props: { padding: "md", border: true },
					children: [
						{
							type: "Flex",
							props: { justify: "between", align: "center" },
							children: [
								{
									type: "Text",
									props: { as: "h3", size: "lg", weight: "bold" },
									children: "La Dolce Vita",
								},
								{
									type: "Text",
									props: { as: "span", color: "muted" },
									children: "Italian · CBD",
								},
							],
						},
					],
				},
				{
					type: "Form",
					props: { gap: "lg" },
					children: [
						{
							type: "Text",
							props: { as: "h3", size: "lg", weight: "semibold" },
							children: "Choose a time",
						},
						{
							type: "RadioGroup",
							props: { label: "Available times", orientation: "horizontal" },
							children: [
								{ type: "Radio", props: { value: "6pm", label: "6:00 PM" } },
								{ type: "Radio", props: { value: "630pm", label: "6:30 PM" } },
								{ type: "Radio", props: { value: "7pm", label: "7:00 PM" } },
								{ type: "Radio", props: { value: "730pm", label: "7:30 PM" } },
								{ type: "Radio", props: { value: "8pm", label: "8:00 PM" } },
							],
						},
						{
							type: "Text",
							props: { as: "h3", size: "lg", weight: "semibold" },
							children: "Your details",
						},
						{
							type: "Grid",
							props: { columns: 2, gap: "md" },
							children: [
								{
									type: "TextField",
									props: { label: "First name", isRequired: true },
								},
								{
									type: "TextField",
									props: { label: "Last name", isRequired: true },
								},
								{
									type: "TextField",
									props: { label: "Email", type: "email", isRequired: true },
								},
								{ type: "TextField", props: { label: "Phone", type: "tel" } },
							],
						},
						{
							type: "CheckboxGroup",
							props: {
								label: "Dietary requirements",
								orientation: "horizontal",
							},
							children: [
								{
									type: "Checkbox",
									props: { value: "vegetarian", label: "Vegetarian" },
								},
								{ type: "Checkbox", props: { value: "vegan", label: "Vegan" } },
								{
									type: "Checkbox",
									props: { value: "gluten-free", label: "Gluten free" },
								},
								{ type: "Checkbox", props: { value: "halal", label: "Halal" } },
							],
						},
						{
							type: "Flex",
							props: { justify: "end", gap: "md" },
							children: [
								{
									type: "Button",
									props: { variant: "secondary" },
									children: "Back",
								},
								{
									type: "Button",
									props: { variant: "primary" },
									children: "Confirm Booking",
								},
							],
						},
					],
				},
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("Choose a time")).toBeDefined()
		await expect(canvas.getByRole("button", { name: /confirm booking/i })).toBeDefined()
	},
}

export const BookingConfirmation: Story = {
	args: {
		node: {
			type: "Flex",
			props: { direction: "column", align: "center", gap: "lg" },
			children: [
				{
					type: "Breadcrumb",
					props: {
						items: [
							{ id: "home", label: "Home", href: "/" },
							{ id: "results", label: "Search Results", href: "/results" },
							{ id: "confirmed", label: "Booking Confirmed" },
						],
					},
				},
				{
					type: "Text",
					props: { as: "h1", size: "2xl", weight: "bold", color: "primary" },
					children: "Booking Confirmed!",
				},
				{
					type: "Text",
					props: { as: "p", color: "muted" },
					children: "Your table has been reserved. See you soon!",
				},
				{
					type: "Card",
					props: { padding: "lg", shadow: "md", radius: "lg", border: true },
					children: [
						{
							type: "Grid",
							props: { columns: 2, gap: "sm" },
							children: [
								{
									type: "Text",
									props: { as: "span", weight: "semibold" },
									children: "Restaurant",
								},
								{
									type: "Text",
									props: { as: "span" },
									children: "La Dolce Vita",
								},
								{
									type: "Text",
									props: { as: "span", weight: "semibold" },
									children: "Date",
								},
								{
									type: "Text",
									props: { as: "span" },
									children: "Saturday, 21 June 2026",
								},
								{
									type: "Text",
									props: { as: "span", weight: "semibold" },
									children: "Time",
								},
								{ type: "Text", props: { as: "span" }, children: "7:00 PM" },
								{
									type: "Text",
									props: { as: "span", weight: "semibold" },
									children: "Party size",
								},
								{ type: "Text", props: { as: "span" }, children: "4 guests" },
								{
									type: "Text",
									props: { as: "span", weight: "semibold" },
									children: "Confirmation #",
								},
								{
									type: "Text",
									props: { as: "span", color: "primary" },
									children: "RB-20260621-0042",
								},
							],
						},
					],
				},
				{
					type: "Flex",
					props: { gap: "md" },
					children: [
						{
							type: "Button",
							props: { variant: "secondary" },
							children: "Book Another Table",
						},
						{
							type: "Button",
							props: { variant: "primary" },
							children: "Manage My Booking",
						},
					],
				},
			],
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByText("Booking Confirmed!")).toBeDefined()
		await expect(canvas.getByText("La Dolce Vita")).toBeDefined()
	},
}
