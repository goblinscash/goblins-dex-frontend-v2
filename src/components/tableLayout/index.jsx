"use client";
import React from "react";
import styled from "styled-components";

const TableLayout = ({ column, data }) => {
  return (
    <>
      <div className="overflow-x-auto">
        <Table className={` text-xs w-full`}>
          <thead>
            <tr>
              {column &&
                column.length > 0 &&
                column.map((item, index) => (
                  <th
                    key={index}
                    className="font-semibold p-3 border-0 text-left"
                  >
                    {item.head}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {data &&
              data.length > 0 &&
              data.map((rowData, rowIndex) => (
                <tr key={rowIndex}>
                  {column &&
                    column.length > 0 &&
                    column.map((item, colIndex) => {
                      if (item.component) {
                        return (
                          <td
                            key={colIndex}
                            className="border-0 p-3 capitalize fw-sbold"
                          >
                            {item.component(rowData, rowIndex, data)}
                          </td>
                        );
                      }

                      return (
                        <td
                          key={colIndex}
                          className="border-0 capitalize p-3 fw-sbold"
                        >
                          {rowData[item?.accessor]}
                        </td>
                      );
                    })}
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
      {/* <div className="text-right mt-1">
        <ul className="inline-flex rounded-full justify-end bg-[var(--backgroundColor2)]">
          <li>
            <button
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#00ff4e] text-gray-500 disabled:opacity-50 cursor-not-allowed"
              tabIndex={-1}
              type="button"
              disabled=""
              aria-label="Go to previous page"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
          </li>
          <li>
            <button
              className="w-8 h-8 rounded-full hover:bg-[#00ff4e] text-gray-700 font-medium cursor-pointer active:bg-blue-500 active:text-white"
              tabIndex={0}
              aria-current="page"
              aria-label="page 1"
            >
              1
            </button>
          </li>
          <li>
            <button
              className="w-8 h-8 rounded-full hover:bg-[#00ff4e] text-gray-700 font-medium cursor-pointer hover:bg-gray-200 active:bg-blue-500 active:text-white"
              tabIndex={0}
              aria-label="Go to page 2"
            >
              2
            </button>
          </li>
          <li>
            <button
              className="w-8 h-8 rounded-full hover:bg-[#00ff4e] text-gray-700 font-medium cursor-pointer hover:bg-gray-200 active:bg-blue-500 active:text-white"
              tabIndex={0}
              aria-label="Go to page 3"
            >
              3
            </button>
          </li>
          <li>
            <button
              className="w-8 h-8 rounded-full hover:bg-[#00ff4e] text-gray-700 font-medium cursor-pointer hover:bg-gray-200 active:bg-blue-500 active:text-white"
              tabIndex={0}
              aria-label="Go to page 4"
            >
              4
            </button>
          </li>
          <li>
            <button
              className="w-8 h-8 rounded-full hover:bg-[#00ff4e] text-gray-700 font-medium cursor-pointer hover:bg-gray-200 active:bg-blue-500 active:text-white"
              tabIndex={0}
              aria-label="Go to page 5"
            >
              5
            </button>
          </li>
          <li>
            <div className="w-8 h-8 rounded-full hover:bg-[#00ff4e] text-gray-700 flex items-center justify-center cursor-default">
              …
            </div>
          </li>
          <li>
            <button
              className="w-8 h-8 rounded-full hover:bg-[#00ff4e] text-gray-700 font-medium cursor-pointer hover:bg-gray-200 active:bg-blue-500 active:text-white"
              tabIndex={0}
              aria-label="Go to page 10"
            >
              10
            </button>
          </li>
          <li>
            <button
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#00ff4e] text-gray-500 cursor-pointer hover:bg-gray-200"
              tabIndex={0}
              type="button"
              aria-label="Go to next page"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </li>
        </ul>
      </div> */}
    </>
  );
};

const Table = styled.table`
  border-collapse: separate;
  border-spacing: 0 8px;
  font-size: 14px;
  th {
    background: var(--backgroundColor2);
    color: #666666;
  }
  tr {
    > *:first-child {
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
    }
    > *:last-child {
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }
  }
  td {
    background: #000e0e;
    color: #fff;
  }
`;

export default TableLayout;
