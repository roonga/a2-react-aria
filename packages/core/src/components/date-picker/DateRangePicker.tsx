import { parseDate } from "@internationalized/date"
import {
	Button,
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
	DateRangePicker as RACDateRangePicker,
	RangeCalendar,
	Text,
} from "react-aria-components"
import { getDatePickerStyles } from "./date-picker.styles"

interface DateRangePickerProps {
	label?: string
	name?: string
	description?: string
	errorMessage?: string
	isDisabled?: boolean
	isRequired?: boolean
	isInvalid?: boolean
	isReadOnly?: boolean
	defaultValue?: { start: string; end: string }
	minValue?: string
	maxValue?: string
}

export function DateRangePicker({
	label,
	name,
	description,
	errorMessage,
	isDisabled,
	isRequired,
	isInvalid,
	isReadOnly,
	defaultValue,
	minValue,
	maxValue,
}: DateRangePickerProps) {
	const styles = getDatePickerStyles()
	return (
		<RACDateRangePicker
			defaultValue={
				defaultValue ? { start: parseDate(defaultValue.start), end: parseDate(defaultValue.end) } : undefined
			}
			minValue={minValue ? parseDate(minValue) : undefined}
			maxValue={maxValue ? parseDate(maxValue) : undefined}
			name={name}
			isDisabled={isDisabled}
			isRequired={isRequired}
			isInvalid={isInvalid}
			isReadOnly={isReadOnly}
			className={styles.root}
		>
			{label && <Label className={styles.label}>{label}</Label>}
			<Group className={styles.group}>
				<DateInput slot="start" className={styles.input}>
					{(segment) => <DateSegment segment={segment} className={styles.segment} />}
				</DateInput>
				<span aria-hidden="true" className={styles.rangeSeparator}>
					–
				</span>
				<DateInput slot="end" className={styles.input}>
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
				<RangeCalendar className={styles.calendar}>
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
				</RangeCalendar>
			</Popover>
		</RACDateRangePicker>
	)
}
