"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SelectTokenPopup from "@/components/modals/SelectTokenPopup";
import TableLayout from "@/components/tableLayout";
import Logo from "@/components/common/Logo";
import { useChainId } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import { tokens } from "@myswap/token-list";
import { stableTokens } from "@/utils/constant.utils";

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

export interface Token {
  address: string;
  symbol: string;
  decimals: number;
  balance: number;
}

const Pools = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chainId = useChainId();
  const [token0, setToken0] = useState<Token | null>(null);
  const [token1, setToken1] = useState<Token | null>(null);
  const [data, setData] = useState<Data[]>([]);
  const [tokenBeingSelected, setTokenBeingSelected] = useState<
    "token0" | "token1" | null
  >(null);
  const [filteredTokenList, setFilteredTokenList] = useState([]);

  const handleTokenSelect = (token: Token) => {
    const newQueryParams = new URLSearchParams(searchParams.toString());
    if (tokenBeingSelected === "token0") {
      setToken0(token);
      newQueryParams.set("token0", token.address);
    } else if (tokenBeingSelected === "token1") {
      setToken1(token);
      newQueryParams.set("token1", token.address);
    }
    setTokenBeingSelected(null);
    router.push(`/pools?${newQueryParams.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (token0 && token1) {
      setData([
        {
          LiquidityName: `${token0.symbol}/${token1.symbol}`,
          Volume: "",
          APR: "%",
          Fees: "",
          PoolBalance: "",
        },
      ]);
    }
  }, [token0, token1]);

  useEffect(() => {
    if (chainId) {
      setInitialToken();
    }
  }, [chainId]);

  const setInitialToken = () => {
    let tokens_ = tokens.filter((item) => item.chainId == chainId);
    tokens_ = [...tokens_, ...stableTokens(chainId)];
    //@ts-expect-error ignore
    setFilteredTokenList(tokens_);
  };

  const handleDepositClick = () => {
    if (!token0 || !token1) {
      return;
    }

    // Construct URL with token parameters
    const queryParams = new URLSearchParams({
      token0: token0.address,
      token1: token1.address,
    });

    router.push(`/deposit?${queryParams.toString()}`);
  };

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
      component: () => {
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDepositClick()}
              className="flex items-center justify-center btn commonBtn rounded-lg h-[40px] px-4 font-medium"
            >
              New Deposit
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {tokenBeingSelected &&
        createPortal(
          <SelectTokenPopup
            tokenBeingSelected={tokenBeingSelected}
            onSelectToken={handleTokenSelect}
            onClose={() => setTokenBeingSelected(null)}
            chainId={chainId}
            tokens={filteredTokenList}
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
                        onClick={() => setTokenBeingSelected("token0")}
                      >
                        <span className="absolute right-2 icn">{downIcn}</span>
                        <div className="flex-shrink-0">
                          {token0 ? (
                            <Logo
                              chainId={chainId}
                              token={token0?.address}
                              margin={0}
                              height={20}
                            />
                          ) : (
                            addIcn
                          )}
                        </div>
                        <div className="content">
                          <p className="m-0 text-white/50 text-xs font-medium">
                            {token0 ? token0.symbol : "Select first token"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-6 col-span-12">
                      <div
                        className="flex items-center relative iconWithText cursor-pointer rounded-lg bg-[#000e0e] gap-3 px-4 py-5"
                        onClick={() => setTokenBeingSelected("token1")}
                      >
                        <span className="absolute right-2 icn">{downIcn}</span>
                        <div className="flex-shrink-0">
                          {token1 ? (
                            <Logo
                              chainId={chainId}
                              token={token1?.address}
                              margin={0}
                              height={20}
                            />
                          ) : (
                            addIcn
                          )}
                        </div>
                        <div className="content">
                          <p className="m-0 text-white/50 text-xs font-medium">
                            {token1 ? token1.symbol : "Select second token"}
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
                      {/* <div className="py-3">
                        <p className="m-0 text-white text-base">
                          Available Pools
                        </p>
                        <TableLayout column={column} data={data} />
                      </div> */}
                      {data && (
                        <div className="py-3">
                          <p className="m-0 text-white text-base">
                            Low Liquidity Pools
                          </p>
                          <TableLayout column={column} data={data} />
                        </div>
                      )}
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
