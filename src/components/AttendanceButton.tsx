import React from 'react';
import { Lock, Unlock, CheckCircle2 } from 'lucide-react';

interface AttendanceButtonProps {
  isActive: boolean;
  onMark: () => void;
  isLoading?: boolean;
  hasMarked?: boolean;
}

const AttendanceButton: React.FC<AttendanceButtonProps> = ({ isActive, onMark, isLoading, hasMarked }) => {
  // State 1: Student already marked — show success then disable
  if (hasMarked) {
    return (
      <div className="px-4 mb-4 space-y-2">
        <div className="w-full py-3.5 rounded-lg font-bold text-sm tracking-widest flex items-center justify-center gap-2 bg-teal-600 text-white shadow-md uppercase">
          <CheckCircle2 size={18} />
          ATTENDANCE MARKED ✓
        </div>
        <p className="text-center text-[10px] text-gray-400">Your attendance has been recorded for this session.</p>
      </div>
    );
  }

  return (
    <div className="px-4 mb-4">
      <button
        disabled={!isActive || isLoading}
        onClick={onMark}
        className={`w-full py-3.5 rounded-lg font-bold text-sm tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-md uppercase
          ${isLoading
            ? 'bg-green-400 text-white cursor-wait'
            : isActive
              ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            MARKING...
          </>
        ) : isActive ? (
          <>
            <Unlock size={18} />
            MARK ATTENDANCE
          </>
        ) : (
          <>
            <Lock size={18} />
            ATTENDANCE DISABLED
          </>
        )}
      </button>
    </div>
  );
};

export default AttendanceButton;
