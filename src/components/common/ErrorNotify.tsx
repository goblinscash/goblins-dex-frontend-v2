// utils/toast.utils.ts
import { toast } from 'react-toastify';
import Link from 'next/link';
import { explorerUrls } from '@/utils/config.utils';

// Function to show error toast
export function showErrorToast(chainId: number, txhash: string) {
    const url = `${explorerUrls[chainId]}/${txhash}`;

    toast.error(
        <div>
            Transaction failed!
            < Link
                href={url}
                className='themeClr font-medium'
                style={{ textDecoration: 'underline', marginLeft: '8px' }}
                target="_blank"
                rel="noopener noreferrer"
            >
                View Details
            </Link>
        </div>
    );
}
