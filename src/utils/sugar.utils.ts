import { ethers } from "ethers";
import { aerodromeContracts, rpcUrls } from "./config.utils";

import lpSugarAbi from "../abi/sugar/lpSugar.json"
import veSugarAbi from "../abi/sugar/veSugar.json"
import rewardSugarAbi from "../abi/sugar/rewardSugar.json"
import relaySugarAbi from "../abi/sugar/relaySugar.json"

import { formatValue, fromUnits } from "./math.utils";

export type FormattedPool = {
    chainId: number;
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

type ManagedVenft = {
    id: string;
    amount: string;
    earned: string;
};

export type Relay = {
    venft_id: string;
    decimals: number;
    amount: string;
    voting_amount: string;
    used_voting_amount: string;
    voted_at: string;
    votes: LpVote[];
    token: string;
    compounded: string;
    withdrawable: string;
    run_at: string;
    manager: string;
    relay: string;
    inactive: boolean;
    name: string;
    account_venfts: ManagedVenft[];
};


//LP Sugar//
export const all = async (chainId: number, limit: number, offset: number, type: number): Promise<FormattedPool[]> => {
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
            pool_fee: `${Number(formatValue(pool[21])) / 100}%`,
            unstaked_fee: formatValue(pool[22]),
            token0_fees: formatValue(pool[23]),
            token1_fees: formatValue(pool[24]),
            nfpm: pool[25],
            alm: pool[26],
            root: pool[27],
            // Custom fields
            poolBalance: `$${Number(fromUnits(pool[8], Number(pool[2]))) + Number(fromUnits(pool[11], Number(pool[2])))}`,
            apr: 0,
            volume: 0,
            url: `/deposit?id=${index}&token0=${pool[7]}&token1=${pool[10]}&stable=${Number(pool.type) == -1 ? false : true}`
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

        return formattedPools;
    } catch (error) {
        console.log(error, chainId)
        return []
    }
};

export interface Position {
    id: bigint;
    lp: string;
    liquidity: bigint;
    staked: bigint;
    amount0: bigint;
    amount1: bigint;
    staked0: bigint;
    staked1: bigint;
    unstaked_earned0: bigint;
    unstaked_earned1: bigint;
    emissions_earned: bigint;
    tick_lower: bigint;
    tick_upper: bigint;
    sqrt_ratio_lower: bigint;
    sqrt_ratio_upper: bigint;
    alm: string;
}

export const positions = async (chainId: number, limit: number, offset: number, account: string): Promise<Position[]> => {
    try {
        const instance = new ethers.Contract(
            aerodromeContracts[chainId].lpSugar as string,
            lpSugarAbi,
            new ethers.JsonRpcProvider(rpcUrls[chainId])
        );

        const positionsRaw = await instance.positions(limit, offset, account)
        // const positionsRaw = await instance.positionsByFactory(limit, offset, account, aerodromeContracts[chainId].factory)

        return positionsRaw as Position[]

    } catch (error) {
        console.log(error, chainId)
        return []
    }
};
//LP Sugar//


//VE Sugar//
export const locksByAccount = async (chainId: number, account: string) => {
    try {
        const instance = new ethers.Contract(
            aerodromeContracts[chainId].veSugar as string,
            veSugarAbi,
            new ethers.JsonRpcProvider(rpcUrls[chainId])
        );

        const locksRaw = await instance.byAccount(account);

        //@ts-expect-error ignore
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


        return formattedLocks
    } catch (error) {
        console.log(error, chainId)
        return []
    }
};

export const lockById = async (chainId: number, tokenId: number) => {
    try {
        const instance = new ethers.Contract(
            aerodromeContracts[chainId].veSugar as string,
            veSugarAbi,
            new ethers.JsonRpcProvider(rpcUrls[chainId])
        );

        const lock = await instance.byId(tokenId);

        const formattedLocks = {
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
        };


        return formattedLocks
    } catch (error) {
        console.log(error, chainId)
        return []
    }
};
//VE Sugar//

//Reward Sugar
export const allWithRewards = async (chainId: number, limit: number, offset: number) => {
    try {
        // Fetch all pools first
        const pools = await all(chainId, limit, offset, 1); // Use the passed offset for pools as well

        const rewardSugarAddress = aerodromeContracts[chainId].rewardSugar;
        if (!rewardSugarAddress) {
            console.error(`rewardSugar contract address not found for chainId: ${chainId}`);
            return pools.map(p => ({ ...p, apr: 0, volume: 0 })); // Return pools with 0 APR/Volume
        }

        const rewardInstance = new ethers.Contract(
            rewardSugarAddress,
            rewardSugarAbi,
            new ethers.JsonRpcProvider(rpcUrls[chainId])
        );

        // Fetch latest epoch data - assuming we need to fetch enough to cover all LPs.
        // The limit for epochsLatest might need adjustment based on the number of LPs.
        // For now, let's fetch a reasonable number, e.g., the same limit as pools, assuming a rough 1-to-1 mapping or more epochs than pools.
        const lpEpochsRaw = await rewardInstance.epochsLatest(limit, 0); // Using offset 0 for epochs, assuming latest means recent, not paginated historical

        const WEEK_IN_SECONDS = 7 * 24 * 60 * 60; // From rewardSugarAbi if available, otherwise hardcode
        const YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
        const EPOCHS_PER_YEAR = YEAR_IN_SECONDS / WEEK_IN_SECONDS;

        //@ts-expect-error ignore
        const epochDataMap = new Map(lpEpochsRaw.map((epoch) => {
            const bribes = epoch.bribes.map(bribe => ({
                token: bribe.token,
                amount: parseFloat(fromUnits(bribe.amount, 18)) // Assuming bribe token decimals are 18
            }));
            return [epoch.lp, {
                emissions: parseFloat(fromUnits(epoch.emissions, 18)), // Assuming emission token decimals are 18
                bribes: bribes,
            }];
        }));

        const enrichedPools = pools.map(pool => {
            const poolEpochData = epochDataMap.get(pool.lp);
            let apr = 0;
            let volume = 0;

            // APR Calculation
            if (poolEpochData && pool.gauge_liquidity > 0) {
                // Assume $1 price for emission and bribe tokens for now
                const emissionValuePerEpoch = poolEpochData.emissions * 1; // price = $1
                const bribesValuePerEpoch = poolEpochData.bribes.reduce((sum, b) => sum + (b.amount * 1), 0); // price = $1
                const totalRewardsValuePerEpoch = emissionValuePerEpoch + bribesValuePerEpoch;
                const totalRewardsValuePerYear = totalRewardsValuePerEpoch * EPOCHS_PER_YEAR;

                // Assume $1 price for LP token unit in gauge_liquidity for simplicity
                // A more accurate way would be to get TVL of the gauge (gauge_liquidity * LP_price)
                // pool.gauge_liquidity is already a number here from formatValue
                const stakedLiquidityUSD = pool.gauge_liquidity * 1; // price = $1

                if (stakedLiquidityUSD > 0) {
                    apr = (totalRewardsValuePerYear / stakedLiquidityUSD) * 100;
                }
            }

            // Volume Calculation
            // pool_fee is like "0.05%", need to parse it
            const feePercentMatch = pool.pool_fee.toString().match(/(\d+(\.\d+)?)/);
            if (feePercentMatch && Number(feePercentMatch[1]) > 0) {
                const feeDecimal = Number(feePercentMatch[1]) / 100 / 100; // e.g., 0.05% -> 0.0005

                // Assuming token0_fees and token1_fees are in token units and price is $1 for now
                // pool.token0_fees and pool.token1_fees are numbers from formatValue
                const token0FeesUSD = pool.token0_fees * 1; // price = $1
                const token1FeesUSD = pool.token1_fees * 1; // price = $1
                const totalFeesUSD = token0FeesUSD + token1FeesUSD;

                if (feeDecimal > 0) {
                    volume = totalFeesUSD / feeDecimal;
                }
            }
            
            return {
                ...pool,
                apr: isNaN(apr) ? 0 : apr,
                volume: isNaN(volume) ? 0 : volume,
            };
        });

        return enrichedPools;
    } catch (error) {
        console.error("Error in allWithRewards:", error, chainId);
        return []; // Return empty array or pools with 0 APR/Volume on error
    }
};

export const rewardsByAddress = async (chainId: number, lp: string, account: string) => { // Added account for rewardsByAddress
    const rewardSugarAddress = aerodromeContracts[chainId].rewardSugar;
    if (!rewardSugarAddress) {
        console.error(`rewardSugar contract address not found for chainId: ${chainId}`);
        return [];
    }
    const instance = new ethers.Contract(
        rewardSugarAddress,
        rewardSugarAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );

    // The ABI for rewardsByAddress is:
    // inputs: [{"name":"_venft_id","type":"uint256"},{"name":"_pool","type":"address"}]
    // It seems it requires a veNFT ID and a pool address, not an account address directly.
    // This function might need rethinking based on how it's intended to be used.
    // For now, assuming the original call was a mistake and it might have meant to use _pool (lp)
    // and some _venft_id. If _venft_id is not available, this function cannot be used as is.
    // Let's log a warning.
    console.warn("rewardsByAddress in rewardSugar.json ABI expects _venft_id and _pool, not chainId and lp directly in that order for its parameters.");
    // If the intention was to get rewards for a user for a specific LP, we'd need their veNFT ID that voted on that LP.
    // This function as currently defined in the file seems to misuse the contract function.
    // For now, returning empty array.
    // const rewards = await instance.rewardsByAddress(SOME_VENFT_ID, lp); 
    // console.log(rewards, ")********************")
    return [];

}
//Reward Sugar

//Relay Sugar//
export const allRelay = async (chainId: number, account: string) => {
    try {
        const provider = new ethers.JsonRpcProvider(rpcUrls[chainId]);
        const instance = new ethers.Contract(
            aerodromeContracts[chainId].relaySugar as string,
            relaySugarAbi,
            provider
        );

        const relayRaw = await instance.all(account);

        // Map contract data to Relay objects
        let fetchedRelays: Relay[] = relayRaw.map((fields: any): Relay => ({ // Changed fields:Relay to fields:any to avoid type errors before formatting
            venft_id: formatValue(fields.venft_id),
            decimals: Number(fields.decimals),
            amount: formatValue(fields.amount),
            voting_amount: formatValue(fields.voting_amount),
            used_voting_amount: formatValue(fields.used_voting_amount),
            voted_at: formatValue(fields.voted_at),
            votes: fields.votes.map((vote:LpVote) => ({
                lp: vote.lp,
                weight: formatValue(vote.weight),
            })),
            token: fields.token,
            compounded: formatValue(fields.compounded),
            withdrawable: formatValue(fields.withdrawable),
            run_at: formatValue(fields.run_at),
            manager: fields.manager,
            relay: fields.relay,
            inactive: fields.inactive,
            name: fields.name?.trim(),
            account_venfts: fields.account_venfts && Array.isArray(fields.account_venfts) ? fields.account_venfts.map((venft: ManagedVenft) => ({
                id: formatValue(venft.id),
                amount: formatValue(venft.amount),
                earned: formatValue(venft.earned),
            })) : [],
        }));

        // Hardcode the "veGOB maxi" relay data
        // Placeholder values - these should be replaced with actual data if available
        const veGobMaxiRelay: Relay = {
            venft_id: "0", // Placeholder
            decimals: 18,  // Common default
            amount: "0",   // Placeholder
            voting_amount: "0", // Placeholder
            used_voting_amount: "0", // Placeholder
            voted_at: "0", // Placeholder
            votes: [],     // Empty array
            token: "0x000000000000000000000000000000000000G0B", // Placeholder GOB token address
            compounded: "0", // Placeholder
            withdrawable: "0", // Placeholder
            run_at: "0", // Placeholder
            manager: "0x00000000000000000000000000000000MANAGER", // Placeholder manager address
            relay: "0x00000000000000000000000000000000VEGOBMX", // Placeholder relay contract address
            inactive: false,
            name: "veGOB maxi",
            account_venfts: [], // Empty, as this specific object is not tied to the fetched account's NFTs
        };

        // Add the veGOB maxi relay to the list
        // Check if a relay with the same name already exists to prevent duplicates if `instance.all(account)` could potentially return it
        const veGobMaxiExists = fetchedRelays.some(r => r.name === "veGOB maxi");
        if (!veGobMaxiExists) {
            fetchedRelays.push(veGobMaxiRelay);
        }

        // Filter out inactive relays
        const activeRelays = fetchedRelays.filter((item: Relay) => item.inactive !== true);

        return activeRelays;
    } catch (error) {
        console.error("Error in allRelay:", error, chainId); // Changed to console.error
        return [];
    }
};

//Relay Sugar//




// Definitions for aprSugar and volume based on the new allWithRewards function

export const aprSugar = async (chainId: number, lpAddress: string): Promise<number> => {
    // Fetch all pools with APR/Volume data
    const pools = await allWithRewards(chainId, 1000, 0); // Fetch a large number to find the pool
    const pool = pools.find(p => p.lp.toLowerCase() === lpAddress.toLowerCase());
    return pool ? pool.apr : 0;
};

export const volume = async (chainId: number, lpAddress: string): Promise<number> => {
    // Fetch all pools with APR/Volume data
    const pools = await allWithRewards(chainId, 1000, 0); // Fetch a large number to find the pool
    const pool = pools.find(p => p.lp.toLowerCase() === lpAddress.toLowerCase());
    return pool ? pool.volume : 0;
};

export const totalFees = async (chainId: number, lpAddress: string): Promise<number> => {
    const pools = await allWithRewards(chainId, 1000, 0);
    const pool = pools.find(p => p.lp.toLowerCase() === lpAddress.toLowerCase());
    if (pool) {
        // Assuming token prices are $1 for simplicity
        return (pool.token0_fees * 1) + (pool.token1_fees * 1);
    }
    return 0;
};

export const poolFeePercentage = async (chainId: number, lpAddress: string): Promise<number> => {
    const pools = await all(chainId, 1000, 0, 1); // type 1 for all, don't need full reward calculation for just fee
    const pool = pools.find(p => p.lp.toLowerCase() === lpAddress.toLowerCase());
    if (pool && pool.pool_fee) {
        const feePercentMatch = pool.pool_fee.toString().match(/(\d+(\.\d+)?)/);
        if (feePercentMatch && Number(feePercentMatch[1]) > 0) {
            return Number(feePercentMatch[1]) / 100; // e.g., 0.05 for 0.05%
        }
    }
    return 0;
};

// volumePct might mean percentage of total volume for a specific pool.
// This would require knowing total volume across all pools, which is not directly calculated here.
// For now, returning 0 or it could mean something else like daily change.
export const volumePct = async (chainId: number, lpAddress: string): Promise<number> => {
    // This function's purpose is unclear. If it's daily volume change % then it needs historical data.
    // If it's pool's volume as % of total site volume, we need total site volume.
    // Returning 0 as a placeholder.
    console.warn(`volumePct for ${lpAddress} on chain ${chainId} is not implemented due to ambiguity.`);
    return 0;
};



