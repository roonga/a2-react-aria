import { Cell, Column, Table as RACTable, Row, TableBody, TableHeader } from "react-aria-components"
import type { TableColumn, TableRow } from "./table.schema"
import { getTableStyles } from "./table.styles"

interface TableProps {
	ariaLabel?: string
	columns?: TableColumn[]
	rows?: TableRow[]
	selectionMode?: "none" | "single" | "multiple"
	onRowAction?: (id: string) => void
}

export function Table({
	ariaLabel = "Table",
	columns = [],
	rows = [],
	selectionMode = "none",
	onRowAction,
}: TableProps) {
	const styles = getTableStyles()
	return (
		<RACTable
			aria-label={ariaLabel}
			selectionMode={selectionMode}
			onRowAction={(key) => onRowAction?.(key as string)}
			className={styles.root}
		>
			<TableHeader>
				{columns.map((col) => (
					<Column key={col.id} id={col.id} isRowHeader={col.isRowHeader} className={styles.column}>
						{col.label}
					</Column>
				))}
			</TableHeader>
			<TableBody>
				{rows.map((row) => (
					<Row key={row.id} id={row.id} className={styles.row}>
						{columns.map((col) => (
							<Cell key={col.id} className={styles.cell}>
								{row.data[col.id] ?? ""}
							</Cell>
						))}
					</Row>
				))}
			</TableBody>
		</RACTable>
	)
}
