import { RadioButton, RadioField } from "react-aria-components"
import { getRadioStyles } from "./radio.styles"

interface RadioProps {
	label?: string
	value: string
	isDisabled?: boolean
}

export function Radio({ label, value, isDisabled = false }: RadioProps) {
	const styles = getRadioStyles()

	return (
		<RadioField value={value} isDisabled={isDisabled} className={styles.field}>
			<RadioButton className={styles.button}>
				{({ isSelected, isDisabled: dis, isInvalid }) => (
					<>
						<div className={styles.indicator({ isSelected, isDisabled: dis, isInvalid })}>
							{isSelected && <div className={styles.dot} />}
						</div>
						{label}
					</>
				)}
			</RadioButton>
		</RadioField>
	)
}
