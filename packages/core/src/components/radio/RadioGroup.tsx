import type { ReactNode } from "react"
import { FieldError, Label, RadioGroup as RACRadioGroup, Text } from "react-aria-components"
import { getRadioGroupStyles } from "./radio.styles"

interface RadioGroupProps {
	label?: string
	value?: string
	defaultValue?: string
	isDisabled?: boolean
	isRequired?: boolean
	isInvalid?: boolean
	orientation?: "horizontal" | "vertical"
	name?: string
	description?: string
	errorMessage?: string
	onChange?: (value: string) => void
	children?: ReactNode
}

export function RadioGroup({
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
}: RadioGroupProps) {
	const styles = getRadioGroupStyles()

	return (
		<RACRadioGroup
			value={value}
			defaultValue={defaultValue}
			isDisabled={isDisabled}
			isRequired={isRequired}
			isInvalid={isInvalid}
			orientation={orientation}
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
		</RACRadioGroup>
	)
}
