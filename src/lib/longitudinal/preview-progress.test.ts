import { describe, expect, it } from "vitest";
import { PREVIEW_BENCH_BARS, PREVIEW_BENCH_LABELS } from "./preview-progress";

describe("preview de evolução", () => {
  it("barras do supino têm um rótulo cada", () => {
    expect(PREVIEW_BENCH_BARS).toHaveLength(PREVIEW_BENCH_LABELS.length);
  });
});
