"use client";
import React, { useEffect, useState } from "react";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useAccount, useChainId } from "wagmi";
import ActButton from "@/components/common/ActButton";
import { toUnits } from "@/utils/math.utils";
import { approve, fetchTokenDetails } from "@/utils/web3.utils";
import { aerodromeContracts } from "@/utils/config.utils";
import aerodromeRouterAbi from "../../abi/aerodromeRouter.json";
import { ethers } from "ethers";
import styled, { keyframes } from "styled-components";
import { useSearchParams } from "next/navigation";
import { Token } from "../pools/page";

const Deposit = () => {
  const [load, setLoad] = useState<{ [key: string]: boolean }>({});
  const signer = useEthersSigner();
  const chainId = useChainId();
  const { address } = useAccount();

  const searchParams = useSearchParams();
  const [token0, setToken0] = useState<Token | null>(null);
  const [token1, setToken1] = useState<Token | null>(null);
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");

  useEffect(() => {
    const token0Address = searchParams.get("token0");
    const token1Address = searchParams.get("token1");
    if(chainId && token0Address && token1Address){
      fetchToken(chainId, token0Address, token1Address)
    }
  }, [searchParams, chainId]);
  
  const fetchToken = async(chainId: number, token0: string, token1:string) => {
    const token_ = await fetchTokenDetails(chainId, token0);       
    setToken0(token_)
    const _token = await fetchTokenDetails(chainId, token1);       
    setToken1(_token)
  }


  const handleLoad = (action: string, status: boolean) => {
    setLoad((prev) => ({ ...prev, [action]: status }));
  };

  const addLiquidity = async () => {
    try {
      if (!address) return alert("Please connect your wallet");
      if(!token0) return
      if(!token1) return
      handleLoad("addLiquidity", true);
      const stable = false;
      const amount0Desired = toUnits(amount0, token0?.decimals);
      const amount1Desired = toUnits(amount1, token1?.decimals);
      const amount0Min = 0;
      const amount1Min = 0;
      const to = address;
      const deadline = Math.floor(Date.now() / 1000) + 600;

      const tx0Approve = await approve(
        token0.address,
        await signer,
        aerodromeContracts[chainId].router,
        Number(amount0),
        18
      );
      if (tx0Approve) {
        await tx0Approve.wait();
      }

      const tx1Approve = await approve(
        token1.address,
        await signer,
        aerodromeContracts[chainId].router,
        Number(amount1),
        18
      );
      if (tx1Approve) {
        await tx1Approve.wait();
      }

      const aerodromeRouter = new ethers.Contract(
        aerodromeContracts[chainId].router,
        aerodromeRouterAbi,
        await signer
      );

      const tx = await aerodromeRouter.addLiquidity(
        token0.address,
        token1.address,
        stable,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min,
        to,
        deadline,
        { gasLimit: 5000000 }
      );

      await tx.wait();

      handleLoad("addLiquidity", false);
    } catch (error) {
      console.log(error);
      handleLoad("addLiquidity", false);
    }
  };

  return (
    <section className="relative py-5 ">
      <div className="container">
        <div className="grid gap-3 grid-cols-12">
          <div className="col-span-12">
            <div
              className="mx-auto grid gap-3 md:gap-5 grid-cols-12"
              style={{ maxWidth: 1000 }}
            >
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
                          <p className="m-0">Minimum received 2,503.03 AERO</p>
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
                      <button className="btn flex items-center font-medium justify-center w-full rounded btn commonBtn">
                        Swap ETH for AERO
                      </button>
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
                          <span className="font-medium text-base">Swap</span>
                          <span className="opacity-60 font-light text-xs">
                            Available 0.0 ETH
                          </span>
                        </div>
                        <div className="flex border border-gray-800 rounded mt-1">
                          <div className="left relative flex items-center gap-2 p-3 border-r border-gray-800 w-[180px]">
                            <span className="icn">{eth}</span>
                            <span className="">ETH</span>
                            <span className="absolute right-2">
                              {downArrow}
                            </span>
                          </div>
                          <input
                            onChange={(e) => setAmount0(e.target.value)}
                            value={amount0}
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
                            Available 0.0 AERO
                          </span>
                        </div>
                        <div className="flex border border-gray-800 rounded mt-1">
                          <div className="left relative flex items-center gap-2 p-3 border-r border-gray-800 w-[180px]">
                            <span className="icn">{eth}</span>
                            <span className="">AERO</span>
                            <span className="absolute right-2">
                              {downArrow}
                            </span>
                          </div>
                          <input
                            onChange={(e) => setAmount1(e.target.value)}
                            value={amount1}
                            type="number"
                            className="form-control border-0 p-3 h-10 text-xs bg-transparent w-full"
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="py-2">
                  <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] relative">
                    <div className="py-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="left flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <ul className="list-none pl-0 mb-0 flex items-center">
                              <li className="" style={{ marginLeft: -10 }}>
                                {icn1}
                              </li>
                              <li className="" style={{ marginLeft: -10 }}>
                                {icn1}
                              </li>
                            </ul>
                          </div>
                          <div className="content">
                            <p className="m-0 font-medium text-white">
                              vAMM-USDC/cbBTC
                            </p>
                            <ul className="list-none pl-0 mb-0 flex items-center gap-2">
                              <li className="text-yellow-500 text-xs">
                                (x) Basic Volatile
                              </li>
                              <li className="text-xs flex items-center gap-2">
                                0.3% {infoIcn}
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="right text-right">
                          <p className="m-0 text-gray-500 text-xs">APR</p>
                          <p className="m-0 text-white text-base font-bold">
                            10.49%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <ul className="list-none pl-0 mb-0">
                        <li className="py-1 flex items-center justify-between gap-2">
                          <p className="m-0 text-gray-500 text-xs">Liquidity</p>
                          <p className="m-0 text-gray-500 text-xs">
                            Your Liquidity
                          </p>
                        </li>
                        <li className="py-1 flex items-center justify-between gap-2">
                          <p className="m-0 text-white text-base font-bold">
                            2,071,534.54 USDC
                          </p>
                          <p className="m-0 text-white text-base font-bold">
                            0.0 USDC
                          </p>
                        </li>
                        <li className="py-1 flex items-center justify-between gap-2">
                          <p className="m-0 text-white text-base font-bold">
                            23.68 cbBTC
                          </p>
                          <p className="m-0 text-white text-base font-bold">
                            0.0 cbBTC
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ActButton
              label="addLiquidity"
              onClick={() => addLiquidity()}
              load={load["addLiquidity"]}
            />
          </div>
        </div>
      </div>
    </section>
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

const eth = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 32 32"
  >
    <g fill="none" fillRule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <g fill="#FFF" fillRule="nonzero">
        <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
        <path d="M16.498 4L9 16.22l7.498-3.35z" />
        <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
        <path d="M16.498 27.995v-6.028L9 17.616z" />
        <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z" />
        <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
      </g>
    </g>
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

const infoIcn = (
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
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4"></path>
    <path d="M12 8h.01"></path>
  </svg>
);

const icn1 = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 32 32"
  >
    <g fill="none" transform="translate(0 .48)">
      <circle cx="14.418" cy="14.418" r="14.418" fill="#000" />
      <path
        fill="#FF0079"
        d="M14.4183909,27.8068966 C21.8126584,27.8068966 27.8068966,21.8126583 27.8068966,14.4183908 C27.8068966,7.02412326 21.8126584,1.02988506 14.4183909,1.02988506 C7.02412329,1.02988506 1.02988509,7.02412326 1.02988509,14.4183908 C1.02988509,21.8126583 7.02412329,27.8068966 14.4183909,27.8068966 Z"
      />
      <circle cx="17.508" cy="16.478" r="13.389" fill="#FFF" />
      <path
        fill="#000"
        d="M17.508046,30.8965517 C9.54498862,30.8965517 3.08965517,24.4412183 3.08965517,16.4781609 C3.08965517,8.51510356 9.54498862,2.05977012 17.508046,2.05977012 C25.4711033,2.05977012 31.9264367,8.51510356 31.9264367,16.4781609 C31.9264367,24.4412183 25.4711033,30.8965517 17.508046,30.8965517 Z M17.508046,29.8666667 C24.9023135,29.8666667 30.8965517,23.8724285 30.8965517,16.4781609 C30.8965517,9.08389337 24.9023135,3.08965517 17.508046,3.08965517 C10.1137784,3.08965517 4.11954023,9.08389337 4.11954023,16.4781609 C4.11954023,23.8724285 10.1137784,29.8666667 17.508046,29.8666667 Z"
      />
      <path
        fill="#000"
        d="M12.3465428,20.0053161 L10.8765867,20.0053161 L10.0520788,16.529454 C10.0215413,16.4057465 9.96948954,16.1500378 9.89592196,15.7623204 C9.82235439,15.3746029 9.78001896,15.1143684 9.76891442,14.9816092 C9.75225762,15.144541 9.71061622,15.4062841 9.64398897,15.7668462 C9.57736174,16.1274084 9.52600401,16.3846257 9.48991426,16.5385057 L8.66957048,20.0053161 L7.20377854,20.0053161 L5.6505388,13.3885057 L6.92061418,13.3885057 L7.69931615,17.0001437 C7.83534676,17.6669574 7.93389808,18.2447533 7.99497305,18.7335488 C8.01162986,18.5615652 8.04980114,18.2952963 8.10948805,17.9347342 C8.16917495,17.574172 8.22539084,17.2943257 8.2781374,17.0951868 L9.16510809,13.3885057 L10.3852133,13.3885057 L11.272184,17.0951868 C11.3110499,17.2611359 11.3596315,17.5145816 11.4179303,17.8555316 C11.4762292,18.1964815 11.5206467,18.4891511 11.5511841,18.7335488 C11.5789456,18.4982028 11.623363,18.204779 11.684438,17.8532686 C11.745513,17.5017583 11.8010348,17.2173862 11.8510053,17.0001437 L12.625543,13.3885057 L13.8956184,13.3885057 L12.3465428,20.0053161 Z M18.1680688,20.0053161 L14.6618279,20.0053161 L14.6618279,13.3885057 L18.1680688,13.3885057 L18.1680688,14.5380747 L15.9527241,14.5380747 L15.9527241,15.9908765 L18.0139941,15.9908765 L18.0139941,17.1404454 L15.9527241,17.1404454 L15.9527241,18.8466954 L18.1680688,18.8466954 L18.1680688,20.0053161 Z M21.7867426,20.0053161 L20.4958463,20.0053161 L20.4958463,14.5561782 L18.8426662,14.5561782 L18.8426662,13.3885057 L23.4399227,13.3885057 L23.4399227,14.5561782 L21.7867426,14.5561782 L21.7867426,20.0053161 Z M29.3655531,20.0053161 L28.0788211,20.0053161 L28.0788211,17.1494972 L25.6677599,17.1494972 L25.6677599,20.0053161 L24.3768636,20.0053161 L24.3768636,13.3885057 L25.6677599,13.3885057 L25.6677599,15.9818247 L28.0788211,15.9818247 L28.0788211,13.3885057 L29.3655531,13.3885057 L29.3655531,20.0053161 Z"
      />
    </g>
  </svg>
);
