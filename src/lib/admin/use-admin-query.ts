"use client";

import { useCallback, useEffect, useState } from "react";
import { adminRequest, type AdminApiResult } from "@/lib/admin/http";

export function useAdminQuery<T>(path: string) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disconnected, setDisconnected] = useState(false);

  const reload = useCallback(async () => {
    if (!path) {
      setLoading(false);
      setData(null);
      setError(null);
      setDisconnected(false);
      return;
    }
    setLoading(true);
    const result: AdminApiResult<T> = await adminRequest<T>(path);
    if (result.ok) {
      setData(result.data);
      setError(null);
      setDisconnected(Boolean(result.disconnected));
    } else {
      setData(null);
      setError(result.error);
      setDisconnected(false);
    }
    setLoading(false);
  }, [path]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { loading, data, error, disconnected, reload };
}

export function databaseCopy(error: string | null): string {
  if (error === "nhost_unavailable") {
    return "Sem conexão com o banco. Esta tela não preenche dado inventado.";
  }
  if (error === "nhost_unreachable" || error === "graphql_error") {
    return "O banco não respondeu. Tente de novo; nada foi fabricado.";
  }
  if (error === "forbidden") return "Sem permissão para esta operação.";
  if (error) return "Não foi possível carregar os dados reais.";
  return "";
}
