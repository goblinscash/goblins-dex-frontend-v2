import React from "react";
import BtnLoader from "./BtnLoader";

interface ActButtonProps {
  label: string;
  onClick: () => void;
  load?: boolean;
}

const ActButton: React.FC<ActButtonProps> = ({ label, onClick, load = false }) => {
  return (
    <div className="pt-2">
      <button
        onClick={onClick}
        disabled={load}
        className="flex w-full rounded text-black items-center justify-center bg-white px-2 py-2 font-medium disabled:opacity-50"
      >
        {load ? <BtnLoader /> : label}
      </button>
    </div>
  );
};

export default ActButton;
