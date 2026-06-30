import Survey from "@/components/Survey"

export default function Home() {
	return (
		<main className="flex min-h-screen items-start justify-center p-6 pt-12">
			<div className="w-full max-w-2xl">
				<h1 className="mb-1 text-center font-bold text-(--color-text) text-2xl">Developer Survey</h1>
				<p className="mb-8 text-center text-(--color-textMuted) text-sm">
					Powered by <span className="font-medium text-(--color-primary)">@a2ra/core</span>
				</p>
				<Survey />
			</div>
		</main>
	)
}
