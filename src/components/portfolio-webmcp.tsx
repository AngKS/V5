"use client";
import { useEffect } from "react";
import type { PortfolioModelContext } from "@/lib/webmcp";

export function PortfolioWebMCP() {
  useEffect(() => {
    const context = (
      document as Document & { modelContext?: PortfolioModelContext }
    ).modelContext;
    if (!context || typeof context.registerTool !== "function") return;
    let disposed = false;
    let unregister: (() => void) | undefined;
    void import("@/lib/webmcp")
      .then(({ registerPortfolioTools }) => {
        if (!disposed) unregister = registerPortfolioTools(context);
      })
      .catch(() => {
        // An unavailable optional tool chunk must not interrupt the portfolio.
      });
    return () => {
      disposed = true;
      unregister?.();
    };
  }, []);
  return null;
}
