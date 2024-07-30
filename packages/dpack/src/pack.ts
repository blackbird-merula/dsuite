import { need } from '@dsuite/core'
import type { DPack, ObjectInfo, TypeInfo } from '@dsuite/core/types'
import { assertValidObject, assertValidPack, assertValidType } from './validate'

export function merge(...packs: DPack[]): DPack {
	const [head, ...rest] = packs

	for (const pack of packs) {
		assertValidPack(pack)
		need(
			pack.format === head.format,
			"two packs have different 'format' fields",
		)
		need(
			pack.network === head.network,
			"two packs have different 'network' fields",
		)
	}

	let out = structuredClone(head)
	for (const pack of rest) {
		for (const typeInfo of Object.values(pack.types)) {
			out = addType(out, typeInfo)
		}
		for (const objectInfo of Object.values(pack.objects)) {
			out = addObject(out, objectInfo)
		}
	}

	assertValidPack(out)
	return out
}

export function blank(network: string): DPack {
	const pack: DPack = {
		format: 'dpack-1',
		network: network,
		types: {},
		objects: {},
	}
	assertValidPack(pack)
	return pack
}

export function addType(pack: DPack, typeInfo: TypeInfo): DPack {
	assertValidPack(pack)
	assertValidType(typeInfo)
	need(
		!pack.types[typeInfo.typename],
		`typename already exists: ${typeInfo.typename}`,
	)
	const out = structuredClone(pack)
	out.types[typeInfo.typename] = typeInfo
	assertValidPack(out)
	return out
}

export function addObject(pack: DPack, objectInfo: ObjectInfo): DPack {
	assertValidPack(pack)
	assertValidObject(objectInfo)
	need(
		!pack.objects[objectInfo.objectname],
		`objectname already exists: ${objectInfo.objectname}`,
	)
	const out = structuredClone(pack)
	out.objects[objectInfo.objectname] = objectInfo
	assertValidPack(pack)
	return out
}
