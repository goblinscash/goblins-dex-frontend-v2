import React from "react";

interface TransactionModalProps {
  /**
   * Title of the transaction modal
   * @default "Swapped"
   */
  title?: string;
  
  /**
   * Description text for the transaction
   * @default "ETH for AERO"
   */
  description?: string;
  
  /**
   * URL for the transaction confirmation
   * @default ""
   */
  confirmationUrl?: string;
  
  /**
   * Text for the main action button
   * @default "Swap again"
   */
  actionButtonText?: string;
  
  /**
   * Function to execute when action button is clicked
   */
  onActionClick: () => void;
  
  /**
   * Function to close the modal
   */
  onClose: () => void;
  
  /**
   * Status of the transaction: 'pending', 'success', 'error'
   * @default "success"
   */
  status?: 'pending' | 'success' | 'error';
  
  /**
   * Whether the modal is visible
   * @default false
   */
  isVisible: boolean;
  
  /**
   * Custom content to render in the modal
   */
  customContent?: React.ReactNode;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  title = "Swapped",
  description = "ETH for AERO",
  confirmationUrl = "",
  actionButtonText = "Swap again",
  onActionClick,
  onClose,
  status = "success",
  isVisible,
  customContent
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed z-[9999] inset-0 flex items-center justify-center cstmModal">
      <div className="absolute inset-0 bg-black z-[9] opacity-70" onClick={onClose}></div>
      <div className="modalDialog relative p-4 px-lg-5 mx-auto rounded-lg z-[9999] bg-[#272625] w-full max-w-[500px]">
        <button onClick={onClose} className="border-0 p-0 absolute top-2 right-2">
          {crossIcon}
        </button>
        
        <div className="flex flex-col items-center justify-center text-center py-8">
          {/* Status Icon */}
          <div className="w-14 h-14 rounded-full bg-[#00ff4e] flex items-center justify-center mb-4">
            {status === "pending" && <LoadingIcon />}
            {status === "success" && <CheckIcon />}
            {status === "error" && <ErrorIcon />}
          </div>
          
          {/* Custom content or default content */}
          {customContent ? (
            customContent
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-1">{title}</h3>
              <p className="text-gray-200 mb-4">{description}</p>
              
              {confirmationUrl && (
                <a 
                  href={confirmationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#00ff4e] hover:text-blue-400 flex items-center text-sm mb-6"
                >
                  View confirmation {externalLinkIcon}
                </a>
              )}
            </>
          )}
          
          {/* Action Button */}
          <button
            onClick={onActionClick}
            className="btn flex items-center font-medium justify-center w-full rounded btn commonBtn bg-[#1E40AF] hover:bg-[#1E3A8A] text-white py-3"
          >
            {actionButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Icons
const crossIcon = (
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

const CheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 13L9 17L19 7"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 18L18 6M6 6L18 18"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LoadingIcon = () => (
  <svg
    className="animate-spin"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const externalLinkIcon = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="ml-1"
  >
    <path
      d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TransactionModal; 