"use client";
import React, { useEffect, useState } from 'react';
import DocumentationModal from '@/components/modals/DocumentationModal';
import DepositCard from './DepositCard';
import LockCard from './LockCard';
import ClaimCard from './ClaimCard';
import Link from 'next/link';
import { VeNFT, locksByAccount, positions, all, Position, FormattedPool, PoolTypeMap } from '@/utils/sugar.utils';
import { useChainId, useAccount } from 'wagmi';
import { calculateRebaseAPR, formatLockedFor, fromUnits, toUnits } from '@/utils/math.utils';
import { getToken } from '@/utils/token.utils';
import { v3PositionByAddress } from '@/utils/web3.utils';
import { zeroAddr } from '@/utils/config.utils';
interface PositionType {
    nonce: string;
    operator: string;
    token0: string;
    token1: string;
    fee: string;
    tickLower: string;
    tickUpper: string;
    liquidity: string;
    feeGrowthInside0LastX128: string;
    feeGrowthInside1LastX128: string;
    tokensOwed0: string;
    tokensOwed1: string;
}
interface NFTPosition {
    nftId: number;
    position: PositionType;
}

type LockItem = {
    id: string;
    amount: string;
    lockedFor: string;
    type: 'locked' | 'unlocked';
    tokenSymbol: string;
    rebaseApr: string;
    rebaseAmount: string;
    logoUri: string;
};

type DepositItem = {
    id: number;
    tokenPair: {
        position?: number,
        tickLower?: string,
        tickUpper?: string,
        index: number;
        lp: string;
        gauge: string;
        token0: string;
        token1: string;
        token0Name: string;
        token1Name: string;
        fee: string;
        type: string;
        token0Amount: string;
        token1Amount: string;
        unstaked0Amount: string;
        unstaked1Amount: string;
        apr: string;
        emissionsToken: string;
        emissionsAmount: string;
        tradingFees0: string;
        tradingFees1: string;
        depositedUsd: string;
        poolTotalUsd: string;
    };
};

const Dashboard = () => {
    const [allDepositsExpanded, setAllDepositsExpanded] = useState(false);
    const [expandedDepositStates, setExpandedDepositStates] = useState<{ [key: number]: boolean }>({});
    const [open, setOpen] = useState(false);
    const [v3PositionData, setV3PositionData] = useState<NFTPosition[]>([]);

    const [isLiquidityRewardsModalOpen, setIsLiquidityRewardsModalOpen] = useState(false);
    const [isLocksModalOpen, setIsLocksModalOpen] = useState(false);
    const [isVotingRewardsModalOpen, setIsVotingRewardsModalOpen] = useState(false);

    const liquidityPoolsAndRewardsContent = (
        <>
            <h4>Understanding Liquidity Pools in Goblins Cash V2</h4>
            <p>The core functionality of Goblins Cash V2 is to allow users to exchange tokens in a secure way, with low fees and low slippage.</p>
            <p>Slippage is the difference between the current market price of a token and the price at which the actual exchange/swap is executed...</p>
            <p>To provide access to the best rates on the market, Goblins Cash V2 utilizes different types of tokens:<ul><li><strong>Correlated tokens:</strong> Assets expected to trade closely in price (e.g., stablecoins like $USDC, $DAI).</li><li><strong>Uncorrelated tokens:</strong> Assets whose prices are not expected to move closely (e.g., $GOB, $BTC).</li></ul></p>
            <p>Goblins Cash V2 offers different liquidity pool types... primarily Stable Pools and Volatile Pools...</p>
            <p>The protocol&apos;s router evaluates pool types... uses time-weighted average prices (TWAPs)...</p>
            <p>The deeper the liquidity... the smaller the slippage...</p>
            <h5>Pool Types:</h5>
            <p><strong>Stable Pools:</strong> Designed for tokens with little to no volatility relative to each other. Common formula: <code>x³y + y³x ≥ k</code></p>
            <p><strong>Volatile Pools:</strong> Designed for tokens with higher price volatility. Common formula: <code>x × y ≥ k</code></p>
            <p><strong>Concentrated Liquidity (CL) Pools:</strong> Allow LPs to deposit assets within a specific price range... using &quot;ticks&quot;...</p>
            <ul>
                <li><strong>Tick Spacing:</strong> Minimum price movement between ranges. Examples: Stable tokens (0.01%-0.5%), Volatile tokens (2%+).</li>
                <li><strong>CL Pool Symbols:</strong> Often indicate nature, e.g., <code>CL1-wstETH/WETH</code>.</li>
                <li><strong>CL Pool Fees:</strong> Can be adjusted flexibly.</li>
            </ul>
            <h4>Understanding Rewards & APR Calculation in Goblins Cash V2</h4>
            <p>Providing liquidity... can earn rewards from transaction fees and potential token incentives (emissions).</p>
            <h5>Calculating APRs (Annual Percentage Rate):</h5>
            <p><strong>For Basic Pools:</strong> APR generally based on rewards earned / total value of staked liquidity.</p>
            <p><strong>For Concentrated Liquidity (CL) Pools:</strong> APR calculation is nuanced, considering rewards for liquidity in the active trading price range.</p>
        </>
    );

    const votingRewardsContent = (
        <>
            <h4>Fees</h4>
            <p>Token pairs in Goblins Cash V2 capture fees from the trading volume enabled by the liquidity in each pool.</p>
            <p>The fees collected by staked Liquidity Providers (LPs) in the previous epoch are often deposited as incentives for the current voting epoch.</p>
            <p>Fee rewards are distributed in the same tokens as the liquidity pool tokens from which they originate. For example, if the pool is a Goblins Cash V2 AMM pool for GOB/USDC, the distributed fee tokens would be $GOB and $USDC.</p>
            <p>Fee rewards that are part of direct LP earnings are typically distributed as accrued and can be claimed at any time. Fee rewards deposited as voter incentives are usually available for claim after the epoch changes (e.g., Thursday 00:00 UTC) and are distributed proportionally to the voting power cast by a voter (e.g., $veGOB).</p>

            <h4>Incentives</h4>
            <p>In addition to fee rewards, liquidity pools can receive external voter rewards from protocols or other participants (these are often known as incentives).</p>
            <p>Incentives can be deposited for whitelisted tokens and are distributed only to voters on that specific pool, proportionally to their share of pool votes.</p>
            <p>These rewards are typically available for claim after the epoch changes (e.g., Thursday 00:00 UTC) and are distributed proportionally to the voting power cast by a voter (e.g., $veGOB).</p>

            <h4>Rewards Claim</h4>
            <p>Rebase rewards, if applicable within the Goblins Cash V2 system, are typically claimable after a new epoch has started (e.g., Thursday 00:00 UTC).</p>
            <p><strong>An example of incentives, voting, and rewards claim timeline:</strong></p>
            <ul>
                <li>A new epoch starts (e.g., Thursday 00:00 UTC).</li>
                <li>Incentives are deposited by projects or individuals at any point during the epoch.</li>
                <li>Voters use their voting power (e.g., $veGOB) to vote for their preferred pools.</li>
                <li>Once the next epoch arrives (e.g., the following Thursday 00:00 UTC), users are able to claim the rewards earned from the concluded epoch.</li>
            </ul>
        </>
    );

    const locksContent = (
        <>
            <h4>Understanding Locks (veNFTs) in Goblins Cash V2</h4>
            <p>Locking your GOB tokens (or other designated tokens) allows you to participate in protocol governance and earn a share of protocol fees and emissions. These locks are often represented as veNFTs (Vote-Escrowed Non-Fungible Tokens).</p>
            <p><strong>Key Aspects of Locks:</strong></p>
            <ul>
                <li><strong>Voting Power:</strong> The longer you lock your tokens, and the greater the amount, the more voting power (e.g., veGOB) you receive.</li>
                <li><strong>Rewards:</strong> This voting power is then used to vote on which liquidity pools receive token emissions. As a voter, you typically earn a share of the transaction fees from the pools you vote for, plus a portion of the emissions.</li>
                <li><strong>Boosties:</strong> Some systems allow locks to boost the rewards earned from liquidity provision.</li>
            </ul>
            <p>The APR for rewards earned via locks and voting is influenced by the total rewards distributed and the total voting power participating.</p>
            <br />
            {liquidityPoolsAndRewardsContent} {/* Append general pool info */}
        </>
    );

    const chainId = useChainId();
    const { address } = useAccount();
    const [locks, setLocks] = useState<LockItem[] | null>(null);
    const [deposits, setDeposits] = useState<DepositItem[]>([]);

    useEffect(() => {
        if (chainId && address) {
            fetchLocksByAccount()
            fetchv3PositionByAddress().then(() => fetchDepositsByAccount());
        }
    }, [chainId, address]);

    const fetchLocksByAccount = async () => {
        if (!address) return
        const locks_ = await locksByAccount(chainId, address)
        console.log("Locks by account: ", locks_)
        setLocks(locks_.map((lock: VeNFT) => ({
            id: lock.id,
            amount: String(parseFloat(lock.amount) / 10 ** parseInt(lock.decimals)),
            lockedFor: formatLockedFor(Number(lock.expires_at)),
            type: "locked",
            tokenSymbol: getToken(lock.token)!.symbol,
            logoUri: getToken(lock.token)!.logoURI,
            rebaseApr: `${calculateRebaseAPR(lock.rebase_amount, lock.amount, lock.decimals)}%`,
            rebaseAmount: String(parseFloat(lock.rebase_amount) / 10 ** parseInt(lock.decimals)),
        } as LockItem)
        ))
    }

    async function fetchv3PositionByAddress() {
        const v3Position = await v3PositionByAddress(chainId, address!);

        setV3PositionData(v3Position.map((item) => {
            //@ts-expect-error ignore
            item.lp = item?.position.lp;
            return item;
        }
        ));
    }

    const fetchDepositsByAccount = async () => {
        if (!address) return
        const [deposits_, pools] = await Promise.all([positions(chainId, 100, 0, address), all(chainId, 100, 0, undefined)]);

        const v3Position: NFTPosition[] = await v3PositionByAddress(chainId, address!);
        console.log(v3Position, "v3Position", deposits_, "pools", pools)

        const depositsExtended = [...deposits_, ...v3Position];

        //@ts-expect-error ignore
        const updatedDeposits = depositsExtended.map((deposit: Position, index: number) => {

            const lpAddress = deposit?.lp ?? deposit?.position?.lp;


            const pool = pools.find((pool: FormattedPool) => pool.lp === lpAddress);
            if (!pool) {
                console.warn("No pool matched for lp:", lpAddress);
                return null;
            }
            console.log(pool, "ppppppppppppppppppppppp", deposit)

            const isV3 = pool?.nfpm === zeroAddr ? false : true;
            const position = isV3 ? deposit?.nftId || deposit.id : 0;
            const tickLower = isV3 ? deposit.position?.tickLower : 0;
            const tickUpper = isV3 ? deposit.position?.tickUpper : 0;

            const token0 = getToken(pool.token0)!;
            const token1 = getToken(pool.token1)!;
            const rewardToken = getToken(pool.emissions_token);

            const depositInfo = {
                id: pool.type > 0 ? Number(deposit.id) : index + 1,
                tokenPair: {
                    position,
                    tickUpper,
                    tickLower,
                    index: pool.id,
                    lp: pool.lp,
                    gauge: pool.gauge,
                    token0: pool.token0,
                    token1: pool.token1,
                    token0Name: token0.symbol,
                    token1Name: token1?.symbol,
                    fee: pool.pool_fee || "",
                    type: PoolTypeMap[String(pool.type)],
                    token0Amount: pool.type > 0 ? fromUnits(pool.reserve0, token0.decimals) : String(Number(deposit.amount0) / 10 ** token0.decimals),
                    token1Amount: pool.type > 0 ? fromUnits(pool.reserve1, token1.decimals) : String(Number(deposit.amount1) / 10 ** token1.decimals),
                    unstaked0Amount: pool.type > 0 ? fromUnits(pool.staked0, token0.decimals) : String(Number(deposit.staked0) / 10 ** token0.decimals),
                    unstaked1Amount: pool.type > 0 ? fromUnits(pool.staked1, token0.decimals) : String(Number(deposit.staked1) / 10 ** token1.decimals),
                    apr: `${pool.apr}%`,
                    emissionsToken: rewardToken?.symbol ?? "",
                    emissionsAmount: rewardToken
                        ? String(Number(deposit.emissions_earned) / 10 ** rewardToken.decimals)
                        : "",
                    tradingFees0: pool.type > 0 ? fromUnits(pool.token0_fees, token0.decimals) : String(Number(deposit.unstaked_earned0) / 10 ** token0.decimals),
                    tradingFees1: pool.type > 0 ? fromUnits(pool.token1_fees, token0.decimals) : String(Number(deposit.unstaked_earned1) / 10 ** token1.decimals),
                    depositedUsd: `$${(
                        (parseFloat(String(pool.poolBalance).replace("$", "")) *
                            Number(deposit.liquidity || deposit.position?.liquidity)) /
                        pool.liquidity
                    ).toFixed(2)}`,
                    poolTotalUsd: `${pool.poolBalance}`
                }
            } as DepositItem;

            return depositInfo;
        });

        console.log(updatedDeposits, "updatedDeposits")
        setDeposits(updatedDeposits.filter((d): d is DepositItem => d !== null));


    }

    const toggleExpandAllDeposits = () => {
        const newExpandedState = !allDepositsExpanded;
        setAllDepositsExpanded(newExpandedState);
    };

    const handleDepositExpandChange = (id: number, expanded: boolean) => {
        setExpandedDepositStates(prev => ({
            ...prev,
            [id]: expanded
        }));
    };

    console.log(deposits, "deposits++", expandedDepositStates)
    return (
        <div className='container px-3 py-5'>
            {/* Liquidity Rewards Section */}
            <div className='liquid-content mb-8'>
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-5">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-medium text-white whitespace-nowrap">Liquidity Rewards</h1>
                        <button
                            onClick={() => setIsLiquidityRewardsModalOpen(true)}
                            className="w-6 h-6 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#00ff4e] hover:text-white hover:bg-[#3A3A3A]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={toggleExpandAllDeposits}
                            className="flex items-center justify-center px-3 py-2 rounded-md bg-[#000E0E] border border-[#2A2A2A] text-white hover:bg-[#1A1A24] whitespace-nowrap min-w-[110px] w-1/2 sm:w-auto"
                        >
                            <span className="mr-1">Expand</span>
                            <span className="hidden sm:inline mr-1">All</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <Link href="/pools" className="w-1/2 sm:w-auto">
                            <button className="btn flex items-center justify-center commonBtn rounded text-xs font-medium">
                                <span className="sm:hidden">New</span>
                                <span className="hidden sm:inline">New Deposit</span>
                            </button>
                        </Link>
                    </div>
                </div>
                {/* Deposit Cards */}
                <div className="space-y-5">
                    {deposits.map((deposit, index) => (
                        <DepositCard
                            key={index}
                            depositId={deposit.id}
                            tokenPair={deposit.tokenPair}
                            forceExpanded={allDepositsExpanded}
                            onExpandChange={(expanded) => handleDepositExpandChange(deposit.id, expanded)}
                        />
                    ))}
                </div>
            </div>

            {/* Locks Section */}
            <div className='lock-section'>
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-5">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-medium text-white whitespace-nowrap">Locks</h1>
                        <button
                            onClick={() => setIsLocksModalOpen(true)}
                            className="w-6 h-6 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#00ff4e] hover:text-white hover:bg-[#3A3A3A]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg>
                        </button>
                    </div>
                </div>
                {/* Lock Cards */}
                <div className="space-y-5">
                    {locks?.map((lock, index) => (
                        <LockCard
                            key={`${lock.id}-${index}`}
                            lock={lock}
                        />
                    ))}
                </div>
            </div>

            <div className='static-card mt-3'>
                <Link href="/locks">
                    <div className="bg-[#000E0E] text-white p-4 sm:p-5 rounded-lg flex items-start sm:items-center justify-between hover:shadow-lg w-full">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-10"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ratio"><rect width="12" height="20" x="6" y="2" rx="2"></rect><rect width="20" height="12" x="2" y="6" rx="2"></rect></svg></div>
                            <div>
                                <p className="text-sm sm:text-base font-medium text-gray-200">
                                    You can deposit your locks into a Relay strategy
                                </p>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    if you want to maximize your voting power.
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:block text-gray-300">
                            <span className="text-xl">{`>`}</span>
                        </div>
                    </div>
                </Link>
            </div>

            <div className='claim-section mt-8'>
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-5">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-medium font-bold text-white whitespace-nowrap">Voting Rewards</h1>
                        <button
                            onClick={() => setIsVotingRewardsModalOpen(true)}
                            className="w-6 h-6 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#00ff4e] hover:text-white hover:bg-[#3A3A3A]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg>
                        </button>
                    </div>
                    <div className="relative inline-block text-left">
                        {/* Button */}
                        <button
                            onClick={() => setOpen(!open)}
                            className="bg-[#000E0E] border border-[#1E2233] text-neon-green px-4 py-1.5 rounded-md text-sm flex items-center gap-1 hover:bg-[#12172A] transition"
                        >
                            Claim All
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"></path></svg>
                        </button>

                        {/* Dropdown */}
                        {open && (
                            <div className="absolute right-0 z-10 mt-2 w-full max-w-xs sm:w-72 bg-[#000E0E] rounded-xl shadow-lg border border-[#1E2233]">
                                {locks?.map((lock, index) => (
                                    <div key={`${lock.id}-${index}`} className="px-4 py-3 border-b border-[#1E2233] last:border-0">
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={lock.logoUri}
                                                alt={lock.tokenSymbol}
                                                className="w-7 h-7 mt-0.5 rounded-md object-cover"
                                            />
                                            <div className="flex flex-col text-sm text-white">
                                                <div className="flex items-center gap-1 font-semibold">
                                                    Lock #{lock.id}
                                                    {lock.type === 'locked' ? (
                                                        <svg className="ml-2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                                                        </svg>) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-orbit"><circle cx="12" cy="12" r="3"></circle><circle cx="19" cy="5" r="2"></circle><circle cx="5" cy="19" r="2"></circle><path d="M10.4 21.9a10 10 0 0 0 9.941-15.416"></path><path d="M13.5 2.1a10 10 0 0 0-9.841 15.416"></path></svg>)}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {lock.amount} {lock.tokenSymbol} {lock.lockedFor}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="mt-2 text-neon-green text-xs font-medium hover:underline">
                                            Claim
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="space-y-5 mt-3">
                    {[1, 2, 3, 4].map((index) => (
                        <ClaimCard
                            key={`claim-${index}`}
                            lockId={`68969-${index}`}
                            fBOMBAmount="0.03499"
                            wstETHAmount="0.0"
                        />
                    ))}
                </div>
            </div>

            <DocumentationModal
                isOpen={isLiquidityRewardsModalOpen}
                onClose={() => setIsLiquidityRewardsModalOpen(false)}
                title="Liquidity Pools & Rewards Explained"
                content={liquidityPoolsAndRewardsContent}
            />
            <DocumentationModal
                isOpen={isLocksModalOpen}
                onClose={() => setIsLocksModalOpen(false)}
                title="Locks Explained"
                content={locksContent}
            />
            <DocumentationModal
                isOpen={isVotingRewardsModalOpen}
                onClose={() => setIsVotingRewardsModalOpen(false)}
                title="Voting Rewards Explained"
                content={votingRewardsContent}
            />
        </div>
    );
};

export default Dashboard;
