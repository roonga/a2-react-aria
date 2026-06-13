import { Input, Label, TextField as RACTextField } from "react-aria-components"
import { getTextFieldStyles } from "./text-field.styles"

interface TextFieldProps {
	label?: string
	placeholder?: string
	disabled?: boolean
	required?: boolean
	type?: "text" | "email" | "password" | "number" | "tel" | "url"
	value?: string
	onChange?: (value: string) => void
}

export function TextField({
	label,
	placeholder,
	disabled = false,
	required = false,
	type = "text",
	value,
	onChange,
}: TextFieldProps) {
	const styles = getTextFieldStyles()

	return (
		<RACTextField
			type={type}
			isDisabled={disabled}
			isRequired={required}
			value={value}
			onChange={onChange}
			className={styles.container}
		>
			{label && (
				<Label className={styles.label}>
					{label}
					{required && <span className={styles.requiredIndicator}>*</span>}
				</Label>
			)}
			<Input placeholder={placeholder} className={styles.input} />
		</RACTextField>
	)
}
