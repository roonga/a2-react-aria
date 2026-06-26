import { z } from "zod"

export const AccordionItemSchema = z.object({
	type: z.literal("AccordionItem"),
	props: z
		.object({
			id: z.string().optional(),
			heading: z.string(),
			defaultExpanded: z.boolean().optional(),
			isDisabled: z.boolean().optional(),
		})
		.optional(),
	children: z.union([z.string(), z.array(z.unknown())]).optional(),
})

export type AccordionItemNode = z.infer<typeof AccordionItemSchema>

export const AccordionSchema = z.object({
	type: z.literal("Accordion"),
	props: z
		.object({
			allowsMultipleExpanded: z.boolean().optional(),
			isDisabled: z.boolean().optional(),
		})
		.optional(),
	children: z.array(z.unknown()).optional(),
})

export type AccordionNode = z.infer<typeof AccordionSchema>
