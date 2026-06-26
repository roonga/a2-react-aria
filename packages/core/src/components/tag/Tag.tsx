import type { ReactNode } from "react"
import { Label, Tag as RACTag, TagGroup as RACTagGroup, TagList, Text } from "react-aria-components"
import {
	getTagStyles,
	tagGroupDescriptionStyles,
	tagGroupLabelStyles,
	tagGroupListStyles,
	tagGroupStyles,
} from "./tag.styles"

interface TagProps {
	id?: string
	isDisabled?: boolean
	children?: string
}

export function Tag({ id, isDisabled, children }: TagProps) {
	return (
		<RACTag
			id={id}
			isDisabled={isDisabled}
			textValue={children}
			className={({ isSelected, isDisabled: dis }) => getTagStyles({ isSelected, isDisabled: dis })}
		>
			{children}
		</RACTag>
	)
}

interface TagGroupProps {
	label?: string
	selectionMode?: "none" | "single" | "multiple"
	description?: string
	children?: ReactNode
}

export function TagGroup({ label, selectionMode = "none", description, children }: TagGroupProps) {
	return (
		<RACTagGroup selectionMode={selectionMode} className={tagGroupStyles}>
			{label && <Label className={tagGroupLabelStyles}>{label}</Label>}
			<TagList className={tagGroupListStyles}>{children}</TagList>
			{description && (
				<Text slot="description" className={tagGroupDescriptionStyles}>
					{description}
				</Text>
			)}
		</RACTagGroup>
	)
}
