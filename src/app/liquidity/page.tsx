"use client";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import TableLayout from "@/components/tableLayout";
import { useChainId } from "wagmi";
import { all } from "@/utils/sugar.utils";
import Link from "next/link";

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
  symbol: string;
  volume: string;
  apr: string;
  pool_fee: string;
  poolBalance: string;
  url: string;
};

const tabs: Tab[] = [
  {
    title: "Active",
    content: <>adafsdfasd</>,
  }
];

const column: Column[] = [
  {
    head: "Liquidity Pool",
    accessor: "Liquidity",
    component: (item: Data, key: number) => {
      return (
        <div key={key} className="flex items-center gap-3">
          <div className="content">
            <p className="m-0 text-muted">{item?.symbol}</p>
          </div>
        </div>
      );
    },
  },
  { head: "apr", accessor: "apr" },
  {
    head: "volume",
    accessor: "volume",
    isComponent: true,
  },
  {
    head: "pool_fee",
    accessor: "pool_fee",
  },
  {
    head: "Pool Balance",
    accessor: "poolBalance",
  },
  {
    head: "",
    accessor: "action",
    component: (item: Data, key: number) => {
      const url = item.url || "/deposit";
      return (
        <div key={key} className="flex items-center gap-3">
          <Link
            href={url}
            className="flex items-center justify-center btn commonBtn rounded-lg h-[40px] px-4 font-medium "
          >
            Deposit
          </Link>
        </div>
      );
    },
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
      all(chainId, 5, 0).then(result => setPools(result))
    }
  }, [chainId]);

  console.log(pools, "pool++");
  return (
    <section className="Liquidity py-5 relative">
      <div className="container ">
        <div className="grid gap-3 grid-cols-12">
          <div className="col-span-12">
            <div className="flex items-center justify-between flex-wrap">
              <h4 className="m-0 font-bold text-2xl">Liquidity Pools</h4>
              <form action="">
                <div className="flex items-center gap-3">                  
                  <Link
                    href={"/pools?token0=&token1="}
                    className="flex items-center justify-center btn text-xs commonBtn rounded-lg h-[40px] px-4 font-medium "
                  >
                    Deposit Liquidity
                  </Link>
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
                      className={`${
                        activeTab === key && "active"
                      } tab-button font-medium relative py-2 flex-shrink-0  text-xs text-gray-400`}
                    >
                      {item.title}
                    </button>
                  ))}
              </Nav>
              <div className="tabContent pt-3">
                <TableLayout column={column} data={pools} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Liquidity;
