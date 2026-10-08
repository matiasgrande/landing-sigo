"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { ProveedorTasa } from "@/componentes/ContextoTasa";

/** Respeta "reducir movimiento" del sistema y comparte la tasa BCV */
export function Proveedores({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ProveedorTasa>{children}</ProveedorTasa>
    </MotionConfig>
  );
}
