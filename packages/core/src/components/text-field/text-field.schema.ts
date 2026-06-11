import { z } from "zod"

export const TextFieldSchema = z.object({
	type: z.literal("TextField"),
	props: z
		.object({
			label: z.string().optional(),
			placeholder: z.string().optional(),
			disabled: z.boolean().optional(),
			required: z.boolean().optional(),
			type: z.enum(["text", "email", "password", "number", "tel", "url"]).optional(),
			value: z.string().optional(),
		})
		.optional(),
})

export type TextFieldNode = z.infer<typeof TextFieldSchema>
