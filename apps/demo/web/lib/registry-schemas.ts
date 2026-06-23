import { ButtonSchema } from "../components/a2ui/button/button.schema.ts"
import { CardSchema } from "../components/a2ui/card/card.schema.ts"
import { DatePickerSchema } from "../components/a2ui/date-picker/date-picker.schema.ts"
import { FlexSchema, GridSchema } from "../components/a2ui/layout/layout.schema.ts"
import { NumberFieldSchema } from "../components/a2ui/number-field/number-field.schema.ts"
import { RadioGroupSchema, RadioSchema } from "../components/a2ui/radio/radio.schema.ts"
import { SelectSchema } from "../components/a2ui/select/select.schema.ts"
import { TextSchema } from "../components/a2ui/text/text.schema.ts"
import { TextFieldSchema } from "../components/a2ui/text-field/text-field.schema.ts"
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
