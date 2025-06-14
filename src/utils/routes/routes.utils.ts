import { BigNumber } from "@ethersproject/bignumber";
import { allSimpleEdgeGroupPaths } from "graphology-simple-path";

import lpSugarAbi from "../../abi/sugar/lpSugar.json"
import Graph from "graphology";
import { chunk, isEmpty } from "lodash";
import { ethers } from "ethers";
import { aerodromeContracts, rpcUrls } from "../config.utils";
import { toUnits } from "../math.utils";
import { GraphType } from "graphology-types";
import quoterAbi from "@/abi/aerodrome/quoterv2.json"
import { encodePath } from "../path.utils";
import { quoteV3AddLiquidity } from "../web3.utils";

const MAX_ROUTES = 10;

type GraphOptions = {
    allowSelfLoops?: boolean;
    multi?: boolean;
    type?: GraphType;
};
//@ts-expect-error ignore
export function buildGraph(pairs) {

    const options: GraphOptions = { multi: true }

    const graph = new Graph(options);

    const pairsByAddress = {};

    if (!isEmpty(pairs))
        //@ts-expect-error ignore
        pairs.forEach((pair) => {
            const tokenA = pair.token0.toLowerCase();
            const tokenB = pair.token1.toLowerCase();
            const pairAddress = pair.lp.toLowerCase();

            graph.mergeEdgeWithKey(`direct:${pairAddress}`, tokenA, tokenB);
            graph.mergeEdgeWithKey(`reversed:${pairAddress}`, tokenB, tokenA);

            //@ts-expect-error ignore
            pairsByAddress[pairAddress] = { ...pair, address: pairAddress };
        });

    return [graph, pairsByAddress];
}


export async function getPools(chainId: number) {
    const instance = new ethers.Contract(
        aerodromeContracts[chainId].lpSugar as string,
        lpSugarAbi,
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );

    return await instance.forSwaps(100, 0);
}

export function getRoutes(
    //@ts-expect-error ignore
    graph,
    //@ts-expect-error ignore
    pairsByAddress,
    fromToken: string,
    toToken: string,
    highLiqTokens: string[],
    maxHops = 5
): [][] {
    if (!fromToken || !toToken) {
        return [];
    }

    if (graph?.size < 1) {
        return [];
    }

    let graphPaths = [];

    try {
        graphPaths = allSimpleEdgeGroupPaths(graph, fromToken, toToken, {
            maxDepth: maxHops,
        });
    } catch {
        return [];
    }

    const paths: [][] = [];

    graphPaths.map((pathSet) => {
        //@ts-expect-error ignore
        let mappedPathSets = [];

        pathSet.map((pairAddresses, index) => {
            //@ts-expect-error ignore
            const currentMappedPathSets = [];
            pairAddresses.map((pairAddressWithDirection) => {
                const [dir, pairAddress] = pairAddressWithDirection.split(":");
                const pair = pairsByAddress[pairAddress];
                const from = pair[2]
                const to = pair[3]
                const factory = pair[4]

                const routeComponent = {
                    from,
                    to,
                    factory: factory
                };
                const isV3 = factory.toLowerCase() === '0x7a3027f7a2f9241c0634a7f6950d2d8270ac0563';

                if (isV3) {
                    //@ts-expect-error ignore
                    routeComponent.fee = Number(pair[1]); // Assume pair[1] is the fee tier for v3
                } else {
                    //@ts-expect-error ignore
                    routeComponent.stable = Number(pair[1]) == 0 ? true : false;
                }

                if (dir === "reversed") {
                    routeComponent.from = to;
                    routeComponent.to = from;
                }

                if (index == 0) {
                    currentMappedPathSets.push([routeComponent]);
                } else {
                    //@ts-expect-error ignore
                    mappedPathSets.map((incompleteSet) => {
                        currentMappedPathSets.push(
                            incompleteSet.concat([routeComponent])
                        );
                    });
                }

            });

            //@ts-expect-error ignore
            mappedPathSets = [...currentMappedPathSets];
        });
        //@ts-expect-error ignore
        paths.push(...mappedPathSets);
    });

    // Filters out High Liquidity Tokens and extra Routes if max length is exceeded
    return filterPaths(paths, [...highLiqTokens, fromToken, toToken], MAX_ROUTES);
}

// Filters out 2 Hop Paths until MaxLength is not surpassed
function filterPaths(
    paths: [][],
    highLiqTokens: string[],
    maxLength: number
): [][] {
    console.log(paths, "++")
    paths = paths.filter((routes: []) =>
        routes.every(
            (r) =>
                //@ts-expect-error ignore
                highLiqTokens.includes(r.to.toLowerCase()) && highLiqTokens.includes(r.from.toLowerCase())
        )
    );
    if (paths.length > maxLength) {
        const itemsToRemove: number = paths.length - maxLength;
        const filteredArray: [][] = [];
        let count = 0;
        for (let i = 0; i < paths.length; i++) {
            const path: [] = paths[i];
            if (count < itemsToRemove) {
                //@ts-expect-error ignore
                if (path.length == 1) filteredArray.push(path);
                // Ignore tokens with more than 1 hop
                else count++;
            } else filteredArray.push(path);
        }
        paths = filteredArray;
    }
    return paths;
}

/**
 * Returns the best quote for a bunch of routes and an amount
 *
 * if the quoted amount is the same. This should theoretically limit
 * the price impact on a trade.
 */
export async function fetchQuoteV2(
    routes: [][],
    amount: BigNumber,
    chainId: number,
    chunkSize = 50
) {
    const routeChunks = chunk(routes, chunkSize);
    const router = new ethers.Contract(
        aerodromeContracts[chainId].router as string,
        [
            "function getAmountsOut(uint256,tuple(address from, address to, bool stable, address factory)[]) public view returns (uint256[] memory)",
        ],
        new ethers.JsonRpcProvider(rpcUrls[chainId])
    );

    const quoteChunks = [];
    // Split into chunks and get the route quotes...
    for (const routeChunk of routeChunks) {
        for (const route of routeChunk) {
            let amountsOut;
            try {
                amountsOut = await router.getAmountsOut(amount, route);
                console.log(amountsOut, "OOOOPPPPOOOOO")
            } catch (err) {
                console.log(err)
                amountsOut = [];
            }
            // Ignore bad quotes...
            if (amountsOut && amountsOut.length >= 1) {
                const amountOut = amountsOut[amountsOut.length - 1];

                // Ignore zero quotes...
                if (!BigNumber.from(amountOut).isZero())
                    quoteChunks.push({ route, amount, amountOut, amountsOut });
            }

        }
    }

    // Filter out bad quotes and find the best one...
    const bestQuote = quoteChunks
        .flat()
        .filter(Boolean)
        //@ts-expect-error ignore
        .reduce((best, quote) => {
            if (!best) {
                return quote;
            } else {
                //@ts-expect-error ignore
                return best.amountOut.gt(quote.amountOut) ? best : quote;
            }
        }, null);

    if (!bestQuote) {
        return null;
    }

    return bestQuote;
}

export async function fetchQuoteV3(
    routes: [][],
    amount: BigNumber,
    chainId: number,
    chunkSize = 50
) {
    const routeChunks = chunk(routes, chunkSize);
    const quoteChunks = [];
    // Split into chunks and get the route quotes...
    for (const routeChunk of routeChunks) {
        for (const route of routeChunk) {
            let amountsOut;
            try {
               if(route?.length){
                //@ts-expect-error ignore
                const encodedInput = encodePath([route[0].from, route[0].to], [route[0].fee])
                amountsOut = await quoteV3AddLiquidity(chainId, encodedInput, Number(amount));
                console.log(amountsOut, "amountsOut")
               }
            } catch (err) {
                console.log(err)
                amountsOut = [];
            }
            // Ignore bad quotes...
            if (amountsOut && amountsOut.length >= 1) {
                const amountOut = amountsOut[amountsOut.length - 1];

                // Ignore zero quotes...
                if (!BigNumber.from(amountOut).isZero())
                    quoteChunks.push({ route, amount, amountOut, amountsOut });
            }

        }
    }

    // Filter out bad quotes and find the best one...
    const bestQuote = quoteChunks
        .flat()
        .filter(Boolean)
        //@ts-expect-error ignore
        .reduce((best, quote) => {
            if (!best) {
                return quote;
            } else {
                //@ts-expect-error ignore
                return best.amountOut.gt(quote.amountOut) ? best : quote;
            }
        }, null);

    if (!bestQuote) {
        return null;
    }

    return bestQuote;
}

//@ts-expect-error ignore
const separateRoutes = (routes) => {
    const v2Routes = [];
    const v3Routes = [];

    for (const route of routes) {
        if (route.length === 0) continue;

        const firstHop = route[0];

        if ('fee' in firstHop) {
            // V3 route has "fee"
            v3Routes.push(route);
        } else if ('stable' in firstHop) {
            // V2 route has "stable"
            v2Routes.push(route);
        }
    }

    return { v2Routes, v3Routes };
}

export async function quoteForSwap(chainId: number, token0: string, token1: string, amount: number, decimal0: number) {
    try {
        const [poolsGraph, poolsByAddress] = buildGraph(await getPools(chainId));
        const routes = getRoutes(
            poolsGraph,
            poolsByAddress,
            token0?.toLowerCase(), //token0
            token1?.toLowerCase(), //token1
            []
        )

        const { v2Routes, v3Routes } = separateRoutes(routes);
        console.log("V2 Routes:", v2Routes);
        console.log("V3 Routes:", v3Routes);


        const quotev2 = await fetchQuoteV2(
            v2Routes,
            //@ts-expect-error ignore
            toUnits(amount, decimal0),
            chainId,
        )

        const quotev3 = await fetchQuoteV3(
            v3Routes,
            //@ts-expect-error ignore
            toUnits(amount, decimal0),
            chainId,
        )
        console.log(quotev3, "quot<><><>******<e+++++", quotev2)
        // return {
        //     data: quotev3?.route,
        //     amountOut: quotev3?.amountOut,
        //     command_type: "V3_SWAP_EXACT_IN"
        // }

        return {
            data: quotev2?.route,
            amountOut: quotev2?.amountOut,
            command_type: "V2_SWAP_EXACT_IN"
        }
    } catch (error) {
        console.log(error)
        return {
            data: null,
            amountOut: 0,
            command_type: "V2_SWAP_EXACT_IN"
        }
    }
}
