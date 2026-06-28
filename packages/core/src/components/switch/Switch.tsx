import { FieldError, SwitchButton, SwitchField, Text } from "react-aria-components"
import { getSwitchStyles } from "./switch.styles"

interface SwitchProps {
	readonly label?: string
	readonly isSelected?: boolean
	readonly defaultSelected?: boolean
	readonly isDisabled?: boolean
	readonly isRequired?: boolean
	readonly isInvalid?: boolean
	readonly isReadOnly?: boolean
	readonly autoFocus?: boolean
	readonly validationBehavior?: "aria" | "native"
	readonly validate?: (value: boolean) => string | string[] | true | null | undefined
	readonly name?: string
	readonly value?: string
	readonly description?: string
	readonly errorMessage?: string
	readonly onChange?: (isSelected: boolean) => void
}

export function Switch({
	label,
	isSelected,
	defaultSelected,
	isDisabled = false,
	isRequired = false,
	isInvalid = false,
	isReadOnly = false,
	autoFocus,
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
			autoFocus={autoFocus}
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
