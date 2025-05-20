import React from 'react';

interface SaveButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export default function SaveButton({ onClick, disabled = false, label = "Save" }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${disabled ? 'bg-gray-400' : 'bg-black hover:bg-gray-900'} text-white px-6 py-2 rounded transition-colors`}
    >
      {label}
    </button>
  );
} 