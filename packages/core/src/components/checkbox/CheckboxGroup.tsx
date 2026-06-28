import type { ReactNode } from "react"
import { FieldError, Label, CheckboxGroup as RACCheckboxGroup, Text } from "react-aria-components"
import { getCheckboxGroupStyles } from "./checkbox.styles"

interface CheckboxGroupProps {
	readonly label?: string
	readonly value?: string[]
	readonly defaultValue?: string[]
	readonly isDisabled?: boolean
	readonly isRequired?: boolean
	readonly isReadOnly?: boolean
	readonly isInvalid?: boolean
	readonly validationBehavior?: "aria" | "native"
	readonly validate?: (value: string[]) => string | string[] | true | null | undefined
	readonly orientation?: "horizontal" | "vertical"
	readonly name?: string
	readonly description?: string
	readonly errorMessage?: string
	readonly onChange?: (value: string[]) => void
	readonly children?: ReactNode
}

export function CheckboxGroup({
	label,
	value,
	defaultValue,
	isDisabled = false,
	isRequired = false,
	isReadOnly = false,
	isInvalid = false,
	validationBehavior,
	validate,
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
			isReadOnly={isReadOnly}
			isInvalid={isInvalid}
			validationBehavior={validationBehavior}
			validate={validate}
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
