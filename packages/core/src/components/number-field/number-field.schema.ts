import { z } from "zod"

export const NumberFieldSchema = z.object({
	type: z.literal("NumberField"),
	props: z
		.object({
			label: z.string().optional(),
			placeholder: z.string().optional(),
			minValue: z.number().optional(),
			maxValue: z.number().optional(),
			step: z.number().optional(),
			defaultValue: z.number().optional(),
			isRequired: z.boolean().optional(),
			isDisabled: z.boolean().optional(),
			isReadOnly: z.boolean().optional(),
			description: z.string().optional(),
			errorMessage: z.string().optional(),
		})
		.optional(),
})

export type NumberFieldNode = z.infer<typeof NumberFieldSchema>
