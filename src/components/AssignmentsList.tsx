import React from 'react';
import { ClipboardCheck, CheckCircle2 } from 'lucide-react';

const AssignmentsList = () => {
  const assignments = [
    { 
      id: 1, 
      title: "Assignment 1", 
      deadline: "27 Feb / 28 Feb", 
      submittedDate: "02-04-2026", 
      status: "Submitted" 
    },
    { 
      id: 2, 
      title: "Assignment 2", 
      deadline: "19 March / 20 March", 
      submittedDate: "02-04-2026", 
      status: "Submitted" 
    },
    { 
      id: 3, 
      title: "Assignment 3", 
      deadline: "Deadline (30-April), Create some App using Code Gen OR hack the App OR Your analysis of App as seen from Continuous Development Phase viewpoint.", 
      submittedDate: null, 
      status: "Pending" 
    },
  ];

  return (
    <div className="m-4">
      <div className="bg-[#00796b] text-white p-2.5 px-4 rounded-t-xl flex items-center gap-2 text-xs font-bold">
        <ClipboardCheck size={16} />
        Assignment Submissions
      </div>
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden">
        {assignments.map((item, idx) => (
          <div key={item.id} className={`p-4 ${idx !== assignments.length - 1 ? 'border-b border-gray-50' : ''}`}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border ${item.status === 'Submitted' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    {item.id}
                  </div>
                  <h3 className="text-xs font-bold text-gray-700">{item.title}</h3>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed ml-8">{item.deadline}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {item.submittedDate && (
                  <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-medium">
                    {item.submittedDate}
                  </span>
                )}
                <div className={`status-badge ${item.status === 'Submitted' ? 'status-submitted' : 'status-pending'}`}>
                  {item.status === 'Submitted' ? <CheckCircle2 size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-400" />}
                  {item.status}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="p-2.5 px-4 bg-gray-50 border-t border-gray-100">
          <button className="text-[10px] font-bold text-[#8e24aa] hover:underline">Hackers .. See this Note</button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsList;
