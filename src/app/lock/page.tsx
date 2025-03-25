"use client";
import React, { useEffect, useState } from "react";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useAccount, useChainId } from "wagmi";
import ActButton from "@/components/common/ActButton";
import { toUnits } from "@/utils/math.utils";
import { allowance, approve } from "@/utils/web3.utils";
import { aerodromeContracts } from "@/utils/config.utils";
import votingEscrowAbi from "../../abi/aerodrome/votingEscrow.json";
import { ethers } from "ethers";
import styled, { keyframes } from "styled-components";
import Logo from "@/components/common/Logo";
import RangeSlider from "./RangeSlider";
// import { FormattedPool } from "@/utils/sugar.utils";
import { gobV2 } from "@/utils/constant.utils";
import Progress from "@/components/common/Progress";

const Deposit = () => {
  const [load, setLoad] = useState<{ [key: string]: boolean }>({});
  const signer = useEthersSigner();
  const chainId = useChainId();
  const { address } = useAccount();

  // const searchParams = useSearchParams();
  // const id = searchParams.get("id");

  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");

  // const [pool, setPool] = useState<FormattedPool | null>(null);

  const [status, setStatus] = useState<{ [key: string]: boolean }>({
    isAllowanceForToken: false,
    createLock: false,
    tokenLocked: false,
  });

  // useEffect(() => {
  //   if (chainId && id) {
  //     fetchPoolByIndex(chainId, Number(id))
  //   }
  // }, [searchParams, chainId, id]);

  useEffect(() => {
    if (chainId && amount) {
      checkAllownceStatus(chainId);
    }
  }, [chainId, amount]);

  const handProgress = (action: string, status: boolean) => {
    setStatus((prev) => ({ ...prev, [action]: status }));
  };

  const handleLoad = (action: string, status: boolean) => {
    setLoad((prev) => ({ ...prev, [action]: status }));
  };

  // const fetchPoolByIndex = async (chainId: number, index: number) => {
  //   const pool_ = await byIndex(chainId, index)
  //   //@ts-expect-error ignore warn
  //   setPool(pool_)
  // }

  const checkAllownceStatus = async (chainId: number) => {
    //@ts-expect-error ignore warn
    const status0_ = await allowance(
      chainId,
      gobV2[chainId]?.address,
      address,
      aerodromeContracts[chainId].votingEscrow,
      amount,
      gobV2[chainId]?.decimals
    );
    handProgress("isAllowanceForToken", status0_);
  };

  const createLock = async () => {
    try {
      if (!address) return alert("Please connect your wallet");
      if (!amount) return;

      handleLoad("createLock", true);

      const txApprove = await approve(
        gobV2[chainId]?.address,
        await signer,
        aerodromeContracts[chainId].votingEscrow,
        Number(amount),
        gobV2[chainId]?.decimals
      );
      if (txApprove) {
        await txApprove.wait();
      }
      handProgress("isAllowanceForToken", true);

      const votingEscrow = new ethers.Contract(
        aerodromeContracts[chainId].votingEscrow,
        votingEscrowAbi,
        await signer
      );

      const tx = await votingEscrow.createLock(
        toUnits(amount, gobV2[chainId]?.decimals),
        parseInt(duration) * 24 * 3600,
        { gasLimit: 5000000 }
      );

      await tx.wait();
      handProgress("tokenLocked", true);
      // await fetchPoolByIndex(chainId, Number(id))
      handleLoad("createLock", false);
    } catch (error) {
      console.log(error);
      handleLoad("createLock", false);
    }
  };

  // console.log(pool, "pool)))", typeof (duration))
  return (
    <>
      <section className="relative py-5 ">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div
                className="mx-auto grid gap-3 md:gap-5 grid-cols-12"
                style={{ maxWidth: 1000 }}
              >
                <div className="md:col-span-5 col-span-12">
                  <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] opacity-70 relative h-full flex justify-between flex-col">
                    <div className="top w-full">
                      <h4 className="m-0 font-semibold text-xl">New Lock</h4>
                      <div className="content pt-3">
                        <SwapList className="list-none py-3 relative z-10 pl-0 mb-0">
                          {amount ? (
                            <>
                              <Progress
                                icon={
                                  status.isAllowanceForToken ? unlock : lock
                                }
                                symbol={gobV2[chainId || 8453]?.symbol}
                                text="Allow the contracts to access"
                              />
                              <Progress
                                icon={status.tokenLocked ? unlock : lock}
                                symbol={gobV2[chainId || 8453]?.symbol}
                                text="Lock Created for"
                              />
                            </>
                          ) : (
                            <>
                              <li className="py-1 flex itmes-start gap-3 ">
                                <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                                  1
                                </span>
                                <div className="content text-xs text-gray-400">
                                  <p className="m-0">
                                    Select the amount of AERO you want to lock.
                                  </p>
                                </div>
                              </li>
                              <li className="py-1 flex itmes-start gap-3 ">
                                <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                                  2
                                </span>
                                <div className="content text-xs text-gray-400">
                                  <p className="m-0">
                                    Select the number of days.
                                  </p>
                                </div>
                              </li>
                              <li className="py-1 flex itmes-start gap-3 ">
                                <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                                  3
                                </span>
                                <div className="content text-xs text-gray-400">
                                  <p className="m-0">Confirm the locking!</p>
                                </div>
                              </li>
                              <li className="py-1 flex itmes-start gap-3 ">
                                <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                                  4
                                </span>
                                <div className="content text-xs text-gray-400">
                                  <p className="m-0">
                                    Your lock will be available in the
                                    dashboard.
                                  </p>
                                </div>
                              </li>
                            </>
                          )}
                        </SwapList>
                      </div>
                    </div>
                    <div className="bottom w-full">
                      <div className="btnWrpper mt-3">
                        <ActButton
                          label="Create Lock"
                          onClick={() => createLock()}
                          load={load["createLock"]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-7 col-span-12">
                  <div className="py-2">
                    <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] relative">
                      <form action="">
                        <div className="py-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-base">
                              Amount to lock
                            </span>
                            <span className="opacity-60 font-light text-xs">
                              Available 0.0 {gobV2[chainId || 8453]?.symbol}
                            </span>
                          </div>
                          <div className="py-2">
                            <div className="flex border border-gray-800 rounded mt-1">
                              <div className="left relative flex items-center gap-2 p-3 border-r border-gray-800 w-[180px]">
                                <span className="icn">
                                  {gobV2[chainId || 8453]?.address ? (
                                    <Logo
                                      chainId={chainId}
                                      token={gobV2[chainId || 8453]?.address}
                                      margin={0}
                                      height={20}
                                    />
                                  ) : (
                                    ""
                                  )}
                                </span>
                                <span className="">
                                  {gobV2[chainId || 8453]?.symbol}
                                </span>
                              </div>
                              <input
                                onChange={(e) => setAmount(e.target.value)}
                                value={amount}
                                type="number"
                                className="form-control text-right border-0 p-3 h-10 text-xs bg-transparent w-full"
                              />
                            </div>
                          </div>
                          <div className="py-2">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium text-base">
                                Lock duration
                              </span>
                              <span className="opacity-60 font-light text-xs">
                                Lock duration in days
                              </span>
                            </div>
                          </div>
                          <div className="py-2">
                            <RangeSlider />
                          </div>
                          <div className="flex border border-gray-800 rounded mt-1">
                            <input
                              onChange={(e) => setDuration(e.target.value)}
                              value={duration}
                              type="number"
                              className="form-control border-0 p-3 h-10 text-xs bg-transparent w-full"
                            />
                          </div>
                          <div className="py-2">
                            <div className="flex p-4 rounded-xl itmes-center gap-2 bg-[#1c1d2a] text-[#a55e10]">
                              <span className="icn">{inforicn}</span>
                              <p className="m-0">
                                Locking will give you an NFT , referred to as a
                                veNFT. You can increase the Lock amount or
                                extend the Lock time at any point after.
                              </p>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Deposit;

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

const lock = (
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

// const downArrow = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="14"
//     height="14"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="m6 9 6 6 6-6"></path>
//   </svg>
// );

// const transfer = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="15"
//     height="15"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="m21 16-4 4-4-4"></path>
//     <path d="M17 20V4"></path>
//     <path d="m3 8 4-4 4 4"></path>
//     <path d="M7 4v16"></path>
//   </svg>
// );

// const infoIcn = (
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     width="12"
//     height="12"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <circle cx="12" cy="12" r="10"></circle>
//     <path d="M12 16v-4"></path>
//     <path d="M12 8h.01"></path>
//   </svg>
// );

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
