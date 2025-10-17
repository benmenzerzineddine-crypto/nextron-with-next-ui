import type { Supplier, Type } from "@/types/schema";

export function computeSku(supplier?: Partial<Supplier>, height?: number, grammage?: number, type?: Partial<Type>) {
  const parts = [supplier?.name ?? "", height ?? "", grammage ?? "", type?.name ?? ""]
    .map((p) => String(p).trim())
    .filter(Boolean)
    .map((p) => p.replace(/\s+/g, "").toUpperCase());
  return parts.join("-");
}

export default computeSku;