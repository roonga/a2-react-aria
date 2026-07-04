import type { Metadata } from "next"
import {
	Atkinson_Hyperlegible,
	DM_Sans,
	Inter,
	JetBrains_Mono,
	Lato,
	Lexend,
	Lora,
	Montserrat,
	Nunito,
	Open_Sans,
	Poppins,
	Roboto,
	Source_Sans_3,
} from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto" })
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-poppins" })
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" })
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" })
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" })
const atkinson = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-atkinson" })
const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" })
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans" })
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans" })
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-lato" })
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" })

export const metadata: Metadata = {
	title: "Developer Survey — a2UI Demo",
	description: "Dynamic developer survey powered by @a2ra/core",
}

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
	return (
		<html lang="en">
			<body
				className={[
					inter.variable,
					roboto.variable,
					poppins.variable,
					montserrat.variable,
					dmSans.variable,
					nunito.variable,
					atkinson.variable,
					lexend.variable,
					openSans.variable,
					sourceSans.variable,
					lato.variable,
					lora.variable,
					jetbrainsMono.variable,
					"min-h-screen bg-(--color-background) text-(--color-text)",
				].join(" ")}
			>
				{children}
			</body>
		</html>
	)
}
