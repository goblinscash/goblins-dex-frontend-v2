"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SelectTokenPopup, { Token } from "@/components/modals/SelectTokenPopup";
import Logo from "@/components/common/Logo";
import { useAccount, useChainId } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import { getToken, tokens } from "@/utils/token.utils";
import { stableTokens } from "@/utils/constant.utils";
import ListLayout from "@/components/lockRow";
import { erc20Balance, fetchV2Pools } from "@/utils/web3.utils";
import Link from "next/link";
import { getUsdRates } from "@/utils/price.utils";
import { showCustomErrorToast, showErrorToast } from "@/utils/toast/toast.utils";
import { BtnLoader } from "@/components/common";

type Column = {
  accessor: string;
  component?: (item: Data, key: number) => React.ReactNode; // Optional component property
  isComponent?: boolean; // For columns with specific components (like a switch)
};

type Data = {
  pool: string;
  token0: string;
  token1: string;
  symbol: string;
  chainId: number;
  volume: string;
  apr: string;
  poolBalance: string;
  action: string;
  status: boolean;
  type: number;
};


const column: Column[] = [
  {
    accessor: "Lock",
    component: (item: Data, key: number) => {
      return (
        <div key={key} className="flex items-center gap-3">
          <ul className="list-none pl-3 mb-0 flex-shrink-0 flex items-center">
            <li className="" style={{ marginLeft: -10 }}>
              <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                <Logo chainId={item.chainId} token={item.token0} margin={0} height={20} />{" "}
              </div>
            </li>
            <li className="" style={{ marginLeft: -10 }}>
              <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                <Logo chainId={item.chainId} token={item.token1} margin={0} height={20} />{" "}
              </div>
            </li>
          </ul>
          <div className="content">
            <p className="m-0 text-muted">{item?.symbol}</p>
          </div>
        </div>
      )
    }
  },
  {
    accessor: "TVL", component: () => {
      return (
        <>
          <p className="m-0 text-gray-500 text-xs">TVL </p>
          <p className="m-0 text-base text-white">
            0 $
          </p>
        </>
      );
    },
  },
  {
    accessor: "APR",
    component: () => {
      return (
        <>
          <p className="m-0 text-gray-500 text-xs">APR </p>
          <p className="m-0 text-base text-white">
            0 %
          </p>
        </>
      );
    },
  },
  {
    accessor: "Action",
    component: (item: Data) => {
      const url = `/deposit?token0=${item.token0}&token1=${item.token1}&type=${item.type}`;
      return (
        <>
          <Link href={url} className="flex items-center justify-center rounded-xl font-semibold transition duration-[400ms] border border-[#454545] h-[38px] px-4 text-white hover:bg-[#00ff4e] hover:text-[#000]">

            {item.action}
          </Link>
        </>
      );
    },
  }
];

const Pools = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chainId = useChainId();
  const [token0, setToken0] = useState<Token | null>(null);
  const [token1, setToken1] = useState<Token | null>(null);
  const [stablePool, setStablePool] = useState<Data[]>([]);
  const [volatilePool, setVolatilePool] = useState<Data[]>([]);
  const [concentratedPool, setConcetratedPool] = useState<Data[]>([]);
  const [tokenBeingSelected, setTokenBeingSelected] = useState<
    "token0" | "token1" | null
  >(null);
  const [filteredTokenList, setFilteredTokenList] = useState<Token[]>([]);
  const [tokenListWithBalances, setTokenListWithBalances] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const { address } = useAccount();

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
    if (chainId && token0 && token1) {

      fetchPools()
    }
  }, [chainId, token0, token1]);

  useEffect(() => {
    if (chainId) {
      let tokens_ = tokens.filter((item) => item.chainId == chainId);
      tokens_ = [...tokens_, ...stableTokens(chainId)];
      setFilteredTokenList(tokens_ as Token[]); // Keep original filtered list

      if (address) {
        const fetchBalancesForList = async () => {
          const rates = await getUsdRates(chainId, tokens_.map((token) => token.address).filter((value, index, array) => array.indexOf(value) === index));
          const enrichedTokens = await Promise.all(
            tokens_.map(async (token) => {
              try {
                const balanceStr = await erc20Balance(chainId, token.address, token.decimals, address);
                return {
                  ...token,
                  balance: parseFloat(balanceStr) || 0,
                  priceRate: rates[token.address] || 0, // Use the fetched rate or fallback to 0
                };
              } catch (error) {
                console.error(`Failed to fetch balance for ${token.symbol} on chain ${chainId}`, error);
                return {
                  ...token,
                  balance: 0, // Fallback balance
                  price: 0,
                };
              }
            })
          );
          setTokenListWithBalances(enrichedTokens as Token[]);
        };
        fetchBalancesForList();
      } else {
        // If no address, set list with balances to 0
        setTokenListWithBalances(tokens_.map(t => ({ ...t, balance: 0 } as Token)));
      }
    }
  }, [chainId, address]);

  // const setInitialToken = () => { // Logic moved into useEffect above
  //   let tokens_ = tokens.filter((item) => item.chainId == chainId);
  //   tokens_ = [...tokens_, ...stableTokens(chainId)];
  //   //@ts-expect-error ignore
  //   setFilteredTokenList(tokens_);
  // };

  const fetchPools = async () => {
    try {
      if (!token0 || !token1) return;
      setLoading(true);
      const volatile = await fetchV2Pools(chainId, token0.address, token1.address, false);
      //@ts-expect-error ignore
      setVolatilePool(volatile);
      const stable = await fetchV2Pools(chainId, token0.address, token1.address, true);
      //@ts-expect-error ignore
      setStablePool(stable);
      // const v3Pool = await fetchV3Pools(chainId, token0.address, token1.address)    
      const symbol = `Concentrated AMM-${getToken(token0.address)?.name}/${getToken(token1.address)?.name}`
      setConcetratedPool([{
        pool: "",
        token0: token0.address,
        token1: token1.address,
        symbol: symbol,
        chainId: chainId,
        volume: "",
        apr: "",
        poolBalance: "",
        action: "Deposit",
        status: false,
        type: 1
      }])
      setLoading(false);
    } catch (error) {
      showCustomErrorToast("Unable to fetch pool data.")
      setLoading(false);
    }
  }

  return (
    <>
      {tokenBeingSelected &&
        createPortal(
          <SelectTokenPopup
            tokenBeingSelected={tokenBeingSelected}
            onSelectToken={handleTokenSelect}
            onClose={() => setTokenBeingSelected(null)}
            chainId={chainId}
            tokens={tokenListWithBalances}
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
                        className="flex items-center relative iconWithText cursor-pointer rounded-lg bg-[#000e0e] gap-3 px-3 py-3 sm:px-4 sm:py-4 md:py-5"
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
                            {token0 ? token0?.symbol : "Select a token"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-6 col-span-12">
                      <div
                        className="flex items-center relative iconWithText cursor-pointer rounded-lg bg-[#000e0e] gap-3 px-3 py-3 sm:px-4 sm:py-4 md:py-5"
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
                            {token1 ? token1.symbol : "Select a token"}
                          </p>
                        </div>
                      </div>
                    </div>
                    {token0?.address && token1?.address ? "" :
                      <div className="col-span-12">
                        <div className="flex items-center relative iconWithText cursor-pointer rounded-lg bg-[#000e0e] gap-3 px-3 py-3 sm:px-4 sm:py-4 md:py-5">
                          <span className="">{infoIcn}</span>
                          <div className="content">
                            <p className="m-0 text-white/50 text-xs font-medium">
                              Select your tokens first. Available liquidity pools for deposit will then appear.
                            </p>
                          </div>
                        </div>
                      </div>}


                    <div className="col-span-12">
                      <div className="py-2">
                        <h4 className="m-0 font-medium text-l">Available pools</h4>
                      </div>
                      <div className="w-full">
                        <div className="tabContent pt-3">
                          {
                            !loading ?

                              <>
                                {stablePool.length > 0 && stablePool[0]?.status == true && <ListLayout column={column} data={stablePool} />}
                                {volatilePool.length > 0 && volatilePool[0]?.status == true && <ListLayout column={column} data={volatilePool} />}
                              </> : <BtnLoader />

                          }
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12">
                      <div className="py-2">
                        <h4 className="m-0 font-medium text-l">Low liquidity pools</h4>
                      </div>
                      <div className="w-full">
                        <div className="tabContent pt-3">
                          {

                            !loading ? <>

                              {stablePool.length > 0 && stablePool[0]?.status == false && <ListLayout column={column} data={stablePool} />}
                              {volatilePool.length > 0 && volatilePool[0]?.status == false && <ListLayout column={column} data={volatilePool} />}
                            </> : <BtnLoader />

                          }
                        </div>
                      </div>
                    </div>

                    <div className="col-span-12">
                      <div className="py-2">
                        <h4 className="m-0 font-medium text-l">Concetrated pools</h4>
                      </div>
                      <div className="w-full">
                        <div className="tabContent pt-3">


                          {

                            !loading ? <>

                              {concentratedPool.length > 0 && concentratedPool[0]?.status == false && <ListLayout column={column} data={concentratedPool} />}
                            </> : <BtnLoader />

                          }

                        </div>
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