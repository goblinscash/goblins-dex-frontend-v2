"use client";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import TableLayout from "@/components/tableLayout";
import { useAccount, useChainId } from "wagmi";
import { all } from "@/utils/sugar.utils";



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

const search = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 21L17 17M19 11C19 13.1217 18.1571 15.1566 16.6569 16.6569C15.1566 18.1571 13.1217 19 11 19C8.87827 19 6.84344 18.1571 5.34315 16.6569C3.84285 15.1566 3 13.1217 3 11C3 8.87827 3.84285 6.84344 5.34315 5.34315C6.84344 3.84285 8.87827 3 11 3C13.1217 3 15.1566 3.84285 16.6569 5.34315C18.1571 6.84344 19 8.87827 19 11Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type Tab = {
  title: string;
  content: React.ReactNode; // This can be any JSX element
};

type Column = {
  head: string;
  accessor: string;
  component?: (item: Data, key: number) => React.ReactNode; // Optional component property
  isComponent?: boolean; // For columns with specific components (like a switch)
};

type Data = {
  LiquidityName: string;
  Volume: string;
  APR: string;
  Fees: string;
  PoolBalance: string;
};

const tabs: Tab[] = [
  {
    title: "Active",
    content: <>adafsdfasd</>,
  },
  {
    title: "Stable",
    content: <>asdfasdf23423</>,
  },
  {
    title: "Volatile",
    content: <>a2342134</>,
  },
  {
    title: "Concentrated",
    content: <>a2342134</>,
  },
  {
    title: "Incentivized",
    content: <>a2342134</>,
  },
];

const column: Column[] = [
  {
    head: "Liquidity Pool",
    accessor: "Liquidity",
    component: (item: Data, key: number) => {
      return (
        <div key={key} className="flex items-center gap-3">
          <div className="content">
            <p className="m-0 text-muted">{item?.LiquidityName}</p>
          </div>
        </div>
      );
    },
  },
  { head: "APR", accessor: "APR" },
  {
    head: "Volume",
    accessor: "Volume",
    isComponent: true,
  },
  {
    head: "Fees",
    accessor: "Fees",
  },
  {
    head: "Pool Balance",
    accessor: "PoolBalance",
  },
];

const data: Data[] = [
  {
    LiquidityName: "CL1-WETH/superOETHb",
    Volume: "$487,904.63",
    APR: "5.0333%",
    Fees: "$195.16",
    PoolBalance: "5,400.42 WETH",
  },
  {
    LiquidityName: "CL1-WETH/superOETHb",
    Volume: "$487,904.63",
    APR: "5.0333%",
    Fees: "$195.16",
    PoolBalance: "5,400.42 WETH",
  },
  {
    LiquidityName: "CL1-WETH/superOETHb",
    Volume: "$487,904.63",
    APR: "5.0333%",
    Fees: "$195.16",
    PoolBalance: "5,400.42 WETH",
  },
];

const Liquidity = () => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [pools, setPools] = useState([]);


  const showTab = (tab: number) => {
    setActiveTab(tab);
  };

  const chainId = useChainId();

  useEffect(() => {
    if (chainId) {
      all(chainId, 1, 1).then(result => setPools(result))
    }
  }, [chainId])

  console.log(pools, "pool++")
  return (
    <section className="Liquidity py-5 relative">
      <div className="container ">
        <div className="grid gap-3 grid-cols-12">
          <div className="col-span-12">
            <div className="flex items-center justify-between flex-wrap">
              <h4 className="m-0 font-bold text-2xl">Liquidity Pools</h4>
              <form action="">
                <div className="relative iconWithText">
                  <span className="absolute icn left-2">{search}</span>
                  <input
                    placeholder="Search..."
                    type="search"
                    className="form-control text-xs h-[40px] border border-gray-600 pl-8 rounded bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)]"
                  />
                </div>
              </form>
            </div>
          </div>
          <div className="col-span-12">
            <div className="w-full">
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
              <div className="tabContent pt-3">
                <TableLayout column={column} data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default Liquidity;

