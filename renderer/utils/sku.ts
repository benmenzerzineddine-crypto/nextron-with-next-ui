export function computeSku(supplier?: string, height?: number, grammage?: number, type?: string) {
  const parts = [supplier ?? "", height ?? "", grammage ?? "", type ?? ""]
    .map((p) => String(p).trim())
    .filter(Boolean)
    .map((p) => p.replace(/\s+/g, "").toUpperCase());
  return parts.join("-");
}

export default computeSku;
