import { calculateVolume } from "@/utils/pool.utils";
import { FormattedPool } from "@/utils/sugar.utils";
import React, { useEffect, useState } from "react";
import { useChainId } from "wagmi";

const VolumeCell = ({ item }: { item: FormattedPool }) => {    
  const [volume, setVolume] = useState<string | number | null>(item.volume ?? null);
  const chainId = useChainId();

  useEffect(() => {
    let isMounted = true;

    const fetchVolume = async () => {
      const result = await calculateVolume(chainId, item); 
      if (isMounted) {
        setVolume(result);
      }
    };

    if(chainId){
        fetchVolume();
    }

    return () => {
      isMounted = false;
    };
  }, [item, chainId]);

  return <>{volume ?? "..."}</>;
};

export default VolumeCell;
