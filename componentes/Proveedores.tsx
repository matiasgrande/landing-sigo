"use client";

import type { ReactNode } from "react";
import { ProveedorTasa } from "@/componentes/ContextoTasa";

/** Proveedores globales del cliente (tasa BCV compartida) */
export function Proveedores({ children }: { children: ReactNode }) {
  return <ProveedorTasa>{children}</ProveedorTasa>;
}
