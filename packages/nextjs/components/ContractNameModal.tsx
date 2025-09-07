import { useCallback, useEffect, useState } from "react";
import { clearContractName, getContractName, setContractName } from "~~/utils/recently";

type Props = {
  isOpen: boolean;
  network: string | number;
  address: string;
  onClose: () => void;
  onSaved?: (name: string | null) => void;
};

export const ContractNameModal = ({ isOpen, network, address, onClose, onSaved }: Props) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const current = getContractName(network, address) || "";
    setName(current);
  }, [isOpen, network, address]);

  const handleSave = useCallback(() => {
    const trimmed = name.trim();
    setContractName(network, address, trimmed);
    onSaved?.(trimmed || null);
    onClose();
  }, [name, network, address, onClose, onSaved]);

  const handleClear = useCallback(() => {
    clearContractName(network, address);
    onSaved?.(null);
    onClose();
  }, [network, address, onClose, onSaved]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-11/12 max-w-md p-5">
        <h3 className="text-lg font-semibold mb-3">Set Name</h3>
        <p className="text-xs text-gray-500 mb-3">Optional label for {address}</p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="input input-bordered w-full"
          placeholder="e.g. MyContract"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn" onClick={handleClear}>
            Clear Name
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractNameModal;
