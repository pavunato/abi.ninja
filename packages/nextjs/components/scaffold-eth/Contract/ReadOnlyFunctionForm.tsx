import { useState } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { Abi, AbiFunction, AbiParameter } from "abitype";
import { Address } from "viem";
import { useContractRead } from "wagmi";
import {
  ContractInput,
  displayTxResult,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  getParsedError,
  transformAbiFunction,
} from "~~/components/scaffold-eth";
import { useAbiNinjaState } from "~~/services/store/store";
import { notification } from "~~/utils/scaffold-eth";

type ReadOnlyFunctionFormProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  inheritedFrom?: string;
  abi: Abi;
};

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
    // Multiple outputs, each might be a tuple
    return data.map((item, index) => {
      const output = outputs[index];
      if (output && output.type === "tuple" && "components" in output && output.components && Array.isArray(item)) {
        return formatTuple(item, output.components);
      }
      return item;
    });
  }

  return data;
};

export const ReadOnlyFunctionForm = ({
  contractAddress,
  abiFunction,
  inheritedFrom,
  abi,
}: ReadOnlyFunctionFormProps) => {
  const mainChainId = useAbiNinjaState(state => state.mainChainId);
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [result, setResult] = useState<unknown>();

  const { isFetching, refetch } = useContractRead({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    args: getParsedContractFunctionArgs(form),
    enabled: false,
    chainId: mainChainId,
    onError: (error: any) => {
      const parsedErrror = getParsedError(error);
      notification.error(parsedErrror);
    },
    onSuccess: data => {
      setResult(formatResult(data, abiFunction.outputs));
    },
  });

  const transformedFunction = transformAbiFunction(abiFunction);
  const inputElements = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      <p className="font-medium my-0 break-words">
        {abiFunction.name}
        <InheritanceTooltip inheritedFrom={inheritedFrom} />
      </p>
      {inputElements}
      <div className="flex justify-end w-full gap-5">
        <div className="flex-grow w-4/5">
          {result !== null && result !== undefined && (
            <div className="bg-secondary rounded-xl text-sm px-4 py-1.5 break-words">
              <p className="font-bold m-0 mb-1">Result:</p>
              <pre className="whitespace-pre-wrap break-words">{displayTxResult(result)}</pre>
            </div>
          )}
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={async () => {
            refetch();
          }}
          disabled={isFetching}
        >
          {isFetching && <span className="loading loading-spinner loading-xs"></span>}
          Read 📡
        </button>
      </div>
    </div>
  );
};
