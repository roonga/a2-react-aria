import { z } from "zod"

export const DialogSchema = z.object({
	type: z.literal("Dialog"),
	props: z
		.object({
			title: z.string().optional(),
			description: z.string().optional(),
			triggerLabel: z.string().optional(),
			isDismissable: z.boolean().optional(),
			isKeyboardDismissDisabled: z.boolean().optional(),
			role: z.enum(["dialog", "alertdialog"]).optional(),
			isOpen: z.boolean().optional(),
		})
		.optional(),
	children: z.array(z.unknown()).optional(),
})

export type DialogNode = z.infer<typeof DialogSchema>
