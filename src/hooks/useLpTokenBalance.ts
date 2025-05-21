import { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // Removed BigNumber import
import erc20Abi from '@/abi/erc20.json'; // Assuming path is correct from root

interface UseLpTokenBalanceProps {
  tokenAddress: string | undefined;
  userAddress: string | undefined;
  provider: ethers.Provider | undefined; // Updated to ethers.Provider for v6
}

interface UseLpTokenBalanceReturn {
  balance: bigint | null; // Changed to bigint
  formattedBalance: string | null;
  decimals: number | null;
  totalSupply: bigint | null; // Changed to bigint
  formattedTotalSupply: string | null;
  loading: boolean;
  error: Error | null;
}

export const useLpTokenBalance = ({
  tokenAddress,
  userAddress,
  provider,
}: UseLpTokenBalanceProps): UseLpTokenBalanceReturn => {
  const [balance, setBalance] = useState<bigint | null>(null); // Changed to bigint
  const [formattedBalance, setFormattedBalance] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<number | null>(null);
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null); // Changed to bigint
  const [formattedTotalSupply, setFormattedTotalSupply] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBalanceAndSupply = async () => {
      if (!provider || !tokenAddress || !userAddress) {
        setBalance(null);
        setFormattedBalance(null);
        setDecimals(null);
        setTotalSupply(null);
        setFormattedTotalSupply(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
        
        // Contract methods like balanceOf, decimals, totalSupply will return bigint in ethers v6
        const [fetchedBalance, fetchedDecimals, fetchedTotalSupply] = await Promise.all([
          tokenContract.balanceOf(userAddress),
          tokenContract.decimals(),
          tokenContract.totalSupply(),
        ]);

        setBalance(fetchedBalance);
        setDecimals(Number(fetchedDecimals)); // decimals() in ERC20 is uint8, ensure it's number for formatUnits
        setFormattedBalance(ethers.formatUnits(fetchedBalance, Number(fetchedDecimals)));
        
        setTotalSupply(fetchedTotalSupply);
        setFormattedTotalSupply(ethers.formatUnits(fetchedTotalSupply, Number(fetchedDecimals)));

      } catch (e) {
        console.error(`Failed to fetch LP token data for ${tokenAddress}:`, e);
        setError(e instanceof Error ? e : new Error('Failed to fetch LP token data'));
        setBalance(null);
        setFormattedBalance(null);
        setDecimals(null);
        setTotalSupply(null);
        setFormattedTotalSupply(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceAndSupply();
  }, [tokenAddress, userAddress, provider]);

  return { balance, formattedBalance, decimals, totalSupply, formattedTotalSupply, loading, error };
};
