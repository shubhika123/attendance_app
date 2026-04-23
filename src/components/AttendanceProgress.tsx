import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { AttendanceLog } from '@/lib/supabase';
import { format } from 'date-fns';

interface AttendanceProgressProps {
  logs?: AttendanceLog[];
}

const AttendanceProgress: React.FC<AttendanceProgressProps> = ({ logs = [] }) => {
  const [isOpen, setIsOpen] = useState(true);

  const totalClasses = 12; // This would come from DB in production
  const attendedClasses = logs.length;
  const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

  return (
    <div className="m-4 space-y-4">
      <div className="text-sm font-semibold text-purple-700 mb-1 px-1">Attendance Progress</div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-50">
        <div className="flex justify-between items-center text-xs font-medium mb-2">
          <span className="text-gray-700">Overall Attendance</span>
          <span className="text-blue-600">{attendedClasses} / {totalClasses} Days</span>
        </div>
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-orange-500 h-full transition-all duration-1000"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="text-[10px] text-right text-gray-400 mt-1">{percentage.toFixed(1)}%</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-purple-50 overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex justify-between items-center text-xs font-medium text-purple-700 border-b border-purple-50"
        >
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-1 rounded">
              <CheckCircle2 size={16} />
            </div>
            <span>View Details</span>
            <span className="text-gray-400 font-normal">{attendedClasses} of {totalClasses} classes attended</span>
          </div>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div className="overflow-x-auto">
            {logs.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs">No attendance records yet.</div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-purple-100 text-purple-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2 w-12">#</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log, index) => (
                    <tr key={log.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {format(new Date(log.marked_at), 'dd-MM-yyyy')}
                      </td>
                      <td className="px-4 py-3 flex justify-center">
                        <div className="bg-green-100 text-green-600 p-1 rounded-full">
                          <CheckCircle2 size={14} fill="currentColor" className="text-white" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceProgress;
