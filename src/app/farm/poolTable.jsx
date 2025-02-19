import Logo from "@/components/common/Logo";
import React from "react";
import styled from "styled-components";

import { useChainId } from "wagmi";

const PoolTable = ({ pools, setFarmPool }) => {
  const chainId = useChainId();
  return (
    <>
      <div className="top flex items-center justify-between gap-2">
        <input
          type="text"
          placeholder="search..."
          className="form-control bg-[#1a1919] text-xs h-[40px] w-full px-2 text-white font-medium"
        />
        <button className="border p-2 flex items-center justify-center border-[#1a1919]">
          {filterIcn}
        </button>
      </div>
      <TableWrpper className="overflow-auto mt-2 text-[#939393]">
        <table className="w-full caption-bottom text-sm border border-[#1a1919]">
          <thead className="">
            <tr>
              <th className="]">
                <div className="flex items-center gap-1 w-full group text-muted-foreground px-2 text-xs justify-start">
                  {" "}
                </div>
              </th>
              <th className="border-0">
                <div className="flex items-center gap-1 w-full group text-muted-foreground px-2 text-xs justify-start">
                  Asset{" "}
                </div>
              </th>
              <th className="border-0">
                <button
                  type="button"
                  tabIndex={0}
                  className="focus-visible:ring-ring whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs flex items-center gap-2 w-full group text-muted-foreground justify-end"
                  data-button-root=""
                >
                  <span className="w-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M5 7.75a.75.75 0 0 0-.53 1.28l7 7a.75.75 0 0 0 1.06 0l7-7A.75.75 0 0 0 19 7.75z"
                      />
                    </svg>
                  </span>{" "}
                  TVL{" "}
                </button>
              </th>
              <th className="border-0">
                <button
                  type="button"
                  tabIndex={0}
                  className="focus-visible:ring-ring whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs flex items-center gap-2 w-full group text-muted-foreground justify-end"
                  data-button-root=""
                >
                  <span className="w-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="0.63em"
                      height="1em"
                      viewBox="0 0 320 512"
                      className="group-hover:text-primary text-muted"
                    >
                      <path
                        fill="currentColor"
                        d="M137.4 41.4c12.5-12.5 32.8-12.5 45.3 0l128 128c9.2 9.2 11.9 22.9 6.9 34.9S301 224.1 288 224.1L32 224c-12.9 0-24.6-7.8-29.6-19.8s-2.2-25.7 6.9-34.9l128-128zm0 429.3l-128-128c-9.2-9.2-11.9-22.9-6.9-34.9S19.1 288 32.1 288h256c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-128 128c-12.5 12.5-32.8 12.5-45.3 0z"
                      />
                    </svg>
                  </span>{" "}
                  APR{" "}
                </button>
              </th>
              <th className="border-0">
                <div className="flex items-center gap-1 w-full group text-muted-foreground px-2 text-xs justify-end">
                  {" "}
                </div>
              </th>
            </tr>
          </thead>{" "}
          <tbody className="">
            {" "}
            {pools &&
              pools.map((item) => (
                <tr
                  className="hover:bg-muted/20 data-[state=selected]:bg-muted border-b transition-colors relative overflow-hidden border-t hover:cursor-pointer"
                  style={{}}
                  onClick={() => setFarmPool(item)}
                >
                  <td
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] mx-0"
                    style={{ maxWidth: 50, width: 50 }}
                  >
                    <div className="flex min-h-[37px] items-center justify-start">
                      <button className="focus-visible:ring-ring whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 flex items-center justify-center text-muted-foreground">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={16}
                          height={16}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide-icon lucide lucide-star"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>{" "}
                    </div>{" "}
                  </td>
                  <td
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] mx-0"
                    style={{}}
                  >
                    <div className="flex min-h-[37px] items-center justify-start">
                      <div className="flex items-center">
                        <Logo chainId={chainId} token={item?.token0?.id} />{" "}
                        <Logo chainId={chainId} token={item?.token1?.id} />{" "}
                        <div className="hidden items-center whitespace-nowrap text-sm text-foreground sm:flex">
                          {item?.token0?.symbol}/{item?.token1?.symbol}
                        </div>{" "}
                        <div className="tags svelte-1n2akg9 flex items-center">
                          <button className="hidden sm:flex">
                            <img
                              src="https://imagedelivery.net/tLQGX6fO2lhA7EXY2jvPQQ/project-uniswap/public"
                              alt="Uniswap logo"
                              title="Uniswap"
                              style={{ height: 30 }}
                            />
                          </button>{" "}
                          <button className="hidden sm:flex">
                            <span className="focus:ring-ring inline-flex select-none items-center rounded-md border py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent px-1.5">
                              {parseInt(item.feeTier) / 10000}%
                            </span>
                          </button>{" "}
                        </div>
                      </div>
                    </div>{" "}
                  </td>
                  <td
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] mx-0"
                    style={{ maxWidth: 170, width: 170 }}
                  >
                    <div className="flex min-h-[37px] items-center justify-end">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center justify-end gap-1 text-foreground">
                          {" "}
                          <button className="">
                            <span slot="trigger">
                              ${parseFloat(item.totalValueLockedUSD).toFixed(3)}
                            </span>
                          </button>{" "}
                        </div>{" "}
                        {/* <span className="flex items-center gap-2">
                          <img
                            src="https://imagedelivery.net/tLQGX6fO2lhA7EXY2jvPQQ/chain-42161/public"
                            alt="Arbitrum logo"
                            style={{ height: 30 }}
                            title="Arbitrum"
                          />{" "}
                        </span> */}
                      </div>
                    </div>{" "}
                  </td>
                  <td
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] mx-0"
                    style={{ maxWidth: 100, width: 100 }}
                  >
                    <div className="flex min-h-[37px] items-center justify-end">
                      <div className="flex items-center justify-end gap-1 text-foreground">
                        {" "}
                        <button className="">
                          <span slot="trigger">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={16}
                              height={16}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide-icon lucide lucide-asterisk"
                            >
                              <path d="M12 6v12" />
                              <path d="M17.196 9 6.804 15" />
                              <path d="m6.804 9 10.392 6" />
                            </svg>
                          </span>
                        </button>{" "}
                        58.81%
                      </div>
                    </div>{" "}
                  </td>
                  <td
                    className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] mx-0"
                    style={{ maxWidth: 50, width: 50 }}
                  >
                    <div className="flex min-h-[37px] items-center justify-end">
                      <button className="focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground text-foreground h-9 w-9">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={16}
                          height={16}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide-icon lucide lucide-arrow-down-to-line text-muted-foreground"
                        >
                          <path d="M12 17V3" />
                          <path d="m6 11 6 6 6-6" />
                          <path d="M19 21H5" />
                        </svg>
                      </button>
                    </div>{" "}
                  </td>
                </tr>
              ))}
            {/* <tr className="">
              <td colSpan={6} className="">
                <div className=" border border-[#1a1919] px-3 py-2 bg-[#1a1919]">
                  <span className="text-white font-bold">Pool</span>

                  <ul className="list-none pl-0 mb-0 text-xs">
                    <li className="flex py-1 items-center justify-between border-b border-[#4e4e4e]">
                      <span className="text-[#888]">In Range TVL</span>
                      <span className="text-[#888]">$48,600.74</span>
                    </li>
                    <li className="flex py-1 items-center justify-between border-b border-[#4e4e4e]">
                      <span className="text-[#888]">In Range TVL</span>
                      <span className="text-[#888]">$48,600.74</span>
                    </li>
                    <li className="flex py-1 items-center justify-between border-b border-[#4e4e4e]">
                      <span className="text-[#888]">In Range TVL</span>
                      <span className="text-[#888]">$48,600.74</span>
                    </li>
                  </ul>
                </div>
              </td>
            </tr> */}
          </tbody>
        </table>
      </TableWrpper>
    </>
  );
};

const TableWrpper = styled.div`
  td,
  th,
  tr {
    border: 0 !important;
  }
`;

export default PoolTable;

const filterIcn = (
  <svg
    width="20"
    height="20"
    stroke="currentColor"
    strokeWidth="1.5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="4" y1="21" y2="14"></line>
    <line x1="4" x2="4" y1="10" y2="3"></line>
    <line x1="12" x2="12" y1="21" y2="12"></line>
    <line x1="12" x2="12" y1="8" y2="3"></line>
    <line x1="20" x2="20" y1="21" y2="16"></line>
    <line x1="20" x2="20" y1="12" y2="3"></line>
    <line x1="2" x2="6" y1="14" y2="14"></line>
    <line x1="10" x2="14" y1="8" y2="8"></line>
    <line x1="18" x2="22" y1="16" y2="16"></line>
  </svg>
);
