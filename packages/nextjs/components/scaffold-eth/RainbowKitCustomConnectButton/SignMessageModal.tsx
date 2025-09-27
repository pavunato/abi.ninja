import { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useSignMessage } from "wagmi";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

type SignMessageModalProps = {
  modalId: string;
};

export const SignMessageModal = ({ modalId }: SignMessageModalProps) => {
  const { signMessageAsync } = useSignMessage();
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [signatureCopied, setSignatureCopied] = useState(false);

  const handleSign = async () => {
    if (!message) return;
    setIsSigning(true);
    try {
      const sig = await signMessageAsync({ message });
      setSignature(sig);
    } catch (error) {
      console.error("Signing failed:", error);
    } finally {
      setIsSigning(false);
    }
  };

  useEffect(() => {
    if (signature) setSignature("");
  }, [message, signature]);

  return (
    <>
      <div className="text-black">
        <input type="checkbox" id={`${modalId}`} className="modal-toggle" />
        <label htmlFor={`${modalId}`} className="modal cursor-pointer">
          <label className="modal-box relative">
            {/* dummy input to capture event onclick on modal box */}
            <input className="h-0 w-0 absolute top-0 left-0" />
            <label htmlFor={`${modalId}`} className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
              ✕
            </label>
            <div className="space-y-3 py-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Message to sign</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Enter message to sign"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                <button className="btn btn-primary" onClick={handleSign} disabled={!message || isSigning}>
                  {isSigning ? "Signing..." : "Sign Message"}
                </button>
                {signature && (
                  <div>
                    <label className="label">
                      <span className="label-text">Signature:</span>
                      {signatureCopied ? (
                        <CheckCircleIcon
                          className="ml-1.5 text-xl font-normal text-primary h-5 w-5 cursor-pointer"
                          aria-hidden="true"
                        />
                      ) : (
                        <CopyToClipboard
                          text={signature}
                          onCopy={() => {
                            setSignatureCopied(true);
                            setTimeout(() => {
                              setSignatureCopied(false);
                            }, 800);
                          }}
                        >
                          <DocumentDuplicateIcon
                            className="ml-1.5 text-xl font-normal text-primary h-5 w-5 cursor-pointer filled"
                            aria-hidden="true"
                          />
                        </CopyToClipboard>
                      )}
                    </label>
                    <div className="flex flex-col gap-2">
                      <textarea className="textarea textarea-bordered" value={signature} readOnly />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </label>
        </label>
      </div>
    </>
  );
};
