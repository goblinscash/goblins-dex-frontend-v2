// // SPDX-License-Identifier: BUSL-1.1
// import { Contract } from "@ethersproject/contracts";
// import { Provider } from "@ethersproject/providers";
// import { BigNumber } from "@ethersproject/bignumber";
// import { allSimpleEdgeGroupPaths } from "graphology-simple-path";
// // import { abi as convAbi } from "";
// import {
//     PROCESSING_COMPLETE,
//     LP_SUGAR_ADDRESS,
//     ZERO_ADDRESS,
//     RewardContractInfo,
//     Reward,
//     RELAY_REGISTRY_ADDRESS,
//     ROUTER_ADDRESS,
// } from "@/utils/constants";

// import lpSugarAbi from "../../abi/sugar/lpSugar.json"
// import Graph from "graphology";
// import { chunk, isEmpty } from "lodash";
// import { ethers } from "ethers";
// import { aerodromeContracts, rpcUrls } from "../config.utils";

// const MAX_ROUTES = 25;

// export function buildGraph(pairs: any) {

//     const graph = new Graph({ multi: true });
//     const pairsByAddress: any = {};

//     if (!isEmpty(pairs))
//         pairs.forEach((pair: any) => {
//             const tokenA = pair.token0.toLowerCase();
//             const tokenB = pair.token1.toLowerCase();
//             const pairAddress = pair.lp.toLowerCase();

//             // @ts-ignore
//             graph.mergeEdgeWithKey(`direct:${pairAddress}`, tokenA, tokenB);
//             // @ts-ignore
//             graph.mergeEdgeWithKey(`reversed:${pairAddress}`, tokenB, tokenA);

//             pairsByAddress[pairAddress] = { ...pair, address: pairAddress };
//         });

//     return [graph, pairsByAddress];
// }



// let provider = new ethers.JsonRpcProvider(rpcUrls[56]);
// export async function getPools(chainId: number) {
//     const instance = new ethers.Contract(
//         aerodromeContracts[chainId].lpSugar as string,
//         lpSugarAbi,
//         new ethers.JsonRpcProvider(rpcUrls[chainId])
//     );

//     console.log(aerodromeContracts[chainId].lpSugar, "++++++++++++++++")
//     return await instance.forSwaps(10, 0);
// }

// export function getRoutes(
//     graph: any,
//     pairsByAddress: any,
//     fromToken: string,
//     toToken: string,
//     highLiqTokens: string[],
//     maxHops = 3
// ): any[][] {
//     if (!fromToken || !toToken) {
//         return [];
//     }

//     // @ts-ignore
//     if (graph?.size < 1) {
//         return [];
//     }

//     let graphPaths = [];

//     try {
//         graphPaths = allSimpleEdgeGroupPaths(graph, fromToken, toToken, {
//             maxDepth: maxHops,
//         });
//     } catch {
//         return [];
//     }

//     let paths: any[][] = [];

//     graphPaths.map((pathSet: any) => {
//         let mappedPathSets: any = [];

//         pathSet.map((pairAddresses: any, index: any) => {
//             const currentMappedPathSets: any = [];
//             pairAddresses.map((pairAddressWithDirection: any) => {
//                 const [dir, pairAddress] = pairAddressWithDirection.split(":");
//                 const pair = pairsByAddress[pairAddress];
//                 const routeComponent = {
//                     from: pair.token0,
//                     to: pair.token1,
//                     stable: pair.stable,
//                     factory: pair.factory,
//                 };
//                 if (dir === "reversed") {
//                     routeComponent.from = pair.token1;
//                     routeComponent.to = pair.token0;
//                 }

//                 index == 0
//                     ? currentMappedPathSets.push([routeComponent])
//                     : mappedPathSets.map((incompleteSet: any) => {
//                         currentMappedPathSets.push(
//                             incompleteSet.concat([routeComponent])
//                         );
//                     });
//             });

//             mappedPathSets = [...currentMappedPathSets];
//         });
//         paths.push(...mappedPathSets);
//     });

//     // Filters out High Liquidity Tokens and extra Routes if max length is exceeded
//     return filterPaths(paths, [...highLiqTokens, fromToken, toToken], MAX_ROUTES);
// }

// // Filters out 2 Hop Paths until MaxLength is not surpassed
// function filterPaths(
//     paths: any[][],
//     highLiqTokens: string[],
//     maxLength: number
// ): any[][] {
//     paths = paths.filter((routes: any[]) =>
//         routes.every(
//             (r: any) =>
//                 highLiqTokens.includes(r.to.toLowerCase()) &&
//                 highLiqTokens.includes(r.from.toLowerCase())
//         )
//     );
//     if (paths.length > maxLength) {
//         const itemsToRemove: number = paths.length - maxLength;
//         let filteredArray: any[][] = [];
//         let count = 0;
//         for (let i = 0; i < paths.length; i++) {
//             const path: any[] = paths[i];
//             if (count < itemsToRemove) {
//                 if (path.length == 1) filteredArray.push(path);
//                 // Ignore tokens with more than 1 hop
//                 else count++;
//             } else filteredArray.push(path);
//         }
//         paths = filteredArray;
//     }
//     return paths;
// }

// /**
//  * Returns the best quote for a bunch of routes and an amount
//  *
//  * if the quoted amount is the same. This should theoretically limit
//  * the price impact on a trade.
//  */
// export async function fetchQuote(
//     routes: any[][],
//     amount: BigNumber,
//     provider: Provider,
//     chunkSize = 50
// ) {
//     const routeChunks = chunk(routes, chunkSize);
//     const router: Contract = new Contract(
//         ROUTER_ADDRESS,
//         [
//             "function getAmountsOut(uint256,tuple(address from, address to, bool stable, address factory)[]) public view returns (uint256[] memory)",
//         ],
//         provider
//     );

//     let quoteChunks = [];
//     // Split into chunks and get the route quotes...
//     for (const routeChunk of routeChunks) {
//         for (const route of routeChunk) {
//             let amountsOut;
//             try {
//                 amountsOut = await router.getAmountsOut(amount, route);
//             } catch (err) {
//                 amountsOut = [];
//             }

//             // Ignore bad quotes...
//             if (amountsOut && amountsOut.length >= 1) {
//                 const amountOut = amountsOut[amountsOut.length - 1];

//                 // Ignore zero quotes...
//                 if (!amountOut.isZero())
//                     quoteChunks.push({ route, amount, amountOut, amountsOut });
//             }
//         }
//     }

//     // Filter out bad quotes and find the best one...
//     const bestQuote = quoteChunks
//         .flat()
//         .filter(Boolean)
//         .reduce((best: any, quote) => {
//             if (!best) {
//                 return quote;
//             } else {
//                 return best.amountOut.gt(quote.amountOut) ? best : quote;
//             }
//         }, null);

//     if (!bestQuote) {
//         return null;
//     }

//     return bestQuote;
// }

// // under testing

// export async function helper() {

    
//     const [poolsGraph, poolsByAddress] = buildGraph(await getPools(56));
// }
