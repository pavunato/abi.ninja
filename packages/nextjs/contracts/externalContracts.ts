import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";
import abi_market from "./abi/abi.sta_market.json"
import abi_weapon from "./abi/abi.starmechweapon.json"

/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *      address: "0x...",
 *      abi: [...],
 *    }
 * } as const;
 */
const externalContracts = {
    43113: {
        STA_Market: {
            address: "0xb06C56b0696dE9d5e418fF0386330b6Da48E27DA",
            abi: abi_market,
        },
        STA_Weapon: {
            address: "0xd6300E8Af9c78672A21362507D8f4B4611F5a793",
            abi: abi_weapon
        },
    }
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
