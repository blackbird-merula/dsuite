import type {
	Artifact,
	Bundle,
	DPack,
	ObjectInfo,
	ResolvedPack,
	TypeInfo,
} from '@dsuite/core/types'
import { CID, type KuboRPCClient } from 'kubo-rpc-client'
import {
	assertValidArtifact,
	assertValidBundle,
	assertValidResolvedPack,
} from './validate'

export async function unpack(
	client: KuboRPCClient,
	dpack: DPack,
): Promise<ResolvedPack> {
	const bundle = await resolveBundle(client, dpack)
	const resolvedPack: ResolvedPack = {
		...structuredClone(dpack),
		_bundle: bundle,
		_resolved: true,
	}

	assertValidResolvedPack(resolvedPack)
	return resolvedPack
}

async function resolveArtifact(
	client: KuboRPCClient,
	info: ObjectInfo | TypeInfo,
) {
	const cid = CID.parse(info.artifact['/'])
	const resolvedArtifact = (await client.dag
		.get(cid)
		.then((res) => res.value)) as Artifact

	assertValidArtifact(resolvedArtifact)
	return resolvedArtifact
}

async function resolveBundle(
	client: KuboRPCClient,
	{ objects, types }: DPack,
): Promise<Bundle> {
	const bundle: Bundle = await Promise.all(
		[objects, types]
			.flatMap<[string, ObjectInfo | TypeInfo]>(Object.entries)
			.map(async ([key, info]) => [key, await resolveArtifact(client, info)]),
	).then(Object.fromEntries)

	assertValidBundle(bundle)
	return bundle
}
