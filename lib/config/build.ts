import { ApiError } from "@/lib/api/errors";

export function canDeferBuildData(error: unknown): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" &&
    error instanceof ApiError &&
    (error.status >= 500 ||
      ["NETWORK_ERROR", "REQUEST_TIMEOUT"].includes(error.code ?? ""))
  );
}

export function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}
