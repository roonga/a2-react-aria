"use client"

import { extractA2ui } from "@a2ra/core"
import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

export interface Message {
	role: "user" | "assistant"
	content: string
	thought?: string
	a2uiJson?: unknown[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9080"
const APP_NAME = "restaurant_agent"
const USER_ID = "user_1"

const genReqId = () => Math.random().toString(36).slice(2, 10)

const INITIAL_MESSAGE: Message = {
	role: "assistant",
	content: "Hi! I can help you find and book a restaurant in Australia. What are you looking for?",
}

type SSEEvent = {
	content?: { parts?: Array<{ text?: string; thought?: boolean }> }
	partial?: boolean
	turnComplete?: boolean
	errorMessage?: string
}

export function useChat() {
	const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
	const [input, setInput] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [streamingText, setStreamingText] = useState("")
	const [streamingThought, setStreamingThought] = useState("")
	const messagesContainerRef = useRef<HTMLDivElement>(null)
	const sessionId = useRef<string | null>(null)
	const sessionPromise = useRef<Promise<string> | null>(null)
	const isLoadingRef = useRef(false)

	// Create ADK session on mount
	useEffect(() => {
		const rid = genReqId()
		sessionPromise.current = fetch(`${API_BASE}/apps/${APP_NAME}/users/${USER_ID}/sessions`, {
			method: "POST",
			headers: { "Content-Type": "application/json", "X-Request-ID": rid },
			body: "{}",
		})
			.then((r) => r.json())
			.then((data: { id: string }) => {
				sessionId.current = data.id
				console.info(`[Chat] [req:${rid}] session created: ${data.id}`)
				return data.id
			})
			.catch((err: unknown) => {
				console.error(`[Chat] [req:${rid}] session create failed:`, err)
				throw err
			})
	}, [])

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally scrolls on any chat state change
	useEffect(() => {
		const el = messagesContainerRef.current
		if (el) el.scrollTop = el.scrollHeight
	}, [messages, streamingText, streamingThought])

	const sendMessage = async (overrideText?: string) => {
		const userMessage = (overrideText ?? input).trim()
		if (!userMessage || isLoadingRef.current) return

		if (!sessionId.current && sessionPromise.current) {
			try {
				await sessionPromise.current
			} catch {
				return
			}
		}
		if (!sessionId.current) return

		isLoadingRef.current = true
		const rid = genReqId()
		setMessages((prev) => [...prev, { role: "user", content: userMessage }])
		setInput("")
		setIsLoading(true)
		setStreamingText("")
		setStreamingThought("")

		// Helpers scoped to this send invocation
		const clearStreaming = () => {
			setStreamingText("")
			setStreamingThought("")
		}
		const commitMessage = (text: string, thought: string) => {
			const { plainText, a2uiJson } = extractA2ui(text)
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: plainText,
					thought: thought.trim() || undefined,
					a2uiJson: a2uiJson ?? undefined,
				},
			])
			clearStreaming()
		}

		try {
			const response = await fetch(`${API_BASE}/run_sse`, {
				method: "POST",
				headers: { "Content-Type": "application/json", "X-Request-ID": rid },
				body: JSON.stringify({
					app_name: APP_NAME,
					user_id: USER_ID,
					session_id: sessionId.current,
					new_message: { role: "user", parts: [{ text: userMessage }] },
					streaming: true,
				}),
			})

			if (!response.ok) throw new Error(`HTTP ${response.status}`)

			const reader = response.body?.getReader()
			if (!reader) throw new Error("No response body")

			const decoder = new TextDecoder()
			let accumulated = ""
			let accumulatedThought = ""

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				for (const line of decoder.decode(value, { stream: true }).split("\n")) {
					if (!line.startsWith("data: ")) continue
					try {
						const event = JSON.parse(line.slice(6)) as SSEEvent

						if (event.content?.parts) {
							if (event.partial === false) {
								// Full-turn snapshot: replace accumulated, don't append
								let turnText = ""
								let finalThought = ""
								for (const part of event.content.parts) {
									if (!part.text) continue
									if (part.thought) finalThought += part.text
									else turnText += part.text
								}
								if (turnText) {
									accumulated = turnText
									setStreamingText(accumulated)
								}
								if (finalThought) accumulatedThought = finalThought
								setStreamingThought(accumulatedThought)
							} else {
								for (const part of event.content.parts) {
									if (!part.text) continue
									if (part.thought) {
										accumulatedThought += part.text
										setStreamingThought(accumulatedThought)
									} else {
										accumulated += part.text
										setStreamingText(accumulated)
									}
								}
							}
						}

						if (event.turnComplete) {
							commitMessage(accumulated, accumulatedThought)
							accumulated = ""
							accumulatedThought = ""
						}

						if (event.errorMessage) {
							setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${event.errorMessage}` }])
							clearStreaming()
							accumulated = ""
							accumulatedThought = ""
						}
					} catch {
						// ignore unparseable SSE lines
					}
				}
			}

			// Fallback: stream ended without turnComplete
			if (accumulated) commitMessage(accumulated, accumulatedThought)
		} catch (error) {
			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: `Error: ${error instanceof Error ? error.message : "Unknown error"}` },
			])
		} finally {
			isLoadingRef.current = false
			setIsLoading(false)
			clearStreaming()
		}
	}

	// Stable ref so handleAction's useCallback doesn't need sendMessage as a dep
	const sendMessageRef = useRef(sendMessage)
	sendMessageRef.current = sendMessage

	const handleAction = useCallback((text: string) => {
		void sendMessageRef.current(text)
	}, [])

	const appendMessages = useCallback((msgs: Message[]) => {
		setMessages((prev) => [...prev, ...msgs])
	}, [])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			void sendMessage()
		}
	}

	return {
		messages,
		input,
		setInput,
		isLoading,
		streamingText,
		streamingThought,
		messagesContainerRef,
		handleAction,
		appendMessages,
		sendMessage,
		handleKeyDown,
	}
}
