import type { DPath } from '@dsuite/core/types'

export function parseDpath(path: string): DPath {
	if (path === '') return []

	const fullPath = path.match(/^[:.]/) ? path : `:${path}`

	const names = fullPath.match(/[a-z]+/g)
	const runes = fullPath.match(/[:.]/g)
	const banned = fullPath.match(/[^a-z.:]/)

	if (banned || !(names && runes && names.length === runes.length)) {
		throw new Error('Invalid dpath')
	}

	return names.map((name, i) => ({ locked: runes[i] === ':', name }))
}

export function isValidDpath(path: string): boolean {
	try {
		parseDpath(path)
		return true
	} catch {
		return false
	}
}
