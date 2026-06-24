import {
	ButtonSchema,
	CardSchema,
	DatePickerSchema,
	FlexSchema,
	GridSchema,
	NumberFieldSchema,
	RadioGroupSchema,
	RadioSchema,
	SelectSchema,
	TextFieldSchema,
	TextSchema,
} from "@a2ra/core"
import { FeedbackSurveySchema } from "../components/custom/feedback-survey.schema.ts"

export const registrySchemas = {
	Button: ButtonSchema,
	Card: CardSchema,
	DatePicker: DatePickerSchema,
	FeedbackSurvey: FeedbackSurveySchema,
	Flex: FlexSchema,
	Grid: GridSchema,
	NumberField: NumberFieldSchema,
	Radio: RadioSchema,
	RadioGroup: RadioGroupSchema,
	Select: SelectSchema,
	Text: TextSchema,
	TextField: TextFieldSchema,
} as const
