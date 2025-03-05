import { ethers } from "ethers";

export const shortenPubkey = (address: string): string => {
    if (!address) {
        return ''
    }
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

export const fromUnits = (value: bigint, decimals: number): string => {
    return ethers.formatUnits(value, decimals);
}

export const toUnits = (value: string | number, decimals: number): bigint => {
    return ethers.parseUnits(value.toString(), decimals);
}

export const formatValue = (value: any) => (typeof value === "bigint" ? value.toString() : value);