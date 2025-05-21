import { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // Removed BigNumber import

// Minimal ABI for a gauge contract
const gaugeAbi = [
  {
    "inputs": [{"internalType":"address","name":"account","type":"address"}],
    "name":"balanceOf",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability":"view",
    "type":"function"
  },
  {
    "inputs": [],
    "name":"decimals",
    "outputs": [{"internalType":"uint8","name":"","type":"uint8"}],
    "stateMutability":"view",
    "type":"function"
  }
];

interface UseGaugeStakedBalanceProps {
  gaugeAddress: string | undefined;
  userAddress: string | undefined;
  provider: ethers.Provider | undefined; // Updated to ethers.Provider for v6
  lpTokenDecimals?: number; 
}

interface UseGaugeStakedBalanceReturn {
  balance: bigint | null; // Changed to bigint
  formattedBalance: string | null;
  decimals: number | null;
  loading: boolean;
  error: Error | null;
}

export const useGaugeStakedBalance = ({
  gaugeAddress,
  userAddress,
  provider,
  lpTokenDecimals,
}: UseGaugeStakedBalanceProps): UseGaugeStakedBalanceReturn => {
  const [balance, setBalance] = useState<bigint | null>(null); // Changed to bigint
  const [formattedBalance, setFormattedBalance] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!provider || !gaugeAddress || !userAddress) {
        setBalance(null);
        setFormattedBalance(null);
        setDecimals(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const gaugeContract = new ethers.Contract(gaugeAddress, gaugeAbi, provider);
        
        let fetchedGaugeDecimals: bigint | number; // Can be bigint or number from contract call
        try {
          // decimals() in ERC20 ABI often returns uint8, which ethers v6 might return as number or bigint.
          // Let's assume it might be bigint and convert.
          const rawDecimals = await gaugeContract.decimals();
          fetchedGaugeDecimals = Number(rawDecimals); // Convert bigint to number if necessary
        } catch (decimalsError) {
          fetchedGaugeDecimals = lpTokenDecimals !== undefined ? lpTokenDecimals : 18;
          console.warn(`Gauge contract ${gaugeAddress} does not have a decimals() method or it failed. Falling back to ${fetchedGaugeDecimals}. Error: ${decimalsError instanceof Error ? decimalsError.message : String(decimalsError)}`);
        }
        
        const fetchedBalance: bigint = await gaugeContract.balanceOf(userAddress); // balanceOf will return bigint

        setBalance(fetchedBalance);
        setDecimals(fetchedGaugeDecimals);
        // ethers.formatUnits second arg (decimals) can be string | number | bigint
        setFormattedBalance(ethers.formatUnits(fetchedBalance, fetchedGaugeDecimals)); 
      } catch (e) {
        console.error(`Failed to fetch staked balance for gauge ${gaugeAddress}:`, e);
        setError(e instanceof Error ? e : new Error('Failed to fetch staked balance'));
        setBalance(null);
        setFormattedBalance(null);
        setDecimals(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [gaugeAddress, userAddress, provider, lpTokenDecimals]);

  return { balance, formattedBalance, decimals, loading, error };
};
