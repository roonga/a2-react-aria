import { FieldError, Input, Label, TextField as RACTextField, Text } from "react-aria-components"
import { getTextFieldStyles } from "./text-field.styles"

interface TextFieldProps {
	label?: string
	placeholder?: string
	type?: "text" | "email" | "password" | "number" | "tel" | "url"
	name?: string
	value?: string
	defaultValue?: string
	isDisabled?: boolean
	isRequired?: boolean
	isReadOnly?: boolean
	isInvalid?: boolean
	validationBehavior?: "aria" | "native"
	validate?: (value: string) => string | string[] | true | null | undefined
	minLength?: number
	maxLength?: number
	pattern?: string
	description?: string
	errorMessage?: string
	onChange?: (value: string) => void
}

export function TextField({
	label,
	placeholder,
	type = "text",
	name,
	value,
	defaultValue,
	isDisabled = false,
	isRequired = false,
	isReadOnly = false,
	isInvalid = false,
	validationBehavior,
	validate,
	minLength,
	maxLength,
	pattern,
	description,
	errorMessage,
	onChange,
}: TextFieldProps) {
	const styles = getTextFieldStyles()

	return (
		<RACTextField
			type={type}
			name={name}
			value={value}
			defaultValue={defaultValue}
			isDisabled={isDisabled}
			isRequired={isRequired}
			isReadOnly={isReadOnly}
			isInvalid={isInvalid}
			validationBehavior={validationBehavior}
			validate={validate}
			minLength={minLength}
			maxLength={maxLength}
			pattern={pattern}
			onChange={onChange}
			className={styles.container}
		>
			{label && (
				<Label className={styles.label}>
					{label}
					{isRequired && <span className={styles.requiredIndicator}> *</span>}
				</Label>
			)}
			<Input placeholder={placeholder} className={styles.input} />
			{description && (
				<Text slot="description" className={styles.description}>
					{description}
				</Text>
			)}
			<FieldError className={styles.errorMessage}>
				{({ validationErrors }) => errorMessage ?? validationErrors.join(", ")}
			</FieldError>
		</RACTextField>
	)
}
