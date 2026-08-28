import { describe, expect, it } from "vitest";
import {
  catalogGifFileNames,
  fileIdFromFilesLookup,
  fileIdFromMediaLookup,
} from "@/lib/catalog/gif-from-nhost";
import { storageAuthHeaders } from "@/lib/nhost/graphql-server";

describe("lookup do GIF no Nhost", () => {
  it("tenta o object_key inteiro e o nome do arquivo", () => {
    expect(catalogGifFileNames("gifs/gluteos/abducao.gif")).toEqual([
      "gifs/gluteos/abducao.gif",
      "abducao.gif",
    ]);
    expect(catalogGifFileNames("sozinho.gif")).toEqual(["sozinho.gif"]);
  });

  it("lê file_id de files e de exercise_media", () => {
    expect(fileIdFromFilesLookup({ files: [{ id: "file-1" }] })).toBe("file-1");
    expect(fileIdFromFilesLookup({ files: [] })).toBeNull();
    expect(fileIdFromMediaLookup({ exercise_media: [{ file_id: "media-1" }] })).toBe("media-1");
    expect(fileIdFromMediaLookup({ exercise_media: [{ file_id: null }] })).toBeNull();
  });
});

describe("storage do catálogo", () => {
  it("só autentica sessão real ou admin secret", () => {
    expect(storageAuthHeaders({ preview: true, accessToken: "abc" })).toEqual([]);
    expect(storageAuthHeaders({ accessToken: "preview" })).toEqual([]);
    expect(storageAuthHeaders({ accessToken: "nhost-jwt" })).toEqual([
      { Authorization: "Bearer nhost-jwt" },
    ]);
  });
});
