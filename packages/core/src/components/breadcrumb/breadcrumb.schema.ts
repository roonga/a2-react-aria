import { z } from "zod"

const BreadcrumbItemSchema = z.object({
	id: z.string(),
	label: z.string(),
	href: z.string().optional(),
})

export type BreadcrumbItem = z.infer<typeof BreadcrumbItemSchema>

export const BreadcrumbSchema = z.object({
	type: z.literal("Breadcrumb"),
	props: z
		.object({
			items: z.array(BreadcrumbItemSchema).optional(),
			ariaLabel: z.string().optional(),
			isDisabled: z.boolean().optional(),
		})
		.optional(),
})

export type BreadcrumbNode = z.infer<typeof BreadcrumbSchema>
