import React from 'react';
import { LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title?: string;
  onSignOut?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title = "My DevOps Status ...", onSignOut }) => {
  return (
    <header className="bg-[#8e24aa] text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-medium tracking-wide truncate max-w-[200px]">
          {title}
        </h1>
      </div>
      <button
        onClick={onSignOut}
        className="hover:bg-white/20 p-2 rounded-full transition-colors"
        title="Sign Out"
      >
        <LogOut size={20} />
      </button>
    </header>
  );
};

export default Header;
