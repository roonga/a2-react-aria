"use client"

import { FormStateContext } from "@a2ra/core"
import { useCallback, useMemo, useState } from "react"
import { SURVEY_STEPS, type SurveyAnswers } from "@/lib/survey-steps"
import A2UIBlock from "./A2UIBlock"

function getVisibleSteps(answers: SurveyAnswers) {
	return SURVEY_STEPS.filter((s) => !s.skip?.(answers))
}

export default function Survey() {
	const [stepIndex, setStepIndex] = useState(0)
	const [answers, setAnswers] = useState<SurveyAnswers>({})
	const [stepValues, setStepValues] = useState<Record<string, string>>({})

	const visibleSteps = useMemo(() => getVisibleSteps(answers), [answers])
	const currentStep = visibleSteps[stepIndex]
	const totalSteps = visibleSteps.length
	const progress = Math.round((stepIndex / Math.max(totalSteps - 1, 1)) * 100)

	const setValue = useCallback((label: string, value: string) => {
		setStepValues((prev) => ({ ...prev, [label]: value }))
	}, [])

	const handleAction = useCallback(
		(action: string) => {
			if (action === "__next__") {
				const merged: SurveyAnswers = { ...answers, ...stepValues }
				setAnswers(merged)
				setStepValues({})
				setStepIndex((i) => Math.min(i + 1, totalSteps - 1))
			} else if (action === "__back__") {
				setStepValues({})
				setStepIndex((i) => Math.max(i - 1, 0))
			}
		},
		[answers, stepValues, totalSteps],
	)

	if (!currentStep) return null

	const isDone = currentStep.id === "done"
	const isWelcome = currentStep.id === "welcome"

	return (
		<div className="flex flex-col gap-4">
			{!isDone && !isWelcome && (
				<div className="flex items-center gap-3">
					<div className="h-2 flex-1 overflow-hidden rounded-full bg-(--color-backgroundMuted)">
						<div
							className="h-full rounded-full bg-(--color-primary) transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<span className="shrink-0 text-(--color-textMuted) text-sm">
						{stepIndex} / {totalSteps - 2}
					</span>
				</div>
			)}

			<FormStateContext.Provider value={{ setValue }}>
				<A2UIBlock nodes={currentStep.nodes} onAction={handleAction} />
			</FormStateContext.Provider>
		</div>
	)
}
