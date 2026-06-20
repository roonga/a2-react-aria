import { z } from "zod"

export const FlexSchema = z.object({
	type: z.literal("Flex"),
	props: z
		.object({
			direction: z.enum(["row", "column", "row-reverse", "column-reverse"]).optional(),
			gap: z.enum(["none", "xs", "sm", "md", "lg", "xl"]).optional(),
			align: z.enum(["start", "center", "end", "stretch", "baseline"]).optional(),
			justify: z.enum(["start", "center", "end", "between", "around", "evenly"]).optional(),
			wrap: z.boolean().optional(),
		})
		.optional(),
	children: z.array(z.unknown()).optional(),
})

export type FlexNode = z.infer<typeof FlexSchema>

export const GridSchema = z.object({
	type: z.literal("Grid"),
	props: z
		.object({
			columns: z.number().int().min(1).max(12).optional(),
			gap: z.enum(["none", "xs", "sm", "md", "lg", "xl"]).optional(),
			align: z.enum(["start", "center", "end", "stretch"]).optional(),
		})
		.optional(),
	children: z.array(z.unknown()).optional(),
})

export type GridNode = z.infer<typeof GridSchema>
