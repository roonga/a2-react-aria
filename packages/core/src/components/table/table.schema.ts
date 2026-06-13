import { z } from "zod"

const TableColumnSchema = z.object({
	id: z.string(),
	label: z.string(),
	isRowHeader: z.boolean().optional(),
})

const TableRowSchema = z.object({
	id: z.string(),
	data: z.record(z.string(), z.string()),
})

export type TableColumn = z.infer<typeof TableColumnSchema>
export type TableRow = z.infer<typeof TableRowSchema>

export const TableSchema = z.object({
	type: z.literal("Table"),
	props: z
		.object({
			ariaLabel: z.string().optional(),
			columns: z.array(TableColumnSchema).optional(),
			rows: z.array(TableRowSchema).optional(),
			selectionMode: z.enum(["none", "single", "multiple"]).optional(),
		})
		.optional(),
})

export type TableNode = z.infer<typeof TableSchema>
