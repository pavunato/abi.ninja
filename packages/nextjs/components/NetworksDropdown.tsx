import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import NetworkRpcModal from "./NetworkRpcModal";
import Select, { OptionProps, components } from "react-select";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

type Options = {
  value: number;
  label: string;
  icon?: string;
};
type GroupedOptions = Record<
  "mainnet" | "testnet" | "localhost",
  {
    label: string;
    options: Options[];
  }
>;

const networks = getTargetNetworks();
const groupedOptions = networks.reduce<GroupedOptions>(
  (groups, network) => {
    // Handle the case for localhost
    if (network.id === 31337) {
      groups.localhost.options.push({
        value: network.id,
        label: network.name,
        icon: network.icon,
      });
      return groups;
    }

    const groupName = network.testnet ? "testnet" : "mainnet";

    groups[groupName].options.push({
      value: network.id,
      label: network.name,
      icon: network.icon,
    });

    return groups;
  },
  {
    mainnet: { label: "mainnet", options: [] },
    testnet: { label: "testnet", options: [] },
    localhost: { label: "localhost", options: [] },
  },
);

const { Option } = components;
const IconOption = (props: OptionProps<Options>) => (
  <Option {...props}>
    <div className="flex items-center">
      <Image src={props.data.icon || "/mainnet.svg"} alt={props.data.label} width={24} height={24} className="mr-2" />
      {props.data.label}
    </div>
  </Option>
);

export const NetworksDropdown = ({ onChange }: { onChange: (options: any) => any }) => {
  const [isMobile, setIsMobile] = useState(false);
  const defaultOption = groupedOptions["mainnet"].options[0] ?? Object.values(groupedOptions)[0]?.options[0];
  const [selected, setSelected] = useState<Options | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedNetwork");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return networks.find(n => n.id === parsed.value) ? parsed : defaultOption;
        } catch {
          return defaultOption;
        }
      }
    }
    return defaultOption ?? null;
  });
  const [showRpcModal, setShowRpcModal] = useState(false);
  const selectedChain = useMemo(() => networks.find(n => n.id === selected?.value), [selected?.value]);
  const defaultRpc = useMemo(() => selectedChain?.rpcUrls?.default?.http?.[0] ?? "", [selectedChain]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(max-width: 640px)");
      setIsMobile(mediaQuery.matches);

      const handleResize = () => setIsMobile(mediaQuery.matches);
      mediaQuery.addEventListener("change", handleResize);
      return () => mediaQuery.removeEventListener("change", handleResize);
    }
  }, []);

  // no-op

  return (
    <div className="flex items-center gap-2">
      <Select
        defaultValue={defaultOption}
        value={selected as any}
        instanceId="network-select"
        options={Object.values(groupedOptions)}
        onChange={option => {
          setSelected(option as Options);
          onChange(option);
          if (typeof window !== "undefined") {
            localStorage.setItem("selectedNetwork", JSON.stringify(option));
          }
        }}
        components={{ Option: IconOption }}
        isSearchable={!isMobile}
        className="max-w-xs bg-white relative text-sm w-44"
        theme={theme => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary25: "#efeaff",
            primary50: "#c1aeff",
            primary: "#551d98",
          },
        })}
        styles={{
          menuList: provided => ({ ...provided, maxHeight: 280, overflow: "auto" }),
        }}
      />

      <button
        type="button"
        title="Change RPC"
        className="btn btn-ghost btn-md h-4 min-h-4"
        onClick={() => setShowRpcModal(true)}
        disabled={!selected}
      >
        <Cog6ToothIcon className="h-5 w-5" />
      </button>

      {showRpcModal && selected && (
        <NetworkRpcModal
          isOpen={showRpcModal}
          chainId={selected.value}
          chainLabel={selected.label}
          defaultRpc={defaultRpc}
          onClose={() => setShowRpcModal(false)}
        />
      )}
    </div>
  );
};
