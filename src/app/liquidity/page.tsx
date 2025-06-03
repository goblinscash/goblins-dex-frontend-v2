"use client";
import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import TableLayout from "@/components/tableLayout";
import { useChainId } from "wagmi";
import { all, FormattedPool } from "@/utils/sugar.utils";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp } from "lucide-react";
import { getToken } from "@/utils/token.utils";
import { CircularLoader } from "@/components/common";
import { fromUnits } from "@/utils/math.utils";
import VolumeCell from "@/components/listData/PoolVolume";
import ToolTipCopy from "@/components/ToolTipCopy/ToolTipCopy";

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

// Add sorting related types
type SortDirection = 'asc' | 'desc' | null;
type SortableDataType = 'string' | 'number' | 'custom';

type Column = {
  head: string;
  accessor: string;
  component?: (item: FormattedPool, key: number) => React.ReactNode; // Optional component property
  isComponent?: boolean; // For columns with specific components (like a switch)
  hasFixedHeight?: boolean; // Optional fixed height constraint
  sortable?: boolean; // Whether this column can be sorted
  dataType?: SortableDataType; // Type of data in this column for sorting
  headerComponent?: () => React.ReactNode; // Component for the header (including sort indicators)
  className?: string; // Additional class for the header
  onHeaderClick?: () => void; // Handler for header click
};

const tabs: Tab[] = [
  {
    title: "Active",
    content: <></>,
  },
  {
    title: "Volatile",
    content: <></>,
  },
  {
    title: "Stable",
    content: <></>,
  },
  {
    title: "Concentrated",
    content: <></>,
  },
];

const column: Column[] = [
  {
    head: "Liquidity Pool",
    accessor: "Liquidity",
    component: (item: FormattedPool, key: number) => {
      return (
        <div key={key} className="flex items-center gap-3">
          <ul className="list-none pl-3 mb-0 flex-shrink-0 flex items-center">
            <li className="" style={{ marginLeft: -10 }}>
              <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                <Logo
                  chainId={item.chainId}
                  token={item.token0}
                  margin={0}
                  height={20}
                />{" "}
              </div>
            </li>
            <li className="" style={{ marginLeft: -10 }}>
              <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                <Logo
                  chainId={item.chainId}
                  token={item.token1}
                  margin={0}
                  height={20}
                />{" "}
              </div>
            </li>
          </ul>
          <div className="content">
            <p className="m-0 text-muted">{item?.symbol || `cAMM-${getToken(item!.token0)!.symbol}/${getToken(item!.token1)!.symbol}`}</p>
          </div>
        </div>
      );
    },
  },
  { head: "APR", accessor: "apr" },
  {
    head: "Volume (24h)",
    accessor: "volume",
    isComponent: true,
    component: (item: FormattedPool) => <VolumeCell item={item} />,
  },
  {
    head: "Pool Fee",
    accessor: "pool_fee",
    component: (item: FormattedPool) => {
      return (
        <>
          {item.pool_fee}%
        </>
      )
    }
  },
  {
    head: "Pool Balance",
    accessor: "poolBalance",
    component: (item: FormattedPool) => {
      const token0Meta = getToken(item.token0);
      const token1Meta = getToken(item.token1);

      if (!token0Meta || !token1Meta) return <>...</>;

      const reserve0 = fromUnits(item.reserve0, token0Meta.decimals);
      const reserve1 = fromUnits(item.reserve1, token1Meta.decimals);

      return (
        <>
          {Number(reserve0) + Number(reserve1)}
        </>
      );
    }
  },
  {
    head: "",
    accessor: "action",
    component: (item: FormattedPool) => {
      const url = item.url || "/deposit";
      return (
        <>
          <details className="dropdown dropdown-end relative">
            <summary className="border-0 cursor-pointer p-0 flex items-center m-1">
              {moreIcn}
            </summary>
            <ul className="menu dropdown-content z-[1] bg-base-100 bg-white rounded-box w-48 sm:w-52 p-2 shadow-md text-dark absolute right-0 mt-2">
              <li className="border-b border-dashed border-[#000] py-1">
                <Link
                  href={url}
                  className="flex items-center text-black font-medium "
                >
                  Deposit
                </Link>
              </li>
              <li className="py-1">
                <Link
                  href={url}
                  className="flex items-center text-black font-medium "
                >
                  Withdraw
                </Link>
              </li>
            </ul>
          </details>
        </>
      );
    },
    hasFixedHeight: false
  },
];

const tabFilter = {
  0: undefined,
  1: -1,
  2: 0,
  3: 1,
} as const;

// SVG icon used in the component
const moreIcn = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.75 6.5C2.97981 6.5 3.20738 6.54526 3.4197 6.63321C3.63202 6.72116 3.82493 6.85006 3.98744 7.01256C4.14994 7.17507 4.27884 7.36798 4.36679 7.5803C4.45474 7.79262 4.5 8.02019 4.5 8.25C4.5 8.47981 4.45474 8.70738 4.36679 8.9197C4.27884 9.13202 4.14994 9.32493 3.98744 9.48744C3.82493 9.64994 3.63202 9.77884 3.4197 9.86679C3.20738 9.95473 2.97981 10 2.75 10C2.28587 10 1.84075 9.81563 1.51256 9.48744C1.18437 9.15925 1 8.71413 1 8.25C1 7.78587 1.18437 7.34075 1.51256 7.01256C1.84075 6.68437 2.28587 6.5 2.75 6.5ZM8 6.5C8.22981 6.5 8.45738 6.54526 8.6697 6.63321C8.88202 6.72116 9.07493 6.85006 9.23744 7.01256C9.39994 7.17507 9.52884 7.36798 9.61679 7.5803C9.70473 7.79262 9.75 8.02019 9.75 8.25C9.75 8.47981 9.70473 8.70738 9.61679 8.9197C9.52884 9.13202 9.39994 9.32493 9.23744 9.48744C9.07493 9.64994 8.88202 9.77884 8.6697 9.86679C8.45738 9.95473 8.22981 10 8 10C7.53587 10 7.09075 9.81563 6.76256 9.48744C6.43437 9.15925 6.25 8.71413 6.25 8.25C6.25 7.78587 6.43437 7.34075 6.76256 7.01256C7.09075 6.68437 7.53587 6.5 8 6.5ZM13.25 6.5C13.4798 6.5 13.7074 6.54526 13.9197 6.63321C14.132 6.72116 14.3249 6.85006 14.4874 7.01256C14.6499 7.17507 14.7788 7.36798 14.8668 7.5803C14.9547 7.79262 15 8.02019 15 8.25C15 8.47981 14.9547 8.70738 14.8668 8.9197C14.7788 9.13202 14.6499 9.32493 14.4874 9.48744C14.3249 9.64994 14.132 9.77884 13.9197 9.86679C13.7074 9.95473 13.4798 10 13.25 10C12.7859 10 12.3408 9.81563 12.0126 9.48744C11.6844 9.15925 11.5 8.71413 11.5 8.25C11.5 7.78587 11.6844 7.34075 12.0126 7.01256C12.3408 6.68437 12.7859 6.5 13.25 6.5Z"
      fill="#00ff4e"
    />
  </svg>
);

const Liquidity = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [pools, setPools] = useState<FormattedPool[]>([]);
  const [type, setType] = useState<number | undefined>(undefined);
  const [pagination, setPagination] = useState({
    count: 10,
    current_page: 1
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [minPoolBalance, setMinPoolBalance] = useState<string>("");
  const [minVolume, setMinVolume] = useState<string>("");
  const [minApr, setMinApr] = useState<string>("");

  // Add sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  }>({
    key: '',
    direction: null
  });

  // Helper function to parse poolBalance string like "$1,234.56" or "N/A" to number
  const parsePoolBalance = (balanceStr: string): number | null => {
    if (!balanceStr || balanceStr.toLowerCase() === "n/a") {
      return null;
    }
    // Remove $ and , then parse
    const numericStr = balanceStr.replace(/\$|,/g, "");
    const val = parseFloat(numericStr);
    return isNaN(val) ? null : val;
  };

  // Sorting function
  const requestSort = (key: string, dataType: SortableDataType) => {
    let direction: SortDirection = 'asc';

    if (sortConfig.key === key) {
      direction = sortConfig.direction === 'asc' ? 'desc' :
        sortConfig.direction === 'desc' ? null : 'asc';
    }

    setSortConfig({ key, direction });
  };

  // Create a header component with sort indicators
  const createSortableHeader = (title: string, key: string, dataType: SortableDataType) => {
    const SortableHeader = () => (
      <div className="flex items-center gap-1 hover:text-[#00ff4e]">
        <span>{title}</span>
        {sortConfig.key === key && sortConfig.direction && (
          <span className="ml-1">
            {sortConfig.direction === 'asc' ?
              <ArrowUp size={14} /> :
              <ArrowDown size={14} />
            }
          </span>
        )}
      </div>
    );
    SortableHeader.displayName = `SortableHeader(${key})`;
    return SortableHeader;
  };


  const filteredPools = useMemo(() => {
    return pools.filter((pool) => {
      const parsedMinPoolBalance = minPoolBalance ? parseFloat(minPoolBalance) : null;
      const parsedMinVolume = minVolume ? parseFloat(minVolume) : null;
      const parsedMinApr = minApr ? parseFloat(minApr) : null;

      // Pool Balance Filter
      if (parsedMinPoolBalance !== null) {
        const poolBalanceNum = parsePoolBalance(pool.poolBalance);
        if (poolBalanceNum === null || poolBalanceNum < parsedMinPoolBalance) {
          return false;
        }
      }

      // Volume Filter
      if (parsedMinVolume !== null) {
        if (pool.volume < parsedMinVolume) {
          return false;
        }
      }

      // APR Filter
      if (parsedMinApr !== null) {
        if (pool.apr < parsedMinApr) {
          return false;
        }
      }

      return true;
    });
  }, [pools, minPoolBalance, minVolume, minApr]);


  function tooltipHandler(item: FormattedPool) {
    console.log(item, "FormattedPoolFormattedPool")
  }

  // Define column configuration with sorting capabilities
  const column = useMemo<Column[]>(() => [
    {
      head: "Liquidity Pool",
      accessor: "symbol",
      component: (item: FormattedPool, key: number) => {
        return (
          <div key={key} className="flex items-center gap-3">
            <ul className="list-none pl-3 mb-0 flex-shrink-0 flex items-center">
              <li className="" style={{ marginLeft: -10 }}>
                <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                  <Logo
                    chainId={item.chainId}
                    token={item.token0}
                    margin={0}
                    height={20}
                  />{" "}
                </div>
              </li>
              <li className="" style={{ marginLeft: -10 }}>
                <div className="flex-shrink-0 flex items-center shadow-sm border border-gray-800 justify-center rounded-full bg-[#000] p-1">
                  <Logo
                    chainId={item.chainId}
                    token={item.token1}
                    margin={0}
                    height={20}
                  />{" "}
                </div>
              </li>
            </ul>
            <ToolTipCopy address={item.lp}>
              <div className="content" onMouseOver={() => tooltipHandler(item)}>
                <p className="m-0 text-muted">{item?.symbol || `cAMM-${getToken(item!.token0)!.symbol}/${getToken(item!.token1)!.symbol}`}</p>
              </div>
            </ToolTipCopy>
          </div>
        );
      },
      sortable: true,
      dataType: 'string',
      headerComponent: createSortableHeader("Liquidity Pool", "symbol", 'string'),
      onHeaderClick: () => requestSort("symbol", 'string')
    },
    {
      head: "APR",
      accessor: "apr",
      sortable: true,
      dataType: 'number',
      headerComponent: createSortableHeader("APR", "apr", 'number'),
      onHeaderClick: () => requestSort("apr", 'number')
    },
    {
      head: "Volume (24h)",
      accessor: "volume",
      isComponent: true,
      component: (item: FormattedPool) => {
        return (
          <>
            {item.volume}
          </>
        )
      },
      sortable: true,
      dataType: 'number',
      headerComponent: createSortableHeader("Volume (24h)", "volume", 'number'),
      onHeaderClick: () => requestSort("volume", 'number')
    },
    {
      head: "Pool Fee",
      accessor: "pool_fee",
      component: (item: FormattedPool) => {
        return (
          <>
            {item.pool_fee}%
          </>
        )
      },
      sortable: true,
      dataType: 'number',
      headerComponent: createSortableHeader("Pool Fee", "pool_fee", 'number'),
      onHeaderClick: () => requestSort("pool_fee", 'number')
    },
    {
      head: "Pool Balance",
      accessor: "poolBalance",
      component: (item: FormattedPool) => {
        const token0Meta = getToken(item.token0);
        const token1Meta = getToken(item.token1);

        if (!token0Meta || !token1Meta) return <>...</>;

        const reserve0 = fromUnits(item.reserve0, token0Meta.decimals);
        const reserve1 = fromUnits(item.reserve1, token1Meta.decimals);

        return (
          <>
            {Number(reserve0) + Number(reserve1)}
          </>
        );
      },
      sortable: true,
      dataType: 'number',
      headerComponent: createSortableHeader("Pool Balance", "poolBalance", 'number'),
      onHeaderClick: () => requestSort("poolBalance", 'number')
    },
    {
      head: "",
      accessor: "action",
      component: (item: FormattedPool) => {
        const url = item.url || "/deposit";
        return (
          <>
            <details className="dropdown dropdown-end relative">
              <summary className="border-0 cursor-pointer p-0 flex items-center m-1">
                {moreIcn}
              </summary>
              <ul className="menu dropdown-content z-[1] bg-base-100 bg-white rounded-box w-48 sm:w-52 p-2 shadow-md text-dark absolute right-0 mt-2">
                <li className="border-b border-dashed border-[#000] py-1">
                  <Link
                    href={url}
                    className="flex items-center text-black font-medium "
                  >
                    Deposit
                  </Link>
                </li>
                <li className="py-1">
                  <Link
                    href={url}
                    className="flex items-center text-black font-medium "
                  >
                    Withdraw
                  </Link>
                </li>
              </ul>
            </details>
          </>
        );
      },
      hasFixedHeight: false
    },
  ], [sortConfig, requestSort, createSortableHeader]);

  // Sort data based on current sort configuration
  const sortedData = useMemo(() => {
    if (!sortConfig.direction || !sortConfig.key) {
      return filteredPools;
    }

    return [...filteredPools].sort((a, b) => {
      // Find the column configuration for this key to determine data type
      const columnConfig = column.find(col => col.accessor === sortConfig.key);
      if (!columnConfig) return 0;

      let aValue, bValue;

      // Handle special cases for different columns
      if (sortConfig.key === 'poolBalance') {
        aValue = parsePoolBalance(a.poolBalance) || 0;
        bValue = parsePoolBalance(b.poolBalance) || 0;
      } else if (columnConfig.dataType === 'number') {
        // For numerical columns like APR, volume, etc.
        aValue = Number(a[sortConfig.key as keyof FormattedPool] || 0);
        bValue = Number(b[sortConfig.key as keyof FormattedPool] || 0);
      } else if (columnConfig.dataType === 'string') {
        // For string columns like pool name
        aValue = String(a[sortConfig.key as keyof FormattedPool] || '').toLowerCase();
        bValue = String(b[sortConfig.key as keyof FormattedPool] || '').toLowerCase();
      } else {
        // Default case
        aValue = a[sortConfig.key as keyof FormattedPool];
        bValue = b[sortConfig.key as keyof FormattedPool];
      }

      // Determine sort direction
      if (sortConfig.direction === 'asc') {
        //@ts-expect-error ignore
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        //@ts-expect-error ignore
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [filteredPools, sortConfig, column]);

  const showTab = (tab: number) => {
    setActiveTab(tab);
    setType(tabFilter[tab as keyof typeof tabFilter]);
  };

  const chainId = useChainId();

  function handlePagination(actionType: string) {
    if (!chainId) return;

    let nextPage = pagination.current_page;

    if (actionType === "left" && nextPage > 1) {
      nextPage -= 1;
    } else if (actionType === "right") {
      nextPage += 1;
    } else {
      return; // No valid pagination movement
    }

    const offset = (nextPage - 1) * pagination.count;

    // Show loading while fetching next page data
    setIsLoading(true);

    // Check next page data first
    all(chainId, pagination.count, offset, type).then((result) => {
      if (result && result.length > 0) {
        setPools(result);
        setPagination((prev) => ({
          ...prev,
          current_page: nextPage,
        }));
      } else {
        // optional: show message like "No more records"
        console.log("No data on next page, not changing pagination.");
      }
      setIsLoading(false);
    });
  }

  useEffect(() => {

  }, [pagination.current_page]);

  useEffect(() => {
    if (chainId) {
      setIsLoading(true);
      const offset = pagination.count * (pagination.current_page - 1);
      all(chainId, pagination.count, offset, type)
        .then((result) => {
          setPools(result);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error fetching pool data:", error);
          setIsLoading(false);
        });
    }
  }, [chainId, type]);

  return (
    <section className="Liquidity py-5 relative">
      <div className="container ">
        <div className="grid gap-3 grid-cols-12">
          <div className="col-span-12">
            <div className="flex items-center justify-between flex-wrap">
              <h4 className="m-0 font-bold text-xl sm:text-2xl">Liquidity Pools</h4>
              <form action="">
                <div className="flex items-center gap-3">
                  <Link
                    href={"/pools"}
                    className="flex items-center justify-center btn text-xs commonBtn rounded-lg h-[40px] px-4 font-medium "
                  >
                    Deposit Liquidity
                  </Link>
                </div>
              </form>
            </div>
          </div>
          <div className="col-span-12 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="minPoolBalance" className="block text-sm font-medium text-white mb-1">Min. Pool Balance</label>
                <input
                  type="number"
                  name="minPoolBalance"
                  id="minPoolBalance"
                  value={minPoolBalance}
                  onChange={(e) => setMinPoolBalance(e.target.value)}
                  placeholder="e.g., 1000"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2.5"
                />
              </div>
              <div>
                <label htmlFor="minVolume" className="block text-sm font-medium text-white mb-1 ">Min. Volume (24h)</label>
                <input
                  type="number"
                  name="minVolume"
                  id="minVolume"
                  value={minVolume}
                  onChange={(e) => setMinVolume(e.target.value)}
                  placeholder="e.g., 10000"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2.5"
                />
              </div>
              <div>
                <label htmlFor="minApr" className="block text-sm font-medium text-white mb-1">Min. APR (%)</label>
                <input
                  type="number"
                  name="minApr"
                  id="minApr"
                  value={minApr}
                  onChange={(e) => setMinApr(e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2.5"
                />
              </div>
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
                        } tab-button font-medium relative py-2 flex-shrink-0  text-xs text-[#00ff4e]`}
                    >
                      {item.title}
                    </button>
                  ))}
              </Nav>
              <div className="tabContent pt-3">
                {isLoading ? (
                  <div className="py-20">
                    <CircularLoader size={50} />
                  </div>
                ) : (
                  <>
                    <TableLayout column={column} data={sortedData} />
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <button
                        onClick={() => handlePagination("left")}
                        disabled={pagination.current_page === 1 && filteredPools.length === 0}
                        className="p-2 rounded-full border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <span className="text-sm font-medium px-3 py-1 border rounded-md border-gray-600">
                        {pagination.current_page || 1}
                      </span>

                      <button
                        onClick={() => handlePagination("right")}
                        disabled={filteredPools.length < pagination.count}
                        className="p-2 rounded-full border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Liquidity;
