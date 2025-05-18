import { BigNumber } from "@ethersproject/bignumber";
import { allSimpleEdgeGroupPaths } from "graphology-simple-path";

import lpSugarAbi from "../../abi/sugar/lpSugar.json"
import Graph from "graphology";
import { chunk, isEmpty } from "lodash";
import { ethers } from "ethers";
import { aerodromeContracts, rpcUrls } from "../config.utils";
import { toUnits } from "../math.utils";
import { GraphType } from "graphology-types";

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
    maxHops = 3
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

                const routeComponent = {
                    from,
                    to,
                    stable: pair[1] == 0 ? true : false,  //pair.stable,
                    factory: pair[4] //pair.factory,
                };
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
export async function fetchQuote(
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

// under testing

export async function quoteForSwap(chainId: number, token0: string, token1: string, amount: number, decimal0: number) {
    // console.log(decimal0, ">>>>>>>><<<<<<<<<<", token0, token1, amount)
    try {
        const [poolsGraph, poolsByAddress] = buildGraph(await getPools(chainId));
        const routes = getRoutes(
            poolsGraph,
            poolsByAddress,
            token0?.toLowerCase(), //token0
            token1?.toLowerCase(), //token1
            []
        )

        const quote = await fetchQuote(
            routes,
            //@ts-expect-error ignore
            toUnits(amount, decimal0),
            chainId,
        )
        console.log(quote, "quote+++++")


        return {
            data: quote?.route,
            amountOut: quote?.amountOut,
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
