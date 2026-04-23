import React from 'react';
import { Share2 } from 'lucide-react';

const FeedbackSection = () => {
  return (
    <div className="m-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-50">
        <h3 className="text-xs font-bold text-gray-700 mb-3">Your Comments /Suggestion / Feedback</h3>
        <div className="relative">
          <textarea 
            placeholder="Share your suggestion here. Max 50 words."
            className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-[11px] min-h-[100px] focus:outline-none focus:ring-1 focus:ring-purple-300 resize-none"
            maxLength={250}
          />
        </div>
        <p className="text-[9px] text-gray-400 mt-2">Once message sent then it cannot be edited or resend again.</p>
        <div className="flex justify-end mt-2">
          <button className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:text-purple-600 transition-colors">
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;
