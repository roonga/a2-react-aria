import { z } from "zod"

export const CheckboxSchema = z.object({
	type: z.literal("Checkbox"),
	props: z
		.object({
			label: z.string().optional(),
			value: z.string().optional(),
			isSelected: z.boolean().optional(),
			defaultSelected: z.boolean().optional(),
			isDisabled: z.boolean().optional(),
			isRequired: z.boolean().optional(),
			isIndeterminate: z.boolean().optional(),
		})
		.optional(),
})

export type CheckboxNode = z.infer<typeof CheckboxSchema>

export const CheckboxGroupSchema = z.object({
	type: z.literal("CheckboxGroup"),
	props: z
		.object({
			label: z.string().optional(),
			value: z.array(z.string()).optional(),
			defaultValue: z.array(z.string()).optional(),
			isDisabled: z.boolean().optional(),
			isRequired: z.boolean().optional(),
			isInvalid: z.boolean().optional(),
			orientation: z.enum(["horizontal", "vertical"]).optional(),
			name: z.string().optional(),
			description: z.string().optional(),
			errorMessage: z.string().optional(),
		})
		.optional(),
	children: z.array(z.unknown()).optional(),
})

export type CheckboxGroupNode = z.infer<typeof CheckboxGroupSchema>
