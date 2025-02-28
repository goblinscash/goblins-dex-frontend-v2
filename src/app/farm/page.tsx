"use client";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
// import TableLayout from "@/components/tableLayout";
// import Image from "next/image";
import FarmingCard from "./farmingCard";
import PoolTable from "./poolTable";
import DepositTable from "./DepositTable";
import CounterCard from "./CounterCard";
import { getTopPools } from "@/utils/requests.utils";
import { useChainId } from "wagmi";
import { subGraphUrls } from "@/utils/config.utils";

type Tab = {
  title: string;
  component: React.ReactNode; // This can be any JSX element
};
const Farm = () => {
  const chainId = useChainId();
  const [pools, setPools] = useState();
  const [farmPool, setFarmPool] = useState();


  const fetchPools = async () => {
    const poolFc = getTopPools(subGraphUrls[Number(chainId) || 8453]);
    const _pools = await poolFc("liquidity", "desc");
    if (_pools.pools?.length > 0) {
      setFarmPool(_pools.pools[0]);
    }
    setPools(_pools.pools);
  };

  useEffect(() => {
    fetchPools();
  }, [chainId]);

  console.log(farmPool, "pools++");

  const tabs: Tab[] = [
    {
      title: "Farms",
      component: (
        <div className="grid gap-3 grid-cols-12">
          <div className="md:col-span-7 col-span-12">
            <PoolTable pools={pools} setFarmPool={setFarmPool} />
          </div>
          <div className="md:col-span-5 col-span-12">
            <FarmingCard farmPool={farmPool} />
          </div>
        </div>
      ),
    },
    {
      title: "Deposits",
      component: (
        <>
          <CounterCard />
          <DepositTable />
        </>
      ),
    },
    // {
    //   title: "Pools",
    //   content: <>asdfasdf23423</>,
    // },
  ];

  const [activeTab, setActiveTab] = useState<number>(0);

  const showTab = (tab: number) => {
    console.log(tab, "tab");
    setActiveTab(tab);
  };

  return (
    <>
      {/* <Loader /> */}
      <section className="Farm py-5 relative">
        <div className="container max-w-full px-3">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <Nav className="flex nav rounded bg-[#353231] p-1 gap-4">
                {tabs &&
                  tabs.length > 0 &&
                  tabs.map((item, key) => (
                    <button
                      key={key}
                      onClick={() => showTab(key)}
                      className={`${
                        activeTab === key && "active"
                      } tab-button font-medium relative rounded py-2  text-xs text-gray-400 w-full`}
                    >
                      {item.title}
                    </button>
                  ))}
              </Nav>
            </div>
            <div className="col-span-12">{tabs[activeTab].component}</div>
          </div>
        </div>
      </section>
    </>
  );
};

const Nav = styled.div`
  button {
    height: 45px;
    &.active {
      color: #fff;
      background: #000;
    }
  }
`;

export default Farm;

// const search = (
//   <svg
//     width="18"
//     height="18"
//     viewBox="0 0 24 24"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     <path
//       d="M21 21L17 17M19 11C19 13.1217 18.1571 15.1566 16.6569 16.6569C15.1566 18.1571 13.1217 19 11 19C8.87827 19 6.84344 18.1571 5.34315 16.6569C3.84285 15.1566 3 13.1217 3 11C3 8.87827 3.84285 6.84344 5.34315 5.34315C6.84344 3.84285 8.87827 3 11 3C13.1217 3 15.1566 3.84285 16.6569 5.34315C18.1571 6.84344 19 8.87827 19 11Z"
//       stroke="currentColor"
//       strokeWidth="1.5"
//       strokeMiterlimit="10"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </svg>
// );
