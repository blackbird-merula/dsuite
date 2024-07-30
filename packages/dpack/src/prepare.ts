import type { PackBuilderManifest } from '@dsuite/core/types'
import { PackBuilder } from './packBuilder'

export async function prepare(manifest: PackBuilderManifest) {
	return PackBuilder.prepare(manifest)
}
