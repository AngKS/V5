"use client";
import { useEffect } from "react";
import {
  registerPortfolioTools,
  type PortfolioModelContext,
} from "@/lib/webmcp";

export function PortfolioWebMCP() {
  useEffect(() => {
    const context = (
      document as Document & { modelContext?: PortfolioModelContext }
    ).modelContext;
    if (!context || typeof context.registerTool !== "function") return;
    return registerPortfolioTools(context);
  }, []);
  return null;
}
