import { z } from "zod"

const SelectItemSchema = z.object({
	label: z.string(),
	value: z.string(),
	isDisabled: z.boolean().optional(),
})

export const SelectSchema = z.object({
	type: z.literal("Select"),
	props: z
		.object({
			label: z.string().optional(),
			placeholder: z.string().optional(),
			items: z.array(SelectItemSchema).optional(),
			value: z.string().optional(),
			defaultValue: z.string().optional(),
			isDisabled: z.boolean().optional(),
			isRequired: z.boolean().optional(),
			isInvalid: z.boolean().optional(),
			name: z.string().optional(),
			description: z.string().optional(),
			errorMessage: z.string().optional(),
		})
		.optional(),
})

export type SelectNode = z.infer<typeof SelectSchema>
export type SelectItem = z.infer<typeof SelectItemSchema>
