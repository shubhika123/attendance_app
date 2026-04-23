import React from 'react';
import { BarChart3 } from 'lucide-react';

const GradesTable = () => {
  const grades = [
    { label: "Mid Term Marks (30 will be scale down to 15 so please ignore total that is coming as 115)", value: "24 / 30", isHigh: true },
    { label: "End Sem Marks", value: "-- / 60", isHigh: false },
    { label: "Practical Marks", value: "-- / 15", isHigh: false },
    { label: "CAP Marks", value: "-- / 10", isHigh: false },
  ];

  return (
    <div className="m-4">
      <div className="bg-[#f4511e] text-white p-2.5 px-4 rounded-t-xl flex items-center gap-2 text-xs font-bold">
        <BarChart3 size={16} />
        Mid / End Sem Marks
      </div>
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        {grades.map((grade, idx) => (
          <div key={idx} className="p-3.5 flex justify-between items-center gap-4">
            <span className="text-[10px] font-medium text-gray-600 leading-tight flex-1">{grade.label}</span>
            <span className={`text-[11px] font-bold px-2 py-1 rounded ${grade.isHigh ? 'bg-red-50 text-red-600' : 'text-gray-400'}`}>
              {grade.value}
            </span>
          </div>
        ))}
        <div className="p-3.5 bg-blue-50/50 flex justify-between items-center">
          <span className="text-[10px] font-bold text-blue-700 flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-600 rounded-full" />
            Total Marks
          </span>
          <span className="text-xs font-black text-blue-800">24 / 115</span>
        </div>
      </div>
    </div>
  );
};

export default GradesTable;
