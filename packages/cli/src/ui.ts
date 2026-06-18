// Minimal ANSI styling + logging. No dependencies; respects NO_COLOR.
const useColor = process.env.NO_COLOR === undefined && process.stdout.isTTY !== false

function wrap(open: number, close: number) {
	return (s: string) => (useColor ? `\x1b[${open}m${s}\x1b[${close}m` : s)
}

export const bold = wrap(1, 22)
export const dim = wrap(2, 22)
export const red = wrap(31, 39)
export const green = wrap(32, 39)
export const yellow = wrap(33, 39)
export const cyan = wrap(36, 39)

export function info(msg: string): void {
	console.log(msg)
}

export function success(msg: string): void {
	console.log(`${green("✓")} ${msg}`)
}

export function warn(msg: string): void {
	console.warn(`${yellow("!")} ${msg}`)
}

export function error(msg: string): void {
	console.error(`${red("✗")} ${msg}`)
}

// Print an error and exit non-zero.
export function fail(msg: string): never {
	error(msg)
	process.exit(1)
}
