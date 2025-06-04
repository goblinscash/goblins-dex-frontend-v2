import { getRoutes, quoteForSwap, buildGraph } from './routes.utils';
import Graph from 'graphology';
import { allSimpleEdgeGroupPaths } from 'graphology-simple-path';
import { ethers } from 'ethers';
import { toUnits } from '../math.utils'; // Ensure this path is correct or adjust as needed

// Actual module, but we will spy on/mock specific functions from it
const actualRoutesUtils = jest.requireActual('./routes.utils');

// Mocks
jest.mock('graphology');
jest.mock('graphology-simple-path');
jest.mock('ethers', () => {
    const originalEthers = jest.requireActual('ethers');
    return {
        ...originalEthers,
        Contract: jest.fn(),
        JsonRpcProvider: jest.fn(), // Assuming JsonRpcProvider is used, if not, remove
    };
});

const mockEthersContract = ethers.Contract as jest.Mock;
const mockAllSimpleEdgeGroupPaths = allSimpleEdgeGroupPaths as jest.Mock;
const mockGraphInstanceConstructor = Graph as jest.MockedClass<typeof Graph>;

// Spy on getPools and mock its implementation for quoteForSwap tests
let mockGetPools: jest.SpyInstance;

describe('routes.utils', () => {
    const tokenA = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const tokenB = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
    const tokenC = '0xcccccccccccccccccccccccccccccccccccccccc';
    const factory = '0xfactoryaddressaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const pairAB_address = '0xpairab0000000000000000000000000000000000';
    const pairBC_address = '0xpairbc0000000000000000000000000000000000';

    // Structure of data as if returned by getPools and processed by buildGraph
    const pairAB_data = [pairAB_address, false, tokenA, tokenB, factory]; // lp, stable, token0, token1, factory
    const pairBC_data = [pairBC_address, true, tokenB, tokenC, factory];  // lp, stable, token0, token1, factory

    let mockGraphInstance: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockGraphInstance = {
            mergeEdgeWithKey: jest.fn(),
            size: 0, // Default size
            // Add any other methods your buildGraph might use from graphology instance
        };
        mockGraphInstanceConstructor.mockImplementation(() => mockGraphInstance);

        // Setup spy for getPools
        mockGetPools = jest.spyOn(actualRoutesUtils, 'getPools');
    });

    afterEach(() => {
        mockGetPools.mockRestore();
    });

    describe('getRoutes', () => {
        it('should return a single direct route for A -> B with maxHops=1', () => {
            mockGraphInstance.size = 1; // Simulate graph has edges
            const pairsByAddress = {
                [pairAB_address]: pairAB_data
            };
            mockAllSimpleEdgeGroupPaths.mockReturnValue([[`direct:${pairAB_address}`]]);

            const routes = getRoutes(mockGraphInstance, pairsByAddress, tokenA, tokenB, [], 1);
            expect(mockAllSimpleEdgeGroupPaths).toHaveBeenCalledWith(mockGraphInstance, tokenA, tokenB, { maxDepth: 1 });
            expect(routes).toHaveLength(1);
            expect(routes[0]).toEqual([{ from: tokenA, to: tokenB, stable: false, factory }]);
        });

        it('should return an A -> B -> C multi-hop route with maxHops=2', () => {
            mockGraphInstance.size = 2;
            const pairsByAddress = {
                [pairAB_address]: pairAB_data,
                [pairBC_address]: pairBC_data
            };
            mockAllSimpleEdgeGroupPaths.mockReturnValue([[`direct:${pairAB_address}`, `direct:${pairBC_address}`]]);

            const routes = getRoutes(mockGraphInstance, pairsByAddress, tokenA, tokenC, [], 2);
            expect(mockAllSimpleEdgeGroupPaths).toHaveBeenCalledWith(mockGraphInstance, tokenA, tokenC, { maxDepth: 2 });
            expect(routes).toHaveLength(1);
            expect(routes[0]).toEqual([
                { from: tokenA, to: tokenB, stable: false, factory },
                { from: tokenB, to: tokenC, stable: true, factory }
            ]);
        });

        it('should return an empty array if no route is found by graphology', () => {
            mockGraphInstance.size = 1; // Graph might have edges, but not for this path
            const pairsByAddress = { [pairAB_address]: pairAB_data };
            mockAllSimpleEdgeGroupPaths.mockReturnValue([]); // No path found

            const routes = getRoutes(mockGraphInstance, pairsByAddress, tokenA, tokenC, [], 1);
            expect(routes).toEqual([]);
        });

        it('should return an empty array if graph is empty', () => {
            mockGraphInstance.size = 0; // Graph is empty
            const pairsByAddress = {};
            // allSimpleEdgeGroupPaths might error or return [] if graph is empty or node not found.
            // We'll assume it returns [] or getRoutes handles it before calling.
            // Based on current getRoutes, if graph.size < 1, it returns [] early.
            const routes = getRoutes(mockGraphInstance, pairsByAddress, tokenA, tokenC, [], 1);
            expect(routes).toEqual([]);
            expect(mockAllSimpleEdgeGroupPaths).not.toHaveBeenCalled(); // due to early exit
        });


        it('should respect maxHops: return empty if only longer path exists', () => {
            mockGraphInstance.size = 2;
            const pairsByAddress = {
                [pairAB_address]: pairAB_data,
                [pairBC_address]: pairBC_data
            };

            // Configure allSimpleEdgeGroupPaths mock to simulate its behavior based on maxDepth
            mockAllSimpleEdgeGroupPaths.mockImplementation((graph, from, to, options) => {
                if (options.maxDepth === 1) {
                    return []; // No 1-hop path found for A -> C
                }
                if (options.maxDepth === 2) {
                    return [[`direct:${pairAB_address}`, `direct:${pairBC_address}`]]; // 2-hop path found
                }
                return [];
            });

            const routes = getRoutes(mockGraphInstance, pairsByAddress, tokenA, tokenC, [], 1);
            expect(mockAllSimpleEdgeGroupPaths).toHaveBeenCalledWith(mockGraphInstance, tokenA, tokenC, { maxDepth: 1 });
            expect(routes).toEqual([]); // Expect empty because only a 2-hop path exists, but maxHops was 1
        });
    });

    describe('quoteForSwap', () => {
        const mockAmount = "10"; // string input for toUnits
        const mockDecimals = 18;
        const mockAmountUnits = toUnits(mockAmount, mockDecimals);
        const chainId = 1;

        let mockContractGetAmountsOut: jest.Mock;

        beforeEach(() => {
            mockContractGetAmountsOut = jest.fn();
            const mockContractInstance = { getAmountsOut: mockContractGetAmountsOut };
            mockEthersContract.mockReturnValue(mockContractInstance);

            // Mock getPools to return data that buildGraph will use
            mockGetPools.mockResolvedValue([
                pairAB_data, // [lp, stable, token0, token1, factory]
                pairBC_data,
            ]);
        });

        it('should process a multi-hop route (A->B->C) and return quote structure', async () => {
            // Configure allSimpleEdgeGroupPaths for the A -> C route (2 hops)
            // This will be called by getRoutes, which is called by quoteForSwap
            mockAllSimpleEdgeGroupPaths.mockImplementation((graph, from, to, options) => {
                if (from === tokenA.toLowerCase() && to === tokenC.toLowerCase() && options.maxDepth >= 2) {
                    return [[`direct:${pairAB_address}`, `direct:${pairBC_address}`]];
                }
                return [];
            });

            const expectedAmountOutB = toUnits("9", mockDecimals); // A -> B
            const expectedAmountOutC = toUnits("8", mockDecimals); // B -> C (final out)

            mockContractGetAmountsOut.mockImplementation(async (amountIn, path) => {
                // Path for A->B->C will be [{from:tokenA, to:tokenB,...}, {from:tokenB, to:tokenC,...}]
                if (path.length === 2 && path[0].from === tokenA.toLowerCase() && path[1].to === tokenC.toLowerCase()) {
                    return [amountIn, expectedAmountOutB, expectedAmountOutC];
                }
                return [];
            });

            const quote = await quoteForSwap(chainId, tokenA, tokenC, parseFloat(mockAmount), mockDecimals);

            expect(mockGetPools).toHaveBeenCalledWith(chainId);
            // buildGraph and getRoutes are called internally, their mocks/spies would show calls.
            expect(mockAllSimpleEdgeGroupPaths).toHaveBeenCalled(); // Confirms getRoutes was hit
            expect(mockContractGetAmountsOut).toHaveBeenCalled(); // Confirms fetchQuote was hit

            expect(quote).not.toBeNull();
            expect(quote?.data).toHaveLength(2); // Path A->B, B->C
            expect(quote?.data[0].from.toLowerCase()).toEqual(tokenA.toLowerCase());
            expect(quote?.data[0].to.toLowerCase()).toEqual(tokenB.toLowerCase());
            expect(quote?.data[1].from.toLowerCase()).toEqual(tokenB.toLowerCase());
            expect(quote?.data[1].to.toLowerCase()).toEqual(tokenC.toLowerCase());
            expect(quote?.amountOut.toString()).toEqual(expectedAmountOutC.toString());
            expect(quote?.command_type).toEqual("V2_SWAP_EXACT_IN");
        });

        it('should return null if no routes are found by getRoutes', async () => {
            mockAllSimpleEdgeGroupPaths.mockReturnValue([]); // No routes

            const quote = await quoteForSwap(chainId, tokenA, tokenC, parseFloat(mockAmount), mockDecimals);
            expect(quote?.data).toBeNull(); // Or however your function indicates no quote
            expect(quote?.amountOut).toEqual(0);
        });

         it('should return null if contract getAmountsOut fails or returns empty', async () => {
            mockAllSimpleEdgeGroupPaths.mockImplementation((graph, from, to, options) => {
                 if (from === tokenA.toLowerCase() && to === tokenC.toLowerCase()) {
                    return [[`direct:${pairAB_address}`, `direct:${pairBC_address}`]];
                }
                return [];
            });
            mockContractGetAmountsOut.mockResolvedValue([]); // Simulate contract error/empty return

            const quote = await quoteForSwap(chainId, tokenA, tokenC, parseFloat(mockAmount), mockDecimals);
             expect(quote?.data).toBeNull();
             expect(quote?.amountOut).toEqual(0);
        });
    });
});
