/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { RequestRecord, Teacher, Vendor, SchoolSettings, RequestStatus } from "./types";
import { defaultSettings, defaultTeachers, defaultVendors, defaultRequests, flattenRequest, cleanDateString } from "./data";
import Dashboard from "./components/Dashboard";
import WizardForm from "./components/WizardForm";
import TeacherList from "./components/TeacherList";
import VendorList from "./components/VendorList";
import SettingsPanel from "./components/SettingsPanel";
import ExportPanel from "./components/ExportPanel";
import AppsScriptExporter from "./components/AppsScriptExporter";

import {
  LayoutDashboard,
  ClipboardCheck,
  FilePlus,
  Users2,
  Store,
  FileSpreadsheet,
  Settings,
  Code,
  Menu,
  X,
  School,
  RefreshCw,
  Cloud,
  Loader2,
} from "lucide-react";

export default function App() {
  // Navigation states: 'dashboard', 'wizard', 'teachers', 'vendors', 'export', 'settings', 'gas'
  const [activeMenu, setActiveMenu] = useState<string>("dashboard");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core database states
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);

  // Sync state transitions and background push states
  const [isPulling, setIsPulling] = useState(false);
  const [syncingState, setSyncingState] = useState<{
    id: string | null;
    type: "save" | "delete" | null;
    error: string | null;
    completed: boolean;
  }>({
    id: null,
    type: null,
    error: null,
    completed: false,
  });

  // Load database from localStorage or seed
  useEffect(() => {
    const localRequests = localStorage.getItem("paiwit_requests");
    const localTeachers = localStorage.getItem("paiwit_teachers");
    const localVendors = localStorage.getItem("paiwit_vendors");
    const localSettings = localStorage.getItem("paiwit_settings");

    if (localRequests) setRequests(JSON.parse(localRequests));
    else {
      setRequests(defaultRequests);
      localStorage.setItem("paiwit_requests", JSON.stringify(defaultRequests));
    }

    if (localTeachers) setTeachers(JSON.parse(localTeachers));
    else {
      setTeachers(defaultTeachers);
      localStorage.setItem("paiwit_teachers", JSON.stringify(defaultTeachers));
    }

    if (localVendors) setVendors(JSON.parse(localVendors));
    else {
      setVendors(defaultVendors);
      localStorage.setItem("paiwit_vendors", JSON.stringify(defaultVendors));
    }

    if (localSettings) setSettings(JSON.parse(localSettings));
    else {
      setSettings(defaultSettings);
      localStorage.setItem("paiwit_settings", JSON.stringify(defaultSettings));
    }
  }, []);

  // Sync state writes back to localStorage
  const syncRequests = (newList: RequestRecord[]) => {
    setRequests(newList);
    localStorage.setItem("paiwit_requests", JSON.stringify(newList));
  };

  const syncTeachers = (newList: Teacher[]) => {
    setTeachers(newList);
    localStorage.setItem("paiwit_teachers", JSON.stringify(newList));
  };

  const syncVendors = (newList: Vendor[]) => {
    setVendors(newList);
    localStorage.setItem("paiwit_vendors", JSON.stringify(newList));
  };

  const syncSettings = (newSettings: SchoolSettings) => {
    setSettings(newSettings);
    localStorage.setItem("paiwit_settings", JSON.stringify(newSettings));
  };

  // Reconstruction function to translate flat rows from Sheets back into full objects
  const unflattenRequest = (flat: any): RequestRecord => {
    const parseFormattedNum = (val: any, defaultVal: number = 0): number => {
      if (val === null || val === undefined || val === "") return defaultVal;
      if (typeof val === "number") return val;
      const cleanStr = String(val).replace(/,/g, "").trim();
      const num = Number(cleanStr);
      return isNaN(num) ? defaultVal : num;
    };

    const items: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const suffix = `_0${i}`;
      const name = flat[`Item_Name${suffix}`] || "";
      if (name) {
        items.push({
          id: `unflat_item_${i}`,
          name,
          qty: parseFormattedNum(flat[`Item_Qty${suffix}`], 1),
          unit: flat[`Item_Unit${suffix}`] || "รายการ",
          price: parseFormattedNum(flat[`Item_UnitPrice${suffix}`], 0),
          total: parseFormattedNum(flat[`Item_Total${suffix}`], 0),
        });
      }
    }

    const priceCommittee: any[] = [];
    for (let i = 1; i <= 5; i++) {
      const suffix = `_0${i}`;
      const teacherId = flat[`PriceCommittee_TeacherID${suffix}`] || "";
      const fullName = flat[`PriceCommittee_FullName${suffix}`] || "";
      if (teacherId || fullName) {
        priceCommittee.push({
          teacherId,
          fullName,
          position: flat[`PriceCommittee_Position${suffix}`] || "",
          role: flat[`PriceCommittee_Role${suffix}`] || "กรรมการ",
        });
      }
    }

    const inspectCommittee: any[] = [];
    for (let i = 1; i <= 5; i++) {
      const suffix = `_0${i}`;
      const teacherId = flat[`InspectionCommittee_TeacherID${suffix}`] || "";
      const fullName = flat[`InspectionCommittee_FullName${suffix}`] || "";
      if (teacherId || fullName) {
        inspectCommittee.push({
          teacherId,
          fullName,
          position: flat[`InspectionCommittee_Position${suffix}`] || "",
          role: flat[`InspectionCommittee_Role${suffix}`] || "กรรมการ",
        });
      }
    }

    const withdrawItems: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const suffix = `_0${i}`;
      const name = flat[`WithdrawItem_Name${suffix}`] || "";
      if (name) {
        withdrawItems.push({
          id: `unflat_w_item_${i}`,
          name,
          qty: Number(flat[`WithdrawItem_Qty${suffix}`] || 1),
          unit: flat[`WithdrawItem_Unit${suffix}`] || "รายการ",
        });
      }
    }

    const resultItems: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const suffix = `_0${i}`;
      const name = flat[`ResultItem_Name${suffix}`] || "";
      if (name) {
        resultItems.push({
          id: `unflat_r_item_${i}`,
          name,
          midPrice: parseFormattedNum(flat[`ResultItem_MidPrice${suffix}`], 0),
          actualPrice: parseFormattedNum(flat[`ResultItem_ActualPrice${suffix}`], 0),
        });
      }
    }

    return {
      RequestID: flat.RequestID || "",
      DocumentNo: flat.DocumentNo || "",
      BudgetYear: flat.BudgetYear || "",
      CreatedDate: cleanDateString(flat.CreatedDate || ""),
      UpdatedDate: cleanDateString(flat.UpdatedDate || ""),
      Status: flat.Status || "Draft",

      StartDate: cleanDateString(flat.StartDate || ""),
      Subject: flat.Subject || "",
      Department: flat.Department || "",
      NecessityReason: flat.NecessityReason || "",
      BudgetSource: flat.BudgetSource || "",
      TotalAmount: parseFormattedNum(flat.TotalAmount, 0),
      TotalAmountText: flat.TotalAmountText || "",
      DeliveryDays: Number(flat.DeliveryDays || 0),
      ItemsJSON: items,
      PriceCommitteeJSON: priceCommittee,
      InspectionCommitteeJSON: inspectCommittee,

      ActivityName: flat.ActivityName || "",

      DueDate: cleanDateString(flat.DueDate || ""),
      DeliveryPerson: flat.DeliveryPerson || "",
      WorkAmount: flat.WorkAmount || "",
      DeliveryBookNo: flat.DeliveryBookNo || "",
      DeliveryBookRef: flat.DeliveryBookRef || "",
      ProjectNo: flat.ProjectNo || "",
      ContractControlNo: flat.ContractControlNo || "",
      InspectionControlNo: flat.InspectionControlNo || "",

      PaymentMemo: flat.PaymentMemo || "",

      ProcurementMethod: flat.ProcurementMethod || "เฉพาะเจาะจง",

      AppointmentSubject: flat.AppointmentSubject || "",

      WithdrawDate: cleanDateString(flat.WithdrawDate || ""),
      ResponsiblePerson: flat.ResponsiblePerson || "",
      WithdrawItemsJSON: withdrawItems,

      ResultItemsJSON: resultItems,

      SchoolAddress: flat.SchoolAddress || "",
      SchoolPhone: flat.SchoolPhone || "",
      VendorName: flat.VendorName || "",
      VendorAddress: flat.VendorAddress || "",
      VendorPhone: flat.VendorPhone || "",
      VendorTaxID: flat.VendorTaxID || "",
      OrderItemsJSON: items,
      VATAmount: parseFormattedNum(flat.VATAmount, 0),
      GrandTotal: parseFormattedNum(flat.GrandTotal, 0),
      GrandTotalText: flat.GrandTotalText || "",

      Reserved01: flat.Reserved01 || "",
      Reserved02: flat.Reserved02 || "",
      Reserved03: flat.Reserved03 || "",
      Reserved04: flat.Reserved04 || "",
      Reserved05: flat.Reserved05 || "",
    };
  };

  const syncWithGoogleSheet = async (
    action: "saveRequest" | "deleteRequest",
    payload: any,
    currentRequestsList: RequestRecord[]
  ) => {
    if (!settings.AppsScriptUrl) return;

    const reqId = action === "saveRequest" ? payload.RequestID : payload;
    setSyncingState({
      id: reqId,
      type: action === "saveRequest" ? "save" : "delete",
      error: null,
      completed: false,
    });

    try {
      let bodyData: any = { action };
      if (action === "saveRequest") {
        const idx = currentRequestsList.findIndex((r) => r.RequestID === payload.RequestID);
        const flat = flattenRequest(payload, idx >= 0 ? idx : 0, teachers);
        bodyData.record = flat;
      } else {
        bodyData.requestId = payload;
      }

      await fetch(settings.AppsScriptUrl, {
        method: "POST",
        mode: "no-cors", // bypass browser CORS redirects
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(bodyData),
      });

      setSyncingState((prev) => ({
        ...prev,
        completed: true,
        error: null,
      }));
      
      setTimeout(() => {
        setSyncingState({ id: null, type: null, error: null, completed: false });
      }, 4000);
    } catch (err: any) {
      console.error("Sheets synchronization error:", err);
      setSyncingState((prev) => ({
        ...prev,
        error: err.message || "การเชื่อมต่อขัดข้อง",
      }));
    }
  };

  const pullDatabaseFromSheets = async () => {
    if (!settings.AppsScriptUrl) return;
    setIsPulling(true);
    try {
      const url =
        settings.AppsScriptUrl +
        (settings.AppsScriptUrl.includes("?") ? "&" : "?") +
        "action=getDatabase";
      const resp = await fetch(url);
      if (!resp.ok) throw new Error("Network status was not ok");
      const data = await resp.json();

      if (data) {
        if (data.requests && Array.isArray(data.requests) && data.requests.length > 0) {
          const parsedRequests: RequestRecord[] = data.requests.map((r: any) => unflattenRequest(r));
          syncRequests(parsedRequests);
        }

        if (data.teachers && Array.isArray(data.teachers) && data.teachers.length > 0) {
          syncTeachers(data.teachers);
        }

        if (data.vendors && Array.isArray(data.vendors) && data.vendors.length > 0) {
          syncVendors(data.vendors);
        }

        if (data.settings && typeof data.settings === "object" && Object.keys(data.settings).length > 0) {
          syncSettings({
            ...settings,
            ...data.settings,
            AppsScriptUrl: settings.AppsScriptUrl, // maintain current sync URL
          });
        }
        alert("โหลดและอัปเดตฐานข้อมูลกลางจาก Google Sheet เรียบร้อยแล้ว!");
      } else {
        alert("ไม่พบข้อมูลกลางใน Google Sheet");
      }
    } catch (err: any) {
      console.error("Failed to pull database from Google Sheets:", err);
      alert(
        "ไม่สามารถซิงค์ข้อมูลกับ Google Sheet ได้: กรุณาเช็คอินเทอร์เน็ต ตรวจสอบว่าใส่ URL ถูกต้อง และรัน setupDatabaseSheets ใน Apps Script และ Deploy เป็น Web App แบบ Everyone เรียบร้อยแล้ว"
      );
    } finally {
      setIsPulling(false);
    }
  };

  // ----------------------------------------------------
  // Actions Functions
  // ----------------------------------------------------
  const handleSaveRequest = (record: RequestRecord) => {
    const exists = requests.some((r) => r.RequestID === record.RequestID);
    let updated: RequestRecord[];
    if (exists) {
      updated = requests.map((r) => (r.RequestID === record.RequestID ? record : r));
    } else {
      updated = [record, ...requests];
    }
    syncRequests(updated);

    if (settings.AppsScriptUrl) {
      syncWithGoogleSheet("saveRequest", record, updated);
    }
  };

  const handleDeleteRequest = (id: string) => {
    const updated = requests.filter((r) => r.RequestID !== id);
    syncRequests(updated);

    if (settings.AppsScriptUrl) {
      syncWithGoogleSheet("deleteRequest", id, updated);
    }
  };

  const handleDuplicateRequest = (id: string) => {
    const match = requests.find((r) => r.RequestID === id);
    if (match) {
      const cloned: RequestRecord = {
        ...match,
        RequestID: "REQ-" + settings.CurrentBudgetYear + "-" + Math.floor(100 + Math.random() * 900),
        Subject: `${match.Subject} (สำเนาคัดลอก)`,
        DocumentNo: match.DocumentNo ? `${match.DocumentNo}-คัดลอก` : "",
        Status: RequestStatus.DRAFT,
        CreatedDate: new Date().toISOString().split("T")[0],
        UpdatedDate: new Date().toISOString().split("T")[0],
      };
      const updated = [cloned, ...requests];
      syncRequests(updated);
    }
  };

  const handleEditRequest = (id: string) => {
    setSelectedRequestId(id);
    setActiveMenu("wizard");
  };

  const handleSaveTeacher = (teacher: Teacher) => {
    const exists = teachers.some((t) => t.TeacherID === teacher.TeacherID);
    let updated: Teacher[];
    if (exists) {
      updated = teachers.map((t) => (t.TeacherID === teacher.TeacherID ? teacher : t));
    } else {
      updated = [...teachers, teacher];
    }
    syncTeachers(updated);
  };

  const handleDeleteTeacher = (id: string) => {
    const updated = teachers.filter((t) => t.TeacherID !== id);
    syncTeachers(updated);
  };

  const handleSaveVendor = (vendor: Vendor) => {
    const exists = vendors.some((v) => v.VendorID === vendor.VendorID);
    let updated: Vendor[];
    if (exists) {
      updated = vendors.map((v) => (v.VendorID === vendor.VendorID ? vendor : v));
    } else {
      updated = [...vendors, vendor];
    }
    syncVendors(updated);
  };

  const handleDeleteVendor = (id: string) => {
    const updated = vendors.filter((v) => v.VendorID !== id);
    syncVendors(updated);
  };

  const handleResetDatabase = () => {
    setRequests(defaultRequests);
    setTeachers(defaultTeachers);
    setVendors(defaultVendors);
    setSettings(defaultSettings);

    localStorage.setItem("paiwit_requests", JSON.stringify(defaultRequests));
    localStorage.setItem("paiwit_teachers", JSON.stringify(defaultTeachers));
    localStorage.setItem("paiwit_vendors", JSON.stringify(defaultVendors));
    localStorage.setItem("paiwit_settings", JSON.stringify(defaultSettings));
    alert("ระบบรีเซ็ตฐานข้อมูลกลางของคุณเรียบร้อยแล้ว!");
    setActiveMenu("dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <School className="w-6 h-6 text-emerald-400" />
          <span className="font-bold text-sm tracking-wide">จัดซื้อพัสดุ ปายวิทยาคาร</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 transition-transform duration-250 border-r border-slate-800`}
      >
        <div className="flex flex-col gap-6 p-6">
          {/* Logo Brand Header */}
          <div className="hidden md:flex items-center gap-2 pb-4 border-b border-slate-800">
            <School className="w-7 h-7 text-emerald-400 shrink-0" />
            <div>
              <h1 className="font-bold text-white text-sm leading-tight tracking-wide">ปายวิทยาคาร</h1>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Procurement Docs</span>
            </div>
          </div>

          {/* Menus List */}
          <nav className="space-y-1">
            {/* Dashboard menu */}
            <button
              onClick={() => {
                setActiveMenu("dashboard");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeMenu === "dashboard" ? "bg-emerald-600 text-white font-bold" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              แผงควบคุมหลัก (Dashboard)
            </button>

            {/* Create New Wizard menu */}
            <button
              onClick={() => {
                setSelectedRequestId(null);
                setActiveMenu("wizard");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeMenu === "wizard" && !selectedRequestId
                  ? "bg-emerald-600 text-white font-bold"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FilePlus className="w-4 h-4 shrink-0" />
              จัดทำเอกสารใหม่
            </button>

            {/* Manage Teachers database */}
            <button
              onClick={() => {
                setActiveMenu("teachers");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeMenu === "teachers" ? "bg-emerald-600 text-white font-bold" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Users2 className="w-4 h-4 shrink-0" />
              จัดการฐานข้อมูลครู
            </button>

            {/* Manage Vendors lists */}
            <button
              onClick={() => {
                setActiveMenu("vendors");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeMenu === "vendors" ? "bg-emerald-600 text-white font-bold" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Store className="w-4 h-4 shrink-0" />
              จัดการข้อมูลร้านค้า
            </button>

            {/* Export options */}
            <button
              onClick={() => {
                setActiveMenu("export");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeMenu === "export" ? "bg-emerald-600 text-white font-bold" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              ส่งออก Mail Merge
            </button>

            {/* Integration manual & apps script code */}
            <button
              onClick={() => {
                setActiveMenu("gas");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeMenu === "gas" ? "bg-emerald-600 text-white font-bold" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Code className="w-4 h-4 shrink-0" />
              ติดตั้ง Google Apps Script
            </button>

            {/* Institutional Settings */}
            <button
              onClick={() => {
                setActiveMenu("settings");
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeMenu === "settings" ? "bg-emerald-600 text-white font-bold" : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              ตั้งค่าระบบ
            </button>
          </nav>

          {/* Google Sheets Cloud Sync Widget */}
          {settings.AppsScriptUrl && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 px-1 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  เชื่อมต่อ Google Sheet แล้ว
                </span>
                {syncingState.completed ? (
                  <span className="text-[10px] text-emerald-400 font-semibold px-1 rounded bg-emerald-950">ซิงค์แล้ว</span>
                ) : syncingState.id ? (
                  <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                ) : null}
              </div>

              {syncingState.id && (
                <div className="bg-slate-950/50 p-2 rounded text-[10px] space-y-1 text-slate-400 leading-tight">
                  <div className="flex justify-between">
                    <span>ประเภท:</span>
                    <span className="font-semibold text-slate-300">
                      {syncingState.type === "save" ? "อัปโหลดใบขอ/แก้ไข" : "ลบเอกสาร"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400 font-mono">
                    <span className="truncate max-w-[100px]">{syncingState.id}</span>
                    <span>{syncingState.completed ? "สำเร็จ!" : "กำลังซิงค์..."}</span>
                  </div>
                </div>
              )}

              <button
                onClick={pullDatabaseFromSheets}
                disabled={isPulling}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-950 hover:bg-emerald-900 active:bg-emerald-950 text-emerald-400 hover:text-emerald-300 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {isPulling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                {isPulling ? "กำลังดาวน์โหลด..." : "ดึงข้อมูลจาก Sheet"}
              </button>
            </div>
          )}
        </div>

        {/* School Footer notation */}
        <div className="p-6 border-t border-slate-800 text-[10px] text-slate-500 space-y-1 shrink-0">
          <div>รร.ปายวิทยาคาร จ.แม่ฮ่องสอน</div>
          <div>© {new Date().getFullYear()} ผลสัมฤทธิ์ทางการพัฒนาพัสดุ</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {activeMenu === "dashboard" && (
          <Dashboard
            requests={requests}
            teachers={teachers}
            vendors={vendors}
            onEditRequest={handleEditRequest}
            onDuplicateRequest={handleDuplicateRequest}
            onDeleteRequest={handleDeleteRequest}
            onNavigateToWizard={() => {
              setSelectedRequestId(null);
              setActiveMenu("wizard");
            }}
          />
        )}

        {activeMenu === "wizard" && (
          <WizardForm
            requestId={selectedRequestId}
            requests={requests}
            teachers={teachers}
            vendors={vendors}
            onSaveRequest={(rec) => {
              handleSaveRequest(rec);
              setSelectedRequestId(rec.RequestID); // Keep selection
            }}
            onNavigateToDashboard={() => setActiveMenu("dashboard")}
          />
        )}

        {activeMenu === "teachers" && (
          <TeacherList teachers={teachers} onSaveTeacher={handleSaveTeacher} onDeleteTeacher={handleDeleteTeacher} />
        )}

        {activeMenu === "vendors" && (
          <VendorList vendors={vendors} onSaveVendor={handleSaveVendor} onDeleteVendor={handleDeleteVendor} />
        )}

        {activeMenu === "export" && <ExportPanel requests={requests} teachers={teachers} />}

        {activeMenu === "settings" && (
          <SettingsPanel settings={settings} onSaveSettings={syncSettings} onResetDatabase={handleResetDatabase} />
        )}

        {activeMenu === "gas" && <AppsScriptExporter />}
      </main>

      {/* Mobile background overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 md:hidden"
        />
      )}
    </div>
  );
}
