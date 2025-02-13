import { ethers } from "ethers";
import { RpcUrls, rpcUrls, uniswapContracts, vfatContracts } from "./config.utils";
import nfpmAbi from "../abi/nfpm.json"
import sickleFactoryAbi from "../abi/sickleFactory.json"


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
        const position = nfts?.map((id) => fetchPosition(chainId, id))
        
        const positions = await Promise.all(position)

        return positions
    } catch (error) {
        console.log(error)
    }
}