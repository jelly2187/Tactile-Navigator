import React from 'react';
import { ArrowLeft, Plus, Phone, Star, User } from 'lucide-react';
import type { FamilyMember } from '../types';

interface FamilyPageProps {
  familyMembers: FamilyMember[];
  onBack: () => void;
  onAddMember: () => void;
  onCallMember: (member: FamilyMember) => void;
  onEditMember: (member: FamilyMember) => void;
}

const FamilyPage: React.FC<FamilyPageProps> = ({
  familyMembers,
  onBack,
  onAddMember,
  onCallMember,
  onEditMember,
}) => {
  return (
    <div className="flex flex-col justify-between w-[390px] min-h-[844px] bg-primary-50">
      {/* 头部导航 */}
      <div className="pt-3 pr-6 pb-3 pl-6 bg-primary-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-3">
              <ArrowLeft size={20} className="text-primary-600" />
            </button>
            <h3 className="text-[14px] font-medium text-primary-600">家人</h3>
          </div>
          <button onClick={onAddMember}>
            <Plus size={20} className="text-primary-600" />
          </button>
        </div>
      </div>

      {/* 家人列表 */}
      <div className="flex-1 pr-6 pl-6">
        <h3 className="mb-3 text-[14px] font-medium text-primary-600">紧急联系人</h3>
        
        {familyMembers.map((member) => (
          <div key={member.id} className="mb-3 pt-4 pr-4 pb-4 pl-4 rounded-[8px] bg-white shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary-100">
                  <User size={20} className="text-primary-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-[14px] font-medium text-primary-600">{member.name}</h4>
                    {member.isEmergency && (
                      <Star size={12} className="text-yellow-500 fill-current" />
                    )}
                  </div>
                  <p className="text-[12px] text-primary-400">{member.relationship}</p>
                  <p className="text-[12px] text-primary-300">{member.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onCallMember(member)}
                  className="flex justify-center items-center w-8 h-8 rounded-full bg-green-500"
                >
                  <Phone size={16} className="text-white" />
                </button>
                <button 
                  onClick={() => onEditMember(member)}
                  className="flex justify-center items-center w-8 h-8 rounded-full bg-primary-100"
                >
                  <User size={16} className="text-primary-500" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {familyMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <User size={48} className="text-primary-300 mb-4" />
            <p className="text-[14px] text-primary-400 mb-2">暂无家人信息</p>
            <p className="text-[12px] text-primary-300">点击右上角添加按钮添加家人</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyPage; 