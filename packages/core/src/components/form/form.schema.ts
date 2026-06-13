import { z } from "zod"

export const FormSchema = z.object({
	type: z.literal("Form"),
	props: z
		.object({
			gap: z.enum(["sm", "md", "lg"]).optional(),
			validationBehavior: z.enum(["aria", "native"]).optional(),
			action: z.string().optional(),
			method: z.enum(["get", "post"]).optional(),
		})
		.optional(),
	children: z.array(z.unknown()).optional(),
})

export type FormNode = z.infer<typeof FormSchema>
