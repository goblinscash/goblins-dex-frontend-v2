import { ethers } from "ethers";

export const shortenPubkey = (address: string): string => {
    if (!address) {
        return ''
    }
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

export const fromUnits = (value: string | number | bigint, decimals: number): string | undefined => {
    if (!decimals) return;
    console.log(value, decimals, "PPPIII");

    const bigIntValue = BigInt(value.toString());

    return ethers.formatUnits(bigIntValue, decimals);
};



export const toUnits = (value: string | number, decimals: number): bigint => {
    return ethers.parseUnits(value.toString(), decimals);
}

export const formatValue = (value: bigint | string | number | boolean | null | undefined) => (typeof value === "bigint" ? value.toString() : value);