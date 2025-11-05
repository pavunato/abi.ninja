const META_PREFIX = "contractMeta_";

function metaKey(network: string | number, address: string) {
  return `${META_PREFIX}${network}_${address}`;
}

export function getContractName(network: string | number, address: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(metaKey(network, address));
  } catch {
    return null;
  }
}

export function setContractName(network: string | number, address: string, name: string) {
  if (typeof window === "undefined") return;
  try {
    if (name) localStorage.setItem(metaKey(network, address), name);
    else localStorage.removeItem(metaKey(network, address));
  } catch {
    // ignore
  }
}

export function clearContractName(network: string | number, address: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(metaKey(network, address));
  } catch {
    // ignore
  }
}

export function parseContractDataKey(key: string): { type: string; network: string; address: string } | null {
  if (!key.startsWith("contractData_")) return null;
  const parts = key.split("_");
  if (parts.length < 4) return null;
  const type = parts[1];
  const network = parts[2];
  const address = parts.slice(3).join("_");
  return { type, network, address };
}
