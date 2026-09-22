import type { AdminServiceContent } from "../types";
import { createBaseEmptyContent, serializeBaseContent } from "./common";

export function createEmptyService(): AdminServiceContent {
  return {
    ...createBaseEmptyContent(),
    type: "Dịch vụ",
  };
}

export function serializeServicePayload(data: Partial<AdminServiceContent>): Record<string, unknown> {
  return serializeBaseContent(data);
}
