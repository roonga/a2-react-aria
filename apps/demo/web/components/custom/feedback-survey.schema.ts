import { z } from "zod"

export const FeedbackSurveySchema = z.object({
	type: z.literal("FeedbackSurvey"),
	props: z
		.object({
			title: z.string().optional(),
			description: z.string().optional(),
			submitLabel: z.string().optional(),
			commentPlaceholder: z.string().optional(),
		})
		.optional(),
})

export type FeedbackSurveyNode = z.infer<typeof FeedbackSurveySchema>
