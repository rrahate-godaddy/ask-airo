import React from 'react';

interface NSBButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick: () => void;
}

export default function NSBButton({ variant, children, onClick }: NSBButtonProps) {
  return (
    <button
      className="nsb-button"
      data-variant={variant}
      onClick={onClick}
    >
      {children}
    </button>
  );
} 