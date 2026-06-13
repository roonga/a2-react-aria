import { z } from "zod"

export const SwitchSchema = z.object({
	type: z.literal("Switch"),
	props: z
		.object({
			label: z.string().optional(),
			isSelected: z.boolean().optional(),
			defaultSelected: z.boolean().optional(),
			isDisabled: z.boolean().optional(),
			isRequired: z.boolean().optional(),
			isInvalid: z.boolean().optional(),
			isReadOnly: z.boolean().optional(),
			name: z.string().optional(),
			value: z.string().optional(),
			description: z.string().optional(),
			errorMessage: z.string().optional(),
		})
		.optional(),
})

export type SwitchNode = z.infer<typeof SwitchSchema>
