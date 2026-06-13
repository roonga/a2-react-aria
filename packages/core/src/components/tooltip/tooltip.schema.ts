import { z } from "zod"

const placement = z.enum(["top", "bottom", "left", "right"])

export const TooltipSchema = z.object({
	type: z.literal("Tooltip"),
	props: z
		.object({
			content: z.string().optional(),
			triggerLabel: z.string().optional(),
			placement: placement.optional(),
			isOpen: z.boolean().optional(),
		})
		.optional(),
})

export type TooltipNode = z.infer<typeof TooltipSchema>
