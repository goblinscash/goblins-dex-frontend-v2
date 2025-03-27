"use client";

import TableLayout from "@/components/tableLayout";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import logo from "@/assets/Images/logo.png";
import { allWithRewards, FormattedPool, locksByAccount, VeNFT } from "@/utils/sugar.utils";
import { useAccount, useChainId } from "wagmi";
import Logo from "@/components/common/Logo";
import Link from "next/link";
import { fromUnits } from "@/utils/math.utils";
import { gobV2 } from "@/utils/constant.utils";

type Tab = {
  title: string;
  content: React.ReactNode; // This can be any JSX element
};


type Column = {
  head: string;
  accessor: string;
  component?: (item: FormattedPool, key: number) => React.ReactNode; // Optional component property
  isComponent?: boolean; // For columns with specific components (like a switch)
};

const tabs: Tab[] = [
  // {
  //   title: "Most Rewarded",
  //   content: <></>,
  // },
  // {
  //   title: "Least Rewarded",
  //   content: <></>,
  // },
  {
    title: "All Pools",
    content: <></>,
  },
];

const Vote = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [pool, setPool] = useState<FormattedPool[]>([])
  const [locks, setLocks] = useState<VeNFT[]>([])

  const chainId = useChainId();
  const { address } = useAccount()

  const showTab = (tab: number) => {
    setActiveTab(tab);
  };

  const fetchPool = async () => {
    const pool = await allWithRewards(chainId, 10, 0)
    setPool(pool)
  }

  const fetchLocksByAccount = async () => {
    if (!chainId && !address) return
    const locks_ = await locksByAccount(chainId, address as string)
    setLocks(locks_)
  }

  useEffect(() => {
    if (chainId && address) {
      fetchLocksByAccount()
    }
  }, [chainId, address]);

  useEffect(() => {
    if (chainId) {
      fetchPool()
    }
  }, [chainId])

  console.log(pool, "pooldujihdsaf", locks)

  const column: Column[] = [
    {
      head: "Pools",
      accessor: "Pools",
      component: (item: FormattedPool) => {
        return (
          <div>
            <div className="flex items-center gap-3 border-b pb-3 border-[#2a2a2a] mb-3">
              <ul className="list-none pl-3 mb-0 flex-shrink-0 flex items-center">
                <li className="" style={{ marginLeft: -10 }}>
                  <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                    <Logo
                      chainId={item.chainId}
                      token={item.token0}
                      margin={0}
                      height={20}
                    />{" "}
                  </div>
                </li>{" "}
                <li className="" style={{ marginLeft: -10 }}>
                  <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                    <Logo
                      chainId={item.chainId}
                      token={item.token1}
                      margin={0}
                      height={20}
                    />
                  </div>
                </li>
              </ul>
              <div className="content">
                <p className="m-0 text-muted">{item.symbol}</p>
                <div className="flex items-center gap-2 mt-2 ">
                  <p className="m-0 text-xs text-yellow-500">
                    <span className="me-2"> (x)</span> Basic {Number(item.type) == 0 ? "Stable" : "Volatile"}
                  </p>
                  {item.pool_fee}
                </div>
              </div>
            </div>
            <p className="m-0 text-[#757575] pt-2 text-xs">TVL ~{item.poolBalance}</p>
          </div>
        );
      },
    },
    {
      head: "Fees",
      accessor: "fees",
      component: (item: FormattedPool) => {
        const symbol = item.symbol?.split("-")[1]?.split("/")
        return (
          <div className="rounded p-3 bg-[#091616] text-xs h-full pb-5 text-right">
            <p className="m-0 pb-3 border-b border-[#2a2a2a]">
              ~$  --
            </p>
            <div className="pt-3">
              <p className="m-0 text-[#7e7e7e] ">
                {item.token0_fees} {symbol[0]}
              </p>
              <p className="m-0 text-[#7e7e7e] ">
                {item.token1_fees} {symbol[1]}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      head: "Incentives",
      accessor: "incentives",
      component: () => {
        return (
          <div className="rounded p-3 bg-[#091616] text-xs h-full pb-5 text-right">
            <p className="m-0 pb-3 border-b border-[#2a2a2a]">
              No available incentives
            </p>
            <Link href="/incentivize" className="m-0 text-blue-500 pt-3">Add incentives</Link>
          </div>
        );
      },
    },
    {
      head: "Total Reward",
      accessor: "Total_Reward",
      component: () => {
        return (
          <div className="rounded p-3 bg-[#091616] text-xs h-full pb-5 text-right">
            <p className="m-0 pb-3 border-b border-[#2a2a2a]">
              No available incentives
            </p>
            <p className="m-0 text-[#7e7e7e] pt-3">Fees + Incentives</p>
          </div>
        );
      },
    },
    {
      head: "vAPR",
      accessor: "vAPR",
      component: () => {
        return (
          <>
            <div className="rounded p-3 bg-[#091616] text-xs h-full pb-5 text-right">
              <p className="m-0 pb-3 border-b border-[#2a2a2a]">7.35852%</p>
              <p className="m-0 text-[#7e7e7e] pt-3">
                ~ 0.0% Votes <br />
                0.99938 veAERO
                { }
              </p>
              <p className="m-0 text-[#7e7e7e] pt-3">Vote</p>
            </div>
            <div className="dropdown w-full">
              <div
                tabIndex={0}
                role="button"
                className="btn text-xs w-full text-right text-white flex justify-end border-0 p-0 bg-transparent"
              >
                Vote
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-white text-dark right-0 rounded-box z-1 w-52 p-2 shadow-sm"
              >
                {locks && locks?.length && locks?.map((lock: VeNFT) => (
                  <li key={lock.id}>
                    <button className="flex items-center gap-2">
                      <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                        <Logo
                          chainId={chainId}
                          token={lock.token}
                          margin={0}
                          height={20}
                        />
                      </div>
                      <div className="content">
                        <h6 className="m-0 text-black text-xs font-medium flex items-center gap-1">
                          Lock #{lock.id} <span className="icn">{lockIcn}</span>
                        </h6>
                        <p className="m-0 text-[#2a2a2a] text-[10px]">
                          {Number(fromUnits(lock.amount, Number(lock.decimals))).toFixed(3)} {gobV2[chainId || 8453]?.symbol}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        );
      },
    },
  ];


  return (
    <>
      <section className="pt-8 pb-[100px] relative ">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div className="cardCstm p-3 md:p-8 rounded-2xl bg-[#0b120d] relative border border-[#2a2a2a]">
                <div className="top flex items-center justify-between gap-3 flex-wrap border-b border-[#2a2a2a] pb-3">
                  <div className="left flex items-center gap-2">
                    {clockIcn}
                    <p className="m-0 font-medium">Current voting round</p>
                    <div className="rounded-full text-xs font-medium bg-[#00ff4e] text-black px-3 py-1">
                      ends in 7 days
                    </div>
                  </div>
                  <div className="">
                    <p className="m-0 text-xs text-[#545454]">
                      Voters earn a share of transaction fees and incentives for
                      helping govern how emissions are distributed.
                    </p>
                  </div>
                </div>
                <div className="bottom pt-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="left">
                    <ul className="list-none pl-0 mb-0 flex items-center flex-wrap gap-2">
                      <li className="flex items-center gap-2 text-xs">
                        <span className="text-[#545454]">
                          Total voting power this epoch:
                        </span>
                        <span className="themeClr">777.41M</span>
                      </li>
                    </ul>
                  </div>
                  <div className="left">
                    <ul className="list-none pl-0 mb-0 flex items-center flex-wrap gap-2">
                      <li className="flex items-center gap-2 text-xs">
                        <span className="text-[#545454]">Total Fees:</span>
                        <span className="themeClr">~$2,048,125.32</span>
                      </li>{" "}
                      <li className="flex items-center gap-2 text-xs">
                        <span className="text-[#545454]">
                          Total Incentives:
                        </span>
                        <span className="themeClr">~$72,544.2</span>
                      </li>{" "}
                      <li className="flex items-center gap-2 text-xs">
                        <span className="text-[#545454]">Total Rewards:</span>
                        <span className="themeClr">~~$2,120,669.52</span>
                      </li>{" "}
                      <li className="flex items-center gap-2 text-xs">
                        <span className="text-[#545454]">New Emissions:</span>
                        <span className="themeClr">8,067,170.33</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12">
              <div className="mt-4">
                <h4 className="m-0 font-bold text-2xl pb-3">
                  Select Liquidity Pools for Voting
                </h4>
                <div className="mt-2">
                  <Nav
                    className="flex nav flex-nowrap border-b gap-4 overflow-x-auto"
                    style={{ borderColor: "#2c2c2c" }}
                  >
                    {tabs &&
                      tabs.length > 0 &&
                      tabs.map((item, key) => (
                        <button
                          key={key}
                          onClick={() => showTab(key)}
                          className={`${activeTab === key && "active"
                            } tab-button font-medium relative py-2 flex-shrink-0  text-xs text-gray-400`}
                        >
                          {item.title}
                        </button>
                      ))}
                  </Nav>
                </div>
              </div>
            </div>

            <div className="col-span-12">
              <div className="tabContent pt-3">
                <TableLayout column={column} data={pool} />
              </div>
            </div>
          </div>
        </div>

        <div className="fixed p-5 bottom-0 z-[9999] left-0 w-full bg-[#131313] flex items-center justify-between gap-3">
          <div className="grid gap-3 grid-cols-12 w-full">
            <div className="sm:col-span-6 col-span-12">
              <div className="cardCstm p-3 rounded-xl bg-[#0b120d] relative border border-[#2a2a2a] flex items-center justify-between  gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                    <Image
                      src={logo}
                      alt=""
                      className="max-w-full h-[20px] w-auto"
                      height={100000}
                      width={100000}
                    />
                  </div>
                  <div className="content">
                    <h6 className="m-0 text-white text-xs font-medium flex items-center gap-1">
                      Lock #232434 <span className="icn">{lockIcn}</span>
                    </h6>
                    <p className="m-0 text-[10px]">Locked for 4 years</p>
                  </div>
                </div>
                <div className="right text-right">
                  <p className="m-0 text-base">97.55%</p>
                  <p className="m-0 text-green-500 text-xs">8 Pools Selected</p>
                </div>
              </div>
            </div>{" "}
            <div className="sm:col-span-6 col-span-12">
              <div className="cardCstm p-3 rounded-xl bg-[#0b120d] relative border border-[#2a2a2a] flex items-center justify-between  gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                    <Image
                      src={logo}
                      alt=""
                      className="max-w-full h-[20px] w-auto"
                      height={100000}
                      width={100000}
                    />
                  </div>
                  <div className="content">
                    <h6 className="m-0 text-white text-xs font-medium flex items-center gap-1">
                      Lock #232434 <span className="icn">{lockIcn}</span>
                    </h6>
                    <p className="m-0 text-[10px]">Locked for 4 years</p>
                  </div>
                </div>
                <div className="right text-right">
                  <p className="m-0 text-base">97.55%</p>
                  <p className="m-0 text-green-500 text-xs">8 Pools Selected</p>
                </div>
              </div>
            </div>
          </div>
          <button className="flex items-center justify-center commonBtn px-3 rounded text-xs font-medium h-full">
            Vote
          </button>
        </div>
      </section>
    </>
  );
};


export default Vote;

const Nav = styled.div`
  button {
    &:after {
      position: absolute;
      content: "";
      bottom: 0;
      left: 0;
      width: 100%;
      background: #00ff4e;
      height: 2px;
      opacity: 0;
    }
    &.active {
      color: #fff;
      &:after {
        opacity: 1;
      }
    }
  }
`;

const clockIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M10 2h4"></path>
    <path d="M12 14v-4"></path>
    <path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6"></path>
    <path d="M9 17H4v5"></path>
  </svg>
);

const lockIcn = (
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
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);
