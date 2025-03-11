"use client";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { approve, encodeInput } from "@/utils/web3.utils";
import { ethers } from "ethers";
// import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useAccount, useChainId } from "wagmi";
import { tokens } from "@myswap/token-list";
import universalRouterAbi from "../../abi/aerodrome/universalRouter.json";
import { aerodromeContracts } from "@/utils/config.utils";
import { useEffect, useState } from "react";
import { Token } from "../pools/page";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import SelectTokenPopup from "@/components/modals/SelectTokenPopup";
import Logo from "@/components/common/Logo";

const Swap = () => {
  // const [load, setLoad] = useState<{ [key: string]: boolean }>({});
  // const [status, setStatus] = useState<{ [key: string]: boolean }>({ "selectToken": false });

  const signer = useEthersSigner();
  const chainId = useChainId();
  const { address } = useAccount();

  const searchParams = useSearchParams();
  const [tokenBeingSelected, setTokenBeingSelected] = useState<"token0" | "token1" | null>(null);
  const [token0, setToken0] = useState<Token | null>(null);
  const [token1, setToken1] = useState<Token | null>(null);
  const [filteredTokenList, setFilteredTokenList] = useState([]);

  const handleTokenSelect = (token: Token) => {
    const newQueryParams = new URLSearchParams(searchParams.toString());
    if (tokenBeingSelected === "token0") {
      setToken0(token);
      newQueryParams.set("token0", token.address);
    } else if (tokenBeingSelected === "token1") {
      setToken1(token);
      newQueryParams.set("token1", token.address);
    }
    setTokenBeingSelected(null);
  };

  const setInitialToken = () => {
    const tokens_ = tokens.filter((item) => item.chainId == chainId)
    //@ts-expect-error ignore warning
    setFilteredTokenList(tokens_)
    if(tokens_?.length == 0){
      setToken0(null)
      setToken1(null)
      return
    }
    setToken0({
      address: tokens_[0].address,
      symbol: tokens_[0].symbol,
      decimals: tokens_[0].decimals
    })
    setToken1({
      address: tokens_[1].address,
      symbol: tokens_[1].symbol,
      decimals: tokens_[1].decimals
    })
  }



  // const handleLoad = (action: string, status: boolean) => {
  //   setLoad((prev) => ({ ...prev, [action]: status }));
  // };
  // const handProgress = (action: string, status: boolean) => {
  //   setStatus((prev) => ({ ...prev, [action]: status }));
  // };

  useEffect(() => {
    if (chainId) {
      setInitialToken()
    }
  }, [chainId])

  const swap = async () => {
    try {
      if (!address) return
      console.log("execute")
      const commands = "0x00" //ethers.hexlify([]);

      const swapRoutes = [
        { from: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", fee: 1, to: "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2" }
      ];

      // const swapRoutes = [
      //   { from: "0xf1220b3Bb3839e6f4e5dF59321fbaD2981c1CE89", fee: 1, to: "0x8B56D59cd9b1Ce5dd1Fb2A4e3cA7FBE3043Be42F" }
      // ];

      const inputs = encodeInput(swapRoutes, address, 1, 0, 6)

      const tx0Approve = await approve(
        swapRoutes[0].from,
        await signer,
        aerodromeContracts[chainId].universalRouter,
        1,
        6
      );
      if (tx0Approve) {
        await tx0Approve.wait();
      }

      const universalRouter = new ethers.Contract(
        aerodromeContracts[chainId].universalRouter,
        universalRouterAbi,
        await signer
      );

      const tx = await universalRouter["execute(bytes,bytes[])"](commands, inputs, {
        value: 0,
        gasLimit: 500000
      });
      await tx.wait();

    } catch (error) {
      console.log(error, "error+")
    }
  }


  return (
    <>
      {tokenBeingSelected &&
        createPortal(
          <SelectTokenPopup
            tokenBeingSelected={tokenBeingSelected}
            onSelectToken={handleTokenSelect}
            onClose={() => setTokenBeingSelected(null)}
            chainId={chainId}
            tokens={filteredTokenList}
          />,
          document.body
        )}
      <section className="py-5 relative">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div
                className="mx-auto grid gap-3 md:gap-5 grid-cols-12"
                style={{ maxWidth: 1000 }}
              >
                <div className="md:col-span-7 col-span-12">
                  <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] relative">
                    <form action="">
                      <div className="py-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-base">Swap</span>
                          <span className="opacity-60 font-light text-xs">
                            Available 0.0 {token0?.symbol}
                          </span>
                        </div>
                        <div className="flex border border-gray-800 rounded mt-1">
                          <div
                            className="cursor-pointer left relative flex items-center gap-2 p-3 border-r border-gray-800 w-[180px]"
                            onClick={() => setTokenBeingSelected("token0")}
                          >
                            <span className="icn"><Logo chainId={chainId} token={token0?.address} margin={0} height={20} /></span>
                            <span className="">{token0?.symbol}</span>
                            <span className="absolute right-2">
                              {downArrow}
                            </span>
                          </div>
                          <input
                            type="number"
                            className="form-control border-0 p-3 h-10 text-xs bg-transparent w-full"
                          />
                        </div>
                      </div>
                      <div className="py-2">
                        <div className="mt-3 text-center">
                          <button className="border-0 p-2 rounded bg-[var(--backgroundColor)]">
                            {transfer}
                          </button>
                        </div>
                      </div>
                      <div className="py-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-base">For</span>
                          <span className="opacity-60 font-light text-xs">
                            Available 0.0 {token1?.symbol}
                          </span>
                        </div>
                        <div className="flex border border-gray-800 rounded mt-1">
                          <div
                            className="cursor-pointer left relative flex items-center gap-2 p-3 border-r border-gray-800 w-[180px]"
                            onClick={() => setTokenBeingSelected("token1")}
                          >
                            <span className="icn"><Logo chainId={chainId} token={token1?.address} margin={0} height={20} /></span>
                            <span className="">{token1?.symbol}</span>
                            <span className="absolute right-2">
                              {downArrow}
                            </span>
                          </div>
                          <input
                            type="number"
                            className="form-control border-0 p-3 h-10 text-xs bg-transparent w-full"
                          />
                        </div>
                      </div>
                      <div className="py-2">
                        {/* <div className="flex items-start justify-between h-28 sm:h-24 my-4">
                          <div className="grow flex items-center justify-between">
                            <img
                              className="w-7 h-7 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 hover:opacity-80"
                              src="https://raw.githubusercontent.com/SmolDapp/tokenAssets/main/tokens//8453/0x940181a94a35a4569e4529a3cdfb74e38fd98631/logo.svg"
                              loading="lazy"
                              alt="Token Image"
                            />
                            <div className="relative grow flex justify-center items-center text-gray-600 dark:text-gray-400">
                              <div className="relative z-20 rounded-full bg-[var(--backgroundColor)] p-px sm:p-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={10}
                                  height={10}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-chevrons-right"
                                >
                                  <path d="m6 17 5-5-5-5" />
                                  <path d="m13 17 5-5-5-5" />
                                </svg>
                              </div>
                              <div className="absolute z-10 top-1.5 sm:top-2 border-t border-dashed border-gray-700 dark:border-gray-900 w-10/12" />
                              <div className="absolute z-10 top-6 border-r-2 border-gray-700 h-3" />
                              <div className="absolute top-10">
                                <div className="w-20 sm:w-28 text-[10px] md:text-xs bg-[var(--backgroundColor)] dark:bg-gray-850 px-3 py-2.5 rounded-md">
                                  <div className=" delay-75 text-center">
                                    {" "}
                                    0.05%<div>Stable</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grow flex items-center justify-between">
                            <img
                              className="w-7 h-7 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 hover:opacity-80"
                              src="https://raw.githubusercontent.com/SmolDapp/tokenAssets/main/tokens//8453/0x532f27101965dd16442e59d40670faf5ebb142e4/logo.svg"
                              loading="lazy"
                              alt="Token Image"
                            />
                            <div className="relative grow flex justify-center items-center text-gray-600 dark:text-gray-400">
                              <div className="relative z-20 rounded-full bg-[var(--backgroundColor)] p-px sm:p-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={10}
                                  height={10}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-chevrons-right"
                                >
                                  <path d="m6 17 5-5-5-5" />
                                  <path d="m13 17 5-5-5-5" />
                                </svg>
                              </div>
                              <div className="absolute z-10 top-1.5 sm:top-2 border-t border-dashed border-gray-700  w-10/12" />
                              <div className="absolute z-10 top-6 border-r-2 border-gray-700 h-3" />
                              <div className="absolute top-10">
                                <div className="w-20 sm:w-28 text-[10px] md:text-xs bg-[var(--backgroundColor)] dark:bg-gray-850 px-3 py-2.5 rounded-md">
                                  <div className=" delay-75 text-center">
                                    {" "}
                                    0.3%<div>Volatile</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="grow flex items-center justify-between">
                            <img
                              className="w-7 h-7 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 hover:opacity-80"
                              src="https://raw.githubusercontent.com/SmolDapp/tokenAssets/main/tokens//8453/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913/logo.svg"
                              loading="lazy"
                              alt="Token Image"
                            />
                            <div className="relative grow flex justify-center items-center text-gray-600 dark:text-gray-400">
                              <div className="relative z-20 rounded-full bg-[var(--backgroundColor)] p-px sm:p-1">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width={10}
                                  height={10}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-chevrons-right"
                                >
                                  <path d="m6 17 5-5-5-5" />
                                  <path d="m13 17 5-5-5-5" />
                                </svg>
                              </div>
                              <div className="absolute z-10 top-1.5 sm:top-2 border-t border-dashed border-gray-700 w-10/12" />
                              <div className="absolute z-10 top-6 border-r-2 border-gray-700 h-3" />
                              <div className="absolute top-10">
                                <div className="w-20 sm:w-28 text-[10px] md:text-xs bg-[var(--backgroundColor)] dark:bg-gray-850 px-3 py-2.5 rounded-md">
                                  <div className=" delay-75 text-center">
                                    {" "}
                                    0.05%<div>Stable</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <img
                            className="w-7 h-7 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 hover:opacity-80"
                            src="https://raw.githubusercontent.com/SmolDapp/tokenAssets/main/tokens//8453/0x0000206329b97db379d5e1bf586bbdb969c63274/logo.svg"
                            loading="lazy"
                            alt="Token Image"
                          />
                        </div> */}
                      </div>
                    </form>
                  </div>
                </div>
                <div className="md:col-span-5 col-span-12">
                  <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] opacity-70 relative">
                    <div className="top">
                      <h4 className="m-0 font-semibold text-xl">Swap</h4>
                    </div>
                    <div className="content pt-3">
                      <SwapList className="list-none py-3 relative z-10 pl-0 mb-0">
                        <li className="py-1 flex itmes-start gap-3 ">
                          <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                            {calculate}
                          </span>
                          <div className="content text-xs text-gray-400">
                            <p className="m-0">
                              Exchange rate found...{" "}
                              <button className="border-0 p-0">Refresh</button>
                            </p>
                            <p className="m-0 flex items-center mt-1 gap-1 font-medium">
                              1 ETH {exchange} 2,528.32 AERO
                            </p>
                          </div>
                        </li>
                        <li className="py-1 flex itmes-start gap-3 ">
                          <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                            {plus}
                          </span>
                          <div className="content text-xs text-gray-400">
                            <p className="m-0">
                              1.0% slippage applied...
                              <button className="border-0 p-0">Adjust</button>
                            </p>
                          </div>
                        </li>
                        <li className="py-1 flex itmes-start gap-3 ">
                          <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                            {icn}
                          </span>
                          <div className="content text-xs text-gray-400">
                            <p className="m-0">
                              Minimum received 2,503.03 AERO
                            </p>
                          </div>
                        </li>
                        <li className="py-1 flex itmes-start gap-3 ">
                          <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                            {check}
                          </span>
                          <div className="content text-xs text-gray-400">
                            <p className="m-0">0.61814% price impact is safe</p>
                          </div>
                        </li>
                        <li className="py-1 flex itmes-start gap-3 ">
                          <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-green-500 items-center justify-center rounded-full">
                            {lock}
                          </span>
                          <div className="content text-xs text-gray-400">
                            <p className="m-0">
                              Allowed the contracts to access ETH
                            </p>
                          </div>
                        </li>
                        <li className="py-1 flex itmes-start gap-3 ">
                          <span className="flex bg-[var(--backgroundColor)] h-6 w-6 text-yellow-500 items-center justify-center rounded-full">
                            {waiting}
                          </span>
                          <div className="content text-xs text-gray-400">
                            <p className="m-0 animate">
                              Waiting for pending actions...
                            </p>
                          </div>
                        </li>
                      </SwapList>
                      <div className="btnWrpper mt-3">
                        <button
                          onClick={swap}
                          className="btn flex items-center font-medium justify-center w-full rounded btn commonBtn"
                        >
                          Swap ETH for AERO
                        </button>
                      </div>
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

export default Swap;


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


const calculate = (
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
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
    <line x1="3" x2="21" y1="9" y2="9"></line>
    <line x1="3" x2="21" y1="15" y2="15"></line>
    <line x1="9" x2="9" y1="9" y2="21"></line>
    <line x1="15" x2="15" y1="9" y2="21"></line>
  </svg>
);

const exchange = (
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
    <path d="m16 3 4 4-4 4"></path>
    <path d="M20 7H4"></path>
    <path d="m8 21-4-4 4-4"></path>
    <path d="M4 17h16"></path>
  </svg>
);

const plus = (
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
    <path d="M12 3v14"></path>
    <path d="M5 10h14"></path>
    <path d="M5 21h14"></path>
  </svg>
);

const icn = (
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
    <circle cx="8" cy="8" r="6"></circle>
    <path d="M18.09 10.37A6 6 0 1 1 10.34 18"></path>
    <path d="M7 6h1v4"></path>
    <path d="m16.71 13.88.7.71-2.82 2.82"></path>
  </svg>
);

const check = (
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
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

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
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
  </svg>
);

const waiting = (
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
    <path d="M5 22h14"></path>
    <path d="M5 2h14"></path>
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path>
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>
  </svg>
);

const downArrow = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6"></path>
  </svg>
);

const transfer = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21 16-4 4-4-4"></path>
    <path d="M17 20V4"></path>
    <path d="m3 8 4-4 4 4"></path>
    <path d="M7 4v16"></path>
  </svg>
);
