"use client";
import React, { useState, useEffect, useCallback } from "react";
import logo from "@/assets/Images/logo.png";
import Image from "next/image";
import TableLayout from "@/components/tableLayout";
import Link from "next/link";
import ListLayout from "@/components/lockRow";

const VotePopup = ({ vote, setVote }) => {
  const handleVote = () => {
    setVote(!vote);
  };

  const column = [
    {
      head: "Pools",
      accessor: "Pools",
      component: (item) => {
        return (
          <div>
            <div className="flex items-center gap-3 border-b pb-3 border-[#2a2a2a] mb-3">
              <ul className="list-none pl-3 mb-0 flex-shrink-0 flex items-center">
                <li className="" style={{ marginLeft: -10 }}>
                  <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                    asfas
                  </div>
                </li>
              </ul>
              <div className="content">
                <p className="m-0 text-muted">d</p>
                <div className="flex items-center gap-2 mt-2 ">
                  <p className="m-0 text-xs text-yellow-500">
                    <span className="me-2"> (x)</span> Basic Stable
                  </p>
                  dd
                </div>
              </div>
            </div>
            <p className="m-0 text-[#757575] pt-2 text-xs">TVL ~11</p>
          </div>
        );
      },
    },
    {
      head: "Fees",
      accessor: "fees",
      component: (item) => {
        return (
          <div className="rounded p-3 bg-[#091616] text-xs h-full pb-5 text-right min-w-[200px]">
            <p className="m-0 pb-3 border-b border-[#2a2a2a]">~$ --</p>
            <div className="pt-3">
              <p className="m-0 text-[#7e7e7e] ">11</p>
              <p className="m-0 text-[#7e7e7e] ">11</p>
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
          <div className="rounded p-3 bg-[#091616] text-xs h-full pb-5 text-right min-w-[200px]">
            <p className="m-0 pb-3 border-b border-[#2a2a2a]">
              No available incentives
            </p>
            <Link href="/incentivize" className="m-0 text-blue-500 pt-3">
              Add incentives
            </Link>
          </div>
        );
      },
    },
    {
      head: "Total Reward",
      accessor: "Total_Reward",
      component: () => {
        return (
          <div className="rounded p-3 bg-[#091616] text-xs h-full pb-5 text-right min-w-[200px]">
            <div className="top mb-4 flex items-center justify-center gap-3">
              <div className="">
                <p className="m-0 text-xs">Voting Power</p>
                <p className="m-0 text-xs">0.0069 veAERO</p>
              </div>
              <div className="relative">
                <span className="absolute icn right-2 top-[50%]  transform translate-y-[-50%]">
                  %
                </span>
                <input
                  type="text"
                  className="form-control rounded-xl border border-[#3c3c3c] text-xs bg-transparent max-w-[150px] p-3"
                />
              </div>
            </div>
            <div className="bottom pt-4">
              <ul className="list-none pl-0 mb-0 flex items-center justify-center gap-2">
                <li className="">
                  <button className="p-1 text-xs bg-[#000e0e] rounded-xl px-3">
                    {deleteIcn}
                  </button>
                </li>
                <li className="">
                  <button className="p-1 text-xs bg-[#000e0e] rounded-xl px-3">
                    0 %
                  </button>
                </li>
                <li className="">
                  <button className="p-1 text-xs bg-[#000e0e] rounded-xl px-3">
                    0 %
                  </button>
                </li>
                <li className="">
                  <button className="p-1 text-xs bg-[#000e0e] rounded-xl px-3">
                    0 %
                  </button>
                </li>
              </ul>
            </div>
          </div>
        );
      },
    },
  ];
  const data = [
    {
      Pools: "Pools",
      fees: "",
      incentives: "incentives",
      Total_Reward: "Total_Reward",
    },
    {
      Pools: "Pools",
      fees: "",
      incentives: "incentives",
      Total_Reward: "Total_Reward",
    },
  ];
  return (
    <div className="fixed z-[9999] inset-0 flex items-center justify-center cstmModal">
      <div className="absolute inset-0 bg-black z-[9] opacity-70"></div>
      <div className="modalDialog relative p-4 px-lg-5 mx-auto rounded-lg z-[9999] bg-[#272625] w-full max-w-[1200px] overflow-scroll">
        <div className="top border-b border-[#3c3c3c] flex items-center justify-between pb-3">
          <h6 className="m-0 font-semibold text-xl">Vote</h6>
          <button onClick={handleVote} className="border-0 p-0 ">
            {cross}
          </button>
        </div>
        <div className="modalBody pt-3">
          <div className="py-2">
            <div className="sticky top-0 z-[999]">
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
                    <div className="flex items-center gap-3">
                      <p className="m-0 text-[10px]">Locked for 4 years</p>
                      <ul className="list-none pl-0 mb-0 flex items-center gap-2">
                        <li className="">
                          <Link
                            href={""}
                            className="themeClr text-[10px] font-medium"
                          >
                            link1
                          </Link>
                        </li>
                        <li className="">
                          <Link
                            href={""}
                            className="themeClr text-[10px] font-medium"
                          >
                            link1
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="right text-right">
                  <p className="m-0 text-base">97.55%</p>
                  <p className="m-0 text-green-500 text-xs">8 Pools Selected</p>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <ListLayout column={column} data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotePopup;

const cross = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 17L1 1M17 1L1 17"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
    />
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

const deleteIcn = (
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
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);
