import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import PositionManagementPopup from "@/components/modals/PositionManagementPopup";
import { userDeposits } from "@/utils/web3.utils";
import { useAccount, useChainId } from "wagmi";
import Loader from "@/components/Loader";
import Logo from "@/components/common/Logo";

const DepositTable = () => {
  const [position, setPosition] = useState();
  const [data, setData] = useState();
  const [nftPosition, setNftPosition] = useState();



  const chainId = useChainId();
  const { address } = useAccount();

  const fetchPositions = async () => {
    if (address) {
      const _position = await userDeposits(chainId, address)
      setData(_position)
    }
  }

  const openModal = (item) => {
    setNftPosition(item)
    setPosition(!position)
  }

  useEffect(() => {
    fetchPositions()
  }, [chainId, address])

  return (
    <>
      {!data && <Loader />}
      {position &&
        createPortal(
          <PositionManagementPopup
            position={position}
            nftPosition={nftPosition}
            setPosition={setPosition}
          />,
          document.body
        )}

      <TableWrpper className="overflow-auto mt-2 text-[#939393]">
        <table className="w-full caption-bottom text-sm border border-[#1a1919]">
          <thead className="">
            <tr>
              <th className="border-b border-[#272625]">
                <div className="flex items-center gap-1 w-full group text-muted-foreground px-2 text-xs justify-start">
                  {" "}
                </div>
              </th>
              <th className="border-b border-[#272625]">
                <div className="flex items-center gap-1 w-full group text-muted-foreground px-2 text-xs justify-start">
                  Asset{" "}
                </div>
              </th>
              <th className="border-b border-[#272625]">
                <div className="flex items-center gap-1 w-full group text-muted-foreground px-2 text-xs justify-start">
                  TokenId{" "}
                </div>
              </th>
              <th className="border-b border-[#272625]">
                <div className="flex items-center gap-1 w-full group text-muted-foreground px-2 text-xs justify-start">
                  Deposit{" "}
                </div>
              </th>
              <th className="border-b border-[#272625]">
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
                  Daily Reward{" "}
                </button>
              </th>
              <th className="border-b border-[#272625]">
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
                  Earned{" "}
                </button>
              </th>
              <th className="border-b border-[#272625]">
                <div className="flex items-center gap-1 w-full group text-muted-foreground px-2 text-xs justify-end">
                  APR
                </div>
              </th>
            </tr>
          </thead>{" "}
          <tbody className="">
            {" "}
            {
              data && data?.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => openModal(item)}
                  className="hover:bg-muted/20 data-[state=selected]:bg-muted border-b transition-colors relative overflow-hidden border-t hover:cursor-pointer"
                  style={{}}
                >
                  <td
                    className="p-3 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] mx-0 "
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
                    className="p-3 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] mx-0 "
                    style={{}}
                  >
                    <div className="flex min-h-[37px] items-center justify-start">
                      <div className="flex items-center">
                        <Logo chainId={chainId} token={item?.position?.token0} /> {" "}
                        <Logo chainId={chainId} token={item?.position?.token1} /> {" "}
                        <div className="hidden items-center whitespace-nowrap text-sm text-foreground sm:flex">
                          {item?.token0.symbol}/{item?.token1.symbol}
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
                            <span className="focus:ring-ring inline-flex select-none items-center rounded-md border .5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent px-1.5">
                              {parseFloat(item?.position?.fee) / 10000}%
                            </span>
                          </button>{" "}
                        </div>
                      </div>
                    </div>{" "}
                  </td>
                  <td
                    className="p-3 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] mx-0 "
                    style={{ maxWidth: 50, width: 50 }}
                  >
                    <div className="flex min-h-[37px] items-center">
                      <button className="focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground text-foreground h-9 w-9">
                        {item?.nftId}
                      </button>
                    </div>{" "}
                  </td>
                  <td
                    className="p-3 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] mx-0 "
                    style={{ maxWidth: 170, width: 170 }}
                  >
                    <div className="flex min-h-[37px] items-center">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center justify-end gap-1 text-foreground">
                          {" "}
                          <button className="">
                            <span slot="trigger">$8,816,345.78</span>
                          </button>{" "}
                        </div>{" "}
                      </div>
                    </div>{" "}
                  </td>
                  <td
                    className="p-3 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] mx-0 "
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
                    className="p-3 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] mx-0 "
                    style={{ maxWidth: 50, width: 50 }}
                  >
                    <div className="flex min-h-[37px] items-center justify-end">
                      <button className="focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground text-foreground h-9 w-9">
                        $0.03
                      </button>
                    </div>{" "}
                  </td>
                  <td
                    className="p-3 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] mx-0 "
                    style={{ maxWidth: 50, width: 50 }}
                  >
                    <div className="flex min-h-[37px] items-center justify-end">
                      <button className="focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground text-foreground h-9 w-9">
                        $38.39
                      </button>
                    </div>{" "}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </TableWrpper>
    </>
  );
};

const TableWrpper = styled.div`
  td,
  tr {
    border: 0 !important;
    text-align: left;
    min-width: 150px;
  }
`;

export default DepositTable;
