export const CUSTOM_RPC_STORAGE_KEY_PREFIX = "customRpc_";

export function getCustomRpc(chainId: number): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`${CUSTOM_RPC_STORAGE_KEY_PREFIX}${chainId}`);
  } catch {
    return null;
  }
}

export function setCustomRpc(chainId: number, url: string) {
  if (typeof window === "undefined") return;
  try {
    if (url) {
      localStorage.setItem(`${CUSTOM_RPC_STORAGE_KEY_PREFIX}${chainId}`, url);
    } else {
      localStorage.removeItem(`${CUSTOM_RPC_STORAGE_KEY_PREFIX}${chainId}`);
    }
  } catch {
    // ignore
  }
}

// Fetch and select a random RPC for a given chain from Chainlist
export async function getRandomRpcFromChainlist(chainId: number): Promise<string | null> {
  try {
    const res = await fetch("https://chainlist.org/rpcs.json");
    if (!res.ok) throw new Error(`Failed to fetch RPCs: ${res.status}`);
    const data = await res.json();
    const chains = Array.isArray(data) ? data : Array.isArray((data as any)?.chains) ? (data as any).chains : [];
    const match = chains.find((c: any) => c?.chainId === chainId || c?.chain_id === chainId);
    const rawRpcs: any[] = match?.rpcs ?? match?.rpc ?? [];
    const normalized: string[] = rawRpcs
      .map((r: any) => (typeof r === "string" ? r : r?.url ?? r?.address ?? ""))
      .filter((u: string) => typeof u === "string" && u.length > 0);
    const https = normalized.filter(
      u => u.startsWith("https://") && !u.includes("${") && !u.includes("localhost") && !u.includes("127.0.0.1"),
    );
    const pool = https.length > 0 ? https : normalized.filter(u => u.startsWith("http://"));
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  } catch (e) {
    console.error(e);
    return null;
  }
}
