import { z } from "zod"
import { A2NodeSchema } from "../../schema/index.ts"

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
		.strict()
		.optional(),
	children: z.array(A2NodeSchema).optional(),
})

export type PopoverNode = z.infer<typeof PopoverSchema>
