/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { RequestRecord, Teacher } from "../types";
import { flattenRequest } from "../data";
import { Download, CheckSquare, Square, FileSpreadsheet, Check, Search, Calendar } from "lucide-react";

interface ExportPanelProps {
  requests: RequestRecord[];
  teachers: Teacher[];
}

export default function ExportPanel({ requests, teachers }: ExportPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [exportComplete, setExportComplete] = useState(false);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequests.map((r) => r.RequestID));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.Subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.DocumentNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const triggerCsvDownload = () => {
    if (selectedIds.length === 0) {
      alert("กรุณาเลือกอย่างน้อย 1 รายการเพื่อทำการ Export");
      return;
    }

    const recordsToExport = requests.filter((r) => selectedIds.includes(r.RequestID));
    const flattenedList = recordsToExport.map((req, idx) => flattenRequest(req, idx, teachers));

    // Gather headers from the first record (which has over 150 headers)
    const headers = Object.keys(flattenedList[0]);

    // Build the CSV string with UTF-8 BOM
    let csvContent = "\uFEFF"; // Prepend BOM for Excel Thai language compatibility

    // Append headers line
    csvContent += headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";

    // Append rows
    flattenedList.forEach((row) => {
      const rowString = headers
        .map((header) => {
          const val = row[header];
          const strVal = val !== undefined && val !== null ? String(val) : "";
          return `"${strVal.replace(/"/g, '""')}"`;
        })
        .join(",");
      csvContent += rowString + "\n";
    });

    // Create a Blob and trigger a download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `PaiWit_Procurement_MailMerge_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportComplete(true);
    setTimeout(() => setExportComplete(false), 4000);
  };

  return (
    <div id="export_panel_view" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ส่งออกข้อมูลจดหมายเวียน (Mail Merge)</h1>
        <p className="text-slate-500 text-sm mt-1">
          เลือกหัวข้อโครงการที่ต้องการ แล้วทำการดาวน์โหลดไฟล์ CSV (ตารางพัสดุฟอร์มแบน 150+ ฟิลด์หลัก) เพื่อใช้ในการเปิด Mail Merge บน MS Word และพิมพ์เอกสารพัสดุรวดเดียว
        </p>
      </div>

      {exportComplete && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow-xs text-sm animate-in fade-in duration-200">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>ดึงข้อมูลและเตรียมไฟล์ดาวน์โหลดเสร็จสิ้น! หากไม่เริ่มดาวน์โหลด กรุณาเช็กสิทธิ์ป๊อปอัปเว็บเบราว์เซอร์</span>
        </div>
      )}

      {/* Select Table Operations */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาตามเรื่อง หรือ เลขหนังสือ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-slate-400 text-sm"
          />
        </div>

        <div className="flex w-full sm:w-auto items-center justify-end gap-3">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
          >
            {selectedIds.length === filteredRequests.length && filteredRequests.length > 0
              ? "ยกเลิกการเลือกทั้งหมด"
              : "เลือกทั้งหมดด้านล่าง"}
          </button>

          <button
            onClick={triggerCsvDownload}
            disabled={selectedIds.length === 0}
            className={`inline-flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg text-sm transition-all shadow-sm ${
              selectedIds.length > 0
                ? "bg-slate-800 hover:bg-slate-900 cursor-pointer"
                : "bg-slate-300 cursor-not-allowed opacity-60"
            }`}
          >
            <Download className="w-4 h-4" />
            ดาวน์โหลดไฟล์จดหมายเวียน ({selectedIds.length} รายการ)
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-xs uppercase tracking-wider">
              <th className="py-4 px-6 text-center w-12">เลือก</th>
              <th className="py-4 px-6">เลขประจำเรื่อง / เลขที่หนังสือ</th>
              <th className="py-4 px-6">ชื่อโครงการ / บันทึกขอจ้าง</th>
              <th className="py-4 px-6">ฝ่าย/กลุ่มงาน</th>
              <th className="py-4 px-6 text-right">วงเงินงบประมาณ</th>
              <th className="py-4 px-6 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => {
                const isSelected = selectedIds.includes(req.RequestID);
                return (
                  <tr
                    key={req.RequestID}
                    onClick={() => handleToggleSelect(req.RequestID)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-emerald-50/40 hover:bg-emerald-50/60" : "hover:bg-slate-50/50"
                    }`}
                  >
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleSelect(req.RequestID)}
                        className={`p-1 rounded transition-colors ${
                          isSelected ? "text-emerald-600" : "text-slate-300 hover:text-slate-400"
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-200" />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{req.DocumentNo || "ไม่มีเลข"}</div>
                      <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        เริ่มเมื่อ {req.StartDate || "-"}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-800 max-w-xs md:max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
                      {req.Subject}
                    </td>
                    <td className="py-4 px-6 text-slate-500">{req.Department}</td>
                    <td className="py-4 px-6 text-right font-semibold text-slate-900">
                      ฿{req.TotalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          req.Status === "Completed"
                            ? "bg-slate-100 text-slate-800"
                            : req.Status === "Submitted"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}
                      >
                        {req.Status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400 text-sm bg-slate-50/50">
                  ไม่มีหนังสือขออนุมัติหรือโครงงานที่ต้องการส่งออก
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Guide Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          วิธีการใช้งานไฟล์ส่งออกร่วมกับ Microsoft Word Mail Merge
        </h3>
        <ul className="text-xs text-slate-650 list-decimal list-inside space-y-2 leading-relaxed">
          <li>หลังจากดาวน์โหลดไฟล์ CSV นี้เรียบร้อยแล้ว ให้เปิด Microsoft Word ที่จัดเตรียมนิยามร่างจดหมายไว้</li>
          <li>ไปที่เมนู <b>"การส่งจดหมาย" (Mailings) &gt; "เลือกผู้รับ" (Select Recipients) &gt; "ใช้รายชื่อที่มีอยู่" (Use an Existing List...)</b></li>
          <li>เลือกชื่อไฟล์พัสดุ CSV ที่เพิ่งดาวน์โหลดมาจากโปรแกรมนี้เข้าเชื่อมโยง</li>
          <li>กด <b>"แทรกเขตข้อมูลผสาน" (Insert Merge Field)</b> เพื่อเลือกฟิลด์แบบไดนามิก เช่น <code>{"{{"}DocumentNo{"}}"}</code>, <code>{"{{"}TotalAmount{"}}"}</code>, <code>{"{{"}VendorName{"}}"}</code> บันทึกความปลอดภัยลงในเอกสารตามที่ตกลงกันไว้</li>
          <li>กดปุ่ม <b>"เสร็จสิ้นและผสาน" (Finish & Merge)</b> เพื่อพิมพ์ชุดเอกสารจ้างพัสดุทั้งหมดรวดเดียว</li>
        </ul>
      </div>
    </div>
  );
}
