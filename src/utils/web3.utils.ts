import { ethers } from "ethers";
import { RpcUrls, rpcUrls, subGraphUrls, uniswapContracts, vfatContracts } from "./config.utils";
import nfpmAbi from "../abi/nfpm.json"
import sickleFactoryAbi from "../abi/sickleFactory.json"
import erc20Abi from "../abi/erc20.json"
import uniPoolAbi from "../abi/uniPool.json"
import uniswapFactoryAbi from "../abi/uniswapFactory.json"

import { toUnits } from "./math.utils";
import { getTokenDetails } from "./requests.utils";

import { TickMath } from '@uniswap/v3-sdk'
import { Token } from '@uniswap/sdk-core'


function isValidChainId(chainId: number): chainId is keyof typeof uniswapContracts & keyof RpcUrls {
    return chainId in uniswapContracts && chainId in rpcUrls;
}

export const fetchPosition = async (chainId: number, tokenId: number) => {
    try {
        if (!isValidChainId(chainId)) {
            throw new Error(`Invalid chainId: ${chainId}`);
        }

        const instance = new ethers.Contract(
            uniswapContracts[chainId].nfpm as string,
            nfpmAbi,
            new ethers.JsonRpcProvider(rpcUrls[chainId])
        );


        let position = await instance.positions(tokenId)
        position = {
            nonce: position[0].toString(),
            operator: ethers.getAddress(position[1]),
            token0: ethers.getAddress(position[2]),
            token1: ethers.getAddress(position[3]),
            fee: position[4].toString(),
            tickLower: position[5].toString(),
            tickUpper: position[6].toString(),
            liquidity: position[7].toString(),
            feeGrowthInside0LastX128: position[8].toString(),
            feeGrowthInside1LastX128: position[9].toString(),
            tokensOwed0: position[10].toString(),
            tokensOwed1: position[11].toString()
        };
        return position
    } catch (error) {
        console.log(error, "error")
    }
};

export const fetchNftBalance = async (chainId: number, wallet: string) => {
    try {
        if (!isValidChainId(chainId)) {
            throw new Error(`Invalid chainId: ${chainId}`);
        }

        const instance = new ethers.Contract(
            uniswapContracts[chainId].nfpm as string,
            nfpmAbi,
            new ethers.JsonRpcProvider(rpcUrls[chainId])
        );
        const sickle = await getSickle(chainId, wallet)
        const totalNft = Number(await instance.balanceOf(sickle))
        const ids = [...Array(totalNft)].map((_, i) => {
            return instance.tokenOfOwnerByIndex(sickle, i)
        });

        let nftIds = await Promise.all(ids)
        nftIds = nftIds.map((item) => parseInt(item))
        console.log(totalNft, "totalNft", nftIds)
        return nftIds
    } catch (error) {
        console.log(error)
        return []
    }
}

export const getSickle = async (chainId: number, wallet: string) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }
    const instance = new ethers.Contract(
        vfatContracts[chainId].SickleFactory as string,
        sickleFactoryAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );
    const sickle = await instance.sickles(wallet)
    return sickle
}

export const userDeposits = async (chainId: number, wallet: string) => {
    try {
        if (!isValidChainId(chainId)) {
            throw new Error(`Invalid chainId: ${chainId}`);
        }
        const nfts = await fetchNftBalance(chainId, wallet);
        if (nfts?.length == 0) return []

        const positionPromises = nfts?.map(async (id) => {
            const position = await fetchPosition(chainId, id);
            return {
                nftId: id,
                position,
            };
        });

        const _positions = await Promise.all(positionPromises)

        const tokenFc = getTokenDetails(subGraphUrls[Number(chainId)])
        const positions = await Promise.all(
            _positions.map(async (item) => {
                const _token0 = await tokenFc(item?.position?.token0?.toLowerCase());
                const _token1 = await tokenFc(item?.position?.token1?.toLowerCase());

                return {
                    ...item,
                    token0: _token0.token,
                    token1: _token1.token,
                };
            })
        );

        return positions
    } catch (error) {
        console.log(error)
    }
}

export const getPredictedSickle = async (chainId: number, wallet: string) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }
    const instance = new ethers.Contract(
        vfatContracts[chainId].SickleFactory as string,
        sickleFactoryAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );
    const sickle = await instance.predict(wallet)
    return sickle
}

//@ts-expect-error skip the warning
export const approve = async (token: string, signer, spendor: string, amount: number, decimals: number) => {
    const _amount = BigInt(toUnits(amount, decimals));
    const tokenContract = new ethers.Contract(token, erc20Abi, signer);
    const allowance = await tokenContract.allowance(signer.address, spendor);
    if (allowance < _amount) {
        const tx1 = await tokenContract.approve(spendor, _amount);
        return tx1;
    } else {
        return null
    }
}

export const getTickSpacing = async (chainId: number, pool: string) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }
    const instance = new ethers.Contract(
        pool,
        uniPoolAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );
    const spacing = await instance.tickSpacing()
    return parseFloat(spacing)
}

export const getUniswapPool = async (chainId: number, token0: string, token1: string, feeTier: number) => {
    if (!isValidChainId(chainId)) {
        throw new Error(`Invalid chainId: ${chainId}`);
    }
    const instance = new ethers.Contract(
        uniswapContracts[chainId].factory as string,
        uniswapFactoryAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );
    const pool = await instance.getPool(token0, token1, feeTier)


    await calculatePriceRange(8453);
    const currentPrice = 2725.91; // Example current price
    const newMinPriceChange = -14; 
    const newMaxPriceChange = 14;  

    const newPrices = calculatePricesFromChanges(currentPrice, newMinPriceChange, newMaxPriceChange);
    console.log("New Prices & Ticks:", newPrices);


    return pool
}

export const calculatePriceRange = async (chainId: number) => {
    const tokenA = new Token(chainId, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Ethereum')
    const tokenB = new Token(chainId, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', 6, 'USDC', 'USD Coin')

    // Compute price range
    const priceLower = tickToPrice(-198470, tokenA, tokenB)
    const priceUpper = tickToPrice(-195970, tokenA, tokenB)
    const currentPrice = tickToPrice(-197171, tokenA, tokenB)

    const widthPercentage = ((priceUpper - priceLower) / currentPrice) * 100;
    const minPriceChange = ((priceLower - currentPrice) / currentPrice) * 100;
    const maxPriceChange = ((priceUpper - currentPrice) / currentPrice) * 100;

    console.log(`Current Price %: ${currentPrice}`)
    console.log(`Lower Bound %: ${priceLower}`)
    console.log(`Upper Bound %: ${priceUpper}`)

    console.log(`Width: ${widthPercentage.toFixed(2)}%`);
    console.log(`Min Price Change: ${minPriceChange.toFixed(2)}%`);
    console.log(`Max Price Change: ${maxPriceChange.toFixed(2)}%`);
}

function tickToPrice(tick: number, tokenA: Token, tokenB: Token) {
    if (tick < TickMath.MIN_TICK || tick > TickMath.MAX_TICK) {
        throw new Error('Tick out of range')
    }
    const price = Math.pow(1.0001, tick)
    return tokenA.sortsBefore(tokenB) ? price : 1 / price
}

export const calculatePricesFromChanges = (
    currentPrice: number,
    newMinPriceChange: number,
    newMaxPriceChange: number
) => {
    // Calculate priceLower and priceUpper from the given percentage changes
    const priceLower = currentPrice * (1 + newMinPriceChange / 100);
    const priceUpper = currentPrice * (1 + newMaxPriceChange / 100);

    // Calculate new width percentage
    const widthPercentage = ((priceUpper - priceLower) / currentPrice) * 100;

    // Convert prices to tick values
    const newTickLower = Math.floor(Math.log(priceLower) / Math.log(1.0001));
    const newTickUpper = Math.floor(Math.log(priceUpper) / Math.log(1.0001));

    return {
        priceLower: priceLower.toFixed(6),  // 6 decimal places for precision
        priceUpper: priceUpper.toFixed(6),
        widthPercentage: widthPercentage.toFixed(2),
        newTickLower,
        newTickUpper
    };
};
