import React, { useEffect, useState } from "react";
import Select, { components, StylesConfig } from "react-select";
import { ToggleSwitch } from "@/components/common";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { UniswapContract, uniswapContracts, vfatContracts, zeroAddr } from "@/utils/config.utils";
import { getDepositParams } from "@/utils/farmData.utils";
import { ethers } from "ethers";
import farmStrategyAbi from "../../abi/farmStrategy.json"
import { useAccount, useChainId } from "wagmi";
import { fetchNftBalance, userDeposits } from "@/utils/web3.utils";

type OptionType = {
  value: string;
  label: string;
  image: string;
};

// Custom styles
const customStyles: StylesConfig<OptionType, false> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#1a1919", // Background color of select
    borderColor: state.isFocused ? "#353231" : "#353231", // Border color
    color: "#333", // Text color
    boxShadow: state.isFocused ? "none" : "none",
    "&:hover": {
      borderColor: "unset", // Border color on hover
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#007bff", // Color of selected value
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#353231",
    borderRadius: 10,
  }),
  menuList: (provided) => ({
    ...provided,
    backgroundColor: "#353231", // Change menu list background color
    color: "#fff", // Text color of menu list
    borderRadius: 6,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#1a1919" // Background of selected option
      : state.isFocused
        ? "#1a1919" // Background on hover
        : "#353231", // Default background

    color: state.isSelected ? "#fff" : "#fff", // Text color
    "&:hover": {
      backgroundColor: "#1a1919",
      color: "#fff",
    },
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: 0,
  }),
};

// Custom Dropdown Indicator component
const CustomDropdownIndicator: React.FC = (props) => {
  return (
    //@ts-expect-error warning
    <components.DropdownIndicator {...props}>
      <div className="pr-1">{exhangeIcn}</div>
    </components.DropdownIndicator>
  );
};

//@ts-expect-error warning
const SingleValue: React.FC = ({ data }) => (
  <div className="flex items-center gap-2 text-white">
    <img
      src={data.image}
      alt={data.label}
      style={{ width: 20, height: 20, marginRight: 8 }}
    />
    {data.label}
  </div>
);

const CustomOption: React.FC = (props) => {
  //@ts-expect-error any type
  const { data, innerRef, innerProps } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      style={{ display: "flex", alignItems: "center", padding: "10px" }}
    >
      <img
        src={data.image}
        alt={data.label}
        style={{ width: 20, height: 20, marginRight: 8 }}
      />
      {data.label}
    </div>
  );
};

const FarmingCard = () => {
  const options: OptionType[] = [
    {
      value: "apple",
      label: "Apple",
      image: "https://via.placeholder.com/20/FF0000/FFFFFF?text=A",
    },
    {
      value: "banana",
      label: "Banana",
      image: "https://via.placeholder.com/20/FFD700/000000?text=B",
    },
    {
      value: "cherry",
      label: "Cherry",
      image: "https://via.placeholder.com/20/8B0000/FFFFFF?text=C",
    },
  ];

  const signer = useEthersSigner();
  const chainId = useChainId()
  const { address } = useAccount()

  const [data, setData] = useState({
    amount0Desired: "",
    amount1Desired: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const positions = async() => {
    if(address){
      const position = await userDeposits(chainId, address)
      console.log(position, "+++****")
    }
  }

  useEffect(() => {
    positions()
  }, [chainId, address])

  const deposit = async () => {
    if(!address) return     
    if (!chainId) return null
    const uniswapContract = uniswapContracts[Number(chainId)] as UniswapContract;
    const tokenId = 0
    const token0 = "0x067Fe9C33b6c1B4750ED60357d25b9Eb29Ef8c7f"
    const token1 = "0x6AE97D8132619521bf16256a2cEEA4850866d496"

    const pool = "0xF9f6FE6d14c0F8653F35a4e8A3875a489f2AF0Ff"
    const zero = zeroAddr
    const tickLower = -120
    const tickUpper = 120
    const fee = 3000

    const { params, settings, sweepTokens, approved, referralCode } = getDepositParams(
      uniswapContract.nfpm as string,
      tokenId,
      token0,
      token1,
      data.amount0Desired,
      data.amount1Desired,
      0,
      0,
      pool,
      zero,
      tickLower,
      tickUpper,
      fee
    );


    try {
      const nftFarmStrategy = new ethers.Contract(
        vfatContracts[Number(chainId)].NftFarmStrategy as string,
        farmStrategyAbi,
        await signer
      );

      const tx = await nftFarmStrategy.deposit(
        params,
        settings,
        sweepTokens,
        approved,
        referralCode,
        { gasLimit: 8000000 }
      );

      console.log("Transaction Hash:", tx.hash);
      await tx.wait();
      console.log("Deposit Successful!");
    } catch (error) {
      //@ts-expect-error warning
      console.error("Transaction Failed:", error?.message);
    }
  }

  return (
    <>
      {" "}
      <div className="p-3 rounded border bg-[#272625] border-[#6a6a6a]">
        <div className="top">
          <div className="flex items-center justify-between gap-2">
            <div className="left">
              <h4 className="font-bold text-white text-base">
                CL1-WETH/superOETHb on Base
              </h4>
              <ul className="list-none pl-0 mb-0 flex items-center gap-1">
                <li className="">
                  <button className="text-xs bg-[#4f4b4a] px-2 py-1 rounded font-semibold text-white flex items-center justify-center hover:bg-secondary/80">
                    Aerodrome
                  </button>
                </li>
                <li className="">
                  <button className="text-xs bg-[#4f4b4a] px-2 py-1 rounded font-semibold text-white flex items-center justify-center hover:bg-secondary/80">
                    0.04%
                  </button>
                </li>
              </ul>
            </div>
            <div className="right">
              <button className="btn flex items-center justify-center font-semibold text-white bg-[#4f4b4a] rounded shadow h-[40px] hover:bg-secondary/80">
                View Farm
              </button>
            </div>
          </div>
          <div className="mt-2">
            <div className="p-1 inline-flex items-center rounded bg-[#353231]">
              <button className="flex items-center rounded bg-[#000] justify-center px-3 py-1 text-xs font-medium ">
                Price in superOETHb
              </button>
              <button className="flex items-center justify-center px-3 py-1 font-medium text-xs">
                Price in WETH
              </button>
            </div>
          </div>
        </div>
        <div className="cstmBody">
          <div className="py-2">
            <span className="text-xs font-medium">Token to send</span>
            <div className="relative iconWithText">
              <span className="icn absolute">{exhangeIcn}</span>
              <Select
                // menuIsOpen
                components={{
                  DropdownIndicator: CustomDropdownIndicator,
                  IndicatorSeparator: () => null, // Removes default separator
                  Option: CustomOption,
                  SingleValue,
                }}
                styles={customStyles}
                classNamePrefix={"goblin"}
                options={options}
              />
            </div>
          </div>
          <div className="py-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-medium">USDT Amount</span>
              <span className="text-xs text-gray-400">Balance: 0</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <input
                name="amount0Desired"
                onChange={handleChange}
                type="text"
                className="form-control bg-[#1a1919] text-xs h-[40px] w-full px-2 text-white font-medium"
              />
              <input
                type="text"
                className="form-control bg-[#1a1919] text-xs h-[40px] px-2 text-white font-medium"
                style={{ maxWidth: 60 }}
              />
            </div>
            <div className="mt-1">
              <input type="range" className="form-control w-full" />
              <p className="text-right text-xs font-gray-400">0%</p>
            </div>
          </div>
          <div className="py-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-medium">USDC Amount</span>
              <span className="text-xs text-gray-400">Balance: 0</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <input
                name="amount1Desired"
                onChange={handleChange}
                type="text"
                className="form-control bg-[#1a1919] text-xs h-[40px] w-full px-2 text-white font-medium"
              />
              <input
                type="text"
                className="form-control bg-[#1a1919] text-xs h-[40px] px-2 text-white font-medium"
                style={{ maxWidth: 60 }}
              />
            </div>
            <div className="mt-1">
              <input type="range" className="form-control w-full" />
              <p className="text-right text-xs font-gray-400">0%</p>
            </div>
          </div>
          <div className="py-2">
            <div className="py-2">
              <div className="my-1 flex items-center justify-between gap-10 rounded p-2 bg-[#1a1919]">
                <div className="left flex items-center gap-2">
                  <span className="icn">{icn1}</span>
                  <span className="">Automate Rebalancing</span>
                </div>
                <ToggleSwitch />
              </div>
              <div className="my-1 flex items-center justify-between gap-10 rounded p-2 bg-[#1a1919]">
                <div className="left flex items-center gap-2">
                  <span className="icn">{icn1}</span>
                  <span className="">Automate Rebalancing</span>
                </div>
                <ToggleSwitch />
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => deposit()}
                className="flex w-full rounded text-black items-center justify-center bg-white px-2 py-2 font-medium"
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FarmingCard;

const exhangeIcn = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 16 4 4 4-4"></path>
    <path d="M7 20V4"></path>
    <path d="m21 8-4-4-4 4"></path>
    <path d="M17 4v16"></path>
  </svg>
);

const icn1 = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M12 8V4H8"></path>
    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
    <path d="M2 14h2"></path>
    <path d="M20 14h2"></path>
    <path d="M15 13v2"></path>
    <path d="M9 13v2"></path>
  </svg>
);
