import { z } from "zod"

const TabItemSchema = z.object({
	id: z.string(),
	label: z.string(),
	isDisabled: z.boolean().optional(),
})

export type TabItem = z.infer<typeof TabItemSchema>

export const TabsSchema = z.object({
	type: z.literal("Tabs"),
	props: z
		.object({
			tabs: z.array(TabItemSchema).optional(),
			defaultSelectedKey: z.string().optional(),
			selectedKey: z.string().optional(),
			disabledKeys: z.array(z.string()).optional(),
			orientation: z.enum(["horizontal", "vertical"]).optional(),
			keyboardActivation: z.enum(["automatic", "manual"]).optional(),
			ariaLabel: z.string().optional(),
		})
		.optional(),
	children: z.array(z.unknown()).optional(),
})

export type TabsNode = z.infer<typeof TabsSchema>
