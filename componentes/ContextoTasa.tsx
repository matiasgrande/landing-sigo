"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useTasaBcv, type TasaBcv } from "@/lib/useTasaBcv";

interface ValorContextoTasa {
  tasa: TasaBcv | null;
  error: boolean;
}

const ContextoTasa = createContext<ValorContextoTasa>({ tasa: null, error: false });

export function ProveedorTasa({ children }: { children: ReactNode }) {
  const valor = useTasaBcv();
  return <ContextoTasa.Provider value={valor}>{children}</ContextoTasa.Provider>;
}

export function useTasa(): ValorContextoTasa {
  return useContext(ContextoTasa);
}
