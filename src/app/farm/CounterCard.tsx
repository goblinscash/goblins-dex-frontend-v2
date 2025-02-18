import React from "react";

const CounterCard = () => {
  const data = [
    { title: "Total Deposit", value: "0" },
    { title: "Earned", value: "0" },
    { title: "Daily Rewards", value: "0" },
    { title: "APR", value: "0%" },
  ];
  return (
    <>
      <div className="grid gap-3 grid-cols-12">
        {data.map((item, key) => (
          <div
            key={key}
            className="lg:col-span-3 md:col-span-4 sm:col-span-6 col-span-12"
          >
            <div className="cardCstm rounded border lg:p-5 p-4 border-[#353231] bg-[#272625]">
              <h6 className="m-0 text-base font-bold">{item.title}</h6>
              <h4 className="m-0 text-2xl font-bold">{item.value}</h4>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default CounterCard;
