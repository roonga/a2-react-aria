import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
	children: ReactNode
	fallback?: ReactNode
	onError?: (error: Error, info: ErrorInfo) => void
}

interface State {
	hasError: boolean
}

export class A2ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false }

	static getDerivedStateFromError(): State {
		return { hasError: true }
	}

	componentDidCatch(error: Error, info: ErrorInfo): void {
		console.error("[A2ErrorBoundary]", error, info.componentStack)
		this.props.onError?.(error, info)
	}

	render(): ReactNode {
		if (this.state.hasError) {
			return this.props.fallback ?? null
		}
		return this.props.children
	}
}
