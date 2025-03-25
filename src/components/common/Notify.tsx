import { explorerUrls } from '@/utils/config.utils';
import React from 'react';
import { toast } from 'react-toastify';

interface NotifyProps {
  chainId: number;
  txhash: string;
}

const Notify: React.FC<NotifyProps> = ({ chainId, txhash }) => {
  const url = `${explorerUrls[chainId]}/${txhash}`;

  toast.success(
    <div>
      Transaction completed successfully!
      <a
        href={url}
        style={{ color: 'blue', textDecoration: 'underline', marginLeft: '8px' }}
        target="_blank"
        rel="noopener noreferrer"
      >
        View Transaction
      </a>
    </div>
  );

  return null;
};

export default Notify;
