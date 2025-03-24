"use client";

import TableLayout from "@/components/tableLayout";
import Image from "next/image";
import React, { useState } from "react";
import styled from "styled-components";
import logo from "@/assets/Images/logo.png";

type Tab = {
  title: string;
  content: React.ReactNode; // This can be any JSX element
};

type Data = {
  chainId: number;
  token0: string;
  token1: string;
  symbol: string;
  volume: string;
  apr: string;
  pool_fee: string;
  poolBalance: string;
  url: string;
};

type Column = {
  head: string;
  accessor: string;
  component?: (item: Data, key: number) => React.ReactNode; // Optional component property
  isComponent?: boolean; // For columns with specific components (like a switch)
};

const Vote = () => {
  const tabs: Tab[] = [
    {
      title: "Most Rewarded",
      content: <></>,
    },
    {
      title: "Least Rewarded",
      content: <></>,
    },
    {
      title: "All Pools",
      content: <></>,
    },
  ];
  const [activeTab, setActiveTab] = useState<number>(0);

  const showTab = (tab: number) => {
    setActiveTab(tab);
  };
  const column: Column[] = [
    {
      head: "Pools",
      accessor: "Pools",
      component: (item: Data, key: number) => {
        return (
          <div>
            <div className="flex items-center gap-3 border-b pb-3 border-[#2a2a2a] mb-3">
              <ul className="list-none pl-3 mb-0 flex-shrink-0 flex items-center">
                <li className="" style={{ marginLeft: -10 }}>
                  <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                    <Image
                      src={logo}
                      alt=""
                      className="max-w-full h-[30px] w-auto"
                      height={100000}
                      width={100000}
                    />
                  </div>
                </li>{" "}
                <li className="" style={{ marginLeft: -10 }}>
                  <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                    <Image
                      src={logo}
                      alt=""
                      className="max-w-full h-[30px] w-auto"
                      height={100000}
                      width={100000}
                    />
                  </div>
                </li>
              </ul>
              <div className="content">
                <p className="m-0 text-muted">vAMM-ZRO/MORPHO</p>
                <div className="flex items-center gap-2 mt-2 ">
                  <p className="m-0 text-xs text-yellow-500">
                    <span className="me-2"> (x)</span> Basic Volatile
                  </p>
                  0.3%
                </div>
              </div>
            </div>
            <p className="m-0 text-[#2a3a3a] pt-2 text-xs">TVL ~$2,615.51</p>
          </div>
        );
      },
    },
    {
      head: "Fees",
      accessor: "fees",
      component: (item: Data, key: number) => {
        return (
          <div className="rounded p-3 bg-[#091616] text-xs h-full pb-5 text-right">
            No available fees
          </div>
        );
      },
    },
    {
      head: "Incentives",
      accessor: "incentives",
      component: (item: Data, key: number) => {
        return (
          <div className="rounded p-3 bg-[#091616] text-xs h-full pb-5 text-right">
            <p className="m-0 pb-3 border-b border-[#2a2a2a]">
              No available incentives
            </p>
            <button className="m-0 text-blue-500 pt-3">Add incentives</button>
          </div>
        );
      },
    },
    {
      head: "Total Reward",
      accessor: "Total_Reward",
      component: (item: Data, key: number) => {
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
      component: (item: Data, key: number) => {
        return (
          <div className="rounded p-3 bg-[#091616] text-xs h-full pb-5 text-right">
            <p className="m-0 pb-3 border-b border-[#2a2a2a]">7.35852%</p>
            <p className="m-0 text-[#7e7e7e] pt-3">
              ~ 0.0% Votes <br />
              0.99938 veAERO
            </p>
            <p className="m-0 text-[#7e7e7e] pt-3">Vote</p>
          </div>
        );
      },
    },
  ];

  const data = [
    {
      Pools: "Liquidity",
      fees: "Apr",
      incentives: "volume",
      Total_Reward: "pool_fee",
      vAPR: "poolBalance",
    },
    {
      Pools: "Liquidity",
      fees: "Apr",
      incentives: "volume",
      Total_Reward: "pool_fee",
      vAPR: "poolBalance",
    },
  ];

  return (
    <>
      <section className="py-8 relative">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div className="cardCstm p-3 md:p-8 rounded-2xl bg-[#0b120d] relative border border-[#2a2a2a]">
                <div className="top flex items-center justify-between gap-3 flex-wrap border-b border-[#2a2a2a] pb-3">
                  <div className="left flex items-center gap-2">
                    {clockIcn}
                    <p className="m-0 font-medium">Current voting round</p>
                    <div className="rounded-full text-xs font-medium bg-[#00ff4e] text-black px-3 py-1">
                      ends in 3 days
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
                          className={`${
                            activeTab === key && "active"
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
                <TableLayout column={column} data={data} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
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

export default Vote;

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
