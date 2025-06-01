"use client";
import React, { useState, useEffect } from 'react';
import { tokens } from "@/utils/token.utils";
import { useAccount, useChainId } from "wagmi";
import Logo from '@/components/common/Logo';
import TableLayout from '@/components/tableLayout';
import { erc20Balance } from '@/utils/web3.utils';
import styled from 'styled-components';

interface Token {
	address: string;
	symbol: string;
	decimals: number;
	chainId: number;
	balance?: number;
	tvl?: number;
	price?: number;
}

// Define styled components
const TokenBanner = styled.div`
	background: linear-gradient(90deg, #061c5d 0%, #1544d8 100%);
`;

interface FilterButtonProps {
	active: boolean;
}

const FilterButton = styled.button<FilterButtonProps>`
	background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
	color: ${props => props.active ? '#fff' : '#00ff4e'};
	border: 1px solid ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
	
	&:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}
`;

// Styled component for sort indicator
const SortIndicator = styled.span`
  display: inline-block;
  margin-left: 4px;
`;

type SortDirection = 'asc' | 'desc' | 'none';

interface SortState {
  column: string;
  direction: SortDirection;
}

const TokenListPage = () => {
	const [tokenList, setTokenList] = useState<Token[]>([]);
	const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(true);
	const [selectedFilter, setSelectedFilter] = useState("All");
	// Add sort state
	const [sortState, setSortState] = useState<SortState>({ column: '', direction: 'none' });
	const chainId = useChainId();
	const { address } = useAccount();
	// const [totalValueLocked, setTotalValueLocked] = useState("984.10M");
	const totalValueLocked = "984.10M";

	useEffect(() => {
		const getTokens = async () => {
			setLoading(true);
			try {
				const filteredTokens = tokens.filter((token: Token) => token.chainId === chainId);
				
				// Add placeholders for TVL and price data
				const tokensWithData = await Promise.all(
					filteredTokens.map(async (token) => {
						let balance = 0;
						if (address) {
							// Convert the result to a number
							balance = Number(await erc20Balance(chainId, token.address, token.decimals, address));
						}
						
						// Mock data for demonstration
						const tvl = Math.random() * 10000000;
						const price = Math.random() * 5;
						
						return {
							...token,
							balance: Number(balance),
							tvl,
							price
						};
					})
				);
				
				setTokenList(tokensWithData);
				setFilteredTokens(tokensWithData);
			} catch (error) {
				console.error("Error fetching tokens:", error);
			} finally {
				setLoading(false);
			}
		};

		if (chainId) {
			getTokens();
		}
	}, [chainId, address]);

	// Filter and sort tokens when search query, filter selection, or sort state changes
	useEffect(() => {
		let result = tokenList;
		
		// Apply balance filter if selected
		if (selectedFilter === "Balance") {
			result = result.filter((token) => token.balance && token.balance > 0);
		}
		
		// Apply search filter
		if (searchQuery.trim() !== "") {
			result = result.filter((token) => 
				token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
				token.address.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
		
		// Apply sorting if a column is selected
		if (sortState.column && sortState.direction !== 'none') {
			result = [...result].sort((a, b) => {
				const aValue = a[sortState.column as keyof Token];
				const bValue = b[sortState.column as keyof Token];
				
				// Handle undefined values
				if (aValue === undefined && bValue === undefined) return 0;
				if (aValue === undefined) return sortState.direction === 'asc' ? 1 : -1;
				if (bValue === undefined) return sortState.direction === 'asc' ? -1 : 1;
				
				// Sort based on value type
				if (typeof aValue === 'string' && typeof bValue === 'string') {
					return sortState.direction === 'asc' 
						? aValue.localeCompare(bValue) 
						: bValue.localeCompare(aValue);
				}
				
				// For numbers
				return sortState.direction === 'asc' 
					? (aValue as number) - (bValue as number) 
					: (bValue as number) - (aValue as number);
			});
		}
		
		setFilteredTokens(result);
	}, [searchQuery, tokenList, selectedFilter, sortState]);

	// Function to handle column header click for sorting
	const handleSort = (columnName: string) => {
		setSortState(prevState => {
			// If clicking on the same column, cycle through sort directions
			if (prevState.column === columnName) {
				const nextDirection: SortDirection = 
					prevState.direction === 'none' ? 'asc' :
					prevState.direction === 'asc' ? 'desc' : 'none';
				return { column: columnName, direction: nextDirection };
			}
			// If clicking on a new column, start with ascending sort
			return { column: columnName, direction: 'asc' };
		});
	};

	// Function to render sort indicator
	const renderSortIndicator = (columnName: string) => {
		if (sortState.column !== columnName) return null;
		
		return (
			<SortIndicator>
				{sortState.direction === 'asc' ? '↑' : sortState.direction === 'desc' ? '↓' : ''}
			</SortIndicator>
		);
	};

	const column = [
		{
			head: "Token",
			accessor: "symbol",
			component: (rowData: Token) => (
				<div className="flex items-center gap-2">
					<Logo chainId={rowData.chainId} token={rowData.address} margin={0} height={30} />
					<div>
						<div className="font-medium">{rowData.symbol}</div>
						<div className="text-xs text-gray-500">{`0x${rowData.address.substring(2, 6)}...${rowData.address.substring(rowData.address.length - 4)}`}</div>
					</div>
				</div>
			),
			onHeaderClick: () => handleSort('symbol'),
			headerComponent: () => (
				<div className="flex items-center cursor-pointer hover:text-[#00ff4e]" onClick={() => handleSort('symbol')}>
					Token {renderSortIndicator('symbol')}
				</div>
			),
		},
		{
			head: "TVL",
			accessor: "tvl",
			component: (rowData: Token) => (
				<div className="text-right">
					<div className="text-red-400">-${(rowData.tvl || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
					<div className="text-xs text-gray-500">TVL</div>
				</div>
			),
			className: "text-right",
			onHeaderClick: () => handleSort('tvl'),
			headerComponent: () => (
				<div className="flex items-center justify-end cursor-pointer hover:text-[#00ff4e]" onClick={() => handleSort('tvl')}>
					TVL {renderSortIndicator('tvl')}
				</div>
			),
		},
		{
			head: "Price",
			accessor: "price",
			component: (rowData: Token) => (
				<div className="text-right">
					<div className="text-gray-300">-${(rowData.price || 0).toLocaleString('en-US', { maximumFractionDigits: 4 })}</div>
					<div className="text-xs text-gray-500">Orcham Price</div>
				</div>
			),
			className: "text-right",
			onHeaderClick: () => handleSort('price'),
			headerComponent: () => (
				<div className="flex items-center justify-end cursor-pointer hover:text-[#00ff4e]" onClick={() => handleSort('price')}>
					Price {renderSortIndicator('price')}
				</div>
			),
		},
		{
			head: "Balance",
			accessor: "balance",
			component: (rowData: Token) => (
				<div className="text-right">
					<div className="text-gray-300">{rowData.balance ? rowData.balance.toLocaleString('en-US', { maximumFractionDigits: 6 }) : '0.0'} {rowData.symbol}</div>
					<div className="text-xs text-gray-500">Balance</div>
				</div>
			),
			className: "text-right",
			onHeaderClick: () => handleSort('balance'),
			headerComponent: () => (
				<div className="flex items-center justify-end cursor-pointer hover:text-[#00ff4e]" onClick={() => handleSort('balance')}>
					Balance {renderSortIndicator('balance')}
				</div>
			),
		},
	];

	return (
		<div className="pt-6 pb-10">
			<div className="container">
				<div className="grid grid-cols-1 gap-8">
					{/* Header Banner */}
					<TokenBanner className="p-4 sm:p-6 md:p-8 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<h2 className="text-white text-lg font-medium mb-2">The tokens listed here represent our tokenlist</h2>
							<p className="text-gray-400 text-sm">
								The liquidity pools for these tokens receive emissions and incentives, 
								are fetched directly from our smart contracts, and the price for every 
								token is fetched from our on-chain oracle in real-time.
							</p>
						</div>
						<div className="flex items-center justify-center md:justify-end">
							<div className="text-right">
								<div className="text-2xl sm:text-3xl font-bold">${totalValueLocked}</div>
								<div className="text-sm text-gray-400">Total Value Locked</div>
							</div>
						</div>
					</TokenBanner>

					{/* Token List */}
					<div>
						<div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
							<h3 className="text-xl font-bold">Listed Tokens ({filteredTokens.length})</h3>
							
							<div className="flex flex-wrap gap-2">
								<div className="flex gap-2 mr-2">
									<FilterButton 
										active={selectedFilter === "All"} 
										onClick={() => setSelectedFilter("All")}
										className="px-3 py-1 rounded text-sm"
									>
										All
									</FilterButton>
									<FilterButton 
										active={selectedFilter === "Balance"} 
										onClick={() => setSelectedFilter("Balance")}
										className="px-3 py-1 rounded text-sm"
									>
										Balance
									</FilterButton>
									<FilterButton 
										active={selectedFilter === "Connector"} 
										onClick={() => setSelectedFilter("Connector")}
										className="px-3 py-1 rounded text-sm"
									>
										Connector
									</FilterButton>
								</div>
								<div className="relative w-full sm:w-auto">
									<input
										type="text"
										placeholder="Symbol or address..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="bg-[var(--backgroundColor2)] border-0 rounded pl-8 pr-4 py-1 text-sm w-full"
									/>
									<span className="absolute left-2 top-1/2 -translate-y-1/2">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
											<path d="M21 21L16.65 16.65" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
										</svg>
									</span>
								</div>
							</div>
						</div>

						{loading ? (
							<div className="text-center py-10">Loading tokens...</div>
						) : (
							<TableLayout column={column} data={filteredTokens}/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TokenListPage;
