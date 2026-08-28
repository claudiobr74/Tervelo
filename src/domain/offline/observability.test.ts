import { describe, expect, it } from "vitest";
import { metricEvent, sanitizeSyncLog } from "./observability";

describe("observabilidade offline", () => {
  it("carimba a métrica com o instante informado", () => {
    const metric = metricEvent("sync_success", 3, "2026-08-27T10:00:00.000Z");
    expect(metric).toEqual({ name: "sync_success", value: 3, at: "2026-08-27T10:00:00.000Z" });
  });

  it("registra apenas identificação e estado, sem dado do usuário", () => {
    const log = sanitizeSyncLog({
      opId: "op-1",
      entity: "body_measurement",
      status: "ERRO",
      errorCode: "permission_denied",
    });
    expect(log).toEqual({
      opId: "op-1",
      entity: "body_measurement",
      status: "ERRO",
      errorCode: "permission_denied",
    });
    expect(Object.keys(log)).toEqual(["opId", "entity", "status", "errorCode"]);
  });

  it("normaliza ausência de erro em string vazia", () => {
    expect(sanitizeSyncLog({ opId: "op-2", entity: "set_result", status: "OK" }).errorCode).toBe(
      "",
    );
    expect(
      sanitizeSyncLog({ opId: "op-3", entity: "set_result", status: "OK", errorCode: null })
        .errorCode,
    ).toBe("");
  });
});
