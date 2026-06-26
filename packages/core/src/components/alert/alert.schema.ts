import { z } from "zod"

export const AlertSchema = z.object({
	type: z.literal("Alert"),
	props: z
		.object({
			variant: z.enum(["info", "success", "warning", "error"]).optional(),
			title: z.string().optional(),
		})
		.optional(),
	children: z.union([z.string(), z.array(z.unknown())]).optional(),
})

export type AlertNode = z.infer<typeof AlertSchema>
