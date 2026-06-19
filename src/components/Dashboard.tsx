/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { RequestRecord, RequestStatus, Teacher, Vendor } from "../types";
import { defaultSettings } from "../data";
import { FileText, ClipboardList, CheckCircle, Users, Store, TrendingUp, Calendar, ArrowRight, Edit, Copy, Trash, AlertTriangle, X } from "lucide-react";

interface DashboardProps {
  requests: RequestRecord[];
  teachers: Teacher[];
  vendors: Vendor[];
  onEditRequest: (id: string) => void;
  onDuplicateRequest: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onNavigateToWizard: () => void;
}

export default function Dashboard({
  requests,
  teachers,
  vendors,
  onEditRequest,
  onDuplicateRequest,
  onDeleteRequest,
  onNavigateToWizard,
}: DashboardProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetSubject, setDeleteTargetSubject] = useState<string>("");

  const totalRequests = requests.length;
  const draftRequests = requests.filter((r) => r.Status === RequestStatus.DRAFT).length;
  const submittedRequests = requests.filter((r) => r.Status === RequestStatus.SUBMITTED).length;
  const totalBudget = requests.reduce((sum, r) => sum + r.TotalAmount, 0);

  // Budget source distribution
  const budgetBySource: Record<string, number> = {};
  requests.forEach((r) => {
    const src = r.BudgetSource || "อื่น ๆ / ไม่ระบุ";
    budgetBySource[src] = (budgetBySource[src] || 0) + r.TotalAmount;
  });

  return (
    <div id="dashboard_view" className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <FileText className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider backdrop-blur-sm">
            สังกัด สพม.แม่ฮ่องสอน
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">ระบบเอกสารจัดซื้อจัดจ้าง โรงเรียนปายวิทยาคาร</h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans">
            ระบบจัดเก็บฐานข้อมูลกลางแบบรอบเดียว (Single-Entry Database) ช่วยคุณครูจัดซื้อและเจ้าหน้าที่พัสดุ
            ลดภาระงานกรอกเอกสาร ลดความเสี่ยงเอกสารไม่สมบูรณ์ พร้อมส่งออกดึงจดหมายเวียน Mail Merge ทันที
          </p>
          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={onNavigateToWizard}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-all shadow-sm cursor-pointer"
            >
              สร้างหนังสือขออนุมัติใหม่
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold">โครงการทั้งหมด</span>
            <div className="text-2xl font-bold text-slate-800">{totalRequests} <span className="text-sm font-normal text-slate-400">เรื่อง</span></div>
          </div>
          <div className="bg-slate-100 p-3 rounded-lg text-slate-600">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold">ฉบับร่าง (Draft)</span>
            <div className="text-2xl font-bold text-amber-600">{draftRequests} <span className="text-sm font-normal text-slate-400">เรื่อง</span></div>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold">เสนอยื่นแล้ว</span>
            <div className="text-2xl font-bold text-blue-600">{submittedRequests} <span className="text-sm font-normal text-slate-400">เรื่อง</span></div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold">รวมงบประมาณจัดสรร</span>
            <div className="text-lg md:text-xl font-bold text-emerald-700">
              ฿{totalBudget.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Submissions & Drafts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">รายการพัสดุและจัดจ้างล่าสุด</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div key={req.RequestID} className="p-5 hover:bg-slate-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-sm sm:max-w-md md:max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded">
                        {req.RequestID}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          req.Status === "Submitted"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {req.Status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 md:line-clamp-1">{req.Subject}</h3>
                    <p className="text-xs text-slate-500 max-w-lg overflow-hidden text-ellipsis whitespace-nowrap">
                      <b>เลขหนังสือ:</b> {req.DocumentNo || "ไม่ระบุ"} | <b>แหล่งเงิน:</b> {req.BudgetSource}
                    </p>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5 font-sans">
                      <Calendar className="w-3.5 h-3.5" />
                      เปิดร่าง วันทื่ {req.CreatedDate}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <span className="text-sm font-bold text-slate-800">
                      ฿{req.TotalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    
                    {/* Action buttons */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onEditRequest(req.RequestID)}
                        className="p-1 px-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors text-xs inline-flex items-center gap-1 cursor-pointer"
                        title="กรอก/แก้ไขข้อมูล 9 หน้า"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        แก้ไข
                      </button>
                      <button
                        onClick={() => onDuplicateRequest(req.RequestID)}
                        className="p-1 px-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors text-xs inline-flex items-center gap-1 cursor-pointer"
                        title="คัดลอกเป็นฉบับร่างใหม่"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        คัดลอก
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTargetId(req.RequestID);
                          setDeleteTargetSubject(req.Subject || "ไม่ระบุเรื่อง");
                        }}
                        className="p-1 px-2 border border-red-100 hover:bg-red-50 rounded-lg text-red-600 transition-colors text-xs inline-flex items-center gap-1 cursor-pointer"
                        title="ลบเอกสาร"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-400 text-sm">
                ไม่มีประวัติโครงงานหรือรายงานจัดจ้างขณะนี้ กดพาสปอร์ตสร้างรายการแรกของท่านได้ที่ปุ่มสีเขียวด้านบน
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini Database Summaries */}
        <div className="space-y-6">
          {/* Quick Stats Database */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">สถิติระบบจัดเก็บกลาง</h2>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4 text-emerald-600" />
                  รายชื่อบุคลากรครูที่บันทึก
                </span>
                <span className="font-bold text-slate-800">{teachers.length} ท่าน</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <Store className="w-4 h-4 text-emerald-600" />
                  จำนวนร้านค้า / ห้างหุ้นส่วน
                </span>
                <span className="font-bold text-slate-800">{vendors.length} แห่ง</span>
              </div>
            </div>
          </div>

          {/* School Profile Summary Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">โปรไฟล์องค์กรลงนาม</h2>
            <div className="text-xs space-y-2 leading-relaxed text-slate-650">
              <div><b>สถาบัน:</b> {defaultSettings.SchoolName}</div>
              <div><b>ที่อยู่พัสดุ:</b> {defaultSettings.SchoolAddress}</div>
              <div><b>ผู้ลงตำแหน่งอนุมัติ:</b> {defaultSettings.DirectorName}</div>
              <div><b>ฐานะทางการ:</b> {defaultSettings.DirectorPosition}</div>
              <div><b>ปีจัดสรร:</b> ปีงบประมาณ พ.ศ. {defaultSettings.CurrentBudgetYear}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2 bg-red-50 rounded-full">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  ยืนยันการลบเอกสารพัสดุ?
                </h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-sans">
                คุณชัวร์หรือไม่ที่จะลบรายการจัดจ้างพัสดุ <span className="font-bold text-slate-800">"{deleteTargetSubject}"</span> นี้ออกจากระบบ? การดำเนินการนี้ไม่สามารถย้อนกลับได้ และหากเชื่อมโยง Google Sheets ข้อมูลจะซิงค์ลบออกทันที
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeleteTargetId(null);
                  setDeleteTargetSubject("");
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 text-xs font-semibold cursor-pointer transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteTargetId) {
                    onDeleteRequest(deleteTargetId);
                    setDeleteTargetId(null);
                    setDeleteTargetSubject("");
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Trash className="w-3.5 h-3.5" />
                ยืนยันการลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
