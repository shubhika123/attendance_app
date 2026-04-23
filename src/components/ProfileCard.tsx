import React from 'react';
import { User } from 'lucide-react';

interface ProfileCardProps {
  name: string;
  enrollment: string;
  branch: string;
  semester: string;
  proxyFlag: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, enrollment, branch, semester, proxyFlag }) => {
  return (
    <div className="bg-white m-4 p-4 rounded-xl shadow-sm border border-purple-100 flex items-center gap-4">
      <div className="bg-[#8e24aa] p-3 rounded-full text-white">
        <User size={32} />
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-bold text-gray-800">{name}</h2>
        <div className="text-xs text-gray-500 space-y-0.5">
          <p>Enrollment: {enrollment}</p>
          <p>Branch: {branch} | Sem: {semester}</p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-500">Proxy Flag:</span>
          <input 
            type="checkbox" 
            checked={proxyFlag} 
            readOnly 
            className="w-4 h-4 accent-purple-600 rounded"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
