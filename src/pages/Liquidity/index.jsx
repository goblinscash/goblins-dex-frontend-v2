import TableLayout from "@/Component/TableLayout";
import React, { useState } from "react";
import styled from "styled-components";
import p1 from "@/Assets/Images/logo.png";

const Liquidity = () => {
  const tabs = [
    {
      title: "Active",
      content: <>adafsdfasd</>,
    },
    {
      title: "Stable",
      content: <>asdfasdf23423</>,
    },
    {
      title: "Volatile",
      content: <>a2342134</>,
    },
    {
      title: "Concentrated",
      content: <>a2342134</>,
    },
    {
      title: "Incentivized",
      content: <>a2342134</>,
    },
  ];
  const column = [
    {
      head: "Liquidity Pool",
      accessor: "Liquidity",
      component: (item, key) => {
        return (
          <>
            <div className="d-flex align-items-center gap-10">
              <div className="imgWrp flex-shrink-0">
                <img
                  src={item.studentImg}
                  alt=""
                  style={{ height: 30, width: 30 }}
                  className="img-fluid object-fit-cover rounded-circle"
                />
              </div>
              <div className="content">
                <p className="m-0 text-muted">{item.student}</p>
              </div>
            </div>
          </>
        );
      },
    },
    { head: "APR", accessor: "APR" },
    {
      head: "Volume",
      accessor: "Volume",
      isComponent: true,
      //   component: (item, ind) => (
      //     <Form.Check
      //       type="switch"
      //       accessor="custom-switch"
      //       checked={item.status == "active" ? true : false}
      //       onClick={() => statusChangeHandler(item, ind)}
      //     />
      //   ),
    },
    {
      head: "Fees",
      accessor: "Fees",
    },
    {
      head: "Pool Balance",
      accessor: "PoolBalance",
    },
  ];
  const data = [
    {
      LiquidityName: "CL1-WETH/superOETHb",
      LiquidityIcn: [p1, p1, p1],
      Volume: "$487,904.63",
      APR: "5.0333%",
      Fees: "$195.16",
      PoolBalance: "5,400.42 WETH",
    },
    {
      LiquidityName: "CL1-WETH/superOETHb",
      LiquidityIcn: [p1, p1, p1],
      Volume: "$487,904.63",
      APR: "5.0333%",
      Fees: "$195.16",
      PoolBalance: "5,400.42 WETH",
    },
    {
      LiquidityName: "CL1-WETH/superOETHb",
      LiquidityIcn: [p1, p1, p1],
      Volume: "$487,904.63",
      APR: "5.0333%",
      Fees: "$195.16",
      PoolBalance: "5,400.42 WETH",
    },
  ];
  const [activeTab, setActiveTab] = useState(1);
  const showTab = (tab) => {
    console.log(tab, "tab");

    setActiveTab(tab);
  };
  return (
    <>
      <section className="Liquidity py-5 relative">
        <div className="container ">
          <div className="grid gap-3 grid-cols-12">
            <div className="col-span-12">
              <div className="flex items-center justify-between">
                <h4 className="m-0 font-bold text-2xl">Liquidity Pools</h4>
                <form action="">
                  <div className="relative iconWithText">
                    <span className="position-absolute icn left-2">
                      {search}
                    </span>
                    <input
                      placeholder="Search..."
                      type="search"
                      className="form-control text-xs h-[40px] pl-8 rounded bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)]"
                    />
                  </div>
                </form>
              </div>
            </div>
            <div className="col-span-12">
              <div className="w-full">
                <Nav
                  className="flex nav   flex-nowrap border-b gap-4 overflow-x-auto"
                  style={{ borderColor: "#2c2c2c" }}
                >
                  {tabs &&
                    tabs.length > 0 &&
                    tabs.map((item, key) => (
                      <button
                        key={key}
                        onClick={() => showTab(key)}
                        className={`${
                          activeTab === key && "active"
                        } tab-button font-medium relative py-2 flex-shrink-0  text-xs text-gray-400`}
                      >
                        {item.title}
                      </button>
                    ))}
                </Nav>
                <div className={` tabContent pt-3`}>
                  <TableLayout column={column} data={data} />
                  {/* {tabs &&
                    tabs.length > 0 &&
                    tabs.map((item, key) => {
                      if (activeTab !== key) return;
                      return (
                        <div
                          key={key}
                          id="tabContent1"
                          className={`tab-content border-0`}
                        >
                          {item.content}
                        </div>
                      );
                    })} */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

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

export default Liquidity;

const search = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 21L17 17M19 11C19 13.1217 18.1571 15.1566 16.6569 16.6569C15.1566 18.1571 13.1217 19 11 19C8.87827 19 6.84344 18.1571 5.34315 16.6569C3.84285 15.1566 3 13.1217 3 11C3 8.87827 3.84285 6.84344 5.34315 5.34315C6.84344 3.84285 8.87827 3 11 3C13.1217 3 15.1566 3.84285 16.6569 5.34315C18.1571 6.84344 19 8.87827 19 11Z"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-miterlimit="10"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
