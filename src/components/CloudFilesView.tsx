/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  Search,
  Clock,
  User,
  Building,
  Layers,
  Sparkles
} from 'lucide-react';
import { DepartmentId, UserProfile } from '../types/nursing';
import {
  UploadedFileRecord,
  uploadFileToDatabase,
  subscribeToUploadedFiles,
  deleteUploadedFileRecord
} from '../services/firebaseService';

interface CloudFilesViewProps {
  currentUser: UserProfile;
  selectedDeptId: DepartmentId;
  onSelectDept: (id: DepartmentId) => void;
}

export const CloudFilesView: React.FC<CloudFilesViewProps> = ({
  currentUser,
  selectedDeptId,
}) => {
  const [files, setFiles] = useState<UploadedFileRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<'ROSTER' | 'CENSUS' | 'ACTIVITY' | 'REPORT' | 'OTHER'>('ROSTER');
  const [targetDept, setTargetDept] = useState<DepartmentId | 'all'>(selectedDeptId);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Preview Modal
  const [previewFile, setPreviewFile] = useState<UploadedFileRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Subscribe to Live Realtime Database file sync
  useEffect(() => {
    const unsubscribe = subscribeToUploadedFiles((liveFiles) => {
      setFiles(liveFiles);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: 'ขนาดไฟล์เกิน 5 MB กรุณาเลือกไฟล์เอกสารหรือสเปรดชีตที่มีขนาดเล็กลง',
      });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const record = await uploadFileToDatabase(
        selectedFile,
        targetDept,
        uploadCategory,
        currentUser
      );
      setStatusMessage({
        type: 'success',
        text: `อัปโหลดไฟล์ "${record.fileName}" และเชื่อมต่อ Realtime Database สำเร็จเรียบร้อยแล้ว`,
      });
    } catch (err: unknown) {
      console.error('File upload error:', err);
      setStatusMessage({
        type: 'error',
        text: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์ไปยัง Realtime Database กรุณาลองใหม่อีกครั้ง',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ "${fileName}" ออกจาก Realtime Database?`)) {
      return;
    }
    try {
      await deleteUploadedFileRecord(fileId);
      setStatusMessage({
        type: 'success',
        text: `ลบไฟล์ "${fileName}" ออกจาก Realtime Database เรียบร้อยแล้ว`,
      });
    } catch (err) {
      console.error('Delete error:', err);
      setStatusMessage({
        type: 'error',
        text: 'ไม่สามารถลบไฟล์ได้ กรุณาลองใหม่อีกครั้ง',
      });
    }
  };

  const handleDownloadFile = (file: UploadedFileRecord) => {
    if (!file.fileData) {
      alert('ไม่พบข้อมูลไฟล์สำหรับดาวน์โหลด');
      return;
    }
    const element = document.createElement('a');
    element.setAttribute('href', file.fileData);
    element.setAttribute('download', file.fileName);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getCategoryBadge = (cat: UploadedFileRecord['category']) => {
    switch (cat) {
      case 'ROSTER':
        return { label: 'ตารางเวรพยาบาล (Roster)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'CENSUS':
        return { label: 'สถิติผู้ป่วย (Census)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'ACTIVITY':
        return { label: 'ค่างานกิจกรรม (Activity)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'REPORT':
        return { label: 'รายงานผลิตภาพ (Report)', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'เอกสารทั่วไป', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getFileIcon = (fileName: string, type: string) => {
    if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return <FileSpreadsheet className="w-6 h-6 text-emerald-600" />;
    }
    if (fileName.endsWith('.json') || fileName.endsWith('.txt')) {
      return <FileCode className="w-6 h-6 text-indigo-600" />;
    }
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-6 h-6 text-teal-600" />;
    }
    return <FileText className="w-6 h-6 text-slate-600" />;
  };

  // Filtered files
  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.parsedSummary && f.parsedSummary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = filterDept === 'all' || f.departmentId === filterDept;
    const matchesCat = filterCategory === 'all' || f.category === filterCategory;

    return matchesSearch && matchesDept && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Realtime Database Status */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              คลังเอกสาร & ซิงค์ไฟล์ Realtime Database
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Realtime Database Connected</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            อัปโหลดและจัดเก็บเอกสารตารางเวร (Shift Roster), ข้อมูลผู้ป่วย, และรายงานค่างานการพยาบาล พร้อมเชื่อมต่อฐานข้อมูล Realtime Database สดเรียลไทม์
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center space-x-2">
            <Database className="w-4 h-4 text-teal-700" />
            <div>
              <span className="font-bold block">โหนดฐานข้อมูล:</span>
              <span className="font-mono text-[11px] text-slate-500">/uploaded_files</span>
            </div>
          </div>
          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <div>
              <span className="font-bold block">จำนวนเอกสาร:</span>
              <span className="font-bold text-teal-800">{files.length} รายการ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Zone Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-teal-700" />
          <span>อัปโหลดเอกสารใหม่เชื่อมต่อ Realtime Database</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ประเภทเอกสาร
            </label>
            <select
              value={uploadCategory}
              onChange={(e) =>
                setUploadCategory(
                  e.target.value as 'ROSTER' | 'CENSUS' | 'ACTIVITY' | 'REPORT' | 'OTHER'
                )
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:ring-2 focus:ring-teal-600"
            >
              <option value="ROSTER">ตารางเวรพยาบาล (Shift Roster)</option>
              <option value="CENSUS">สำมะโนและสถิติผู้ป่วย (Census)</option>
              <option value="ACTIVITY">ค่างานมาตรฐาน & การจับเวลา (Activity)</option>
              <option value="REPORT">รายงานสรุปผลิตภาพ 4 เสาหลัก (Report)</option>
              <option value="OTHER">เอกสารทั่วไปอื่น ๆ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              แผนกเป้าหมาย
            </label>
            <select
              value={targetDept}
              onChange={(e) => setTargetDept(e.target.value as DepartmentId | 'all')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold bg-white focus:ring-2 focus:ring-teal-600"
            >
              <option value="er">ER (อุบัติเหตุและฉุกเฉิน)</option>
              <option value="ipd1">IPD 1 (หอผู้ป่วยใน 1)</option>
              <option value="ipd2">IPD 2 (หอผู้ป่วยใน 2)</option>
              <option value="opd">OPD (ผู้ป่วยนอก)</option>
              <option value="lr">LR (ห้องคลอด)</option>
              <option value="all">ทุกแผนก (Global / Executive)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ผู้รับผิดชอบการอัปโหลด
            </label>
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center justify-between">
              <span className="font-bold truncate">{currentUser.name}</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-semibold">
                {currentUser.roleTitle.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Drag & Drop File Selector */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-xl p-8 text-center bg-teal-50/20 hover:bg-teal-50/50 transition-colors cursor-pointer"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".csv,.xlsx,.xls,.json,.txt,.pdf,image/*"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center shadow-xs">
              {isUploading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-teal-700" />
              ) : (
                <UploadCloud className="w-6 h-6 text-teal-700" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isUploading
                  ? 'กำลังประมวลผลและบันทึกลง Firebase Realtime Database...'
                  : 'คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                รองรับ Excel (.xlsx, .xls), CSV, JSON, PDF, ข้อความ TXT และภาพเอกสาร (ขนาดไม่เกิน 5 MB)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาชื่อไฟล์ หรือผู้อัปโหลด..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
          >
            <option value="all">ทุกแผนก</option>
            <option value="er">ER</option>
            <option value="ipd1">IPD 1</option>
            <option value="ipd2">IPD 2</option>
            <option value="opd">OPD</option>
            <option value="lr">LR</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
          >
            <option value="all">ทุกประเภทเอกสาร</option>
            <option value="ROSTER">ตารางเวร (Roster)</option>
            <option value="CENSUS">สำมะโนผู้ป่วย (Census)</option>
            <option value="ACTIVITY">ค่างาน (Activity)</option>
            <option value="REPORT">รายงานสรุป (Report)</option>
          </select>
        </div>
      </div>

      {/* File List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">ยังไม่มีเอกสารใน Realtime Database</p>
            <p className="text-xs text-slate-400 mt-1">
              อัปโหลดไฟล์ตารางเวร หรือไฟล์ค่างานเพื่อเริ่มซิงค์ข้อมูลกับ Realtime Database
            </p>
          </div>
        ) : (
          filteredFiles.map((file) => {
            const badge = getCategoryBadge(file.category);
            return (
              <div
                key={file.id}
                className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg shrink-0">
                        {getFileIcon(file.fileName, file.fileType)}
                      </div>
                      <div className="min-w-0">
                        <h4
                          title={file.fileName}
                          className="text-xs font-bold text-slate-900 truncate"
                        >
                          {file.fileName}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {file.fileSizeFormatted}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${badge.color}`}
                    >
                      {badge.label.split(' ')[0]}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] space-y-1 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>แผนก:</span>
                      </span>
                      <span className="font-semibold text-slate-800 uppercase">
                        {file.departmentId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>ผู้อัปโหลด:</span>
                      </span>
                      <span className="font-medium text-slate-800 truncate max-w-[140px]">
                        {file.uploadedBy}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>เวลาบันทึก:</span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(file.uploadedAt).toLocaleString('th-TH', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    {file.parsedSummary && (
                      <p className="text-[10px] text-teal-800 bg-teal-50/70 p-1.5 rounded mt-2 truncate">
                        • {file.parsedSummary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ดูรายละเอียด</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {file.fileData && (
                      <button
                        onClick={() => handleDownloadFile(file)}
                        title="ดาวน์โหลดไฟล์"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteFile(file.id, file.fileName)}
                      title="ลบไฟล์จาก Realtime Database"
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* File Details & Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {previewFile.fileName}
                </h3>
                <p className="text-xs text-slate-500">
                  ID: <span className="font-mono">{previewFile.id}</span> · เชื่อมต่อ Realtime Database
                </p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">หมวดหมู่:</span>
                <span className="font-bold text-slate-800">{previewFile.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block">แผนก:</span>
                <span className="font-bold text-slate-800 uppercase">{previewFile.departmentId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ขนาดไฟล์:</span>
                <span className="font-bold text-slate-800">{previewFile.fileSizeFormatted}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ผู้อัปโหลด:</span>
                <span className="font-bold text-slate-800">{previewFile.uploadedBy}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เนื้อหาตัวอย่างไฟล์ (Snapshot / Content)
              </label>
              {previewFile.fileData && !previewFile.fileData.startsWith('data:image/') ? (
                <pre className="p-3 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {previewFile.fileData.slice(0, 3000)}
                </pre>
              ) : previewFile.fileData?.startsWith('data:image/') ? (
                <div className="p-2 border rounded-lg max-h-56 overflow-hidden flex items-center justify-center bg-slate-100">
                  <img
                    src={previewFile.fileData}
                    alt="Preview"
                    className="max-h-52 object-contain rounded"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-500 p-3 bg-slate-50 rounded-lg">
                  ไฟล์ชนิดไบนารี สามารถดาวน์โหลดเพื่อเปิดด้วยโปรแกรมต้นทางได้
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              {previewFile.fileData && (
                <button
                  onClick={() => handleDownloadFile(previewFile)}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์</span>
                </button>
              )}
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
