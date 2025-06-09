import { toast } from 'react-toastify';
import Link from 'next/link';
import { explorerUrls } from '@/utils/config.utils';

const toastWithLink = (type: 'success' | 'error', message: string, linkLabel: string, url: string) => {
    toast[type](
        <div>
            {message}
            < Link
                href={url}
                className="toast-link"
                target="_blank"
                rel="noopener noreferrer"
            >
                {linkLabel}
            </Link>
        </div>
    );
};

export function showSuccessToast(chainId: number, txhash?: string) {
    if (txhash) {
        const url = `${explorerUrls[chainId]}/${txhash}`;
        toastWithLink('success', 'Transaction successful!', 'View Transaction', url);
    } else {
        toast.success('Transaction successful!');
    }
}

export function showErrorToast(chainId?: number, txhash?: string) {
    if (txhash && chainId) {
        const url = `${explorerUrls[chainId]}/${txhash}`;
        toastWithLink('error', 'Transaction failed!', 'View Details', url);
    } else {
        toast.error('Transaction failed!');
    }
}

export function showCustomErrorToast(message?: string, txhash?: string, chainId?: number) {
    if (txhash && chainId) {
        const url = `${explorerUrls[chainId]}/${txhash}`;
        toastWithLink(
            'error',
            message || 'Something went wrong with the transaction.',
            'View on Explorer',
            url
        );
    } else {
        toast.error(message || 'Something went wrong. Please try again.');
    }
}



export function showInfoToast(message: string, afterClose?: () => void) {
    toast.info(message, { onClose: afterClose });
}
export function showWarnToast(message: string, afterClose?: () => void) {
    toast.warn(message, { onClose: afterClose });
}

