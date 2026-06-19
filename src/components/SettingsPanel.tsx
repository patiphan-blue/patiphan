/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SchoolSettings } from "../types";
import { Save, RefreshCw, AlertTriangle, Check, BookOpen } from "lucide-react";

interface SettingsPanelProps {
  settings: SchoolSettings;
  onSaveSettings: (settings: SchoolSettings) => void;
  onResetDatabase: () => void;
}

export default function SettingsPanel({ settings, onSaveSettings, onResetDatabase }: SettingsPanelProps) {
  const [schoolName, setSchoolName] = useState(settings.SchoolName);
  const [schoolAddress, setSchoolAddress] = useState(settings.SchoolAddress);
  const [schoolPhone, setSchoolPhone] = useState(settings.SchoolPhone);
  const [directorName, setDirectorName] = useState(settings.DirectorName);
  const [directorPosition, setDirectorPosition] = useState(settings.DirectorPosition);
  const [currentBudgetYear, setCurrentBudgetYear] = useState(settings.CurrentBudgetYear);
  const [appsScriptUrl, setAppsScriptUrl] = useState(settings.AppsScriptUrl || "");
  const [showNotification, setShowNotification] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      SchoolName: schoolName,
      SchoolAddress: schoolAddress,
      SchoolPhone: schoolPhone,
      DirectorName: directorName,
      DirectorPosition: directorPosition,
      CurrentBudgetYear: currentBudgetYear,
      AppsScriptUrl: appsScriptUrl,
    });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div id="settings_panel_view" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ตั้งค่าข้อมูลโรงเรียน</h1>
          <p className="text-slate-500 text-sm mt-1">
            ระบุรายละเอียดเบื้องต้นของโรงเรียนเพื่อกรอกหัวกระดาษและชื่อผู้แทนจัดลงนามโดยอัตโนมัติ
          </p>
        </div>
      </div>

      {showNotification && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-xs text-sm animate-in fade-in duration-200">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>บันทึกข้อมูลตั้งค่าโรงเรียนเรียบร้อยแล้ว รายการเอกสารทั้งหมดจะอัปเดตตามค่าใหม่ทันที!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
            โปรไฟล์โรงเรียนและการลงนาม
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อโรงเรียน *</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ปีงบประมาณปัจจุบัน *</label>
                <input
                  type="text"
                  required
                  value={currentBudgetYear}
                  onChange={(e) => setCurrentBudgetYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 font-mono"
                  placeholder="เช่น 2569"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ที่ตั้ง / ที่ทำงานของส่วนราชการ *</label>
              <input
                type="text"
                required
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">เบอร์โทรศัพท์สถานศึกษา *</label>
                <input
                  type="text"
                  required
                  value={schoolPhone}
                  onChange={(e) => setSchoolPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อผู้อำนวยการโรงเรียนสูงสุด *</label>
                <input
                  type="text"
                  required
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">ตำแหน่งทางการของผู้อำนวยการ *</label>
              <input
                type="text"
                required
                value={directorPosition}
                onChange={(e) => setDirectorPosition(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
              />
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Google Apps Script Web App URL (ถ้ามีเพื่อเชื่อมต่อ Google Sheets)</label>
              <input
                type="url"
                value={appsScriptUrl}
                onChange={(e) => setAppsScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 font-mono bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400"
              />
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                เมื่อประยุกต์ใช้ URL นี้ ระบบจะซิงค์รายการจัดทำเอกสาร (บันทึก, แก้ไข, ลบ) ไปยังระบบตารางแยก (Google Sheet) ของสถานศึกษาโดยอัตโนมัติแบบ Real-time
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                บันทึกค่าที่ตั้ง
              </button>
            </div>
          </form>
        </div>

        {/* Info & Danger Zone */}
        <div className="space-y-6">
          {/* Helpful Tips */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-slate-600" />
              การอ้างสิทธิ์และกรอกเอกสาร
            </h3>
            <ul className="text-xs text-slate-600 list-disc list-inside space-y-2">
              <li>
                ข้อมูลผู้อำนวยการโรงเรียน จะถูกใช้เป็นผู้ลงนามในหนังสือ<b>รายงานขอจ้าง</b>,
                <b>ประกาศผู้ชนะเสนอราคา</b> และ <b>ใบสั่งจ้างพัสดุ</b>
              </li>
              <li>
                <b>ที่ตั้งและเบอร์โทร</b> จะระบุในใบสั่งซื้อสั่งจ้างโดยตรง
              </li>
              <li>การแก้ไขที่นี่ จะไม่ไปทำลายข้อมูลร่างที่เคยสร้างไว้ แต่อุปกรณ์และตำแหน่งจะโหลดจากโรงเรียน ณ วันที่สร้างขึ้นใหม่</li>
            </ul>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/50 rounded-xl border border-red-200 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">จัดการข้อมูลและคลังข้อมูล</h3>
                <p className="text-xs text-red-600 mt-1">
                  เมื่อระบบมีการสั่งงานผิดพลาดหรือต้องการเริ่มทดลองซอฟต์แวร์ใหม่ สามารถล้างฐานข้อมูลกลับเป็นจุดเริ่มต้นได้ทันที
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 hover:bg-red-50 text-red-700 font-semibold rounded-lg text-sm transition-colors w-full justify-center bg-white cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                รีเซ็ตข้อมูลทั้งหมดกลับค่าเริ่มต้น
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Reset DATABASE Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-650">
                <div className="p-2 bg-red-50 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-655 animate-bounce" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  ยืนยันรีเซ็ตฐานข้อมูลทั้งหมด?
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                <b className="text-red-600 block mb-1">คำเตือนสำคัญ:</b> 
                การกระทำนี้จะลบรายการขอซื้อขอจ้าง, รายชื่อครู และรายชื่อร้านค้าในเว็บและ Local Storage ของคุณทั้งหมดกลับไปเริ่มใหม่! หากคุณมี URL ของ Google Sheet เชื่อมอยู่ โครงสร้างข้อมูลท้องถิ่นจะถูกรีเซ็ตเพื่อเตรียมพร้อมสำหรับการเริ่มใหม่
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 text-xs font-semibold cursor-pointer transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDatabase();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                ยืนยันการตั้งค่าเริ่มต้นใหม่
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
