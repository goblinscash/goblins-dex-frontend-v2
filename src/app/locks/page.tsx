"use client";
import React, { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { locksByAccount, VeNFT } from "@/utils/sugar.utils";
import ListLayout from "@/components/lockRow";
import Link from "next/link";
import { calculateRebaseAPR, formatTimestamp } from "@/utils/math.utils";
import LockInteraction from "@/components/lockInteraction/LockInteraction";


type Column = {
  accessor: string;
  component?: (item: VeNFT, key: number) => React.ReactNode; // Optional component property
  isComponent?: boolean; // For columns with specific components (like a switch)
};



const column: Column[] = [
  {
    accessor: "Lock",
    component: (item: VeNFT) => <LockInteraction item={item} />
  },
  {
    accessor: "apr", component: (item: VeNFT) => {
      return (
        <>
          <p className="m-0 text-gray-500 text-xs">Rebase APR </p>
          <p className="m-0 text-base text-white">
            {calculateRebaseAPR(item.rebase_amount, item.amount, item.decimals)}%
          </p>
        </>
      );
    },
  },
  {
    accessor: "Locked Amount",
    component: (item: VeNFT) => {
      const amount = parseFloat(item.amount) / 10 ** parseInt(item.decimals)
      return (
        <>
          <p className="m-0 text-gray-500 text-xs">Locked Amount </p>
          <p className="m-0 text-base text-white">{amount.toFixed(5)} GOB
          </p>
        </>
      );
    },
  },
  {
    accessor: "Voting Power",
    component: (item: VeNFT) => {
      const votingPower = parseFloat(item.voting_amount) / 10 ** parseInt(item.decimals)
      return (
        <>
          <p className="m-0 text-gray-500 text-xs">Voting Power</p>
          <p className="m-0 text-base text-white">{votingPower.toFixed(5)} veGOB
          </p>
        </>
      );
    },
  },
  {
    accessor: "Unlock Date",
    component: (item: VeNFT) => {
      const formattedDate = item.expires_at === "0" ? "-" : formatTimestamp(Number(item.expires_at));
      return (
        <>
          <p className="m-0 text-gray-500 text-xs">Unlock Date</p>
          <p className="m-0 text-base text-white">{formattedDate}
          </p>
        </>
      );
    },
  }
];

const Locks = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const [locks, setLocks] = useState<VeNFT | null>(null);
  useEffect(() => {
    if (chainId && address) {
      fetchLocksByAccount()
    }
  }, [chainId, address]);

  const fetchLocksByAccount = async () => {
    if (!address) return
    const locks_ = await locksByAccount(chainId, address)
    setLocks(locks_)
  }

  return (
    <section className="Liquidity py-5 relative">
      <div className="container ">
        <div className="grid gap-3 grid-cols-12">
          <div className="col-span-12">
            <div className="flex items-center justify-between flex-wrap bg-[#000e0e] rounded-xl p-5">
              <h4 className="m-0 font-normal ">Gain greater voting power and higher rewards, by locking more tokens for longer.

              </h4>
              <form action="">
                <div className="flex items-center gap-3">
                  <Link
                    href={"/lock"}
                    className="flex items-center justify-center btn text-xs commonBtn rounded-lg h-[40px] px-4 font-medium "
                  >
                    Create Lock
                  </Link>
                </div>
              </form>
            </div>
          </div>
          <div className="col-span-12">
            <div className="py-2">
              <h4 className="m-0 font-medium text-xl">Lock</h4>
            </div>
            <div className="w-full">
              <div className="tabContent pt-3">
                <ListLayout column={column} data={locks} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Locks;



