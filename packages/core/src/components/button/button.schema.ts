import { z } from "zod"

export const ButtonSchema = z.object({
	type: z.literal("Button"),
	props: z
		.object({
			variant: z.enum(["primary", "secondary", "danger", "ghost"]).optional(),
			disabled: z.boolean().optional(),
			size: z.enum(["sm", "md", "lg"]).optional(),
		})
		.optional(),
	children: z.union([z.string(), z.array(z.unknown())]).optional(),
})

export type ButtonNode = z.infer<typeof ButtonSchema>
