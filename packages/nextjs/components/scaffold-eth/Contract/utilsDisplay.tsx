import { ReactElement } from "react";
import { AbiParameter } from "abitype";
import { TransactionBase, TransactionReceipt, formatEther, isAddress } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { replacer } from "~~/utils/scaffold-eth/common";

type DisplayContent =
  | string
  | number
  | bigint
  | Record<string, any>
  | TransactionBase
  | TransactionReceipt
  | undefined
  | unknown;

const formatTuple = (data: any[], components: readonly AbiParameter[]): Record<string, any> => {
  const obj: Record<string, any> = {};
  components.forEach((component, index) => {
    let value = data[index];
    if (component.type === "tuple" && "components" in component && component.components && Array.isArray(value)) {
      value = formatTuple(value, component.components);
    }
    if (component.name) {
      obj[component.name] = value;
    } else {
      obj[index] = value;
    }
  });
  return obj;
};

const formatResult = (data: any, outputs: readonly AbiParameter[]): any => {
  if (!outputs || outputs.length === 0) return data;

  if (outputs.length === 1) {
    const output = outputs[0];
    if (output.type === "tuple" && "components" in output && output.components && Array.isArray(data)) {
      return formatTuple(data, output.components);
    }
  } else if (Array.isArray(data)) {
    // Multiple outputs, parse to object with output names as keys
    const result: Record<string, any> = {};
    data.forEach((item, index) => {
      const output = outputs[index];
      if (output) {
        let formattedItem = item;
        if (output.type === "tuple" && "components" in output && output.components && Array.isArray(item)) {
          formattedItem = formatTuple(item, output.components);
        }
        const key = output.name || `output${index}`;
        result[key] = formattedItem;
      }
    });
    return result;
  }

  return data;
};

export const displayTxResult = (
  displayContent: DisplayContent | DisplayContent[],
  asText = false,
  outputs?: readonly AbiParameter[],
): string | ReactElement | number => {
  // Apply ABI-based formatting if outputs are provided
  const formattedContent = outputs ? formatResult(displayContent, outputs) : displayContent;

  if (formattedContent == null) {
    return "";
  }

  if (typeof formattedContent === "bigint") {
    try {
      const asNumber = Number(formattedContent);
      if (asNumber <= Number.MAX_SAFE_INTEGER && asNumber >= Number.MIN_SAFE_INTEGER) {
        return asNumber;
      } else {
        return "Ξ" + formatEther(formattedContent);
      }
    } catch (e) {
      return "Ξ" + formatEther(formattedContent);
    }
  }

  if (typeof formattedContent === "string" && isAddress(formattedContent)) {
    return asText ? formattedContent : <Address address={formattedContent} />;
  }

  if (Array.isArray(formattedContent)) {
    const mostReadable = (v: DisplayContent) =>
      ["number", "boolean"].includes(typeof v) ? v : displayTxResultAsText(v);
    const displayable = JSON.stringify(formattedContent.map(mostReadable), replacer);

    return asText ? (
      displayable
    ) : (
      <span style={{ overflowWrap: "break-word", width: "100%" }}>{displayable.replaceAll(",", ",\n")}</span>
    );
  }

  return JSON.stringify(formattedContent, replacer, 2);
};

const displayTxResultAsText = (displayContent: DisplayContent) => displayTxResult(displayContent, true);
