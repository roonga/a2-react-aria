import { FieldError, SwitchButton, SwitchField, Text } from "react-aria-components"
import { getSwitchStyles } from "./switch.styles"

interface SwitchProps {
	label?: string
	isSelected?: boolean
	defaultSelected?: boolean
	isDisabled?: boolean
	isRequired?: boolean
	isInvalid?: boolean
	isReadOnly?: boolean
	validationBehavior?: "aria" | "native"
	validate?: (value: boolean) => string | string[] | true | null | undefined
	name?: string
	value?: string
	description?: string
	errorMessage?: string
	onChange?: (isSelected: boolean) => void
}

export function Switch({
	label,
	isSelected,
	defaultSelected,
	isDisabled = false,
	isRequired = false,
	isInvalid = false,
	isReadOnly = false,
	validationBehavior,
	validate,
	name,
	value,
	description,
	errorMessage,
	onChange,
}: SwitchProps) {
	const styles = getSwitchStyles()

	return (
		<SwitchField
			isSelected={isSelected}
			defaultSelected={defaultSelected}
			isDisabled={isDisabled}
			isRequired={isRequired}
			isInvalid={isInvalid}
			isReadOnly={isReadOnly}
			validationBehavior={validationBehavior}
			validate={validate}
			name={name}
			value={value}
			onChange={onChange}
			className={styles.field}
		>
			<SwitchButton className={styles.button}>
				{({ isSelected: sel, isDisabled: dis, isInvalid: inv }) => (
					<>
						<div className={styles.track({ isSelected: sel, isDisabled: dis, isInvalid: inv })}>
							<span className={styles.handle(sel)} />
						</div>
						{label}
					</>
				)}
			</SwitchButton>
			{description && (
				<Text slot="description" className={styles.description}>
					{description}
				</Text>
			)}
			<FieldError className={styles.errorMessage}>{errorMessage}</FieldError>
		</SwitchField>
	)
}
