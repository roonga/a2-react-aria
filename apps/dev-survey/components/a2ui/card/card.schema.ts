import { z } from "zod"

export const CardSchema = z.object({
	type: z.literal("Card"),
	props: z
		.object({
			padding: z.enum(["none", "sm", "md", "lg"]).optional(),
			shadow: z.enum(["none", "sm", "md", "lg"]).optional(),
			radius: z.enum(["none", "sm", "md", "lg"]).optional(),
			border: z.boolean().optional(),
		})
		.optional(),
	children: z.array(z.unknown()).optional(),
})

export type CardNode = z.infer<typeof CardSchema>
