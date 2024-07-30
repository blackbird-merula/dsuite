import { need } from '@dsuite/core'
import type {
  Bundle,
  DPack,
  IpfsLink,
  ObjectInfo,
  ResolvedPack,
  TypeInfo,
} from '@dsuite/core/types'
import type { Artifact } from '@dsuite/core/types'
import {
  isWellFormedArtifact,
  isWellFormedBundle,
  isWellFormedLink,
  isWellFormedObject,
  isWellFormedPack,
  isWellFormedResolvedPack,
  isWellFormedType,
} from './schema'

export function assertValidPack(dpack: DPack) {
  need(
    isWellFormedPack(dpack),
    `fails schema validation: ${isWellFormedPack.errors}`,
  )
  need(dpack.network !== '', "'network' field cannot be empty")
  need(
    dpack.format === 'dpack-1',
    `unrecognized 'format' field: ${dpack.format}`,
  )

  Object.values(dpack.objects).forEach(assertValidObject)
  Object.values(dpack.types).forEach(assertValidType)

  // assertMatchingArtifacts(dpack)
}

export function assertValidLink(link: IpfsLink) {
  need(isWellFormedLink(link), `not well formed link: ${link}`)
}

export function assertValidType(typeInfo: TypeInfo) {
  need(isWellFormedType(typeInfo), `not well formed type: ${typeInfo}`)
}

export function assertValidObject(objectInfo: ObjectInfo) {
  need(isWellFormedObject(objectInfo), `not well formed object: ${objectInfo}`)
}

export function assertValidArtifact(artifact: Artifact) {
  need(isWellFormedArtifact(artifact), `not well formed artifact: ${artifact}`)
}

export function assertValidBundle(bundle: Bundle) {
  need(isWellFormedBundle(bundle), `not well formed bundle: ${bundle}`)
}

export function assertValidResolvedPack(resolvedPack: ResolvedPack) {
  need(
    isWellFormedResolvedPack(resolvedPack),
    `not well formed resolved pack: ${resolvedPack}`,
  )
}

function assertMatchingArtifacts({ objects, types }: DPack) {
  // If an object's typename matches one of the types declared in this same scope (the same dpack),
  // or if multiple objects have the same typename, then the artifacts must also match.
  const infos = [objects, types].flatMap<ObjectInfo | TypeInfo>(Object.values)
  const mismatches = infos
    .filter((info) => {
      const match = infos.find((i) => i.typename === info.typename)
      return match && match.artifact['/'] !== info.artifact['/']
    })
    .map((info) => info.typename)

  need(
    mismatches.length === 0,
    `identical typenames with mismatching artifacts: ${mismatches.join(', ')}`,
  )
}
