import type { ReactNode } from "react"
import { Input, Label, TextField as RACTextField } from "react-aria-components"
import type { TextFieldNode } from "./text-field.schema"

interface TextFieldProps extends Omit<Required<TextFieldNode>["props"], "type"> {
	children?: ReactNode
	disabled?: boolean
	label?: string
	placeholder?: string
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
	return (
		<RACTextField
			type={type}
			isDisabled={disabled}
			isRequired={required}
			value={value}
			onChange={onChange}
			className="flex flex-col gap-2"
		>
			{label && (
				<Label className="text-sm font-medium text-gray-700">
					{label}
					{required && <span className="text-red-600">*</span>}
				</Label>
			)}
			<Input
				placeholder={placeholder}
				className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
			/>
		</RACTextField>
	)
}
