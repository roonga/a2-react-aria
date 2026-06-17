import {
	Button,
	FieldError,
	Label,
	ListBox,
	ListBoxItem,
	Popover,
	Select as RACSelect,
	SelectValue,
	Text,
} from "react-aria-components"
import type { SelectItem } from "./select.schema"
import { getSelectStyles } from "./select.styles"

interface SelectProps {
	label?: string
	placeholder?: string
	items?: SelectItem[]
	value?: string
	defaultValue?: string
	isDisabled?: boolean
	isRequired?: boolean
	isInvalid?: boolean
	isOpen?: boolean
	defaultOpen?: boolean
	disabledKeys?: string[]
	validationBehavior?: "aria" | "native"
	validate?: (value: string) => string | string[] | true | null | undefined
	name?: string
	description?: string
	errorMessage?: string
	onChange?: (value: string) => void
	onOpenChange?: (isOpen: boolean) => void
}

export function Select({
	label,
	placeholder = "Select an option",
	items = [],
	value,
	defaultValue,
	isDisabled = false,
	isRequired = false,
	isInvalid = false,
	isOpen,
	defaultOpen,
	disabledKeys,
	validationBehavior,
	validate,
	name,
	description,
	errorMessage,
	onChange,
	onOpenChange,
}: SelectProps) {
	const styles = getSelectStyles()

	return (
		<RACSelect
			selectedKey={value}
			defaultSelectedKey={defaultValue}
			isDisabled={isDisabled}
			isRequired={isRequired}
			isInvalid={isInvalid}
			isOpen={isOpen}
			defaultOpen={defaultOpen}
			validationBehavior={validationBehavior}
			validate={validate ? (key) => validate(key as string) : undefined}
			name={name}
			placeholder={placeholder}
			onSelectionChange={(key) => onChange?.(key as string)}
			onOpenChange={onOpenChange}
			className={styles.field}
		>
			{label && <Label className={styles.label}>{label}</Label>}
			<Button className={({ isDisabled: dis }) => styles.trigger({ isDisabled: dis, isInvalid })}>
				<SelectValue>
					{({ selectedText, isPlaceholder }) => (
						<span className={isPlaceholder ? styles.placeholder : styles.value}>
							{isPlaceholder ? placeholder : selectedText}
						</span>
					)}
				</SelectValue>
				<svg
					aria-hidden="true"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					strokeWidth={1.5}
					className={styles.chevron}
				>
					<path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</Button>
			{description && (
				<Text slot="description" className={styles.description}>
					{description}
				</Text>
			)}
			<FieldError className={styles.errorMessage}>{errorMessage}</FieldError>
			<Popover className={styles.popover}>
				<ListBox disabledKeys={disabledKeys} className={styles.listbox}>
					{items.map((item) => (
						<ListBoxItem key={item.value} id={item.value} isDisabled={item.isDisabled} className={styles.item}>
							{item.label}
						</ListBoxItem>
					))}
				</ListBox>
			</Popover>
		</RACSelect>
	)
}
