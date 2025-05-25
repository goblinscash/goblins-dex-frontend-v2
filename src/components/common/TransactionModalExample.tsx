import React, { useState } from 'react';
import TransactionModal from './TransactionModal';

const TransactionModalExample: React.FC = () => {
  // State to control visibility of different modal examples
  const [showBasicModal, setShowBasicModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Example action handler
  const handleAction = () => {
    console.log('Action button clicked');
    // Close all modals
    setShowBasicModal(false);
    setShowPendingModal(false);
    setShowErrorModal(false);
    setShowCustomModal(false);
  };

  // Custom content example
  const CustomContent = () => (
    <div className="text-center">
      <h3 className="text-xl font-bold mb-2">Custom Content</h3>
      <p className="text-gray-300 mb-4">This is a fully customized modal body</p>
      <div className="bg-gray-800 p-3 rounded-lg mb-6">
        <p className="text-sm text-gray-400">Transaction Details:</p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400">Gas Fee:</span>
          <span className="text-white">0.002 ETH</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-gray-400">Network:</span>
          <span className="text-white">Arbitrum</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Transaction Modal Examples</h2>
      
      <div className="flex flex-wrap gap-4">
        {/* Basic Success Modal */}
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowBasicModal(true)}
        >
          Show Basic Success Modal
        </button>

        {/* Pending Transaction Modal */}
        <button 
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          onClick={() => setShowPendingModal(true)}
        >
          Show Pending Transaction Modal
        </button>

        {/* Error Transaction Modal */}
        <button 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => setShowErrorModal(true)}
        >
          Show Error Transaction Modal
        </button>

        {/* Custom Content Modal */}
        <button 
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
          onClick={() => setShowCustomModal(true)}
        >
          Show Custom Content Modal
        </button>
      </div>

      {/* Basic Success Modal */}
      <TransactionModal
        isVisible={showBasicModal}
        onClose={() => setShowBasicModal(false)}
        onActionClick={handleAction}
        title="Swapped"
        description="ETH for AERO"
        confirmationUrl="https://arbiscan.io/tx/0x123456789"
        actionButtonText="Swap again"
      />

      {/* Pending Transaction Modal */}
      <TransactionModal
        isVisible={showPendingModal}
        onClose={() => setShowPendingModal(false)}
        onActionClick={handleAction}
        title="Processing"
        description="Swapping ETH for AERO"
        status="pending"
        actionButtonText="Close"
      />

      {/* Error Transaction Modal */}
      <TransactionModal
        isVisible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onActionClick={handleAction}
        title="Transaction Failed"
        description="Could not swap ETH for AERO"
        status="error"
        actionButtonText="Try Again"
      />

      {/* Custom Content Modal */}
      <TransactionModal
        isVisible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onActionClick={handleAction}
        status="success"
        customContent={<CustomContent />}
        actionButtonText="Continue"
      />
    </div>
  );
};

export default TransactionModalExample; 