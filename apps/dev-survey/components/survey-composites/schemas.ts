import { A2NodeSchema } from "@a2ra/core"
import { z } from "zod"

export const SurveyPageSchema = z.object({
	type: z.literal("SurveyPage"),
	props: z
		.object({
			title: z.string(),
			description: z.string().optional(),
		})
		.strict(),
	children: z.array(A2NodeSchema).optional(),
})

export type SurveyPageNode = z.infer<typeof SurveyPageSchema>

export const SurveyQuestionSchema = z.object({
	type: z.literal("SurveyQuestion"),
	props: z
		.object({
			description: z.string().optional(),
			hint: z.string().optional(),
			error: z.string().optional(),
		})
		.strict()
		.optional(),
	children: z.union([A2NodeSchema, z.array(A2NodeSchema)]).optional(),
})

export type SurveyQuestionNode = z.infer<typeof SurveyQuestionSchema>
