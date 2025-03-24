"use client";
import React, { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { locksByAccount, VeNFT } from "@/utils/sugar.utils";
import ListLayout from "@/components/lockRow";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/Images/logo.png"
import { formatTimestamp } from "@/utils/math.utils";

type Column = {
  accessor: string;
  component?: (item: VeNFT, key: number) => React.ReactNode; // Optional component property
  isComponent?: boolean; // For columns with specific components (like a switch)
};



const column: Column[] = [
  {
    accessor: "Lock",
    component: (item: VeNFT) => {
      return (
        <>
          <div className="flex items-center gap-2">
            <div className="bg-black rounded-xl p-2 flex items-center justify-center">
              <Image src={logo} alt="" height={10000} width={10000} className="max-w-full h-[30px] mx-auto w-auto object-contain" />
            </div>
            <div className="content">
              <h6 className="m-0 font-medium text-base">Lock #{item.id}</h6>
              <ul className="list-none pl-0 mb-0 flex items-center justify-start gap-2 mt-2">
                <li className="">
                  <Link href={""} className="font-medium text-xs text-blue-500">Increase</Link>
                </li>
                <li className="">
                  <Link href={""} className="font-medium text-xs text-blue-500">Extend</Link>
                </li>
                <li className="">
                  <Link href={""} className="font-medium text-xs text-blue-500">Merge</Link>
                </li>
                <li className="">
                  <Link href={""} className="font-medium text-xs text-blue-500">Transfer</Link>
                </li>
              </ul>
            </div>
          </div>
        </>
      );
    },
  },
  {
    accessor: "apr", component: (item: VeNFT) => {
      return (
        <>
          <p className="m-0 text-gray-500 text-xs">Rebase APR </p>
          <p className="m-0 text-base text-white">
            7.36432%
            {/* {calculateRebaseAPR(item.rebase_amount, item.voting_amount, item.decimals)}% */}
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

const Deposit = () => {
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


  console.log(locks, "locks")

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

export default Deposit;



