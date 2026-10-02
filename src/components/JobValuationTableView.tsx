import React, { useState } from 'react';
import {
  NursingActivity,
  ActivityCategory,
  ComplexityLevel,
  SkillRequirement,
  UserProfile
} from '../types/nursing';
import {
  Search,
  Filter,
  Plus,
  Clock,
  ShieldAlert,
  Edit2,
  Check,
  X,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface JobValuationTableViewProps {
  activities: NursingActivity[];
  onUpdateActivity: (updated: NursingActivity) => void;
  onAddActivity: (newAct: NursingActivity) => void;
  currentUser: UserProfile;
}

export const JobValuationTableView: React.FC<JobValuationTableViewProps> = ({
  activities,
  onUpdateActivity,
  onAddActivity,
  currentUser,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');

  // Edit / Add modal state
  const [editingActivity, setEditingActivity] = useState<NursingActivity | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [newTitleTh, setNewTitleTh] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newMinutes, setNewMinutes] = useState(15);
  const [newCategory, setNewCategory] = useState<ActivityCategory>('direct');
  const [newComplexity, setNewComplexity] = useState<ComplexityLevel>('Moderate');
  const [newSkillReq, setNewSkillReq] = useState<SkillRequirement>('RN_ONLY');
  const [newDescTh, setNewDescTh] = useState('');

  const filteredActivities = activities.filter((act) => {
    const matchCategory = selectedCategory === 'all' || act.category === selectedCategory;
    const matchComplexity = selectedComplexity === 'all' || act.complexity === selectedComplexity;
    const matchQuery =
      act.titleTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchComplexity && matchQuery;
  });

  const getCategoryBadge = (cat: ActivityCategory) => {
    switch (cat) {
      case 'direct':
        return { label: 'Direct Care (โดยตรง)', class: 'text-teal-700 bg-teal-50 border-teal-200' };
      case 'indirect':
        return { label: 'Indirect Care (โดยอ้อม)', class: 'text-sky-700 bg-sky-50 border-sky-200' };
      case 'unit_related':
        return { label: 'Unit-Related (บริหาร)', class: 'text-purple-700 bg-purple-50 border-purple-200' };
    }
  };

  const getComplexityBadge = (c: ComplexityLevel) => {
    switch (c) {
      case 'Critical':
        return 'text-red-700 bg-red-100 font-bold';
      case 'High':
        return 'text-amber-800 bg-amber-100 font-semibold';
      case 'Moderate':
        return 'text-sky-800 bg-sky-100 font-medium';
      case 'Low':
        return 'text-emerald-800 bg-emerald-100 font-normal';
    }
  };

  const getSkillBadge = (s: SkillRequirement) => {
    switch (s) {
      case 'RN_ONLY':
        return 'พยาบาลวิชาชีพเฉพาะทาง (Specialized RN)';
      case 'RN_GENERAL':
      case 'ALL_STAFF_NA':
      default:
        return 'พยาบาลวิชาชีพทั่วไป (General RN)';
    }
  };

  const handleSaveEdit = () => {
    if (!editingActivity) return;
    onUpdateActivity(editingActivity);
    setEditingActivity(null);
  };

  const handleSaveNew = () => {
    if (!newTitleTh.trim()) return;
    const newAct: NursingActivity = {
      id: `act-custom-${Date.now()}`,
      code: `CUST-${Math.floor(Math.random() * 900 + 100)}`,
      category: newCategory,
      titleTh: newTitleTh,
      titleEn: newTitleEn || newTitleTh,
      standardMinutes: Number(newMinutes),
      frequencyUnit: 'ครั้ง/เคส',
      complexity: newComplexity,
      skillReq: newSkillReq,
      leanClass: 'VALUE_ADDED',
      departmentApplicable: 'ALL',
      descriptionTh: newDescTh || 'กิจกรรมการพยาบาลที่กำหนดเพิ่มเติมเฉพาะโรงพยาบาลสังขละบุรี',
    };
    onAddActivity(newAct);
    setIsAddingNew(false);
    setNewTitleTh('');
    setNewTitleEn('');
    setNewDescTh('');
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              [ตารางจำแนกค่างานและเวลามาตรฐาน (Job Valuation Table)]
            </h2>
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 font-semibold px-2 py-0.5 rounded-sm">
              Time & Motion Benchmarks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            จำแนกกิจกรรมการพยาบาลเป็น Direct Care, Indirect Care, และ Unit-Related Activities
            พร้อมระบุเวลามาตรฐาน (Standard Time: นาที/ครั้ง) และระดับความยากง่าย/ความเสี่ยงของงาน
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsAddingNew(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มกิจกรรมการพยาบาลใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อกิจกรรม, หัตถการ หรือรหัส..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="md:col-span-4 flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'direct', label: 'Direct Care' },
              { id: 'indirect', label: 'Indirect Care' },
              { id: 'unit_related', label: 'Unit-Related' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Complexity Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedComplexity}
              onChange={(e) => setSelectedComplexity(e.target.value)}
              aria-label="กรองระดับความเสี่ยง"
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="all">ระดับความเสี่ยง: ทั้งหมด</option>
              <option value="Low">Low (ความเสี่ยงต่ำ)</option>
              <option value="Moderate">Moderate (ปานกลาง)</option>
              <option value="High">High (ความเสี่ยงสูง)</option>
              <option value="Critical">Critical (วิกฤต/คุกคามชีวิต)</option>
            </select>
          </div>
        </div>

        {/* Summary Counter */}
        <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
          <span>
            แสดงผล <strong className="text-slate-800 font-mono">{filteredActivities.length}</strong> จากทั้งหมด{' '}
            <strong className="text-slate-800 font-mono">{activities.length}</strong> รายการมาตรฐาน
          </span>
          <span className="text-[11px] text-teal-700">
            * สอดคล้องกับคู่มือมาตรฐานค่างานบริการพยาบาล สภาการพยาบาล
          </span>
        </div>
      </div>

      {/* Main Valuation Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3 px-4 text-left">รหัส / หมวดหมู่</th>
                <th scope="col" className="py-3 px-4 text-left">ชื่อกิจกรรมการพยาบาล (Nursing Activity)</th>
                <th scope="col" className="py-3 px-4 text-center">เวลามาตรฐาน (นาที)</th>
                <th scope="col" className="py-3 px-4 text-center">ความถี่</th>
                <th scope="col" className="py-3 px-4 text-center">ระดับความเสี่ยง</th>
                <th scope="col" className="py-3 px-4 text-center">คุณสมบัติผู้ปฏิบัติ</th>
                <th scope="col" className="py-3 px-4 text-center">LEAN Status</th>
                <th scope="col" className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredActivities.map((act) => {
                const catBadge = getCategoryBadge(act.category);
                return (
                  <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-800">{act.code}</div>
                      <span className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.2 rounded-xs border ${catBadge.class}`}>
                        {catBadge.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs sm:max-w-sm">
                      <div className="font-semibold text-slate-900 leading-snug">{act.titleTh}</div>
                      <div className="text-[11px] text-slate-400 font-normal leading-snug mt-0.5">{act.titleEn}</div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{act.descriptionTh}</p>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="text-sm font-bold font-mono text-teal-800 tabular-nums">
                        {act.standardMinutes}
                      </span>
                      <span className="text-[10px] text-slate-400 block">นาที/ครั้ง</span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap text-slate-600 font-medium">
                      {act.frequencyUnit}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-sm text-[11px] ${getComplexityBadge(act.complexity)}`}>
                        {act.complexity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm font-medium">
                        {getSkillBadge(act.skillReq)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                          act.leanClass === 'VALUE_ADDED'
                            ? 'text-emerald-700 bg-emerald-50'
                            : act.leanClass === 'REQUIRED_NON_VALUE'
                            ? 'text-slate-600 bg-slate-100'
                            : 'text-amber-800 bg-amber-50'
                        }`}
                      >
                        {act.leanClass === 'VALUE_ADDED'
                          ? 'Value Added'
                          : act.leanClass === 'REQUIRED_NON_VALUE'
                          ? 'Required Non-Value'
                          : 'Waste Candidate'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingActivity(act)}
                        className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                        title="แก้ไขเวลามาตรฐานหรือรายละเอียด"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-teal-700" />
                ปรับปรุงข้อมูลเวลามาตรฐาน: {editingActivity.code}
              </h3>
              <button
                onClick={() => setEditingActivity(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ชื่อกิจกรรม (ภาษาไทย)</label>
                <input
                  type="text"
                  value={editingActivity.titleTh}
                  onChange={(e) =>
                    setEditingActivity({ ...editingActivity, titleTh: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">เวลามาตรฐาน (นาที/ครั้ง)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={editingActivity.standardMinutes}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        standardMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ระดับความเสี่ยง (Risk/Complexity)</label>
                  <select
                    value={editingActivity.complexity}
                    onChange={(e) =>
                      setEditingActivity({
                        ...editingActivity,
                        complexity: e.target.value as ComplexityLevel,
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Low">Low (ความเสี่ยงต่ำ)</option>
                    <option value="Moderate">Moderate (ปานกลาง)</option>
                    <option value="High">High (ความเสี่ยงสูง)</option>
                    <option value="Critical">Critical (วิกฤต)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">คุณสมบัติผู้ปฏิบัติการ</label>
                <select
                  value={editingActivity.skillReq}
                  onChange={(e) =>
                    setEditingActivity({
                      ...editingActivity,
                      skillReq: e.target.value as SkillRequirement,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="RN_ONLY">พยาบาลวิชาชีพเฉพาะทาง (Specialized RN)</option>
                  <option value="RN_GENERAL">พยาบาลวิชาชีพทั่วไป (General RN)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">คำอธิบายขั้นตอนมาตรฐาน (SOP Details)</label>
                <textarea
                  rows={3}
                  value={editingActivity.descriptionTh}
                  onChange={(e) =>
                    setEditingActivity({ ...editingActivity, descriptionTh: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingActivity(null)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Activity Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-700" />
                เพิ่มกิจกรรมการพยาบาลใหม่เข้าสู่สารบบ
              </h3>
              <button onClick={() => setIsAddingNew(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ชื่อกิจกรรม (ภาษาไทย)</label>
                <input
                  type="text"
                  placeholder="เช่น การให้ยาพ่นขยายหลอดลม, การดูแลสายระบายทรวงอก"
                  value={newTitleTh}
                  onChange={(e) => setNewTitleTh(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ชื่อภาษาอังกฤษ (English Name)</label>
                <input
                  type="text"
                  placeholder="e.g. Nebulizer Therapy Administration"
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">หมวดหมู่กิจกรรม</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ActivityCategory)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="direct">Direct Care (โดยตรง)</option>
                    <option value="indirect">Indirect Care (โดยอ้อม)</option>
                    <option value="unit_related">Unit-Related (บริหาร)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">เวลามาตรฐาน (นาที)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full p-2 border rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ระดับความเสี่ยง</label>
                  <select
                    value={newComplexity}
                    onChange={(e) => setNewComplexity(e.target.value as ComplexityLevel)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ผู้ปฏิบัติการ</label>
                  <select
                    value={newSkillReq}
                    onChange={(e) => setNewSkillReq(e.target.value as SkillRequirement)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="RN_ONLY">พยาบาลวิชาชีพเฉพาะทาง (Specialized RN)</option>
                    <option value="RN_GENERAL">พยาบาลวิชาชีพทั่วไป (General RN)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">คำอธิบายขั้นตอน</label>
                <textarea
                  rows={2}
                  placeholder="ระบุข้อกำหนดและขั้นตอนปฏิบัติ..."
                  value={newDescTh}
                  onChange={(e) => setNewDescTh(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveNew}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md"
              >
                เพิ่มเข้าสู่ตาราง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
