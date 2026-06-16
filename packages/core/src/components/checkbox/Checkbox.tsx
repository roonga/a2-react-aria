import { CheckboxButton, CheckboxField, FieldError } from "react-aria-components"
import { getCheckboxStyles } from "./checkbox.styles"

interface CheckboxProps {
	label?: string
	value?: string
	name?: string
	isSelected?: boolean
	defaultSelected?: boolean
	isDisabled?: boolean
	isRequired?: boolean
	isIndeterminate?: boolean
	isInvalid?: boolean
	errorMessage?: string
	onChange?: (isSelected: boolean) => void
}

export function Checkbox({
	label,
	value,
	name,
	isSelected,
	defaultSelected,
	isDisabled = false,
	isRequired = false,
	isIndeterminate = false,
	isInvalid = false,
	errorMessage,
	onChange,
}: CheckboxProps) {
	const styles = getCheckboxStyles()

	return (
		<CheckboxField
			value={value}
			name={name}
			isSelected={isSelected}
			defaultSelected={defaultSelected}
			isDisabled={isDisabled}
			isRequired={isRequired}
			isIndeterminate={isIndeterminate}
			isInvalid={isInvalid}
			onChange={onChange}
			className={styles.field}
		>
			<CheckboxButton
				className={({ isDisabled: dis, isInvalid: inv }) =>
					`${styles.button} ${dis ? "cursor-not-allowed opacity-50" : ""} ${inv ? "text-[var(--color-danger)]" : ""}`
				}
			>
				{({ isSelected: sel, isIndeterminate: indet, isDisabled: dis, isInvalid: inv }) => (
					<>
						<div
							className={styles.indicator({ isSelected: sel, isIndeterminate: indet, isDisabled: dis, isInvalid: inv })}
						>
							{(sel || indet) && (
								<svg viewBox="0 0 12 12" aria-hidden="true" className="w-3 h-3">
									{indet ? (
										<rect x={1} y={5} width={10} height={2} fill="currentColor" />
									) : (
										<polyline
											points="1.5 6 4.5 9.5 10.5 2.5"
											fill="none"
											stroke="currentColor"
											strokeWidth={2}
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									)}
								</svg>
							)}
						</div>
						{label}
					</>
				)}
			</CheckboxButton>
			<FieldError className={styles.errorMessage}>
				{({ validationErrors }) => errorMessage ?? validationErrors.join(", ")}
			</FieldError>
		</CheckboxField>
	)
}
