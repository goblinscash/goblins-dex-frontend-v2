"use client";
import React, { useEffect, useState } from "react";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useAccount, useChainId } from "wagmi";
import ActButton from "@/components/common/ActButton";
import { fromUnits, toUnits } from "@/utils/math.utils";
import {
  allowance,
  approve,
  erc20Balance,
  fetchTokenDetails,
  fetchV3PoolsDetail,
  quoteV2AddLiquidity,
} from "@/utils/web3.utils";
import { aerodromeContracts, zeroAddr } from "@/utils/config.utils";
import aerodromeRouterAbi from "../../abi/aerodromeRouter.json";
import { ethers } from "ethers";
import styled, { keyframes } from "styled-components";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/common/Logo";
import { byIndex, FormattedPool, PoolTypeMap } from "@/utils/sugar.utils";
import Progress from "@/components/common/Progress";
import { Token } from "@/components/modals/SelectTokenPopup";
import nfpmAbi from "@/abi/aerodrome/nfpm.json"
import clFactoryAbi from "@/abi/aerodrome/clFactory.json"
import { encodeSqrtRatioX96 } from "@uniswap/v3-sdk"
import { getMaxTick, getMinTick } from "@/utils/constant.utils";
import { toast } from "react-toastify";



type PoolConfig = {
  pool?: string;         // Address of the pool (Ethereum-style)
  fee?: number;          // Fee in basis points (e.g., 100 = 0.01%)
  tickSpacing?: number;  // Distance between allowable ticks
  tickLower?: number;    // Lower tick bound
  tickUpper?: number;    // Upper tick bound
};



const Deposit = () => {
  const [load, setLoad] = useState<{ [key: string]: boolean }>({});
  const signer = useEthersSigner();
  const chainId = useChainId();
  const { address } = useAccount();

  const searchParams = useSearchParams();
  const token0Address = searchParams.get("token0");
  const token1Address = searchParams.get("token1");
  const id = searchParams.get("id");
  const type = Number(searchParams.get("type"));
  const fee = Number(searchParams.get("fee"));

  const stable = type == 0 ? true : false

  const [token0, setToken0] = useState<Token | null>(null);
  const [token1, setToken1] = useState<Token | null>(null);
  const [token, setToken] = useState<Token | null>(null);
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [slippageTolerance, setSlippageTolerance] = useState('0.5');
  const [lowValue, setLowValue] = useState<number>(0);
  const [highValue, setHighValue] = useState<number>(0);
  const [pool, setPool] = useState<FormattedPool | null>(null);
  const [ratio, setRatio] = useState<number | null>(null)

  const [status, setStatus] = useState<{ [key: string]: boolean }>({
    isTokenSelected: false,
    isAllowanceForToken0: false,
    isAllowanceForToken1: false,
    isCompleted: false,
    createGauge: false,
    isRewardAdded: false,
    isAllowanceForToken: false,
  });



  const [selectedFee, setSelectedFee] = useState<number | null>(0);
  const [v3PositionDetails, setV3PositionDetails] = useState<(PoolConfig | null)[]>([]);
  const [selectedV3PositionDetails, setSelectedV3PositionDetails] = useState<(PoolConfig | null)>({});


  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "amount0") {
      setAmount0(value)
      // if (ratio != null && value !== "" && !isNaN(+value)) {
      //   setAmount1((+value).toString())
      // } else {
      //   setAmount1("")
      // }
    } else if (name === "amount1") {
      setAmount1(value)
      // if (ratio != null && value !== "" && !isNaN(+value)) {
      //   setAmount0((+value).toString())
      // } else {
      //   setAmount0("")
      // }
    }
  }

  useEffect(() => {
    if (chainId && token0Address && token1Address) {
      fetchToken(chainId, token0Address, token1Address);
    }
  }, [searchParams, chainId]);

  useEffect(() => {
    if (chainId && id) {
      fetchPoolByIndex(chainId, Number(id));

    }
  }, [searchParams, chainId, id]);

  useEffect(() => {
    if (chainId && amount0 && amount1 && token0 && token1) {
      checkAllownceStatus(chainId);
    }
    if (token0?.address && token1?.address) {
      fetchPoolFeeTierDetails(token0, token1)
    }
  }, [chainId, amount0, amount1, token0]);

  useEffect(() => {
    if (
      chainId &&
      token0?.address &&
      token1?.address &&
      address &&
      token0.balance == 0 &&
      token1.balance == 0
    ) {
      fetchTokenBalance();
    }
  }, [chainId, token0?.address, token1?.address, address]);

  useEffect(() => {
    if (chainId && token?.address && address) {
      fetchRewardTokenBalance();
    }

  }, [chainId, token?.address, address]);

  useEffect(() => {

  }, [])

  useEffect(() => {
    if (chainId && token0?.address) {
      fetchTokenRatio()
    }
  }, [token0, token1])

  const fetchToken = async (
    chainId: number,
    token0: string,
    token1: string
  ) => {
    const token_ = await fetchTokenDetails(chainId, token0);
    setToken0(token_ as Token);
    const _token = await fetchTokenDetails(chainId, token1);
    setToken1(_token as Token);
  };

  const fetchPoolFeeTierDetails = async (token0: Token, token1: Token) => {
    try {
      let feeTier: (PoolConfig | null)[] = await fetchV3PoolsDetail(chainId, token0.address, token1.address)
      setV3PositionDetails(feeTier);
      if (fee) {
       feeTier = feeTier.filter((item) => item?.fee == fee)
       setSelectedFee(Number(feeTier[0]?.fee));
        setLowValue(Number(feeTier[0]?.tickLower))
        setHighValue(Number(feeTier[0]?.tickUpper))
        setSelectedV3PositionDetails(feeTier[0])
      } 
    } catch (error) {
      console.log(error)
    }
  }

  const handProgress = (action: string, status: boolean) => {
    setStatus((prev) => ({ ...prev, [action]: status }));
  };

  const handleLoad = (action: string, status: boolean) => {
    setLoad((prev) => ({ ...prev, [action]: status }));
  };

  const fetchPoolByIndex = async (chainId: number, index: number) => {
    const pool_ = await byIndex(chainId, index);
    //@ts-expect-error ignore warn
    setPool(pool_);
  };


  const fetchTokenRatio = async () => {
    try {
      if (!token0?.address || !token1?.address) return;
      const data = await quoteV2AddLiquidity(
        chainId,
        token0.address,
        token1.address,
        stable,
        // @ts-expect-error ignore
        toUnits(100, Number(token0.decimals)),
        toUnits(100, Number(token1.decimals))
      )

      //@ts-expect-error ignore
      let ratio = fromUnits(data.amountOne, token0.decimals) / fromUnits(data.amountTwo, token1.decimals)
      ratio = type == 1 ? 1 : ratio
      setRatio(ratio)
    } catch (error) {
      setRatio(null)
      console.log(error)
    }
  }


  const fetchTokenBalance = async () => {
    if (!token0?.address || !token1?.address || !address) return;
    const balance0 = await erc20Balance(
      chainId,
      token0?.address,
      token0?.decimals,
      address
    );
    const balance1 = await erc20Balance(
      chainId,
      token1?.address,
      token1?.decimals,
      address
    );

    if (token0 && token0.address) {
      setToken0({
        ...token0,
        balance: Number(balance0),
      });
    }

    if (token1 && token1.address) {
      setToken1({
        ...token1,
        balance: Number(balance1),
      });
    }
  };

  const fetchRewardTokenBalance = async () => {
    if (!token?.address || !address) return;
    const balance = await erc20Balance(
      chainId,
      token?.address,
      token?.decimals,
      address
    );
    if (token && token.address) {
      setToken({
        ...token,
        balance: Number(balance),
      });
    }
  };

  const checkAllownceStatus = async (chainId: number) => {
    if (!token0?.address || !address || !amount0 || !token1?.address) return;
    const status0_ = await allowance(
      chainId,
      token0?.address,
      address,
      aerodromeContracts[chainId].router,
      Number(amount0),
      token0?.decimals
    );
    handProgress("isAllowanceForToken0", status0_);
    const status1_ = await allowance(
      chainId,
      token1?.address,
      address,
      aerodromeContracts[chainId].router,
      Number(amount1),
      token1?.decimals
    );
    handProgress("isAllowanceForToken1", status1_);
  };

  const swapTokens = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!token0 || !token1) return;

    const newToken0 = { ...token1 };
    const newToken1 = { ...token0 };

    setToken0(newToken0);
    setToken1(newToken1);
  };


  console.log(v3PositionDetails, "v3PositionDetails")
  const addLiquidity = async () => {
    try {
      if (!address) return alert("Please connect your wallet");
      if (!amount0 || !amount1 || !token0 || !token1) return;

      handleLoad("addLiquidity", true);

      const slippage = parseFloat(slippageTolerance);
      if (isNaN(slippage) || slippage < 0 || slippage > 50) { // Basic validation
        toast.warn("Invalid slippage tolerance. Please enter a value between 0 and 50.");
        handleLoad("addLiquidity", false);
        return;
      }

      const bnAmount0Desired = toUnits(amount0, token0?.decimals);
      const bnAmount1Desired = toUnits(amount1, token1?.decimals);

      let amount0MinBigNum = ethers.BigNumber.from(0);
      let amount1MinBigNum = ethers.BigNumber.from(0);

      // Only apply slippage for sAMM (stable) pools as per requirement
      // For vAMM pools, the current UI/logic doesn't seem to use min amounts from user input directly for addLiquidity,
      // but rather for minting NFTs which has a different flow.
      // Sticking to the requirement of modifying addLiquidity for sAMM.
      if (stable) { 
        const slippageBps = ethers.BigNumber.from(Math.round(slippage * 100)); // e.g., 0.5% = 50 bps
        const hundredPercentBps = ethers.BigNumber.from(10000); // 100% = 10,000 bps

        amount0MinBigNum = bnAmount0Desired.mul(hundredPercentBps.sub(slippageBps)).div(hundredPercentBps);
        amount1MinBigNum = bnAmount1Desired.mul(hundredPercentBps.sub(slippageBps)).div(hundredPercentBps);
      } else {
        // For non-stable (vAMM) pools, retain the previous behavior of effectively 0 slippage for addLiquidity,
        // as the task focuses on sAMM for this specific slippage calculation.
        // The 'mint' function handles vAMM liquidity differently (concentrated liquidity with price ranges).
        // If vAMM also needs slippage on desired amounts, it would be a separate calculation.
        // For now, to keep changes focused and avoid breaking vAMM:
        amount0MinBigNum = ethers.BigNumber.from(0); // Or consider bnAmount0Desired if no slippage means exact amount
        amount1MinBigNum = ethers.BigNumber.from(0); // Or consider bnAmount1Desired
      }
      
      const to = address;
      const deadline = Math.floor(Date.now() / 1000) + 600;

      const tx0Approve = await approve(
        token0.address,
        await signer,
        aerodromeContracts[chainId].router,
        Number(amount0),
        token0.decimals
      );
      if (tx0Approve) {
        await tx0Approve.wait();
        handProgress("isAllowanceForToken0", true);
      }

      const tx1Approve = await approve(
        token1.address,
        await signer,
        aerodromeContracts[chainId].router,
        Number(amount1),
        token1.decimals
      );
      if (tx1Approve) {
        await tx1Approve.wait();
        handProgress("isAllowanceForToken1", true);
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
        bnAmount0Desired,
        bnAmount1Desired,
        amount0MinBigNum, // Use calculated BigNumber
        amount1MinBigNum, // Use calculated BigNumber
        to,
        deadline,
        { gasLimit: 5000000 }
      );

      await tx.wait();
      await fetchPoolByIndex(chainId, Number(id));
      handProgress("isCompleted", true);

      handleLoad("addLiquidity", false);
    } catch (error) {
      console.log(error);
      handleLoad("addLiquidity", false);
    }
  };

  const mint = async () => {
    try {
      if (!address) return toast.warn("Please connect your wallet");
      if (!amount0 || !amount1 || !token0 || !token1) return toast.warn("Enter the amounts for token0 and token1");
      if (!selectedV3PositionDetails?.fee) return toast.warn("Select a fee tier")

      handleLoad("mint", true);
      const amount0Desired = toUnits(amount0, token0?.decimals);
      const amount1Desired = toUnits(amount1, token1?.decimals);
      const amount0Min = 0;
      const amount1Min = 0;
      const deadline = Math.floor(Date.now() / 1000) + 600;
      const sqrtPriceX96 = encodeSqrtRatioX96(amount1Desired.toString(), amount0Desired.toString())

      const tx0Approve = await approve(
        token0.address,
        await signer,
        aerodromeContracts[chainId].nfpm,
        Number(amount0),
        token0.decimals
      );
      if (tx0Approve) {
        await tx0Approve.wait();
        handProgress("isAllowanceForToken0", true);
      }

      const tx1Approve = await approve(
        token1.address,
        await signer,
        aerodromeContracts[chainId].nfpm,
        Number(amount1),
        token1.decimals
      );
      if (tx1Approve) {
        await tx1Approve.wait();
        handProgress("isAllowanceForToken1", true);
      }

      const clFactoryInstance = new ethers.Contract(
        aerodromeContracts[chainId].clFactory,
        clFactoryAbi,
        await signer
      )

      if (selectedV3PositionDetails?.pool == zeroAddr) {
        const tx = await clFactoryInstance.createPool(
          token0.address,
          token1.address,
          selectedV3PositionDetails?.tickSpacing,
          sqrtPriceX96.toString()
        )

        await tx.wait()
      }

      const aerodromeNfpm = new ethers.Contract(
        aerodromeContracts[chainId].nfpm,
        nfpmAbi,
        await signer
      );

      const tx = await aerodromeNfpm.mint(
        {
          token0: token0.address,
          token1: token1.address,
          tickSpacing: selectedV3PositionDetails.tickSpacing,
          tickLower: selectedV3PositionDetails.tickLower,
          tickUpper: selectedV3PositionDetails.tickUpper,
          amount0Desired,
          amount1Desired,
          amount0Min,
          amount1Min,
          recipient: address,
          deadline
        },
        { gasLimit: 5000000 }
      );

      await tx.wait();
      handProgress("isCompleted", true);
      handleLoad("mint", false);
    } catch (error) {
      console.log(error);
      handleLoad("mint", false);
    }

  }

  console.log(selectedV3PositionDetails, "selectedV3PositionDetails", lowValue, highValue)
  return (
    <>
      <section className="relative py-5 ">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div
                className="mx-auto grid gap-3 md:gap-5 grid-cols-12 items-start"
                style={{ maxWidth: 1000 }}
              >
                <div className="md:col-span-5 col-span-12 md:sticky top-0">
                  <div className="cardCstm p-3 md:p-4 rounded-md bg-[var(--backgroundColor2)] opacity-70 relative">
                    <div className="top">
                      <h4 className="m-0 font-semibold text-xl">
                        Deposit Liquidity
                      </h4>
                    </div>
                    <div className="content pt-3">
                      <SwapList className="list-none py-3 relative z-10 pl-0 mb-0">
                        <Progress
                          icon={amount0 == "" ? lock : unlock}
                          symbol={token0?.symbol}
                          text="Enter the amount of"
                        />
                        <Progress
                          icon={status.isAllowanceForToken0 ? unlock : lock}
                          symbol={token0?.symbol}
                          text="Allowed the contracts to access"
                        />
                        <Progress
                          icon={status.isAllowanceForToken1 ? unlock : lock}
                          symbol={token1?.symbol}
                          text="Allowed the contracts to access"
                        />
                        <Progress
                          icon={status.isCompleted ? unlock : lock}
                          symbol={token1?.symbol}
                          text="Deposit Liquidity"
                        />
                      </SwapList>
                      <div className="btnWrpper mt-3">
                        {type > 0 ?
                          <ActButton
                            label="concentrated addLiquidity"
                            onClick={() => mint()}
                            load={load["mint"]}
                          /> :
                          <ActButton
                            label="addLiquidity"
                            onClick={() => addLiquidity()}
                            load={load["addLiquidity"]}
                          />
                        }
                      </div>
                    </div>


                  </div>
                </div>


                <div className="md:col-span-7 col-span-12 md:sticky top-0 w-full px-4 bg-black text-white p-3 rounded-xl w-full space-y-4" >
                  {type > 0 &&
                    <>
                      <div className="bg-black text-white p-1 rounded-xl w-full max-w-md space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">{Number(selectedFee) / 10000} fee tier</p>
                          <div className="grid grid-cols-4 gap-3">
                            {v3PositionDetails.map((tier: PoolConfig | null, index: number) => (
                              tier != null ? <button
                                key={index}
                                onClick={() => {
                                  setSelectedV3PositionDetails(tier)
                                  setSelectedFee(Number(tier.fee));
                                  setLowValue(Number(tier.tickLower));
                                  setHighValue(Number(tier.tickUpper))

                                }}
                                className={`border p-3 rounded-lg text-sm transition-all duration-150 text-center whitespace-nowrap
                  ${selectedFee === Number(tier?.fee)
                                    ? "border-green-500 bg-green-900"
                                    : "border-gray-700 hover:border-gray-500"}`}
                              >
                                <p className="font-bold">{Number(tier.fee) / 10000}%</p>

                              </button> : <button
                                key={index}
                                onClick={() => {
                                  setSelectedFee(0);

                                  setLowValue(Number(0));
                                  setHighValue(Number(0))
                                }}
                                className={`border p-3 rounded-lg text-sm transition-all duration-150 text-center whitespace-nowrap
                ${selectedFee === null
                                    ? "border-green-500 bg-green-900"
                                    : "border-gray-700 hover:border-gray-500"}`}
                              >
                                <p className="font-bold">{0}%</p>

                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-[#111] border border-[#333333]">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-base">Low</span>
                              <div className="flex">
                                <button
                                  className="w-8 h-8 flex items-center justify-center bg-[#333] rounded hover:bg-gray-600 mr-1"
                                  onClick={() => {
                                    const currentValue = lowValue;
                                    if (!isNaN(currentValue)) {
                                      const newVal = currentValue - 1;
                                      setLowValue(Number(newVal.toFixed(10)));
                                    }
                                  }}
                                >
                                  <span>−</span>
                                </button>
                                <button
                                  className="w-8 h-8 flex items-center justify-center bg-[#333] rounded hover:bg-gray-600 mr-1"
                                  onClick={() => {
                                    const currentValue = lowValue;
                                    if (!isNaN(currentValue)) {
                                      const newVal = currentValue + 1;
                                      setLowValue(Number(newVal.toFixed(10)));
                                    }
                                  }}
                                >
                                  <span>+</span>
                                </button>
                                <button
                                  className="w-8 h-8 flex items-center justify-center bg-[#333] rounded hover:bg-gray-600"
                                  onClick={() => setLowValue(0)}
                                >
                                  <span>0</span>
                                </button>
                              </div>
                            </div>
                            <div className="text-xl md:text-2xl font-bold mb-1 break-all">
                              {lowValue}
                            </div>
                            <div className="text-right">
                              <span className="text-red-400 text-xs md:text-sm">~$2,475.81</span>
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-[#111] border border-[#333333]">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-base">High</span>
                              <div className="flex">
                                <button
                                  className="w-8 h-8 flex items-center justify-center bg-[#333] rounded hover:bg-gray-600 mr-1"
                                  onClick={() => {
                                    const currentValue = highValue;
                                    if (!isNaN(currentValue)) {
                                      const newVal = currentValue - 1;
                                      if (newVal >= 0) setHighValue(Number(newVal.toFixed(10)));
                                    }
                                  }}
                                >
                                  <span>−</span>
                                </button>
                                <button
                                  className="w-8 h-8 flex items-center justify-center bg-[#333] rounded hover:bg-gray-600 mr-1"
                                  onClick={() => {
                                    const currentValue = highValue;
                                    if (!isNaN(currentValue)) {
                                      const newVal = currentValue + 1;
                                      setHighValue(Number(newVal.toFixed(10)));
                                    }
                                  }}
                                >
                                  <span>+</span>
                                </button>
                                <button
                                  className="w-8 h-8 flex items-center justify-center bg-[#333] rounded hover:bg-gray-600"
                                  onClick={() => setHighValue(0)}
                                >
                                  <span>∞</span>
                                </button>
                              </div>
                            </div>
                            <div className="text-xl md:text-2xl font-bold mb-1 break-all">
                              {highValue}
                            </div>
                            <div className="text-right">
                              <span className="text-red-400 text-xs md:text-sm">~$2,628.9</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  }


                  <div className="py-2">
                    <div className="cardCstm p-3 md:p-10 rounded-2xl bg-[#0b120d] relative border border-[#2a2a2a]">
                      <form action="">
                        <div className="bg-[#00000073] py-5 px-3 rounded-2xl border border-[#141414]">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-base">Swap</span>
                            <span className="opacity-60 font-light text-xs">
                              Balance {token0?.balance} {token0?.symbol}
                            </span>
                          </div>
                          <div className="flex rounded mt-1">
                            <div className="left relative flex items-center gap-2 p-3 border-r border-gray-800 w-[180px]">
                              <span className="icn">
                                {token0Address ? (
                                  <Logo
                                    chainId={chainId}
                                    token={token0Address}
                                    margin={0}
                                    height={20}
                                  />
                                ) : (
                                  ""
                                )}{" "}
                              </span>
                              <span className="">{token0?.symbol}</span>
                            </div>
                            <input
                              name="amount0"
                              type="number"
                              value={amount0}
                              onChange={handleChangeAmount}
                              placeholder="0"
                              className="form-control border-0 p-3 h-10 text-xs bg-transparent w-full"
                            />
                          </div>
                        </div>
                        <div className="" style={{ margin: "-10px 0" }}>
                          <div className="text-center">
                            <button
                              onClick={(e) => swapTokens(e)}
                              className="border-0 p-2 text-black rounded bg-[#18b347]"
                            >
                              {transfer}
                            </button>
                          </div>
                        </div>
                        <div className="bg-[#00000073] py-5 px-3 rounded-2xl border border-[#141414] mb-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-base">For</span>
                            <span className="opacity-60 font-light text-xs">
                              Balance {token1?.balance} {token1?.symbol}
                            </span>
                          </div>
                          <div className="flex rounded mt-1">
                            <div className="left relative flex items-center gap-2 p-3 border-r border-gray-800 w-[180px]">
                              <span className="icn">
                                {token1Address ? (
                                  <Logo
                                    chainId={chainId}
                                    token={token1Address}
                                    margin={0}
                                    height={20}
                                  />
                                ) : (
                                  ""
                                )}{" "}
                              </span>
                              <span className="">{token1?.symbol}</span>
                            </div>
                            <input
                              name="amount1"
                              type="number"
                              value={amount1}
                              onChange={handleChangeAmount}
                              placeholder="0"
                              className="form-control border-0 p-3 h-10 text-xs bg-transparent w-full"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label htmlFor="slippage" className="block text-sm font-medium text-gray-300 mb-1">Slippage Tolerance (%):</label>
                          <input
                            type="number"
                            id="slippage"
                            value={slippageTolerance}
                            onChange={(e) => setSlippageTolerance(e.target.value)}
                            placeholder="0.5"
                            className="form-control w-24 text-xs p-2 rounded-md bg-transparent border border-[#2a2a2a] focus:border-green-500 focus:ring-green-500"
                          />
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
                                  {token0Address ? (
                                    <Logo
                                      chainId={chainId}
                                      token={token0Address}
                                      margin={0}
                                      height={25}
                                    />
                                  ) : (
                                    ""
                                  )}
                                </li>
                                <li className="" style={{ marginLeft: -10 }}>
                                  {token1Address ? (
                                    <Logo
                                      chainId={chainId}
                                      token={token1Address}
                                      margin={0}
                                      height={25}
                                    />
                                  ) : (
                                    ""
                                  )}
                                </li>
                              </ul>
                            </div>
                            <div className="content">
                              <p className="m-0 font-medium text-white">
                                {pool?.symbol}
                              </p>
                              <ul className="list-none pl-0 mb-0 flex items-center gap-2">
                                <li className="text-yellow-500 text-xs">
                                  (x) {PoolTypeMap[String(pool?.type)]}
                                </li>
                                <li className="text-xs flex items-center gap-2">
                                  {Number(pool?.pool_fee) / 100}% {infoIcn}
                                </li>
                              </ul>
                            </div>
                          </div>
                          <div className="right text-right">
                            <p className="m-0 text-gray-500 text-xs">APR</p>
                            <p className="m-0 text-white text-base font-bold">
                              {pool?.apr}%
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <ul className="list-none pl-0 mb-0">
                          <li className="py-1 flex items-center justify-between gap-2">
                            <p className="m-0 text-gray-500 text-xs">
                              Liquidity
                            </p>
                            <p className="m-0 text-gray-500 text-xs">
                              Your Liquidity
                            </p>
                          </li>
                          <li className="py-1 flex items-center justify-between gap-2">
                            <p className="m-0 text-white text-base font-bold">
                              {pool?.reserve0
                                ? fromUnits(
                                  pool?.reserve0,
                                  Number(token0?.decimals)
                                )
                                : "0"}{" "}
                              {token0?.symbol}
                            </p>
                            <p className="m-0 text-white text-base font-bold">
                              0.0 {token0?.symbol}
                            </p>
                          </li>
                          <li className="py-1 flex items-center justify-between gap-2">
                            <p className="m-0 text-white text-base font-bold">
                              {pool?.reserve1
                                ? fromUnits(
                                  pool?.reserve1,
                                  Number(token1?.decimals)
                                )
                                : "0"}{" "}
                              {token1?.symbol}
                            </p>
                            <p className="m-0 text-white text-base font-bold">
                              0.0 {token1?.symbol}
                            </p>
                          </li>
                        </ul>
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
