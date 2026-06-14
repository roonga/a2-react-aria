import { parseDate } from "@internationalized/date"
import {
	Button,
	Calendar,
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader,
	CalendarHeaderCell,
	DateInput,
	DateSegment,
	FieldError,
	Group,
	Heading,
	Label,
	Popover,
	DatePicker as RACDatePicker,
	Text,
} from "react-aria-components"
import { getDatePickerStyles } from "./date-picker.styles"

interface DatePickerProps {
	label?: string
	description?: string
	errorMessage?: string
	isDisabled?: boolean
	isRequired?: boolean
	isInvalid?: boolean
	isReadOnly?: boolean
	defaultValue?: string
	minValue?: string
	maxValue?: string
	onChange?: (value: string) => void
}

export function DatePicker({
	label,
	description,
	errorMessage,
	isDisabled,
	isRequired,
	isInvalid,
	isReadOnly,
	defaultValue,
	minValue,
	maxValue,
	onChange,
}: DatePickerProps) {
	const styles = getDatePickerStyles()
	return (
		<RACDatePicker
			defaultValue={defaultValue ? parseDate(defaultValue) : undefined}
			minValue={minValue ? parseDate(minValue) : undefined}
			maxValue={maxValue ? parseDate(maxValue) : undefined}
			isDisabled={isDisabled}
			isRequired={isRequired}
			isInvalid={isInvalid}
			isReadOnly={isReadOnly}
			onChange={(date) => onChange?.(date?.toString() ?? "")}
			className={styles.root}
		>
			{label && <Label className={styles.label}>{label}</Label>}
			<Group className={styles.group}>
				<DateInput className={styles.input}>
					{(segment) => <DateSegment segment={segment} className={styles.segment} />}
				</DateInput>
				<Button className={styles.button}>▼</Button>
			</Group>
			{description && (
				<Text slot="description" className={styles.description}>
					{description}
				</Text>
			)}
			{errorMessage && <FieldError className={styles.error}>{errorMessage}</FieldError>}
			<Popover className={styles.popover}>
				<Calendar className={styles.calendar}>
					<header className={styles.calendarHeader}>
						<Button slot="previous" className={styles.navButton}>
							◀
						</Button>
						<Heading className={styles.calendarHeading} />
						<Button slot="next" className={styles.navButton}>
							▶
						</Button>
					</header>
					<CalendarGrid className={styles.grid}>
						<CalendarGridHeader>{(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
						<CalendarGridBody>{(date) => <CalendarCell date={date} className={styles.cell} />}</CalendarGridBody>
					</CalendarGrid>
				</Calendar>
			</Popover>
		</RACDatePicker>
	)
}
