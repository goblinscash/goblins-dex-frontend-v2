import { ethers } from "ethers";
import { aerodromeContracts, rpcUrls } from "./config.utils";

import lpSugarAbi from "../abi/sugar/lpSugar.json"
import veSugarAbi from "../abi/sugar/veSugar.json"

import { formatValue, fromUnits } from "./math.utils";

export type FormattedPool = {
    lp: string;
    symbol: string;
    decimals: number;
    liquidity: number;
    type: number;
    tick: number;
    sqrt_ratio: number;
    token0: string;
    reserve0: number;
    staked0: number;
    token1: string;
    reserve1: number;
    staked1: number;
    gauge: string;
    gauge_liquidity: number;
    gauge_alive: boolean;
    fee: string;
    bribe: string;
    factory: string;
    emissions: number;
    emissions_token: string;
    pool_fee: number;
    unstaked_fee: number;
    token0_fees: number;
    token1_fees: number;
    nfpm: string;
    alm: string;
    root: string;
    poolBalance: number;
    apr: number;
    volume: number;
};

export type LpVote = {
    lp: string;
    weight: string;
};

export type VeNFT = {
    id: string;
    account: string;
    decimals: string;
    amount: string;
    voting_amount: string;
    governance_amount: string;
    rebase_amount: string;
    expires_at: string;
    voted_at: string;
    votes: LpVote[];
    token: string;
    permanent: boolean;
    delegate_id: string;
    managed_id: string;
};



export const all = async (chainId: number, limit: number, offset: number, type: number) => {
    try {
        const instance = new ethers.Contract(
            aerodromeContracts[chainId].lpSugar as string,
            lpSugarAbi,
            new ethers.JsonRpcProvider(rpcUrls[chainId])
        );

        const poolsRaw = await instance.all(limit, offset);

        //@ts-expect-error ignore warning
        const formattedPools = poolsRaw.map((pool, index) => ({
            chainId: chainId,
            id: index,
            lp: pool[0],
            symbol: pool[1],
            decimals: formatValue(pool[2]),
            liquidity: formatValue(pool[3]),
            type: formatValue(pool[4]),
            tick: formatValue(pool[5]),
            sqrt_ratio: formatValue(pool[6]),
            token0: pool[7],
            reserve0: formatValue(pool[8]),
            staked0: formatValue(pool[9]),
            token1: pool[10],
            reserve1: formatValue(pool[11]),
            staked1: formatValue(pool[12]),
            gauge: pool[13],
            gauge_liquidity: formatValue(pool[14]),
            gauge_alive: pool[15],
            fee: pool[16],
            bribe: pool[17],
            factory: pool[18],
            emissions: formatValue(pool[19]),
            emissions_token: pool[20],
            pool_fee: Number(formatValue(pool[21])) / 100,
            unstaked_fee: formatValue(pool[22]),
            token0_fees: formatValue(pool[23]),
            token1_fees: formatValue(pool[24]),
            nfpm: pool[25],
            alm: pool[26],
            root: pool[27],
            // Custom fields
            poolBalance: Number(fromUnits(pool[8], Number(pool[2]))) + Number(fromUnits(pool[11], Number(pool[2]))),
            apr: 0,
            volume: 0,
            url: `/deposit?id=${index}&token0=${pool[7]}&token1=${pool[10]}`
        }));
        //@ts-expect-error ignore warning
        const pool = type === 1 ? formattedPools : formattedPools.filter((pool) => Number(pool.type) == type)

        return pool;
    } catch (error) {
        console.log(error, chainId)
        return []
    }
};

export const byIndex = async (chainId: number, index: number) => {
    try {
        const instance = new ethers.Contract(
            aerodromeContracts[chainId].lpSugar as string,
            lpSugarAbi,
            new ethers.JsonRpcProvider(rpcUrls[chainId])
        );

        const pool = await instance.byIndex(index);

        const formattedPools = {
            lp: pool[0],
            symbol: pool[1],
            decimals: formatValue(pool[2]),
            liquidity: formatValue(pool[3]),
            type: formatValue(pool[4]),
            tick: formatValue(pool[5]),
            sqrt_ratio: formatValue(pool[6]),
            token0: pool[7],
            reserve0: formatValue(pool[8]),
            staked0: formatValue(pool[9]),
            token1: pool[10],
            reserve1: formatValue(pool[11]),
            staked1: formatValue(pool[12]),
            gauge: pool[13],
            gauge_liquidity: formatValue(pool[14]),
            gauge_alive: pool[15],
            fee: pool[16],
            bribe: pool[17],
            factory: pool[18],
            emissions: formatValue(pool[19]),
            emissions_token: pool[20],
            pool_fee: formatValue(pool[21]),
            unstaked_fee: formatValue(pool[22]),
            token0_fees: formatValue(pool[23]),
            token1_fees: formatValue(pool[24]),
            nfpm: pool[25],
            alm: pool[26],
            root: pool[27],
            // Custom fields
            poolBalance: Number(fromUnits(pool[8], Number(pool[2]))) + Number(fromUnits(pool[11], Number(pool[2]))),
            apr: 0,
            volume: 0,
        }

        // // await positions(chainId, limit, offset, "0xe47C11e16783eE272117f8959dF3ceEC606C045d")
        // const positionsRaw = await instance.positions(100, 0, "0x892Ff98a46e5bd141E2D12618f4B2Fe6284debac")

        console.log(formattedPools, "formattedPools")

        return formattedPools;
    } catch (error) {
        console.log(error, chainId)
        return []
    }
};

export const positions = async (chainId: number, limit: number, offset: number, account: string) => {
    try {
        const instance = new ethers.Contract(
            aerodromeContracts[chainId].lpSugar as string,
            lpSugarAbi,
            new ethers.JsonRpcProvider(rpcUrls[chainId])
        );

        const positionsRaw = await instance.positions(limit, offset, account)

        console.log(positionsRaw, "positionsRaw")

    } catch (error) {
        console.log(error, chainId)
        return []
    }
};

export const locksByAccount = async (chainId: number, account: string) => {
    try {
        const instance = new ethers.Contract(
            aerodromeContracts[chainId].veSugar as string,
            veSugarAbi,
            new ethers.JsonRpcProvider(rpcUrls[chainId])
        );

        const locksRaw = await instance.byAccount(account);
        // const poolsaw = await instance.all(1,0);
        // const poolsRaw = await instance.byId(12)
        // const poolsRaw = await instance.voter();
        // const token = await instance.token();
        // const ve = await instance.ve();
        // const dist = await instance.dist();
        // const gov = await instance.gov();


        //@ts-expect-error ignore warning
        const formattedLocks = locksRaw.map((lock) => ({
            id: formatValue(lock[0]),
            account: lock[1],
            decimals: formatValue(lock[2]),
            amount: formatValue(lock[3]),
            voting_amount: formatValue(lock[4]),
            governance_amount: formatValue(lock[5]),
            rebase_amount: formatValue(lock[6]),
            expires_at: formatValue(lock[7]),
            voted_at: formatValue(lock[8]),
            //@ts-expect-error ignore
            votes: lock.slice(9, -4).reduce((acc, curr, index, arr) => {
                if (index % 2 === 0) {
                    acc.push({
                        lp: curr,
                        weight: formatValue(arr[index + 1]),
                    });
                }
                return acc;
            }, []),
            token: lock[lock.length - 4],
            permanent: lock[lock.length - 3] === "true",
            delegate_id: formatValue(lock[lock.length - 2]),
            managed_id: formatValue(lock[lock.length - 1]),
        }));

        // console.log(token, "poolsRaw", ve, dist, gov, poolsRa)

        return formattedLocks
    } catch (error) {
        console.log(error, chainId)
        return []
    }
};


export const aprSugar = () => { return 0 }
export const volume = () => { return 0 }
export const totalFees = () => { return 0 }
export const poolFeePercentage = () => { return 0 }
export const volumePct = () => { return 0 }



