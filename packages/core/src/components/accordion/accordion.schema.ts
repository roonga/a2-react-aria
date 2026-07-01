import { z } from "zod"
import { A2NodeSchema } from "../../schema"

export const AccordionItemSchema = z.object({
	type: z.literal("AccordionItem"),
	props: z
		.object({
			id: z.string().optional(),
			heading: z.string(),
			defaultExpanded: z.boolean().optional(),
			isDisabled: z.boolean().optional(),
		})
		.strict()
		.optional(),
	children: z.array(A2NodeSchema).optional(),
})

export type AccordionItemNode = z.infer<typeof AccordionItemSchema>

export const AccordionSchema = z.object({
	type: z.literal("Accordion"),
	props: z
		.object({
			allowsMultipleExpanded: z.boolean().optional(),
			isDisabled: z.boolean().optional(),
		})
		.strict()
		.optional(),
	children: z.array(AccordionItemSchema).optional(),
})

export type AccordionNode = z.infer<typeof AccordionSchema>
