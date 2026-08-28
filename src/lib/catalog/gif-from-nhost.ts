import type { StoredAppSession } from "@/lib/auth/session-cookie";
import {
  nhostStorageEndpoint,
  runGraphqlForCatalog,
  storageAuthHeaders,
} from "@/lib/nhost/graphql-server";

export const FILES_BY_NAME_QUERY = `
  query CatalogGifFile($name: String!) {
    files(
      where: { _and: [{ bucketId: { _eq: "exercise-media" } }, { name: { _eq: $name } }] }
      limit: 1
    ) {
      id
    }
  }
`;

export const MEDIA_BY_KEY_QUERY = `
  query CatalogGifMedia($object_key: String!) {
    exercise_media(where: { object_key: { _eq: $object_key } }, limit: 1) {
      file_id
    }
  }
`;

export function catalogGifFileNames(objectKey: string): string[] {
  const names = [objectKey];
  const slash = objectKey.lastIndexOf("/");
  if (slash >= 0) {
    const base = objectKey.slice(slash + 1);
    if (base) names.push(base);
  }
  return names;
}

export function fileIdFromFilesLookup(data: { files?: { id: string }[] } | null): string | null {
  const id = data?.files?.[0]?.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

export function fileIdFromMediaLookup(
  data: { exercise_media?: { file_id: string | null }[] } | null,
): string | null {
  const id = data?.exercise_media?.[0]?.file_id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

export async function lookupCatalogGifFileId(
  session: StoredAppSession | null,
  objectKey: string,
): Promise<string | null> {
  for (const name of catalogGifFileNames(objectKey)) {
    const files = await runGraphqlForCatalog<{ files: { id: string }[] }>(
      session,
      FILES_BY_NAME_QUERY,
      { name },
    );
    const id = fileIdFromFilesLookup(files.ok ? files.data : null);
    if (id) return id;
  }
  const media = await runGraphqlForCatalog<{
    exercise_media: { file_id: string | null }[];
  }>(session, MEDIA_BY_KEY_QUERY, { object_key: objectKey });
  return fileIdFromMediaLookup(media.ok ? media.data : null);
}

export async function fetchAuthorizedGifFromNhost(
  session: StoredAppSession | null,
  objectKey: string,
): Promise<Response | null> {
  const storage = nhostStorageEndpoint();
  const attempts = storageAuthHeaders(session);
  if (!storage || attempts.length === 0) return null;
  const fileId = await lookupCatalogGifFileId(session, objectKey);
  if (!fileId) return null;
  for (const headers of attempts) {
    try {
      const remote = await fetch(`${storage}/files/${encodeURIComponent(fileId)}`, { headers });
      if (remote.ok && remote.body) return remote;
    } catch {
      continue;
    }
  }
  return null;
}
