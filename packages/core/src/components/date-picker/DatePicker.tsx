import { type DateValue, parseDate } from "@internationalized/date"
import { useContext, useEffect } from "react"
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
import { FormStateContext } from "../../form-state"
import { getDatePickerStyles } from "./date-picker.styles"

interface DatePickerProps {
	label?: string
	name?: string
	description?: string
	errorMessage?: string
	isDisabled?: boolean
	isRequired?: boolean
	isInvalid?: boolean
	isReadOnly?: boolean
	autoFocus?: boolean
	isOpen?: boolean
	defaultOpen?: boolean
	granularity?: "day" | "hour" | "minute" | "second"
	firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat"
	validationBehavior?: "aria" | "native"
	validate?: (value: DateValue | null) => string | string[] | true | null | undefined
	value?: string
	defaultValue?: string
	minValue?: string
	maxValue?: string
	onChange?: (value: string) => void
	onOpenChange?: (isOpen: boolean) => void
}

export function DatePicker({
	label,
	name,
	description,
	errorMessage,
	isDisabled,
	isRequired,
	isInvalid,
	isReadOnly,
	autoFocus,
	isOpen,
	defaultOpen,
	granularity,
	firstDayOfWeek,
	validationBehavior,
	validate,
	value,
	defaultValue,
	minValue,
	maxValue,
	onChange,
	onOpenChange,
}: DatePickerProps) {
	const styles = getDatePickerStyles()
	const formCtx = useContext(FormStateContext)

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only seed
	useEffect(() => {
		if (defaultValue !== undefined && label) formCtx?.setValue(label, defaultValue)
	}, [])

	return (
		<RACDatePicker
			value={value ? parseDate(value) : undefined}
			defaultValue={defaultValue ? parseDate(defaultValue) : undefined}
			minValue={minValue ? parseDate(minValue) : undefined}
			maxValue={maxValue ? parseDate(maxValue) : undefined}
			name={name}
			isDisabled={isDisabled}
			isRequired={isRequired}
			isInvalid={isInvalid}
			isReadOnly={isReadOnly}
			autoFocus={autoFocus}
			isOpen={isOpen}
			defaultOpen={defaultOpen}
			granularity={granularity}
			validationBehavior={validationBehavior}
			validate={validate}
			onChange={(date) => {
				const v = date?.toString() ?? ""
				if (label) formCtx?.setValue(label, v)
				onChange?.(v)
			}}
			onOpenChange={onOpenChange}
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
				<Calendar firstDayOfWeek={firstDayOfWeek} className={styles.calendar}>
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
