import React from "react";
import styled from "styled-components";

const TableLayout = ({ column, data }) => {
  return (
    <>
      <div className="overflow-x-auto">
        <Table className={` text-xs w-full`}>
          <thead>
            <tr className="">
              {column &&
                column.length > 0 &&
                column.map((item, key) => (
                  <>
                    <th className="font-semibold p-3 border-0">{item.head}</th>
                  </>
                ))}
            </tr>
          </thead>
          <tbody>
            {data &&
              data?.length > 0 &&
              data.map((data, columnkey) => {
                return (
                  <tr>
                    {column &&
                      column.length > 0 &&
                      column.map((item, key) => {
                        if (item.component) {
                          return (
                            <td className="border-0 p-3 capitalize fw-sbold">
                              {item.component(data, columnkey, data)}
                            </td>
                          );
                        }

                        return (
                          <td className="border-0 capitalize p-3 fw-sbold">
                            {data[item?.accessor]}
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </div>
    </>
  );
};

const Table = styled.table`
  border-collapse: separate;
  border-spacing: 0 8px;
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
