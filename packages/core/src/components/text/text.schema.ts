import { z } from "zod"

export const TextSchema = z.object({
	type: z.literal("Text"),
	props: z
		.object({
			as: z.enum(["h1", "h2", "h3", "h4", "p", "span", "label"]).optional(),
			size: z.enum(["xs", "sm", "md", "lg", "xl", "2xl"]).optional(),
			weight: z.enum(["normal", "medium", "semibold", "bold"]).optional(),
			color: z.enum(["default", "muted", "primary", "danger"]).optional(),
		})
		.optional(),
	children: z.union([z.string(), z.array(z.unknown())]).optional(),
})

export type TextNode = z.infer<typeof TextSchema>
