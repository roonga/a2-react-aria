import { z } from "zod"

export const RadioSchema = z.object({
	type: z.literal("Radio"),
	props: z
		.object({
			label: z.string().optional(),
			value: z.string(),
			isDisabled: z.boolean().optional(),
		})
		.optional(),
})

export type RadioNode = z.infer<typeof RadioSchema>

export const RadioGroupSchema = z.object({
	type: z.literal("RadioGroup"),
	props: z
		.object({
			label: z.string().optional(),
			value: z.string().optional(),
			defaultValue: z.string().optional(),
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

export type RadioGroupNode = z.infer<typeof RadioGroupSchema>
