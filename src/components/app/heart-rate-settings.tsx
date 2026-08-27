"use client";

import { useState } from "react";
import { FigmaIcon } from "@/components/auth/figma-icon";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import {
  clearHeartRateConnectedBanner,
  connectHeartRateMonitor,
  disconnectHeartRateMonitor,
  enableHeartRate,
  reconnectHeartRateMonitor,
  useHeartRateRuntime,
} from "@/lib/heart-rate/runtime";

export function HeartRateSettingsCard() {
  const runtime = useHeartRateRuntime();
  const [busy, setBusy] = useState(false);
  const connected = runtime.status === "STREAMING" || runtime.status === "CONNECTED";

  async function toggle(next: boolean) {
    setBusy(true);
    await enableHeartRate(next);
    setBusy(false);
  }

  async function connect() {
    setBusy(true);
    await connectHeartRateMonitor();
    setBusy(false);
  }

  return (
    <section className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 text-base font-bold text-foreground">Frequência cardíaca</h2>
          <ToggleSwitch
            checked={runtime.enabled}
            onChange={(next) => void toggle(next)}
            label="Usar frequência cardíaca durante os treinos"
            disabled={busy}
          />
        </div>
        <p className="text-xs text-muted">
          Conecte um frequencímetro Bluetooth para acompanhar sua resposta durante o treino e incluir
          esses dados nas análises do Coach.
        </p>
      </div>

      <p className="text-sm text-muted">
        Frequencímetro Bluetooth compatível. O treino funciona mesmo sem o aparelho.
      </p>

      {runtime.enabled ? (
        <div className="flex flex-col gap-3 border-t border-border pt-3">
          {runtime.status === "UNSUPPORTED" ? (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">Frequência cardíaca</p>
              <p className="text-sm text-muted">
                Este navegador não oferece conexão direta com frequencímetros Bluetooth.
              </p>
              <p className="text-sm text-muted">O treino continuará funcionando normalmente.</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs font-bold uppercase text-muted">Dispositivo</p>
                {connected && runtime.deviceName ? (
                  <div className="mt-1 flex flex-col gap-1">
                    <p className="text-sm font-semibold text-foreground">{runtime.deviceName}</p>
                    <p className="flex items-center gap-1.5 text-xs text-foreground">
                      <span className="size-2 rounded-full bg-success" />
                      Conectado
                    </p>
                    <p className="text-xs text-muted">
                      Última conexão
                      <br />
                      {formatLastConnection(runtime.lastConnectedAt)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted">Nenhum frequencímetro conectado</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {connected ? (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void connect()}
                      className="rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground"
                    >
                      Trocar dispositivo
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void disconnectHeartRateMonitor()}
                      className="rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground"
                    >
                      Desconectar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void (runtime.status === "DISCONNECTED" ? reconnectHeartRateMonitor() : connect())}
                    className="rounded-[var(--radius-md)] bg-brand px-3 py-2 text-xs font-semibold text-on-brand"
                  >
                    Conectar frequencímetro
                  </button>
                )}
              </div>
              <p className="flex items-start gap-2 text-xs text-foreground">
                <FigmaIcon src="/icons/check.svg" alt="" size={14} className="mt-0.5 text-success" />
                Incluir nas análises do Coach de IA
              </p>
              <p className="text-xs text-muted">
                O Coach poderá considerar sua resposta cardíaca e recuperação durante os treinos junto com
                desempenho, recuperação, nutrição e histórico.
              </p>
            </>
          )}
        </div>
      ) : null}

      {runtime.justConnected ? (
        <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-brand bg-brand-soft p-3">
          <p className="text-sm font-bold text-foreground">Frequencímetro conectado</p>
          <p className="text-xs text-muted">
            A partir do próximo treino, seus dados poderão fazer parte das análises do Coach.
          </p>
          <button type="button" onClick={clearHeartRateConnectedBanner} className="self-start text-xs font-semibold text-brand">
            Entendi
          </button>
        </div>
      ) : null}
    </section>
  );
}

function formatLastConnection(iso: string | null): string {
  if (!iso) return "Hoje";
  const date = new Date(iso);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Hoje";
  return date.toLocaleDateString("pt-BR");
}
