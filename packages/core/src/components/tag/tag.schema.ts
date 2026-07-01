import { z } from "zod"

export const TagSchema = z.object({
	type: z.literal("Tag"),
	props: z
		.object({
			id: z.string().optional(),
			isDisabled: z.boolean().optional(),
		})
		.strict()
		.optional(),
	children: z.string().optional(),
})

export type TagNode = z.infer<typeof TagSchema>

export const TagGroupSchema = z.object({
	type: z.literal("TagGroup"),
	props: z
		.object({
			label: z.string().optional(),
			selectionMode: z.enum(["none", "single", "multiple"]).optional(),
			description: z.string().optional(),
		})
		.strict()
		.optional(),
	children: z.array(TagSchema).optional(),
})

export type TagGroupNode = z.infer<typeof TagGroupSchema>
