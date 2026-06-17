import { z } from "zod"

export const PopoverSchema = z.object({
	type: z.literal("Popover"),
	props: z
		.object({
			triggerLabel: z.string().optional(),
			placement: z.enum(["top", "bottom", "left", "right"]).optional(),
			isOpen: z.boolean().optional(),
			defaultOpen: z.boolean().optional(),
			offset: z.number().optional(),
			crossOffset: z.number().optional(),
			shouldFlip: z.boolean().optional(),
			isKeyboardDismissDisabled: z.boolean().optional(),
			maxHeight: z.number().optional(),
		})
		.optional(),
	children: z.array(z.unknown()).optional(),
})

export type PopoverNode = z.infer<typeof PopoverSchema>
