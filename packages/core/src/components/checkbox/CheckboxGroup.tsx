import type { ReactNode } from "react"
import { FieldError, Label, CheckboxGroup as RACCheckboxGroup, Text } from "react-aria-components"
import { getCheckboxGroupStyles } from "./checkbox.styles"

interface CheckboxGroupProps {
	label?: string
	value?: string[]
	defaultValue?: string[]
	isDisabled?: boolean
	isRequired?: boolean
	isInvalid?: boolean
	orientation?: "horizontal" | "vertical"
	name?: string
	description?: string
	errorMessage?: string
	onChange?: (value: string[]) => void
	children?: ReactNode
}

export function CheckboxGroup({
	label,
	value,
	defaultValue,
	isDisabled = false,
	isRequired = false,
	isInvalid = false,
	orientation = "vertical",
	name,
	description,
	errorMessage,
	onChange,
	children,
}: CheckboxGroupProps) {
	const styles = getCheckboxGroupStyles()

	return (
		<RACCheckboxGroup
			value={value}
			defaultValue={defaultValue}
			isDisabled={isDisabled}
			isRequired={isRequired}
			isInvalid={isInvalid}
			name={name}
			onChange={onChange}
			className={styles.group}
		>
			{label && <Label className={styles.label}>{label}</Label>}
			<div className={styles.items(orientation)}>{children}</div>
			{description && (
				<Text slot="description" className={styles.description}>
					{description}
				</Text>
			)}
			<FieldError className={styles.errorMessage}>{errorMessage}</FieldError>
		</RACCheckboxGroup>
	)
}
