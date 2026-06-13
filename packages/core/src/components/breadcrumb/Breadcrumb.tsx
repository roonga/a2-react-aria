import { Link, Breadcrumb as RACBreadcrumb, Breadcrumbs as RACBreadcrumbs } from "react-aria-components"
import type { BreadcrumbItem } from "./breadcrumb.schema"
import { getBreadcrumbStyles } from "./breadcrumb.styles"

interface BreadcrumbProps {
	items?: BreadcrumbItem[]
	ariaLabel?: string
	isDisabled?: boolean
	onAction?: (id: string) => void
}

export function Breadcrumb({ items = [], ariaLabel = "Breadcrumb", isDisabled, onAction }: BreadcrumbProps) {
	const styles = getBreadcrumbStyles()
	return (
		<RACBreadcrumbs
			aria-label={ariaLabel}
			isDisabled={isDisabled}
			onAction={(key) => onAction?.(key as string)}
			className={styles.breadcrumbs}
		>
			{items.map((item) => (
				<RACBreadcrumb key={item.id} id={item.id} className={styles.item}>
					{({ isCurrent }) => (
						<>
							<Link href={item.href} className={styles.link}>
								{item.label}
							</Link>
							{!isCurrent && (
								<span aria-hidden="true" className={styles.separator}>
									/
								</span>
							)}
						</>
					)}
				</RACBreadcrumb>
			))}
		</RACBreadcrumbs>
	)
}
