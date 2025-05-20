import { formatTimestamp, fromUnits } from '@/utils/math.utils';
import { lockById, VeNFT } from '@/utils/sugar.utils';
import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import ActButton from '../common/ActButton';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useAccount, useChainId } from 'wagmi';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { aerodromeContracts } from '@/utils/config.utils';
import votingEscrowAbi from "../../abi/aerodrome/votingEscrow.json";
import Notify from '../common/Notify';
import Progress from '../common/Progress';
import RangeSlider from '@/app/lock/RangeSlider';

import { Switch } from '@headlessui/react';
import { LockKeyhole } from 'lucide-react';

// Define Maximum Expiry Constants
// const MAX_EXPIRY_SECONDS = Math.floor(new Date('2029-12-31T23:59:59Z').getTime() / 1000); // Removed
const FOUR_YEARS_IN_SECONDS = 4 * 365.25 * 24 * 3600; // Approximation

interface ExtendProps {
    tokenId: number;
}

const Extend: React.FC<ExtendProps> = ({ tokenId }) => {
    const [enabled, setEnabled] = useState(false);
    const [lock, setLock] = useState<VeNFT | null>(null);
    const [displayableNewExpiry, setDisplayableNewExpiry] = useState("");
    const [load, setLoad] = useState<{ [key: string]: boolean }>({});
    const [duration, setDuration] = useState(1); // Initial duration set to 1 day
    const [status, setStatus] = useState<{ [key: string]: boolean }>({
        extendCompleted: false,
    });

    const signer = useEthersSigner();
    const chainId = useChainId();
    const { address } = useAccount();

    const handleLoad = (action: string, status: boolean) => {
        setLoad((prev) => ({ ...prev, [action]: status }));
    };

    const handProgress = (action: string, status: boolean) => {
        setStatus((prev) => ({ ...prev, [action]: status }));
    };


    const fetchLocksById = async () => {
        if (!tokenId) return
        const locks_ = await lockById(chainId, Number(tokenId))
        //@ts-expect-error ignore
        setLock(locks_)
    }

    useEffect(() => {
        if (chainId && tokenId) {
            fetchLocksById()
        }
    }, [chainId, tokenId]);

    useEffect(() => {
        if (lock && lock.expires_at && typeof duration === 'number' && duration >= 0) { // ensure duration is valid
            const current_expiry_ts = Number(lock.expires_at);
            // Proposed new date based on current expiry + selected duration (in days)
            const proposed_new_expiry_ts = current_expiry_ts + (duration * 24 * 3600);

            // Apply 4-years-from-now cap
            const max_expiry_from_now_ts_calc = Math.floor(Date.now() / 1000) + FOUR_YEARS_IN_SECONDS;
            const capped_expiry_ts = Math.min(proposed_new_expiry_ts, max_expiry_from_now_ts_calc);

            if (capped_expiry_ts <= current_expiry_ts && duration > 0) { // duration > 0 means an extension was intended
                // This case implies the lock is already past all caps or extension is too small to overcome current date if current is past caps.
                // Or, the chosen duration makes it hit a cap that's <= current_expiry_ts.
                // Display the most restrictive cap that is still a valid extension, or current if no valid extension.
                // For simplicity, if it doesn't extend, show current, or a message.
                // If current_expiry_ts is already > MAX_EXPIRY_SECONDS, it will show current_expiry_ts.
                const effective_display_ts = Math.max(current_expiry_ts, capped_expiry_ts); // Show the later of the two if capped is somehow less.
                if (effective_display_ts <= current_expiry_ts && duration > 0) {
                   setDisplayableNewExpiry(new Date(current_expiry_ts * 1000).toUTCString() + " (Cannot extend further/Max limit reached)");
                } else {
                   setDisplayableNewExpiry(new Date(effective_display_ts * 1000).toUTCString());
                }

            } else if (duration === 0 && current_expiry_ts) { // No duration selected yet, or duration is 0
                setDisplayableNewExpiry(new Date(current_expiry_ts * 1000).toUTCString() + " (Current expiry)");
            }
             else if (current_expiry_ts) { // Valid extension
               setDisplayableNewExpiry(new Date(capped_expiry_ts * 1000).toUTCString());
            } else {
               setDisplayableNewExpiry("N/A"); // Should not happen if lock is loaded
            }
        } else if (lock && lock.expires_at) {
            // Initial state or invalid duration, show current expiry
            setDisplayableNewExpiry(new Date(Number(lock.expires_at) * 1000).toUTCString() + " (Select duration)");
        } else {
            setDisplayableNewExpiry(""); // Or some placeholder like "Calculating..."
        }
    }, [lock, duration]); // MAX_EXPIRY_SECONDS and FOUR_YEARS_IN_SECONDS are constants, no need in dep array


    const extend = async () => {
        try {
            if (!address) return toast.warn("Please connect your wallet");
            if (!lock || !lock.expires_at) return toast.warn("Lock details not loaded yet.");
            if (typeof duration !== 'number' || duration <= 0) return toast.warn("Please select a valid extension duration.");

            handleLoad("extendLock", true);

            const current_expiry_ts = Number(lock.expires_at);
            const proposed_new_expiry_ts = current_expiry_ts + (duration * 24 * 3600);

            const max_expiry_from_now_ts = Math.floor(Date.now() / 1000) + FOUR_YEARS_IN_SECONDS;
            const final_new_expiry_ts = Math.min(proposed_new_expiry_ts, max_expiry_from_now_ts);

            if (final_new_expiry_ts <= current_expiry_ts) {
                toast.warn("New expiry date must be after the current expiry date and within limits.");
                handleLoad("extendLock", false);
                return;
            }

            const votingEscrow = new ethers.Contract(
                aerodromeContracts[chainId].votingEscrow,
                votingEscrowAbi,
                await signer
            );

            const tx = await votingEscrow.increaseUnlockTime(
                tokenId,
                final_new_expiry_ts, // This is the new absolute target timestamp
                { gasLimit: 5000000 }
            );

            await tx.wait();
            await fetchLocksById()
            Notify({ chainId, txhash: tx.hash });
            handProgress("extendCompleted", true);
            handleLoad("extendLock", false);
        } catch (error) {
            console.log(error);
            handleLoad("extendLock", false);
        }
    };

    const formattedDate = lock?.expires_at === "0" ? "-" : formatTimestamp(Number(lock?.expires_at));

    return (
        <>
            <section className="py-8 relative">
                <div className="container">
                    <div className="grid gap-3 grid-cols-12">
                        <div className="md:col-span-6 col-span-12">
                            <div className="cardCstm p-3 md:p-10 rounded-2xl bg-[#000e0e] relative border border-[#2a2a2a]">
                                <div className="space-y-12">
                                    <div className="space-y-3">
                                        <div className="text-lg">
                                            Extending <strong>Lock #{tokenId} </strong>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-accent-50 text-xs">
                                                <div
                                                    className="inline-block cursor-pointer"
                                                    data-testid="flowbite-tooltip-target"
                                                >
                                                    <span
                                                        data-testid=""
                                                        data-test-amount="2.5156102566030962"
                                                        className="tabular-nums"
                                                    >
                                                        {lock && fromUnits(lock?.amount, Number(lock?.decimals))}<span className="opacity-70">&nbsp;GOB</span>
                                                    </span>
                                                </div>
                                                <div
                                                    data-testid="flowbite-tooltip"
                                                    tabIndex={-1}
                                                    className="absolute inline-block z-10 rounded-lg py-2 px-3 text-sm font-medium transition-opacity duration-300 invisible opacity-0 bg-black text-white shadow-xl"
                                                    id=":r6au:"
                                                    role="tooltip"
                                                    style={{ position: "absolute", top: 180, left: "201.523px" }}
                                                >
                                                    <div className="relative z-20">~$1.31498</div>
                                                    <div
                                                        className="absolute z-10 h-2 w-2 rotate-45 bg-black"
                                                        data-testid="flowbite-tooltip-arrow"
                                                        style={{ bottom: "-4px", left: 43 }}
                                                    >
                                                        &nbsp;
                                                    </div>
                                                </div>
                                                &nbsp;
                                                <div
                                                    className="inline-block cursor-pointer"
                                                    data-testid="flowbite-tooltip-target"
                                                >
                                                    {formattedDate}
                                                </div>
                                                <div
                                                    data-testid="flowbite-tooltip"
                                                    tabIndex={-1}
                                                    className="absolute inline-block z-10 rounded-lg py-2 px-3 text-sm font-medium transition-opacity duration-300 invisible opacity-0 bg-black text-white shadow-xl"
                                                    id=":r6b0:"
                                                    role="tooltip"
                                                    style={{ position: "absolute", top: 184, left: "159.289px" }}
                                                >
                                                    <div className="relative z-20">
                                                        <p className="text-xs w-52 sm:w-auto">
                                                            Thu Jan 25 2029 05:30:00 GMT+0530 (India Standard Time)
                                                        </p>
                                                    </div>
                                                    <div
                                                        className="absolute z-10 h-2 w-2 rotate-45 bg-black"
                                                        data-testid="flowbite-tooltip-arrow"
                                                        style={{ bottom: "-4px", left: "182.5px" }}
                                                    >
                                                        &nbsp;
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-accent-50 text-xs">
                                                <div
                                                    className="inline-block cursor-pointer"
                                                    data-testid="flowbite-tooltip-target"
                                                >
                                                    <span
                                                        data-testid=""
                                                        data-test-amount="2.4148573975035372"
                                                        className="tabular-nums"
                                                    >
                                                        {lock && fromUnits(lock?.voting_amount, Number(lock?.decimals))}<span className="opacity-70">&nbsp;veGOB</span>
                                                    </span>
                                                </div>
                                                <div
                                                    data-testid="flowbite-tooltip"
                                                    tabIndex={-1}
                                                    className="absolute inline-block z-10 rounded-lg py-2 px-3 text-sm font-medium transition-opacity duration-300 invisible opacity-0 bg-black text-white shadow-xl"
                                                    id=":r6b2:"
                                                    role="tooltip"
                                                    style={{ position: "absolute", top: 200, left: "206.867px" }}
                                                >
                                                    <div className="relative z-20">~$1.26232</div>
                                                    <div
                                                        className="absolute z-10 h-2 w-2 rotate-45 bg-black"
                                                        data-testid="flowbite-tooltip-arrow"
                                                        style={{ bottom: "-4px", left: 44 }}
                                                    >
                                                        &nbsp;
                                                    </div>
                                                </div>{" "}
                                                voting power granted
                                            </div>
                                        </div>
                                    </div>


                                    <div className="p-4 rounded-xl shadow-sm w-full flex items-start gap-4">
                                        <div className="mt-1">
                                            <LockKeyhole className="text-green-500 w-8 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-medium text-base">Auto Max-Lock Mode</h4>
                                                <Switch
                                                    checked={enabled}
                                                    onChange={() => {
                                                        console.log(enabled, "lllll");
                                                        setEnabled(!enabled);
                                                        console.log(enabled)
                                                        setDuration(enabled == false && 1460 || 1)
                                                    }}
                                                    className={`${enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                                >
                                                    <span
                                                        className={`${enabled ? 'translate-x-6' : 'translate-x-1'}
                inline-block h-4 w-4 transform rounded-full bg-white transition`}
                                                    />
                                                </Switch>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug">
                                                When activated, it sets the lock to maximum unlock time, until disabled. Once disabled,
                                                the regular vesting unlock time will apply. Maximum unlock time gives a 1-to-1 voting
                                                power to the amount of locked tokens.
                                            </p>
                                        </div>
                                    </div>


                                    <div className="py-2">
                                        <RangeSlider
                                            value={duration}
                                            onChange={setDuration}
                                            title="Extending to"
                                            currentLockExpiresAt={lock ? Number(lock.expires_at) : 0} // Pass current lock expiry, or 0 if lock is null
                                        />
                                    </div>
                                    <div className="py-2">
                                        <div className="flex p-4 rounded-xl itmes-center gap-2 bg-[#1c1d2a] text-[#a55e10]">
                                            <span className="icn">{inforicn}</span>
                                            <p className="m-0">
                                                You can extend the lock or increase the lock amount. These actions will increase your voting power. The maximum lock time is 4 years!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-6 col-span-12">
                            <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] opacity-70 relative h-full flex justify-between flex-col">
                                <div className="top w-full">
                                    <h4 className="m-0 font-semibold text-xl">Extend Lock</h4>
                                    <div className="content pt-3">
                                        <SwapList className="list-none py-3 relative z-10 pl-0 mb-0">
                                            {(
                                                <>
                                                    <li className="py-1 flex itmes-start gap-3 ">
                                                        <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                                                            1
                                                        </span>
                                                        <div className="content text-xs text-gray-400">
                                                            <p className="m-0">
                                                                New lock time  {displayableNewExpiry}
                                                            </p>
                                                        </div>
                                                    </li>


                                                    <Progress
                                                        icon={status?.extendCompleted ? unlock : lockIcon}
                                                        symbol={`#${tokenId} is completed.`}
                                                        text="Extend Lock for"
                                                    />
                                                </>

                                            )}
                                        </SwapList>
                                    </div>
                                </div>
                                <div className="bottom w-full">
                                    <div className="btnWrpper mt-3">
                                        <ActButton
                                            label="Extend"
                                            onClick={() => extend()}
                                            load={load["extendLock"] || duration === 0} // Disable if loading OR if duration is 0
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

const fadeInOut = keyframes`
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
`;

const SwapList = styled.ul`
  &:after {
    position: absolute;
    content: "";
    top: 50%;
    left: 12px;
    z-index: -1;
    height: calc(100% - 40px);
    width: 1px;
    border-left: 1px dashed #525252;
    transform: translateY(-50%);
  }
  li:not(:last-child) {
    margin-bottom: 15px;
  }
  .animate {
    animation: ${fadeInOut} 2s infinite;
  }
`;

export default Extend

const inforicn = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 16v-4"></path>
        <path d="M12 8h.01"></path>
    </svg>
);

const unlock = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
    </svg>
);

const lockIcon = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-lock !text-amber-600 animate-pulse"
    >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);