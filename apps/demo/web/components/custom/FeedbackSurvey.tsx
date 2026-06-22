"use client"

import { useState } from "react"
import { getFeedbackSurveyStyles } from "./feedback-survey.styles"

interface FeedbackSurveyProps {
	title?: string
	description?: string
	submitLabel?: string
	commentPlaceholder?: string
	onSubmit?: (rating: number, comment: string) => void
}

export function FeedbackSurvey({
	title = "How was your experience?",
	description,
	submitLabel = "Submit feedback",
	commentPlaceholder = "Any comments? (optional)",
	onSubmit,
}: FeedbackSurveyProps) {
	const [rating, setRating] = useState(0)
	const [hovered, setHovered] = useState(0)
	const [comment, setComment] = useState("")
	const [submitted, setSubmitted] = useState(false)
	const s = getFeedbackSurveyStyles()

	const active = hovered || rating

	const handleSubmit = () => {
		if (rating === 0) return
		onSubmit?.(rating, comment.trim())
		setSubmitted(true)
	}

	if (submitted) {
		return (
			<div className={s.thanksWrap}>
				<span aria-hidden="true" className="text-5xl">
					🎉
				</span>
				<p className={s.thanksText}>Thanks for your feedback!</p>
				<p className={s.thanksSub}>Your response has been recorded.</p>
			</div>
		)
	}

	return (
		<div className={s.container}>
			<p className={s.title}>{title}</p>
			{description && <p className={s.description}>{description}</p>}

			<fieldset className={s.starsRow}>
				<legend className="sr-only">Star rating</legend>
				{[1, 2, 3, 4, 5].map((star) => (
					<button
						key={star}
						type="button"
						aria-label={`${star} star${star !== 1 ? "s" : ""}`}
						aria-pressed={rating === star ? "true" : "false"}
						onClick={() => setRating(star)}
						onMouseEnter={() => setHovered(star)}
						onMouseLeave={() => setHovered(0)}
						className={s.starButton(star <= active)}
					>
						{star <= active ? <FilledStar /> : <OutlinedStar />}
					</button>
				))}
			</fieldset>

			<textarea
				className={s.textarea}
				placeholder={commentPlaceholder}
				value={comment}
				onChange={(e) => setComment(e.target.value)}
				rows={3}
				aria-label="Additional comments"
			/>

			<button type="button" onClick={handleSubmit} disabled={rating === 0} className={s.submit(rating > 0)}>
				{submitLabel}
			</button>
		</div>
	)
}

// Symmetric 5-pointed star: outer R=10, inner r=4, centered at (12,12)
const STAR_POINTS = "12,2 14.35,8.76 21.51,8.91 15.8,13.24 17.88,20.09 12,16 6.12,20.09 8.2,13.24 2.49,8.91 9.65,8.76"

function FilledStar() {
	return (
		<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			<title>Star</title>
			<polygon points={STAR_POINTS} />
		</svg>
	)
}

function OutlinedStar() {
	return (
		<svg
			width="28"
			height="28"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<title>Star</title>
			<polygon points={STAR_POINTS} />
		</svg>
	)
}
