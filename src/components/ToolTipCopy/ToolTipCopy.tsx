import React, { ReactNode, useState } from 'react';

interface ToolTipCopyProps {
    address: string;
    children: ReactNode;
}

const ToolTipCopy: React.FC<ToolTipCopyProps> = ({ address, children }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(address).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    return (
        <div className="relative group inline-block cursor-pointer">
            {children}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 max-w-xs px-3 py-2 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap flex items-center gap-1 sm:gap-2 sm:text-sm sm:max-w-md">
                <span className="font-mono truncate max-w-[120px] sm:max-w-[200px] text-[11px] sm:text-xs pl-2">
                    {address.toString().substring(0, 5)}...{address.toString().slice(-5)}

                </span>
                <i
                    className={`fa-solid fa-copy cursor-pointer transition-colors duration-200 ${copied ? 'text-green-400' : 'text-white'
                        }`}
                    onClick={handleCopy}
                ></i>
            </div>
        </div>
    );
};

export default ToolTipCopy;
