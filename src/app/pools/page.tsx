"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import SelectTokenPopup from "@/components/modals/SelectTokenPopup";
import Link from "next/link";
import TableLayout from "@/components/tableLayout";

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

const Pools = () => {
  const [selectToken, setSelectToken] = useState<boolean | null>(null);
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
    {
      head: "",
      accessor: "action",
      component: (item: Data, key: number) => {
        return (
          <div className="flex items-center gap-3">
            <Link
              href={"/deposit"}
              className="flex items-center justify-center btn commonBtn rounded-lg h-[40px] px-4 font-medium "
            >
              New Deposit
            </Link>
          </div>
        );
      },
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
  ];

  return (
    <>
      {selectToken &&
        createPortal(
          <SelectTokenPopup
            selectToken={selectToken}
            setSelectToken={setSelectToken}
          />,
          document.body
        )}
      <section className="pools py-5 relative">
        <div className="container">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div className="mx-auto max-w-[800px]">
                <div className="top pb-3">
                  <h4 className="m-0 font-normal text-xl flex items-center gap-3">
                    Deposit Liquidity <span>{infoIcn}</span>
                  </h4>
                </div>
                <div className="cardBody">
                  <div className="grid gap-3 grid-cols-12">
                    <div className="sm:col-span-6 col-span-12">
                      <div
                        className="flex items-center relative iconWithText cursor-pointer rounded-lg bg-[#000e0e] gap-3 px-4 py-5"
                        onClick={() => setSelectToken(!selectToken)}
                      >
                        <span className="absolute right-2 icn">{downIcn}</span>
                        <div className="flex-shrink-0">{addIcn}</div>
                        <div className="content">
                          <p className="m-0 text-white/50 text-xs font-medium">
                            Select first token
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-6 col-span-12">
                      <div
                        className="flex items-center relative iconWithText cursor-pointer rounded-lg bg-[#000e0e] gap-3 px-4 py-5"
                        onClick={() => setSelectToken(!selectToken)}
                      >
                        <span className="absolute right-2 icn">{downIcn}</span>
                        <div className="flex-shrink-0">{addIcn}</div>
                        <div className="content">
                          <p className="m-0 text-white/50 text-xs font-medium">
                            Select Second token
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-12">
                      <div className="flex items-center relative iconWithText cursor-pointer rounded-lg bg-[#000e0e] gap-3 px-4 py-5">
                        <span className="">{infoIcn}</span>
                        <div className="content">
                          <p className="m-0 text-white/50 text-xs font-medium">
                            Start by selecting the tokens. The liquidity pools
                            available for deposit will show up next.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-12">
                      <div className="py-3">
                        <p className="m-0 text-white text-base">
                          Available Pools
                        </p>
                        <TableLayout column={column} data={data} />
                      </div>
                      <div className="py-3">
                        <p className="m-0 text-white text-base">
                          Low Liquidity Pools
                        </p>
                        <TableLayout column={column} data={data} />
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

export default Pools;

const infoIcn = (
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
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <path d="M12 17h.01"></path>
  </svg>
);

const downIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
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

const addIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 240 240"
    fill="none"
  >
    <path
      d="M120 240C186.274 240 240 186.274 240 120C240 53.7261 186.274 0 120 0C53.7261 0 0 53.7261 0 120C0 186.274 53.7261 240 120 240Z"
      fill="#E5E7EB"
    />
    <path
      d="M120 240C186.274 240 240 186.274 240 120C240 53.7261 186.274 0 120 0C53.7261 0 0 53.7261 0 120C0 186.274 53.7261 240 120 240Z"
      fill="#E5E5E5"
    />
    <path
      d="M120 220C175.228 220 220 175.228 220 120C220 64.7717 175.228 20 120 20C64.7717 20 20 64.7717 20 120C20 175.228 64.7717 220 120 220Z"
      fill="#CACACA"
    />
    <path
      d="M120 200C164.183 200 200 164.183 200 120C200 75.8174 164.183 40 120 40C75.8174 40 40 75.8174 40 120C40 164.183 75.8174 200 120 200Z"
      fill="#E5E5E5"
    />
    <path
      d="M120 81L132.41 107.59L159 120L132.41 132.41L120 159L107.59 132.41L81 120L107.59 107.59L120 81Z"
      fill="#CACACA"
    />
  </svg>
);
