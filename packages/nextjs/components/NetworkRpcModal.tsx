import { useCallback, useEffect, useMemo, useState } from "react";
import { getCustomRpc, getRandomRpcFromChainlist, setCustomRpc } from "~~/utils/rpc";
import { notification } from "~~/utils/scaffold-eth";

type Props = {
  isOpen: boolean;
  chainId: number;
  chainLabel: string;
  defaultRpc?: string;
  onClose: () => void;
};

export const NetworkRpcModal = ({ isOpen, chainId, chainLabel, defaultRpc = "", onClose }: Props) => {
  const [rpcInput, setRpcInput] = useState("");
  const [isRandomizing, setIsRandomizing] = useState(false);

  const effectiveDefault = useMemo(() => defaultRpc ?? "", [defaultRpc]);

  useEffect(() => {
    if (!isOpen) return;
    const stored = getCustomRpc(chainId);
    setRpcInput(stored ?? effectiveDefault);
  }, [isOpen, chainId, effectiveDefault]);

  const handleRandom = useCallback(async () => {
    setIsRandomizing(true);
    try {
      const pick = await getRandomRpcFromChainlist(chainId);
      if (!pick) {
        notification.error("No suitable RPC endpoints found for this chain.");
      } else {
        setRpcInput(pick);
        notification.success("Random RPC selected. Review and Save to apply.");
      }
    } catch (e: any) {
      console.error(e);
      notification.error("Failed to load RPC list from Chainlist.");
    } finally {
      setIsRandomizing(false);
    }
  }, [chainId]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = useCallback(() => {
    const trimmed = rpcInput.trim();
    setCustomRpc(chainId, trimmed);
    onClose();
    if (typeof window !== "undefined") window.location.reload();
  }, [chainId, onClose, rpcInput]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-11/12 max-w-md p-5">
        <h3 className="text-lg font-semibold mb-2">Custom RPC for {chainLabel}</h3>
        <p className="text-xs text-gray-500 mb-3">Leave empty to use default RPC.</p>
        <input
          type="text"
          value={rpcInput}
          onChange={e => setRpcInput(e.target.value)}
          placeholder={effectiveDefault || "https://..."}
          className="input input-bordered w-full"
        />
        <div className="mt-4 flex justify-between gap-2 items-center">
          <button className="btn btn-outline" disabled={isRandomizing} onClick={handleRandom}>
            {isRandomizing ? "Loading..." : "Randomize"}
          </button>
          <div className="flex justify-end gap-2">
            <button className="btn btn-ghost" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkRpcModal;
