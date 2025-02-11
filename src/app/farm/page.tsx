"use client";
import React, { useState } from "react";
import styled from "styled-components";
import TableLayout from "@/components/tableLayout";
import Image from "next/image";
import FarmingCard from "./farmingCard";
import PoolTable from "./poolTable";

type Tab = {
  title: string;
  content: React.ReactNode; // This can be any JSX element
};
const Farm = () => {
  const tabs: Tab[] = [
    {
      title: "Farms",
      content: <>adafsdfasd</>,
    },
    {
      title: "Pools",
      content: <>asdfasdf23423</>,
    },
    {
      title: "Deposits",
      content: <>a2342134</>,
    },
  ];

  const [activeTab, setActiveTab] = useState<number>(1);

  const showTab = (tab: number) => {
    console.log(tab, "tab");
    setActiveTab(tab);
  };

  return (
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
          <div className="col-span-12">
            <div className="grid gap-3 grid-cols-12">
              <div className="md:col-span-7 col-span-12">
                <PoolTable />
              </div>
              <div className="md:col-span-5 col-span-12">
                <FarmingCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
