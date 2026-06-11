import { z } from "zod"

export const A2NodeSchema: z.ZodType = z.lazy(() =>
	z.object({
		type: z.string().min(1),
		props: z.record(z.string(), z.unknown()).optional(),
		children: z.union([A2NodeSchema, z.array(A2NodeSchema), z.string()]).optional(),
	}),
)

export type A2NodeInput = {
	type: string
	props?: Record<string, unknown>
	children?: A2NodeInput | A2NodeInput[] | string
}

export function parseNode(input: unknown): A2NodeInput {
	return A2NodeSchema.parse(input) as A2NodeInput
}

export function safeParseNode(
	input: unknown,
): ReturnType<typeof A2NodeSchema.safeParse> {
	return A2NodeSchema.safeParse(input)
}
