import { Button, FieldError, Group, Input, Label, NumberField as RACNumberField, Text } from "react-aria-components"
import { getNumberFieldStyles } from "./number-field.styles"

interface NumberFieldProps {
	label?: string
	placeholder?: string
	minValue?: number
	maxValue?: number
	step?: number
	defaultValue?: number
	isRequired?: boolean
	isDisabled?: boolean
	isReadOnly?: boolean
	isInvalid?: boolean
	name?: string
	description?: string
	errorMessage?: string
	onChange?: (value: number) => void
}

export function NumberField({
	label,
	placeholder,
	minValue,
	maxValue,
	step,
	defaultValue,
	isRequired = false,
	isDisabled = false,
	isReadOnly = false,
	isInvalid = false,
	name,
	description,
	errorMessage,
	onChange,
}: NumberFieldProps) {
	const styles = getNumberFieldStyles()

	return (
		<RACNumberField
			minValue={minValue}
			maxValue={maxValue}
			step={step}
			defaultValue={defaultValue}
			isRequired={isRequired}
			isDisabled={isDisabled}
			isReadOnly={isReadOnly}
			isInvalid={isInvalid}
			name={name}
			onChange={onChange}
			className={styles.container}
		>
			{label && (
				<Label className={styles.label}>
					{label}
					{isRequired && <span className={styles.requiredIndicator}> *</span>}
				</Label>
			)}
			<Group className={styles.inputGroup}>
				<Button slot="decrement" className={styles.stepper}>
					−
				</Button>
				<span className={styles.divider} aria-hidden="true" />
				<Input placeholder={placeholder} className={styles.input} />
				<span className={styles.divider} aria-hidden="true" />
				<Button slot="increment" className={styles.stepper}>
					+
				</Button>
			</Group>
			{description && (
				<Text slot="description" className={styles.description}>
					{description}
				</Text>
			)}
			<FieldError className={styles.errorMessage}>
				{({ validationErrors }) => errorMessage ?? validationErrors.join(", ")}
			</FieldError>
		</RACNumberField>
	)
}
