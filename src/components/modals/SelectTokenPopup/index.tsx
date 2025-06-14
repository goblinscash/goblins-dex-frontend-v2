"use client";
import { fetchTokenDetails } from "@/utils/web3.utils";
import React, { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import { shortenPubkey } from "@/utils/math.utils";
import Logo from "@/components/common/Logo";
import { tokens } from "@/utils/token.utils";

export type Token = typeof tokens[0] & { balance?: number, priceRate?: number };

interface SelectTokenPopupProps {
  tokenBeingSelected: "token0" | "token1" | "token";
  onSelectToken: (token: Token) => void;
  onClose: () => void;
  chainId: number;
  tokens: Token[];
}

const SelectTokenPopup: React.FC<SelectTokenPopupProps> = ({ tokenBeingSelected, onSelectToken, onClose, chainId, tokens }) => {
  const [tokenList, setTokenList] = useState<Token[]>([...tokens]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Function to fetch token details with debouncing
  const fetchToken = useCallback(
    debounce(async (query) => {
      setLoading(true);
      setError(null);

      if (!query) {
        setLoading(false);
        setTokenList([...tokens]); // Reset to original token list
        return;
      };

      try {
        const filtered = tokenList.filter((token) =>
          token.symbol.toLowerCase().includes(query.toLowerCase()) ||
          token.name.toLowerCase().includes(query.toLowerCase()) ||
          token.address.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length > 0) {
          setTokenList(filtered);
          return;
        }

        const token = await fetchTokenDetails(chainId, query);
        if (token) {
          setTokenList([token as unknown as Token]); // Store token in state
        } else {
          setTokenList([]);
          setError("Token not found");
        }
      } catch (err) {
        setTokenList([]);
        setError("Failed to fetch token details");
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (chainId) {
      setTokenList([...tokens])
    }
  }, [chainId])

  // Handle input change
  const handleChange = (e: { target: { value: string; }; }) => {
    const value = e.target.value.trim();
    setSearchQuery(value);
    fetchToken(value);
  };

  return (
    <div className="fixed z-[9999] inset-0 flex items-center justify-center cstmModal">
      <div className="absolute inset-0 bg-black z-[9] opacity-70" onClick={onClose}></div>
      <div className="modalDialog relative p-4 px-lg-5 mx-auto rounded-lg z-[9999] bg-[#272625] w-full max-w-[500px] overflow-scroll">
        <button onClick={onClose} className="border-0 p-0 absolute top-2 right-2">
          {cross}
        </button>
        <div className="top">
          <h4 className="m-0 font-bold text-xl">
            Select {tokenBeingSelected === "token0" ? "First" : "Second"} Token
          </h4>
          <form className="pt-4">
            <div className="iconWithText relative">
              <span className="absolute icn left-2">{search}</span>
              <input
                placeholder="Search tokens"
                type="search"
                value={searchQuery}
                onChange={handleChange}
                className="form-control w-full text-xs h-[40px] pl-8 rounded bg-[var(--backgroundColor2)] focus:bg-[var(--backgroundColor2)] border-0"
              />
            </div>
          </form>
        </div>

        <div className="cstmBody py-3">
          {loading ? (
            <p className="text-white text-center">Loading...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <ul className="list-none pl-0 mb-0 overflow-auto" style={{ maxHeight: "calc(100vh - 210px)", scrollbarWidth: "none" }}>
              {tokenList?.length > 0 ? (
                tokenList.map((token, index) => (
                  <li
                    key={index}
                    className="p-3 rounded-lg flex items-center transition duration-[400ms] ease-in-out justify-between hover:bg-[#000]"
                    onClick={() => onSelectToken(token)}
                  >
                    <div className="left flex items-center gap-4">
                      <div className="icnWrp">
                        <Logo chainId={chainId} token={token.address} margin={0} />{" "}
                      </div>
                      <div className="content">
                        <p className="m-0 text-white font-medium text-base">{token.symbol}</p>
                        <p className="m-0 text-xs text-gray-500">{shortenPubkey(token.address)}</p>
                      </div>
                    </div>
                    <div className="right text-right">
                      <p className="m-0 text-white font-medium text-base">
                        {typeof token.balance === 'number' ? token.balance.toFixed(4) : '0.0'}
                      </p>
                      <p className="m-0 text-xs text-gray-500">~${`${((token.balance ?? 0) * (token.priceRate ?? 0)).toFixed(2)}`}</p> {/* USD value can remain or be updated if available later */}
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-center">No tokens found</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelectTokenPopup;


const cross = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 17L1 1M17 1L1 17"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

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
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const icn1 = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 32 32"
  >
    <g fill="none" transform="translate(0 .48)">
      <circle cx="14.418" cy="14.418" r="14.418" fill="#000" />
      <path
        fill="#FF0079"
        d="M14.4183909,27.8068966 C21.8126584,27.8068966 27.8068966,21.8126583 27.8068966,14.4183908 C27.8068966,7.02412326 21.8126584,1.02988506 14.4183909,1.02988506 C7.02412329,1.02988506 1.02988509,7.02412326 1.02988509,14.4183908 C1.02988509,21.8126583 7.02412329,27.8068966 14.4183909,27.8068966 Z"
      />
      <circle cx="17.508" cy="16.478" r="13.389" fill="#FFF" />
      <path
        fill="#000"
        d="M17.508046,30.8965517 C9.54498862,30.8965517 3.08965517,24.4412183 3.08965517,16.4781609 C3.08965517,8.51510356 9.54498862,2.05977012 17.508046,2.05977012 C25.4711033,2.05977012 31.9264367,8.51510356 31.9264367,16.4781609 C31.9264367,24.4412183 25.4711033,30.8965517 17.508046,30.8965517 Z M17.508046,29.8666667 C24.9023135,29.8666667 30.8965517,23.8724285 30.8965517,16.4781609 C30.8965517,9.08389337 24.9023135,3.08965517 17.508046,3.08965517 C10.1137784,3.08965517 4.11954023,9.08389337 4.11954023,16.4781609 C4.11954023,23.8724285 10.1137784,29.8666667 17.508046,29.8666667 Z"
      />
      <path
        fill="#000"
        d="M12.3465428,20.0053161 L10.8765867,20.0053161 L10.0520788,16.529454 C10.0215413,16.4057465 9.96948954,16.1500378 9.89592196,15.7623204 C9.82235439,15.3746029 9.78001896,15.1143684 9.76891442,14.9816092 C9.75225762,15.144541 9.71061622,15.4062841 9.64398897,15.7668462 C9.57736174,16.1274084 9.52600401,16.3846257 9.48991426,16.5385057 L8.66957048,20.0053161 L7.20377854,20.0053161 L5.6505388,13.3885057 L6.92061418,13.3885057 L7.69931615,17.0001437 C7.83534676,17.6669574 7.93389808,18.2447533 7.99497305,18.7335488 C8.01162986,18.5615652 8.04980114,18.2952963 8.10948805,17.9347342 C8.16917495,17.574172 8.22539084,17.2943257 8.2781374,17.0951868 L9.16510809,13.3885057 L10.3852133,13.3885057 L11.272184,17.0951868 C11.3110499,17.2611359 11.3596315,17.5145816 11.4179303,17.8555316 C11.4762292,18.1964815 11.5206467,18.4891511 11.5511841,18.7335488 C11.5789456,18.4982028 11.623363,18.204779 11.684438,17.8532686 C11.745513,17.5017583 11.8010348,17.2173862 11.8510053,17.0001437 L12.625543,13.3885057 L13.8956184,13.3885057 L12.3465428,20.0053161 Z M18.1680688,20.0053161 L14.6618279,20.0053161 L14.6618279,13.3885057 L18.1680688,13.3885057 L18.1680688,14.5380747 L15.9527241,14.5380747 L15.9527241,15.9908765 L18.0139941,15.9908765 L18.0139941,17.1404454 L15.9527241,17.1404454 L15.9527241,18.8466954 L18.1680688,18.8466954 L18.1680688,20.0053161 Z M21.7867426,20.0053161 L20.4958463,20.0053161 L20.4958463,14.5561782 L18.8426662,14.5561782 L18.8426662,13.3885057 L23.4399227,13.3885057 L23.4399227,14.5561782 L21.7867426,14.5561782 L21.7867426,20.0053161 Z M29.3655531,20.0053161 L28.0788211,20.0053161 L28.0788211,17.1494972 L25.6677599,17.1494972 L25.6677599,20.0053161 L24.3768636,20.0053161 L24.3768636,13.3885057 L25.6677599,13.3885057 L25.6677599,15.9818247 L28.0788211,15.9818247 L28.0788211,13.3885057 L29.3655531,13.3885057 L29.3655531,20.0053161 Z"
      />
    </g>
  </svg>
);