"use client";
import React, { useEffect, useState } from 'react';
import DepositCard from './DepositCard';
import LockCard from './LockCard';
import ClaimCard from './ClaimCard';
import Link from 'next/link';
import { VeNFT, Relay, locksByAccount, allRelay, positions, all, Position, FormattedPool, PoolTypeMap } from '@/utils/sugar.utils';
import { useChainId, useAccount } from 'wagmi';
import { calculateRebaseAPR, formatLockedFor } from '@/utils/math.utils';
import { getToken } from '@/utils/token.utils';

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


// Mock data for demonstration
const mockDeposits = [
    {
        id: 0,
        tokenPair: {
            token0Name: "DEGEN",
            token1Name: "Bonk",
            fee: "0.3%",
            type: "Basic Volatile",
            token0Amount: "0.0",
            token1Amount: "0.0",
            unstaked0Amount: "13.53",
            unstaked1Amount: "2,957.35",
            apr: "0.0%",
            emissionsToken: "AERO",
            emissionsAmount: "0.0",
            tradingFees0: "0.20379",
            tradingFees1: "105.27",
            depositedUsd: "~$0.07388",
            poolTotalUsd: "~$0.07482"
        }
    },
    {
        id: 1,
        tokenPair: {
            token0Name: "Token1",
            token1Name: "Token0",
            fee: "0.3%",
            type: "Basic Volatile",
            token0Amount: "0.0",
            token1Amount: "0.0",
            unstaked0Amount: "0.0",
            unstaked1Amount: "0.0",
            apr: "0.0%",
            emissionsToken: "AERO",
            emissionsAmount: "0.0",
            tradingFees0: "0.0",
            tradingFees1: "0.0",
            depositedUsd: "~$0.0",
            poolTotalUsd: "~$0.0"
        }
    }
];

const Dashboard = () => {
    const [allDepositsExpanded, setAllDepositsExpanded] = useState(false);
    const [expandedDepositStates, setExpandedDepositStates] = useState<{ [key: number]: boolean }>({});
    const [open, setOpen] = useState(false);

    const chainId = useChainId();
    const { address } = useAccount();
    const [locks, setLocks] = useState<LockItem[] | null>(null);
    const [deposits, setDeposits] = useState<DepositItem[]>([]);

    useEffect(() => {
        if (chainId && address) {
            fetchLocksByAccount()
            fetchDepositsByAccount()
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

    const fetchDepositsByAccount = async () => {
        if (!address) return
        const [deposits_, pools] = await Promise.all([positions(chainId, 100, 0, address), all(chainId, 100, 0, undefined)]);
        console.log("Deposits by account: ", deposits_)

        setDeposits(deposits_.map((deposit: Position, index: number) => {
            const pool = pools.find((pool: FormattedPool) => pool.lp === deposit.lp)!;

            const token0 = getToken(pool.token0)!;
            const token1 = getToken(pool.token1)!;
            const rewardToken = getToken(pool.emissions_token);

            const depositInfo = {
                id: pool.type > 0 ? Number(deposit.id) : index + 1,
                tokenPair: {
                    token0: pool.token0,
                    token1: pool.token1,
                    token0Name: token0.name,
                    token1Name: token1.name,
                    fee: pool.pool_fee || "",
                    type: PoolTypeMap[String(pool.type)],
                    token0Amount: String(Number(deposit.amount0) / 10 ** token0.decimals),
                    token1Amount: String(Number(deposit.amount1) / 10 ** token1.decimals),
                    unstaked0Amount: String(Number(deposit.staked0) / 10 ** token0.decimals),
                    unstaked1Amount: String(Number(deposit.staked1) / 10 ** token1.decimals),
                    apr: `${pool.apr}%`,
                    emissionsToken: rewardToken?.symbol ?? "",
                    emissionsAmount: rewardToken ? String(Number(deposit.emissions_earned) / 10 ** rewardToken.decimals) : "",
                    tradingFees0: String(Number(deposit.unstaked_earned0) / 10 ** token0.decimals),
                    tradingFees1: String(Number(deposit.unstaked_earned1) / 10 ** token1.decimals),
                    depositedUsd: `$${(parseFloat(String(pool.poolBalance).replace("$", "")) * Number(deposit.liquidity) / pool.liquidity).toFixed(2)}`,
                    poolTotalUsd: `${pool.poolBalance}`,
                }
            } as DepositItem;

            console.log("Deposit Info: ", depositInfo)
            return depositInfo;
        }));
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

    return (
        <div className='container px-3 py-5'>
            {/* Liquidity Rewards Section */}
            <div className='liquid-content mb-8'>
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-5">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">Liquidity Rewards</h1>
                        <button className="w-5 h-5 rounded-full bg-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#3A3A3A]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={toggleExpandAllDeposits}
                            className="flex items-center justify-center px-3 py-2 rounded-md bg-[#0F1118] border border-[#2A2A2A] text-white hover:bg-[#1A1A24] whitespace-nowrap min-w-[110px] w-1/2 sm:w-auto"
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
                        <h1 className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">Locks</h1>
                        <button className="w-5 h-5 rounded-full bg-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#3A3A3A]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                        <h1 className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">Voting Rewards</h1>
                        <button className="w-5 h-5 rounded-full bg-[#2A2A2A] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#3A3A3A]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                            <div className="absolute right-0 z-10 mt-2 w-72 bg-[#000E0E] rounded-xl shadow-lg border border-[#1E2233]">
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
        </div>
    );
};

export default Dashboard;
