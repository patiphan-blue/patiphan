/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { RequestRecord, RequestStatus, Teacher, Vendor, Item, CommitteeMember, WithdrawItem, ResultItem, ProcurementMethod } from "../types";
import { defaultSettings, bahtText, formatDateToThai, cleanDateString } from "../data";
import { ArrowLeft, ArrowRight, Save, Check, Plus, Trash2, Calendar, FileText, Printer, Eye, EyeOff, ClipboardCheck } from "lucide-react";

interface MoneyInputProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  placeholder?: string;
}

function MoneyInput({ value, onChange, className, placeholder }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (value === 0) return "";
    return value.toLocaleString("en-US", { maximumFractionDigits: 10 });
  });

  useEffect(() => {
    const cleanOutside = parseFloat(displayValue.replace(/,/g, "")) || 0;
    if (cleanOutside !== value) {
      setDisplayValue(value === 0 ? "" : value.toLocaleString("en-US", { maximumFractionDigits: 10 }));
    }
  }, [value, displayValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    let sanitized = rawValue.replace(/[^0-9.,]/g, "");
    
    const dotIndex = sanitized.indexOf(".");
    if (dotIndex !== -1) {
      sanitized = 
        sanitized.substring(0, dotIndex + 1) + 
        sanitized.substring(dotIndex + 1).replace(/\./g, "");
    }
    
    const parts = sanitized.split(".");
    const integerPart = parts[0].replace(/,/g, "");
    
    let formattedInteger = integerPart;
    if (integerPart && !isNaN(Number(integerPart))) {
      formattedInteger = Number(integerPart).toLocaleString("en-US");
    }
    
    const finalFormatted = parts.length > 1 ? `${formattedInteger}.${parts[1]}` : formattedInteger;
    setDisplayValue(finalFormatted);
    
    const numericValue = parseFloat(finalFormatted.replace(/,/g, "")) || 0;
    onChange(numericValue);
  };

  const handleBlur = () => {
    const cleanVal = parseFloat(displayValue.replace(/,/g, "")) || 0;
    setDisplayValue(cleanVal === 0 ? "" : cleanVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    onChange(cleanVal);
  };

  const handleFocus = () => {
    const cleanVal = parseFloat(displayValue.replace(/,/g, "")) || 0;
    if (cleanVal !== 0) {
      setDisplayValue(cleanVal.toLocaleString("en-US", { maximumFractionDigits: 10 }));
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={className}
    />
  );
}

interface WizardFormProps {
  requestId: string | null; // Null means create new
  requests: RequestRecord[];
  teachers: Teacher[];
  vendors: Vendor[];
  onSaveRequest: (record: RequestRecord) => void;
  onNavigateToDashboard: () => void;
}

export default function WizardForm({
  requestId,
  requests,
  teachers,
  vendors,
  onSaveRequest,
  onNavigateToDashboard,
}: WizardFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showDraftToast, setShowDraftToast] = useState(false);

  // Load request if editing, otherwise prepare a fresh one
  const [formData, setFormData] = useState<RequestRecord>({
    RequestID: "",
    DocumentNo: "",
    BudgetYear: defaultSettings.CurrentBudgetYear,
    CreatedDate: new Date().toISOString().split("T")[0],
    UpdatedDate: new Date().toISOString().split("T")[0],
    Status: RequestStatus.DRAFT,

    // Page 1
    StartDate: new Date().toISOString().split("T")[0],
    Subject: "",
    Department: "กลุ่มงานบริหารทั่วไป",
    NecessityReason: "",
    BudgetSource: "เงินอุดหนุนรายหัว",
    TotalAmount: 0,
    TotalAmountText: "ศูนย์บาทถ้วน",
    DeliveryDays: 15,
    ItemsJSON: [],
    PriceCommitteeJSON: [],
    InspectionCommitteeJSON: [],

    // Page 2
    ActivityName: "",

    // Page 3
    DueDate: "",
    DeliveryPerson: "",
    WorkAmount: "1 งาน",
    DeliveryBookNo: "",
    DeliveryBookRef: "",
    ProjectNo: "",
    ContractControlNo: "",
    InspectionControlNo: "",

    // Page 4
    PaymentMemo: "ขออนุมัติเบิกจ่ายตามระเบียบพัสดุ",

    // Page 5
    ProcurementMethod: ProcurementMethod.SPECIFIC,

    // Page 6
    AppointmentSubject: "แต่งตั้งคณะกรรมการตรวจรับพัสดุ",

    // Page 7
    WithdrawDate: new Date().toISOString().split("T")[0],
    ResponsiblePerson: "",
    WithdrawItemsJSON: [],

    // Page 8
    ResultItemsJSON: [],

    // Page 9
    SchoolAddress: defaultSettings.SchoolAddress,
    SchoolPhone: defaultSettings.SchoolPhone,
    VendorName: "",
    VendorAddress: "",
    VendorPhone: "",
    VendorTaxID: "",
    OrderItemsJSON: [],
    VATAmount: 0,
    GrandTotal: 0,
    GrandTotalText: "ศูนย์บาทถ้วน",
  });

  const [isManualDelivery, setIsManualDelivery] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [scaleMode, setScaleMode] = useState<"auto" | number>("auto");
  const [previewScale, setPreviewScale] = useState(0.85);

  const previewContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPreview) return;
    
    if (scaleMode !== "auto") {
      setPreviewScale(scaleMode);
      return;
    }

    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth;
        const padding = 20; // safe padding
        const targetScale = Math.min(1.0, (containerWidth - padding) / 520);
        setPreviewScale(parseFloat(Math.max(0.4, targetScale).toFixed(2)));
      }
    };

    updateScale();

    const observer = new ResizeObserver(() => {
      updateScale();
    });

    if (previewContainerRef.current) {
      observer.observe(previewContainerRef.current);
    }

    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [showPreview, scaleMode]);

  useEffect(() => {
    if (requestId) {
      const match = requests.find((r) => r.RequestID === requestId);
      if (match) {
        setFormData({
          ...match,
          Reserved01: match.Reserved01 || formatDateToThai(match.StartDate),
          Reserved02: match.Reserved02 || formatDateToThai(match.DueDate),
          Reserved03: match.Reserved03 || formatDateToThai(match.WithdrawDate),
        });
        const isRegistered = vendors.some((v) => v.VendorName === match.DeliveryPerson);
        setIsManualDelivery(match.DeliveryPerson ? !isRegistered : false);
      }
    } else {
      // Create new fresh state
      const newID = "REQ-" + defaultSettings.CurrentBudgetYear + "-" + Math.floor(100+Math.random()*900);
      const initialStartDate = new Date().toISOString().split("T")[0];
      const initialDeliveryDays = 15;
      const initialDueDateObj = new Date(initialStartDate);
      initialDueDateObj.setDate(initialDueDateObj.getDate() + initialDeliveryDays);
      const initialDueDate = initialDueDateObj.toISOString().split("T")[0];
      const initialWithdrawDate = new Date().toISOString().split("T")[0];

      setFormData((prev) => ({
        ...prev,
        RequestID: newID,
        CreatedDate: new Date().toISOString().split("T")[0],
        UpdatedDate: new Date().toISOString().split("T")[0],
        SchoolAddress: defaultSettings.SchoolAddress,
        SchoolPhone: defaultSettings.SchoolPhone,
        StartDate: initialStartDate,
        DueDate: initialDueDate,
        WithdrawDate: initialWithdrawDate,
        Reserved01: formatDateToThai(initialStartDate),
        Reserved02: formatDateToThai(initialDueDate),
        Reserved03: formatDateToThai(initialWithdrawDate),
      }));
      setIsManualDelivery(false);
    }
  }, [requestId, requests, vendors]);

  // Handle simple input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let cleanedValue = value;
      if (name === "StartDate" || name === "DueDate" || name === "WithdrawDate") {
        cleanedValue = cleanDateString(value);
      }
      const updated = { ...prev, [name]: cleanedValue };

      // Multi-page automatic calculations
      if (name === "StartDate" || name === "DeliveryDays") {
        const days = parseInt(String(updated.DeliveryDays)) || 0;
        const d = new Date(updated.StartDate);
        if (!isNaN(d.getTime())) {
          d.setDate(d.getDate() + days);
          updated.DueDate = d.toISOString().split("T")[0];
          updated.Reserved02 = formatDateToThai(updated.DueDate);
        }
        updated.Reserved01 = formatDateToThai(updated.StartDate);
      }

      if (name === "WithdrawDate") {
        updated.Reserved03 = formatDateToThai(updated.WithdrawDate);
      }

      return updated;
    });
  };

  // ----------------------------------------------------
  // Page 1 Item List Helper
  // ----------------------------------------------------
  const handleAddItem = () => {
    const newItem: Item = {
      id: "item_" + Date.now(),
      name: "",
      qty: 1,
      unit: "รายการ",
      price: 0,
      total: 0,
    };
    setFormData((prev) => {
      const updatedItems = [...prev.ItemsJSON, newItem];
      const totalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
      return {
        ...prev,
        ItemsJSON: updatedItems,
        TotalAmount: totalAmount,
        TotalAmountText: bahtText(totalAmount),
        // Sync OrderItemsJSON as well
        OrderItemsJSON: updatedItems,
        GrandTotal: totalAmount + (prev.VATAmount || 0),
        GrandTotalText: bahtText(totalAmount + (prev.VATAmount || 0)),
      };
    });
  };

  const handleUpdateItem = (index: number, field: keyof Item, val: any) => {
    setFormData((prev) => {
      const updatedItems = prev.ItemsJSON.map((item, idx) => {
        if (idx !== index) return item;
        const updatedItem = { ...item, [field]: val };
        if (field === "qty" || field === "price") {
          updatedItem.total = (parseFloat(String(updatedItem.qty)) || 0) * (parseFloat(String(updatedItem.price)) || 0);
        }
        return updatedItem;
      });
      const totalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
      return {
        ...prev,
        ItemsJSON: updatedItems,
        TotalAmount: totalAmount,
        TotalAmountText: bahtText(totalAmount),
        OrderItemsJSON: updatedItems,
        GrandTotal: totalAmount + (prev.VATAmount || 0),
        GrandTotalText: bahtText(totalAmount + (prev.VATAmount || 0)),
      };
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => {
      const updatedItems = prev.ItemsJSON.filter((_, idx) => idx !== index);
      const totalAmount = updatedItems.reduce((sum, item) => sum + item.total, 0);
      return {
        ...prev,
        ItemsJSON: updatedItems,
        TotalAmount: totalAmount,
        TotalAmountText: bahtText(totalAmount),
        OrderItemsJSON: updatedItems,
        GrandTotal: totalAmount + (prev.VATAmount || 0),
        GrandTotalText: bahtText(totalAmount + (prev.VATAmount || 0)),
      };
    });
  };

  // ----------------------------------------------------
  // Page 1 Committees Helper
  // ----------------------------------------------------
  const handleAddCommittee = (type: "price" | "inspection") => {
    if (teachers.length === 0) return;
    const defaultTeacher = teachers[0];
    const newMember: CommitteeMember = {
      teacherId: defaultTeacher.TeacherID,
      fullName: defaultTeacher.FullName,
      position: defaultTeacher.Position,
      role: type === "price" && formData.PriceCommitteeJSON.length === 0 ? "ประธานกรรมการ" : "กรรมการ",
    };

    setFormData((prev) => {
      if (type === "price") {
        return { ...prev, PriceCommitteeJSON: [...prev.PriceCommitteeJSON, newMember] };
      } else {
        return { ...prev, InspectionCommitteeJSON: [...prev.InspectionCommitteeJSON, newMember] };
      }
    });
  };

  const handleUpdateCommittee = (type: "price" | "inspection", index: number, field: keyof CommitteeMember, val: string) => {
    setFormData((prev) => {
      const list = type === "price" ? [...prev.PriceCommitteeJSON] : [...prev.InspectionCommitteeJSON];
      if (field === "teacherId") {
        const teacherMatch = teachers.find((t) => t.TeacherID === val);
        if (teacherMatch) {
          list[index].teacherId = val;
          list[index].fullName = teacherMatch.FullName;
          list[index].position = teacherMatch.Position;
        }
      } else {
        list[index][field] = val;
      }

      if (type === "price") {
        return { ...prev, PriceCommitteeJSON: list };
      } else {
        return { ...prev, InspectionCommitteeJSON: list };
      }
    });
  };

  const handleRemoveCommittee = (type: "price" | "inspection", index: number) => {
    setFormData((prev) => {
      if (type === "price") {
        return { ...prev, PriceCommitteeJSON: prev.PriceCommitteeJSON.filter((_, idx) => idx !== index) };
      } else {
        return { ...prev, InspectionCommitteeJSON: prev.InspectionCommitteeJSON.filter((_, idx) => idx !== index) };
      }
    });
  };

  // ----------------------------------------------------
  // Page 7 Withdraw Helper
  // ----------------------------------------------------
  const handleAddWithdrawItem = () => {
    const newItem: WithdrawItem = {
      id: "w_" + Date.now(),
      name: "",
      qty: 1,
      unit: "ชิ้น",
    };
    setFormData((prev) => ({
      ...prev,
      WithdrawItemsJSON: [...prev.WithdrawItemsJSON, newItem],
    }));
  };

  const handleRemoveWithdrawItem = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      WithdrawItemsJSON: prev.WithdrawItemsJSON.filter((_, i) => i !== idx),
    }));
  };

  const handleUpdateWithdrawItem = (index: number, field: keyof WithdrawItem, val: any) => {
    setFormData((prev) => {
      const list = prev.WithdrawItemsJSON.map((item, i) => {
        if (i !== index) return item;
        return { ...item, [field]: val };
      });
      return { ...prev, WithdrawItemsJSON: list };
    });
  };

  // ----------------------------------------------------
  // Page 9 Vendor Dropdown Handler
  // ----------------------------------------------------
  const handleSelectVendor = (vendorNameStr: string) => {
    const match = vendors.find((v) => v.VendorName === vendorNameStr);
    if (match) {
      setFormData((prev) => ({
        ...prev,
        VendorName: match.VendorName,
        VendorAddress: match.VendorAddress,
        VendorPhone: match.Phone,
        VendorTaxID: match.TaxID,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        VendorName: vendorNameStr,
      }));
    }
  };

  // ----------------------------------------------------
  // Global Save & Actions
  // ----------------------------------------------------
  const handleSaveDraft = () => {
    const updated = {
      ...formData,
      Status: RequestStatus.DRAFT,
      UpdatedDate: new Date().toISOString().split("T")[0],
    };
    onSaveRequest(updated);
    setShowDraftToast(true);
    setTimeout(() => setShowDraftToast(false), 3000);
  };

  const handleSaveAndSubmit = () => {
    if (!formData.Subject || !formData.DocumentNo) {
      alert("กรุณากรอกหัวข้อเรื่องจัดซื้อพัสดุ และ เลขที่หนังสือหนังสือขอซื้อขอจ้าง ก่อนทำส่งเอกสารอนุมัติ!");
      setCurrentStep(1);
      return;
    }

    const updated = {
      ...formData,
      Status: RequestStatus.SUBMITTED,
      UpdatedDate: new Date().toISOString().split("T")[0],
    };
    onSaveRequest(updated);
    alert("ระบบบันทึกและส่งรายงานขอจ้างเรียบร้อยแล้ว! ข้อมูลถูกบันทึกลงฐานข้อมูลกลางพร้อมนำผสาน Mail Merge บนคอมพิวเตอร์");
    onNavigateToDashboard();
  };

  // Navigation Steps
  const nextStep = () => currentStep < 9 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  // Auto initialize DueDate on render
  useEffect(() => {
    if (formData.StartDate && formData.DeliveryDays && !formData.DueDate) {
      const days = parseInt(String(formData.DeliveryDays)) || 0;
      const d = new Date(formData.StartDate);
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + days);
        setFormData((prev) => ({ ...prev, DueDate: d.toISOString().split("T")[0] }));
      }
    }
  }, [formData.StartDate, formData.DeliveryDays]);

  return (
    <div className="space-y-6">
      {/* Toast Alert Draft Saved */}
      {showDraftToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg border border-slate-800 text-sm animate-in slide-in-from-top duration-300">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>บันทึกแบบร่างฉบับไอแซกคอลเลกชันสำเร็จแล้วในเบราว์เซอร์!</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={onNavigateToDashboard}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold mb-1 cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> กลับไปหน้าควบคุมหลัก
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">แบบฟอร์มเรื่อง: {formData.RequestID || "เรื่องใหม่"}</h1>
            {formData.Status && (
              <span className="text-xs bg-slate-100 text-slate-700 font-mono font-semibold px-2 py-0.5 rounded">
                สถานะ: {formData.Status}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Live Preview */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 border rounded-lg text-xs font-semibold select-none transition-all cursor-pointer ${
              showPreview
                ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
            }`}
            title="แสดง/ซ่อน ตัวอย่างกระดาษร่างจดหมายราชการด้านขวามือสำหรับการกรอกข้อมูลเต็มจอ"
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />}
            {showPreview ? "ซ่อนตัวอย่างกระดาษ (เต็มจอ)" : "แสดงตัวอย่างกระดาษ"}
          </button>

          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-750 font-medium rounded-lg text-sm transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-500" />
            บันทึกร่าง
          </button>
          
          <button
            onClick={handleSaveAndSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow-md transition-all cursor-pointer ring-2 ring-emerald-650 ring-offset-2 animate-pulse hover:animate-none"
            title="กดปุ่มเพื่อบันทึกข้อมูลทุกหน้ารวมกันลงฐานข้อมูลและชีตทันที ไม่ต้องรอกรอกครบทุกหน้า"
          >
            <Check className="w-4 h-4" />
            บันทึกและส่งข้อมูลหลัก
          </button>
        </div>
      </div>

      {/* Progress wizard step numbers */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="overflow-x-auto">
          <div className="flex min-w-[700px] items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((step) => {
              const isActive = currentStep === step;
              const isCompleted = currentStep > step;
              return (
                <button
                  key={step}
                  onClick={() => setCurrentStep(step)}
                  className="relative z-10 flex flex-col items-center gap-1.5 text-center focus:outline-none cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? "bg-slate-800 text-white ring-4 ring-slate-100"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-400 border border-slate-200"
                    }`}
                  >
                    {step}
                  </div>
                  <span
                    className={`text-[10px] font-semibold tracking-tight ${
                      isActive ? "text-slate-800 font-bold" : "text-slate-400"
                    }`}
                  >
                    {step === 1 && "1. รายงานขอจ้าง"}
                    {step === 2 && "2. ตารางงบประมาณ"}
                    {step === 3 && "3. ใบตรวจรับ"}
                    {step === 4 && "4. ใบส่งเบิกเงิน"}
                    {step === 5 && "5. ประกาศผู้ชนะ"}
                    {step === 6 && "6. คำสั่งแต่งตั้ง"}
                    {step === 7 && "7. ใบเบิกพัสดุ"}
                    {step === 8 && "8. รายงานผลสอบ"}
                    {step === 9 && "9. ใบสั่งซื้อจ้าง"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Core Wizard Content Area (Forms + Documents Live Preview Side-by-Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: 9-step wizard forms inputs */}
        <div className={`${showPreview ? "lg:col-span-7" : "lg:col-span-12"} bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6 transition-all duration-300`}>
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-5 h-5 text-indigo-600" />
              ส่วนที่ {currentStep}: {getStepTitle(currentStep)}
            </h2>
            <p className="text-xs text-slate-500 mt-1">กรอกข้อมูลเฉพาะหน้านี้ ส่วนหน้าอื่นจะทำการสืบทอดสัญญารับช่วงโดยอัตโนมัติ</p>
          </div>

          {/* PAGE 1: REPORT REQUEST */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">เลขที่หนังสือ *</label>
                  <input
                    type="text"
                    name="DocumentNo"
                    value={formData.DocumentNo}
                    onChange={handleChange}
                    placeholder="เช่น มส 0023.401/124"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">วันที่เริ่มดำเนินการ *</label>
                  <input
                    type="date"
                    name="StartDate"
                    value={formData.StartDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 mb-1.5"
                  />
                  <input
                    type="text"
                    name="Reserved01"
                    value={formData.Reserved01 || ""}
                    onChange={handleChange}
                    placeholder="ปรับรูปแบบข้อความวันที่ไทยตัวเต็ม"
                    title="พิมพ์แก้ไขข้อความวันที่ภาษาไทยตัวเต็มสำหรับลงเอกสารรายงานขอจัดซื้อจัดจ้างได้ที่นี่"
                    className="w-full px-2.5 py-1 border border-amber-200 bg-amber-50/20 text-slate-700 rounded-lg text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-sans">✍️ แก้ไขวันที่ไทยตัวเต็มเพื่อเอกสารราชการที่ถูกต้อง</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">เรื่องที่ต้องการจ้างพัสดุ *</label>
                <input
                  type="text"
                  name="Subject"
                  value={formData.Subject}
                  onChange={handleChange}
                  placeholder="เช่น ซ่อมแซมระบบระบายความร้อน หรือ ปรับปรุงลานออกกำลังกาย..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">กลุ่มงาน/กลุ่มวิชาการยื่นขอ *</label>
                  <input
                    type="text"
                    name="Department"
                    value={formData.Department}
                    onChange={handleChange}
                    placeholder="เช่น กลุ่มบริหารทั่วไป (งานคอมพิวเตอร์)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">กำหนดส่งมอบของพัสดุภายใน (วัน) *</label>
                  <input
                    type="number"
                    name="DeliveryDays"
                    value={formData.DeliveryDays}
                    onChange={handleChange}
                    min={1}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">เหตุผลความจำเป็นในการสั่งจ้างครั้งนี้ *</label>
                <textarea
                  name="NecessityReason"
                  value={formData.NecessityReason}
                  onChange={handleChange}
                  placeholder="เช่น เนื่องจากเป็นช่วงที่มีอุณหภูมิห้องค่อนข้างสูง ส่งผลให้ชุดประมวลผลมีความร้อนสูงขึ้น..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">เบิกเงินพัสดุจากโครงการ/กองทุนใด *</label>
                <input
                  type="text"
                  name="BudgetSource"
                  value={formData.BudgetSource}
                  onChange={handleChange}
                  placeholder="เช่น เงินอุดหนุนรายหัวนักเรียนเรียนรู้ตลอดชีวิตมัธยมศึกษาปีที่ 2569"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                />
              </div>

              {/* Items JSON block */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase">1.1 รายการที่จะขออนุมัติจัดจ้าง</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่มแถวสินค้า
                  </button>
                </div>

                {formData.ItemsJSON.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4 border border-dashed rounded-lg">
                    กรุณากด 'เพิ่มแถวสินค้า' เพื่อเริ่มใส่รายการจัดซื้อจัดจ้าง
                  </p>
                ) : (
                  <div className="space-y-2 pr-1">
                    {formData.ItemsJSON.map((item, idx) => (
                      <div key={item.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100 w-full min-w-0 shadow-3xs">
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            placeholder="รายละเอียดสเปกของงาน"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(idx, "name", e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-205 rounded-lg bg-white text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="w-14 md:w-16 shrink-0">
                          <input
                            type="number"
                            placeholder="จำนวน"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(idx, "qty", parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-205 rounded-lg bg-white text-slate-705 text-center outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="w-14 md:w-16 shrink-0">
                          <input
                            type="text"
                            placeholder="หน่วย"
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(idx, "unit", e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-205 rounded-lg bg-white text-slate-705 text-center outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="w-20 md:w-24 shrink-0">
                          <MoneyInput
                            value={item.price}
                            onChange={(numericVal) => handleUpdateItem(idx, "price", numericVal)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-205 rounded-lg bg-white text-slate-705 text-right outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                            placeholder="หน่วยละ"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 border border-transparent hover:border-red-100 rounded-lg flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700">คำนวณเงินรวมออโต้:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ฿{formData.TotalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Committees */}
              <div className="grid grid-cols-1 gap-5 pt-4 border-t border-slate-100">
                {/* Price committee */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">1.2 คณะกรรมการกำหนดราคากลาง</h4>
                    <button
                      type="button"
                      onClick={() => handleAddCommittee("price")}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      เพิ่มรายชื่อ
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.PriceCommitteeJSON.map((member, idx) => (
                      <div key={idx} className="flex gap-2 items-center w-full min-w-0">
                        <select
                          value={member.teacherId}
                          onChange={(e) => handleUpdateCommittee("price", idx, "teacherId", e.target.value)}
                          className="text-xs border border-slate-205 rounded-lg p-2 bg-white flex-1 min-w-0 text-slate-700 shadow-3xs"
                        >
                          {teachers.map((t) => (
                            <option key={t.TeacherID} value={t.TeacherID}>
                              {t.FullName}
                            </option>
                          ))}
                        </select>
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateCommittee("price", idx, "role", e.target.value)}
                          className="text-xs border border-slate-205 rounded-lg p-2 bg-white text-slate-700 w-28 shrink-0 shadow-3xs"
                        >
                          <option value="ประธานกรรมการ">ประธาน</option>
                          <option value="กรรมการ">กรรมการ</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveCommittee("price", idx)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg shrink-0 transition-colors flex items-center justify-center cursor-pointer border border-transparent hover:border-red-100 shadow-3xs"
                          title="ลบรายชื่อ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inspection committee */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">1.3 คณะกรรมการตรวจรับพัสดุ</h4>
                    <button
                      type="button"
                      onClick={() => handleAddCommittee("inspection")}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      เพิ่มรายชื่อ
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.InspectionCommitteeJSON.map((member, idx) => (
                      <div key={idx} className="flex gap-2 items-center w-full min-w-0">
                        <select
                          value={member.teacherId}
                          onChange={(e) => handleUpdateCommittee("inspection", idx, "teacherId", e.target.value)}
                          className="text-xs border border-slate-205 rounded-lg p-2 bg-white flex-1 min-w-0 text-slate-700 shadow-3xs"
                        >
                          {teachers.map((t) => (
                            <option key={t.TeacherID} value={t.TeacherID}>
                              {t.FullName}
                            </option>
                          ))}
                        </select>
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateCommittee("inspection", idx, "role", e.target.value)}
                          className="text-xs border border-slate-205 rounded-lg p-2 bg-white text-slate-700 w-28 shrink-0 shadow-3xs"
                        >
                          <option value="ประธานกรรมการ">ประธาน</option>
                          <option value="กรรมการ">กรรมการ</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveCommittee("inspection", idx)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg shrink-0 transition-colors flex items-center justify-center cursor-pointer border border-transparent hover:border-red-100 shadow-3xs"
                          title="ลบรายชื่อ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: BUDGET TABLE */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 text-xs text-slate-600 leading-relaxed space-y-1">
                <div><b>หัวข้อมรดก:</b> {formData.Subject}</div>
                <div><b>งบประมาณที่ตกลง:</b> ฿{formData.TotalAmount.toLocaleString()} ({formData.TotalAmountText})</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ระบุนามชื่อกิจกรรมการเรียนรู้ / แผนงานย่อย *</label>
                <input
                  type="text"
                  name="ActivityName"
                  value={formData.ActivityName}
                  onChange={handleChange}
                  placeholder="เช่น กิจกรรมยกระดับสื่อการสอนคอมพิวเตอร์ หรือ โครงการกีฬาพัฒนาการเรียนรู้"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                />
              </div>
            </div>
          )}

          {/* PAGE 3: INSPECTION REPORT */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">วันที่ส่งของครบกำหนด (คำนวณออโต้)</label>
                  <input
                    type="date"
                    disabled
                    value={formData.DueDate}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 font-mono mb-1.5"
                  />
                  <input
                    type="text"
                    name="Reserved02"
                    value={formData.Reserved02 || ""}
                    onChange={handleChange}
                    placeholder="ปรับรูปแบบข้อความวันที่ส่งพัสดุครบกำหนด"
                    title="พิมพ์แก้ไขข้อความวันที่ภาษาไทยตัวเต็มสำหรับใบตรวจรับพัสดุได้ที่นี่"
                    className="w-full px-2.5 py-1 border border-amber-200 bg-amber-50/20 text-slate-700 rounded-lg text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-sans">✍️ แก้ไขวันที่จัดส่งตัวเต็มเพื่อใช้ในใบตรวจรับพัสดุ</span>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-600">คู่สัญญา / ผู้ส่งมอบพัสดุ *</label>
                    <label className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isManualDelivery}
                        onChange={(e) => {
                          setIsManualDelivery(e.target.checked);
                          if (!e.target.checked) {
                            setFormData(prev => ({ ...prev, DeliveryPerson: "" }));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>กรอกชื่อเอง (บุคคลธรรมดา)</span>
                    </label>
                  </div>

                  {isManualDelivery ? (
                    <input
                      type="text"
                      name="DeliveryPerson"
                      value={formData.DeliveryPerson || ""}
                      onChange={handleChange}
                      placeholder="เช่น นางสมศรี บรรเทา (บุคคลทั่วไป)"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"
                    />
                  ) : (
                    <select
                      name="DeliveryPerson"
                      value={formData.DeliveryPerson || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"
                    >
                      <option value="">-- เลือกร้านค้าเพื่อเชื่อมโยงผู้ติดต่อ --</option>
                      {vendors.map((v) => (
                        <option key={v.VendorID} value={v.VendorName}>
                          {v.VendorName}
                        </option>
                      ))}
                    </select>
                  )}
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-sans">เลือกจากร้านค้าในระบบ หรือ ติ๊กถูก เพื่อพิมพ์ชื่ออิสระ</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 font-mono">ปริมาณงาน</label>
                  <input
                    type="text"
                    name="WorkAmount"
                    value={formData.WorkAmount}
                    onChange={handleChange}
                    placeholder="เช่น 1 งาน หรือ 2 ชุด"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ส่งพัสดุเล่มที่</label>
                  <input
                    type="text"
                    name="DeliveryBookNo"
                    value={formData.DeliveryBookNo}
                    onChange={handleChange}
                    placeholder="เช่น 05"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ส่งพัสดุเลขที่</label>
                  <input
                    type="text"
                    name="DeliveryBookRef"
                    value={formData.DeliveryBookRef}
                    onChange={handleChange}
                    placeholder="เช่น 1122"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">เลขโครงการ (ProjectNo)</label>
                  <input
                    type="text"
                    name="ProjectNo"
                    value={formData.ProjectNo}
                    onChange={handleChange}
                    placeholder="เช่น PROJ-69022"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-750 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">เลขคุมสัญญา (ContractNo)</label>
                  <input
                    type="text"
                    name="ContractControlNo"
                    value={formData.ContractControlNo}
                    onChange={handleChange}
                    placeholder="เช่น CNTR-2569-105"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-750 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">เลขกำกับตรวจรับ (InspectNo)</label>
                  <input
                    type="text"
                    name="InspectionControlNo"
                    value={formData.InspectionControlNo}
                    onChange={handleChange}
                    placeholder="เช่น INSP-2569-331"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-750 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PAGE 4: PAYMENT REQUEST */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ข้อมูลส่งเบิกหมายเหตุข้อความพัสดุ</label>
                <textarea
                  name="PaymentMemo"
                  value={formData.PaymentMemo}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                  placeholder="เช่น อนุมัติเบิกจ่ายตามระเบียบเนื่องจากการจ้างเสร็จสมบูรณ์เรียบร้อย พ้นภาระงาน..."
                />
              </div>
            </div>
          )}

          {/* PAGE 5: WINNER ANNOUNCEMENT */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">เลือกวิธีจัดซื้อจัดจ้าง *</label>
                <select
                  name="ProcurementMethod"
                  value={formData.ProcurementMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"
                >
                  {Object.values(ProcurementMethod).map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* PAGE 6: APPOINTMENT ORDER */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">เรื่องการออกคำสั่งแต่งตั้งคณะพัสดุ *</label>
                <input
                  type="text"
                  name="AppointmentSubject"
                  value={formData.AppointmentSubject}
                  onChange={handleChange}
                  placeholder="ความจำเป็น และการแต่งตั้งผู้ตรวจรับแบบฉุกเฉิน..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                />
              </div>
            </div>
          )}

          {/* PAGE 7: WITHDRAW MATERIALS */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">วันที่ทำการเบิกพัสดุพึ่งได้ *</label>
                  <input
                    type="date"
                    name="WithdrawDate"
                    value={formData.WithdrawDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-750 mb-1.5"
                  />
                  <input
                    type="text"
                    name="Reserved03"
                    value={formData.Reserved03 || ""}
                    onChange={handleChange}
                    placeholder="ปรับรูปแบบข้อความวันที่เบิกจ่ายพัสดุ"
                    title="พิมพ์แก้ไขข้อความวันที่ภาษาไทยตัวเต็มสำหรับใบเบิกพัสดุได้ที่นี่"
                    className="w-full px-2.5 py-1 border border-amber-200 bg-amber-50/20 text-slate-700 rounded-lg text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-sans">✍️ แก้ไขวันที่เบิกตัวเต็มเพื่อประกอบรายงานเบิกจ่ายพัสดุ</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ครูผู้รับผิดชอบเบิกพัสดุสูงสุด *</label>
                  <select
                    name="ResponsiblePerson"
                    value={formData.ResponsiblePerson}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"
                  >
                    <option value="">-- กรุณาเลือกบุคลากรครู --</option>
                    {teachers.map((t) => (
                      <option key={t.TeacherID} value={t.TeacherID}>
                        {t.FullName} ({t.Position})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Withdraw Items Lists */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase">7.1 รายการพัสดุเบิกโรงเรียน</h4>
                  <button
                    type="button"
                    onClick={handleAddWithdrawItem}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    + เพิ่มแถวเบิก
                  </button>
                </div>

                {formData.WithdrawItemsJSON.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4 border border-dashed rounded-lg bg-slate-50/50">
                    รายการเบิกว่างอยู่ (คุณครูเบิกสามารถกดเพิ่มเพื่อกรอกพัสดุได้)
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.WithdrawItemsJSON.map((item, idx) => (
                      <div key={item.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200 w-full min-w-0 shadow-3xs">
                        <input
                          type="text"
                          placeholder="ชื่อรายการเบิกพัสดุ"
                          value={item.name}
                          onChange={(e) => handleUpdateWithdrawItem(idx, "name", e.target.value)}
                          className="text-xs px-2.5 py-1.5 border border-slate-205 rounded-lg bg-white flex-1 min-w-0 text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="number"
                          placeholder="จำนวน"
                          value={item.qty}
                          onChange={(e) => handleUpdateWithdrawItem(idx, "qty", parseInt(e.target.value) || 0)}
                          className="text-xs px-2 py-1.5 border border-slate-205 rounded-lg bg-white w-16 shrink-0 text-center text-slate-750 outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="หน่วย"
                          value={item.unit}
                          onChange={(e) => handleUpdateWithdrawItem(idx, "unit", e.target.value)}
                          className="text-xs px-2 py-1.5 border border-slate-205 rounded-lg bg-white w-16 shrink-0 text-center text-slate-755 outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveWithdrawItem(idx)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg shrink-0 transition-colors flex items-center justify-center cursor-pointer border border-transparent hover:border-red-100 shadow-3xs"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAGE 8: RESULT REPORT */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
                รายการพิจารณาในหน้านี้จะโหลดอัตโนมัติจากส่วนที่ 1 สามารถตรวจเช็กค่าราคากลางและราคาเสนอซื้อจริงได้เลยทันที
              </div>

              {formData.ItemsJSON.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">ไม่มีพัสดุในส่วนที่ 1 จึงไม่ปรากฏรายการพิจารณาผลการประกวด</p>
              ) : (
                <table className="w-full text-xs text-left border border-slate-200 text-slate-750">
                  <thead className="bg-slate-55 border-b border-slate-200 text-slate-650 font-semibold">
                    <tr>
                      <th className="py-2 px-3">รายการ</th>
                      <th className="py-2 px-3">ราคากลาง (฿)</th>
                      <th className="py-2 px-3">เสนอราคาทีได้ (฿)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.ItemsJSON.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-2 px-3">{item.name}</td>
                        <td className="py-2 px-3 font-mono">฿{item.price.toLocaleString()}</td>
                        <td className="py-2 px-3 font-mono">฿{item.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* PAGE 9: PURCHASE ORDER */}
          {currentStep === 9 && (
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-4 space-y-2">
                <div className="text-xs font-semibold text-emerald-800">1. ดึงผู้ประกอบการ / ร้านค้าเพื่อประกอบใบสั่งจ้าง</div>
                <select
                  onChange={(e) => handleSelectVendor(e.target.value)}
                  value={formData.VendorName}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"
                >
                  <option value="">-- เลือกร้านค้าเพื่อป้อนข้อมูลผู้ค้าอัตโนมัติ --</option>
                  {vendors.map((v) => (
                    <option key={v.VendorID} value={v.VendorName}>
                      {v.VendorName} (ผู้จดทะเบียน: {v.ContactPerson})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-amber-50/70 rounded-lg border border-amber-100 p-3 text-xs text-amber-800 flex items-start gap-2">
                <span className="text-base select-none">💡</span>
                <p className="leading-relaxed font-sans">
                  <b>คำแนะนำระบบบุคคลธรรมดา:</b> ท่านสามารถพิมพ์ชื่อและที่อยู่ของผู้รับจ้าง (บุคคลธรรมดา) ลงในชองด้านล่างโดยตรงได้เลย และใช้เลขประจำตัวประชาชน 13 หลัก ป้อนเป็น <b>"เลขประจำตัวผู้ค้าจดทะเบียนภาษี"</b> ได้ทันทีโดยไม่จำเป็นต้องเลือกดึงฐานข้อมูลเดิม
                </p>
              </div>

              {/* ข้อมูลผู้ประกอบการ / ร้านค้า (Vendor Information) */}
              <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-emerald-500 rounded-sm"></span>
                  ข้อมูลร้านค้า / ผู้รับสัญญารับจ้าง
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อผู้ค้า / ห้าง / ร้านการจ้าง *</label>
                    <input
                      type="text"
                      name="VendorName"
                      value={formData.VendorName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all shadow-3xs"
                      placeholder="เช่น บจก. สื่อการศึกษาไทย"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">เลขประจำตัวผู้ค้าจดทะเบียนภาษี *</label>
                    <input
                      type="text"
                      name="VendorTaxID"
                      value={formData.VendorTaxID}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white font-mono outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all shadow-3xs"
                      placeholder="เลขประจำตัวผู้เสียภาษี 13 หลัก"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">ที่ตั้งและสถานที่พิมพ์ใบผู้ค้า *</label>
                    <input
                      type="text"
                      name="VendorAddress"
                      value={formData.VendorAddress}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all shadow-3xs"
                      placeholder="เลขที่ตั้ง หมู่ ถนน ตำบล อำเภอ จังหวัด"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">เบอร์ติดต่อ</label>
                    <input
                      type="text"
                      name="VendorPhone"
                      value={formData.VendorPhone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 transition-all shadow-3xs"
                      placeholder="เช่น 02-345-6789"
                    />
                  </div>
                </div>
              </div>

              {/* ข้อมูลการเงินและการคำนวณ (Financial Information) */}
              <div className="space-y-3.5 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-indigo-500 rounded-sm"></span>
                  ข้อมูลการเงินและสรุปภาษีมูลค่าเพิ่ม
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 bg-slate-100/30">ราคารวมของวัสดุมูลค่า (฿)</label>
                    <input
                      type="text"
                      disabled
                      value={formData.TotalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-100/60 text-slate-500 font-mono rounded-lg text-sm outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">ระบุมูลค่าภาษี VAT (฿) ถ้ามี</label>
                    <MoneyInput
                      value={formData.VATAmount}
                      onChange={(v) => {
                        setFormData((prev) => ({
                          ...prev,
                          VATAmount: v,
                          GrandTotal: prev.TotalAmount + v,
                          GrandTotalText: bahtText(prev.TotalAmount + v),
                        }));
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-750 font-mono bg-white outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all shadow-3xs text-right"
                      placeholder="ใส่ 0 หากไม่มีภาษีมูลค่าเพิ่ม"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-sm flex items-center justify-between">
                <span>ยอดเงินสุทธิสั่งซื้อสั่งจ้าง:</span>
                <span className="font-bold text-lg">฿{formData.GrandTotal.toLocaleString("th-TH")}</span>
              </div>
            </div>
          )}

          {/* Buttons Bottom Nav */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                currentStep === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-50"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับ
            </button>

            {currentStep < 9 ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSaveAndSubmit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg transition-all border border-emerald-200 cursor-pointer"
                  title="บันทึกและส่งรายงานขอจ้างและพัสดุนี้ทันทีโดยไม่ต้องกดไปจนถึงหน้าสุดท้าย"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-650" />
                  บันทึกข้อมูลด่วน
                </button>
                <button
                  onClick={nextStep}
                  className="inline-flex items-center gap-1.5 px-4 md:px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  ถัดไปส่วนถัดไป
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSaveAndSubmit}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                บันทึกเสร็จสมบูรณ์รวดเดียว
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: LIVE PDF PAPER PREVIEW */}
        {showPreview && (
          <div className="lg:col-span-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-500 text-xs px-2 gap-2">
              <span className="flex items-center gap-1 font-semibold select-none">
                <Eye className="w-4 h-4 text-emerald-600 animate-pulse" />
                ตัวอย่างกระดาษร่างจดหมายจริง
              </span>
              <div className="flex items-center gap-1 select-none bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-sans px-1 font-semibold">ย่อ/ขยาย:</span>
                <button
                  type="button"
                  onClick={() => setScaleMode("auto")}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-bold cursor-pointer transition-all ${
                    scaleMode === "auto"
                      ? "bg-white text-emerald-700 shadow-xs scale-[1.05]"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  พอดีหน้ากระดาษ (Auto)
                </button>
                {[0.6, 0.75, 0.85, 1.0].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setScaleMode(sz)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-all ${
                      scaleMode === sz
                        ? "bg-white text-slate-900 shadow-xs font-bold scale-[1.05]"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {Math.round(sz * 100)}%
                  </button>
                ))}
              </div>
            </div>

            <div ref={previewContainerRef} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center overflow-hidden max-h-[500px] w-full">
              <div className="w-full overflow-auto flex justify-center py-1">
                {/* Paper Container */}
                <div
                  id="live-paper-document"
                  style={{
                    fontFamily: "'Sarabun', 'Inter', sans-serif",
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top center",
                    transition: "transform 0.15s ease-in-out, margin 0.15s ease-in-out",
                    width: "520px",
                    minHeight: "640px",
                    marginBottom: `calc((1 - ${previewScale}) * -640px)`,
                  }}
                  className="bg-white border border-slate-200 shadow-sm p-8 font-serif text-[11px] text-slate-900 space-y-4 relative leading-relaxed shrink-0"
                >
              {/* Draft watermark */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center rotate-45 select-none font-bold text-5xl tracking-widest text-red-600">
                โรงเรียนปายวิทยาคาร
              </div>

              {/* RENDER SPECIFIC STEP PAPER PREVIEW */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {/* Garuda & Header for Thai Memoir Document (บันทึกข้อความ) */}
                  <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                    <span className="font-bold text-lg text-slate-800">บันทึกข้อความ</span>
                    <span className="font-semibold text-xs border border-slate-400 px-2 py-0.5">ส่วนราชการพัสดุ</span>
                  </div>

                  <div className="space-y-1 text-slate-800">
                    <div><b>ส่วนราชการ:</b> {formData.Department || "กลุ่มงาน..."} {defaultSettings.SchoolName}</div>
                    <div><b>ที่:</b> {formData.DocumentNo || "........................."}</div>
                    <div><b>วันที่เริ่ม:</b> {formData.Reserved01 || formatDateToThai(formData.StartDate) || "........................."}</div>
                    <div><b>เรื่อง:</b> ขออนุมัติจัดจ้าง{formData.Subject || "........................."}</div>
                    <div><b>เรียน:</b> ผู้อำนวยการ{defaultSettings.SchoolName}</div>
                  </div>

                  <p className="text-slate-800 indent-8 leading-snug">
                    ด้วย{formData.Department} {defaultSettings.SchoolName} มีความประสงค์จะจัดจ้างพัสดุเรื่อง: <b>{formData.Subject || "........................."}</b> เนื่องจากมีความจำเป็นเรื่อง: {formData.NecessityReason || "........................."} โดยขอเบิกจ่ายงบประมาณจาก {formData.BudgetSource || "........................."} รวมเป็นเงินทั้งสิ้น วงเงินงบประมาณ <b>฿{formData.TotalAmount.toLocaleString()} บาท</b> ({formData.TotalAmountText})
                  </p>

                  <div className="space-y-2">
                    <div className="font-bold text-slate-850">รายการพัสดุขอสั่งจ้าง:</div>
                    <table className="w-full text-left border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-300">
                          <th className="p-1.5 border-r border-slate-350 text-center w-8">ที่</th>
                          <th className="p-1.5 border-r border-slate-350">รายละเอียดงานพัสดุ</th>
                          <th className="p-1.5 border-r border-slate-350 text-center">จำนวน/หน่วย</th>
                          <th className="p-1.5 text-right">วงเงินรวม</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.ItemsJSON.map((item, id) => (
                          <tr key={item.id} className="border-b border-slate-200">
                            <td className="p-1 border-r border-slate-200 text-center">{id + 1}</td>
                            <td className="p-1 border-r border-slate-200 text-slate-750">{item.name || "ใส่รายละเอียด..."}</td>
                            <td className="p-1 border-r border-slate-200 text-center">{item.qty} {item.unit}</td>
                            <td className="p-1 text-right">฿{item.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures Roster */}
                  <div className="pt-8 grid grid-cols-2 text-slate-650 text-[10px] gap-4">
                    <div className="space-y-6">
                      <div className="text-center">
                        <div>ลงชื่อ................................................... เจ้าหน้าที่พัสดุ</div>
                        <div>( {teachers[2]?.FullName || "......................"} )</div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="text-center">
                        <div>ลงชื่อ................................................... ผู้อนุมัติสั่งการ</div>
                        <div>( {defaultSettings.DirectorName} )</div>
                        <div className="text-slate-400 text-[9px]">{defaultSettings.DirectorPosition}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 text-slate-800">
                  <div className="text-center font-bold text-xs">
                    <div>แบบฟอร์มแสดงวงเงินงบประมาณ และรายชื่อประมาณราคาสำหรับการจัดจ้างครั้งนี้</div>
                    <div className="font-semibold text-[10px] text-slate-500">โรงเรียนปายวิทยาคาร สพม.แม่ฮ่องสอน</div>
                  </div>

                  <div className="space-y-2 border border-slate-200 p-4 rounded bg-slate-50/50">
                    <div><b>1. ชื่อโครงการ/กิจกรรมย่อย:</b> {formData.ActivityName || "ยังไม่ได้กรอกส่วนที่ 2..."}</div>
                    <div><b>2. รายการจ้างบริการ:</b> {formData.Subject}</div>
                    <div><b>3. งบประมาณได้รับจัดสรร:</b> ฿{formData.TotalAmount.toLocaleString()} บาท ({formData.TotalAmountText})</div>
                    <div><b>4. วันที่ตกลงแผนงาน:</b> {formData.Reserved01 || formatDateToThai(formData.StartDate)}</div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-800">5. คณะกรรมการกำหนดราคากลางชุดที่หนึ่ง:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {formData.PriceCommitteeJSON.map((member, id) => (
                        <li key={id} className="text-slate-700">
                          {member.fullName} - {member.position} ({member.role})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center font-bold text-base text-slate-850">ใบตรวจรับพัสดุ / ใบตรวจรับงานจ้าง</div>
                  <div className="text-right"><b>เขียนที่:</b> {defaultSettings.SchoolName}</div>
                  
                  <p className="indent-8 leading-relaxed">
                    ตามที่ทางโรงเรียนปายวิทยาคาร ได้ติดตาจัดซื้อจัดจ้าง <b>{formData.Subject}</b> กับทางผู้ประกอบการร้านค้า <b>{formData.DeliveryPerson || "............................"}</b> ตามเลขหนังสือที่ {formData.DocumentNo} ครบกำหนดเวลาส่งของในวันที่ <b>{formData.Reserved02 || formatDateToThai(formData.DueDate) || "............................"}</b> (ภายใน {formData.DeliveryDays} วันถัดมา)
                  </p>

                  <p className="indent-8">
                    บัดนี้ทางผู้ส่งมอบ ได้นำพัสดุและผลงานจำนวน {formData.WorkAmount} เข้าส่งรับ ณ โรงเรียนตามใบส่งพัสดุ <b>เล่มที่ {formData.DeliveryBookNo || "....... "} เลขที่ {formData.DeliveryBookRef || "....... "}</b> เป็นวงเงินและค่าบริการรวมสุทธิ <b>฿{formData.TotalAmount.toLocaleString()} บาท</b>
                  </p>

                  <div className="space-y-1">
                    <div className="font-bold text-xs text-slate-900 border-b pb-1">รายชื่อคณะกรรมการผู้ร่วมลงชื่อตรวจรับ:</div>
                    <div className="space-y-4 pt-4 text-center text-slate-700">
                      {formData.InspectionCommitteeJSON.map((member, id) => (
                        <div key={id}>
                          <div>ลงชื่อ............................................................ กรรมการ ({member.role})</div>
                          <div className="text-[10px] text-slate-500">( {member.fullName} | {member.position} )</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4 text-slate-850">
                  <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                    <span className="font-bold text-lg">บันทึกส่งเรื่องเบิกเงินประจำฝ่าย</span>
                    <span className="text-xs font-mono font-bold">ส่วนที่ 4/9</span>
                  </div>

                  <div className="space-y-1 text-slate-700">
                    <div><b>จากฝ่ายบริหาร:</b> {formData.Department}</div>
                    <div><b>เลขสัญญาคุม:</b> {formData.ContractControlNo || "ไม่มีเลข"}</div>
                    <div><b>เรียน:</b> ผู้อำนวยการโรงเรียนปายวิทยาคาร</div>
                  </div>

                  <p className="indent-8 leading-snug">
                    อ้างอิงถึงการอนุมัติใบตรวจรับพัสดุสำหรับโครงการ <b>{formData.Subject}</b> ที่มอบงานให้กับคู่ค้า <b>{formData.DeliveryPerson}</b> เรียบร้อยนั้น บัดนี้พัสดุได้ส่งตรวจรับเรียบร้อยดีแล้วตามเกณฑ์ และสมบูรณ์อย่างเป็นทางการในวันที่ {formData.Reserved02 || formatDateToThai(formData.DueDate)}
                  </p>

                  <p className="indent-8">
                    จึงขอนำส่งพยานหลักฐานและรายงานผลพัสดุตราส่งมอบ เพื่อขอเบิกจ่ายงบประมาณแผ่นดินจากส่วนกลาง รวมเป็นเงินเบิกจ่ายทั้งสิ้น <b>฿{formData.TotalAmount.toLocaleString()} บาท</b> ({formData.TotalAmountText}) โดยแนบหมายเหตุใบส่งเงินดังนี้: "{formData.PaymentMemo}"
                  </p>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4 text-slate-850">
                  <div className="text-center font-bold text-sm">
                    <div>ประกาศโรงเรียนปายวิทยาคาร</div>
                    <div>เรื่อง ประกาศผู้ชนะการเสนอราคาสำหรับการจัดซื้อจัดจ้างครั้งนี้</div>
                  </div>

                  <p className="indent-8 text-slate-700 leading-snug">
                    ตามที่ {defaultSettings.SchoolName} ได้มีกิจกรรมจ้างเหมา <b>{formData.Subject}</b> ภายใต้การบริหารงานของกลุ่ม {formData.Department} โดยวิธีจัดซื้อจัดจ้างแบบ <b>"{formData.ProcurementMethod}"</b> นั้น
                  </p>

                  <p className="indent-8 text-slate-700">
                    ผลปรากฏผู้มีหน้าที่และศักยะในการสนองวัสดุที่ดีที่สุดเป็นจัดแข่งขัน ได้แก่ <b>{formData.DeliveryPerson || "............................"}</b> โดยเสนอราคารวมพัสดุหักส่วนลดทั้งสิ้นเป็นเงิน <b>฿{formData.TotalAmount.toLocaleString()} บาท</b> ({formData.TotalAmountText}) ซึ่งรวมอัตราภาษีมูลค่าเพิ่มพัสดุตามเกณฑ์ประกาศราชการทุกกรณีแล้ว
                  </p>

                  <div className="pt-8 text-center text-xs">
                    <div>ประกาศ ณ วันที่ {formData.Reserved01 || formatDateToThai(formData.StartDate)}</div>
                    <div className="mt-6">
                      <div>( {defaultSettings.DirectorName} )</div>
                      <div className="text-slate-400 text-[10px]">{defaultSettings.DirectorPosition}</div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="text-center font-bold text-xs text-slate-850 uppercase">
                    <div>คำสั่งโรงเรียนปายวิทยาคาร</div>
                    <div>ที่ มส 0023.401 / .........................</div>
                  </div>

                  <p className="indent-8 text-slate-705 text-justify leading-snug">
                    ตามที่ทางโรงเรียนปายวิทยาคารมีความจำเป็นกระทำการจัดซื้อจัดจ้างในหัวข้อ: <b>{formData.Subject}</b> ด้วยวิธีจ้างพัสดุแบบ {formData.ProcurementMethod} อาศัยอำนาจตามระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ เพื่อให้การตรวจสอบและประเมินราคากลางดำเนินงานถูกต้อง สมบูรณ์ จึงขอแต่งตั้งคณกรรรมการปฏิบัติหน้าที่คำอ้างสิทธิ์ในหัวข้อ: <b>"{formData.AppointmentSubject}"</b>
                  </p>

                  <div className="space-y-2 pt-2 text-slate-700">
                    <div className="font-bold text-xs border-b">รายชื่อผู้มีรายนามแต่งตั้ง:</div>
                    <ol className="list-decimal list-inside space-y-1 text-[10px]">
                      {formData.InspectionCommitteeJSON.map((member, id) => (
                        <li key={id}>{member.fullName} - {member.position} ทำหน้าที่ตรวจรับงานจ้าง</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div className="space-y-4 text-slate-850">
                  <div className="text-center font-bold text-sm">ใบเบิกพัสดุ แผนกควบคุมพัสดุกลางโรงเรียน</div>
                  <div className="text-right text-[10px]"><b>ลงวันที่เบิก:</b> {formData.Reserved03 || formatDateToThai(formData.WithdrawDate)}</div>

                  <div className="space-y-1 text-[10px] text-slate-750 p-2 border bg-slate-50">
                    <div><b>เลขทะเบียนขอจัดจ้าง:</b> {formData.DocumentNo}</div>
                    <div><b>แผนงานรองรับ:</b> {formData.ActivityName || "ไม่ได้ระบุชื่อกิจกรรม"}</div>
                    <div><b>ผู้ประสานงานเบิกพัสดุ:</b> {teachers.find((t)=>t.TeacherID === formData.ResponsiblePerson)?.FullName || ".............................."}</div>
                  </div>

                  <table className="w-full text-left text-slate-700 border border-slate-350">
                     <thead>
                       <tr className="bg-slate-150 border-b border-slate-350 font-bold">
                         <th className="p-1 text-center w-8">ที่</th>
                         <th className="p-1">รายการวัสดุเบิกโรงเรียน</th>
                         <th className="p-1 text-center font-mono">จำนวนพัสดุ</th>
                       </tr>
                     </thead>
                     <tbody>
                       {formData.WithdrawItemsJSON.map((item, id) => (
                         <tr key={item.id} className="border-b">
                           <td className="p-1 text-center">{id + 1}</td>
                           <td className="p-1">{item.name || "ระบุวัสดุ..."}</td>
                           <td className="p-1 text-center font-bold">{item.qty} {item.unit}</td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
                </div>
              )}

              {currentStep === 8 && (
                <div className="space-y-4">
                  <div className="text-center font-bold text-xs">บันทึกรายงานผลการจัดซื้อจัดจ้างและการพิจารณาพัสดุ</div>
                  <p className="indent-8 text-[10px] text-slate-650 leading-snug">
                    ตามหนังสือราคารายงานขอจ้างเลขที่ {formData.DocumentNo} วันที่เริ่ม {formData.Reserved01 || formatDateToThai(formData.StartDate)} ได้เสนอรายละเอียดจัดซื้อวัสดุของฝ่าย {formData.Department} บัดนี้ผู้มอบสัญญาการเสนอ {formData.DeliveryPerson} ได้ยื่นจัดราคากลางและการพิจารณาผลแข่งขันพัสดุเสร็จสมบูรณ์ วงเงินได้รับการพิจารณารวมสุทธิ <b>฿{formData.TotalAmount.toLocaleString()} บาท</b>
                  </p>

                  <table className="w-full text-left text-[10px] border border-slate-300">
                    <thead>
                      <tr className="bg-slate-50 border-b font-bold text-slate-600">
                        <th className="p-1.5 border-r">รายการพิจารณา</th>
                        <th className="p-1.5 text-right font-mono">ราคากลางงบประมาณ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.ItemsJSON.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 text-slate-705">
                          <td className="p-1.5 border-r">{item.name}</td>
                          <td className="p-1.5 text-right font-mono">฿{item.price.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {currentStep === 9 && (
                <div className="space-y-4 text-slate-800 text-[10px]">
                  <div className="text-center font-bold text-xs uppercase text-slate-900">
                    <div>ใบสั่งจ้าง / ใบสั่งซื้อ (Purchase Order)</div>
                    <div>เลขที่ มส 0023.401 / .........................</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border border-slate-200 p-2.5 rounded bg-slate-50/50">
                    <div className="space-y-1 text-slate-800">
                      <div className="font-bold text-[11px] text-slate-900 border-b pb-0.5 mb-1 text-indigo-850">ผู้รับจ้าง (ร้านค้า)</div>
                      <div><b>ผู้รับจ้าง</b> {formData.VendorName || "............................"}</div>
                      <div><b>ที่อยู่</b>   {formData.VendorAddress || "............................"}</div>
                      <div><b>โทรศัพท์</b>  {formData.VendorPhone || "............................"}</div>
                      <div><b>เลขประจำตัวผู้เสียภาษี</b> {formData.VendorTaxID || "............................"}</div>
                    </div>
                    <div className="space-y-1 text-slate-800">
                      <div className="font-bold text-[11px] text-slate-900 border-b pb-0.5 mb-1 text-emerald-800">ผู้สั่งจ้าง (สถาบัน)</div>
                      <div><b>{defaultSettings.SchoolName}</b></div>
                      <div><b>ที่อยู่</b>  {defaultSettings.SchoolAddress}</div>
                      <div><b>โทรศัพท์</b>  {defaultSettings.SchoolPhone}</div>
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse border border-slate-300">
                     <thead>
                       <tr className="bg-slate-100 border-b font-bold">
                         <th className="p-1 text-center w-6">ที่</th>
                         <th className="p-1">รายการสั่งจ้างบริการ</th>
                         <th className="p-1 text-center">จำนวน/หน่วย</th>
                         <th className="p-1 text-right">จำนวนเงิน</th>
                       </tr>
                     </thead>
                     <tbody>
                       {formData.ItemsJSON.map((item, id) => (
                         <tr key={item.id} className="border-b text-slate-700">
                           <td className="p-1 text-center">{id + 1}</td>
                           <td className="p-1">{item.name}</td>
                           <td className="p-1 text-center">{item.qty} {item.unit}</td>
                           <td className="p-1 text-right">฿{item.total.toLocaleString()}</td>
                         </tr>
                       ))}
                     </tbody>
                  </table>

                  <div className="text-right space-y-1 pt-2 border-t border-dashed">
                    <div><b>รวมเป็นเงิน:</b> ฿{formData.TotalAmount.toLocaleString()}</div>
                    <div><b>ภาษีมูลค่าเพิ่ม VAT:</b> ฿{formData.VATAmount.toLocaleString()}</div>
                    <div className="font-bold text-slate-900"><b>จำนวนสุทธิสั่งจ้างทั้งสิ้น:</b> ฿{formData.GrandTotal.toLocaleString()} บาท ({formData.GrandTotalText})</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      )}
      </div>
    </div>
  );
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return "บันทึกข้อความ รายงานขอจ้าง";
    case 2:
      return "ตารางแสดงวงเงินงบประมาณ";
    case 3:
      return "ใบตรวจรับพัสดุและค่าจ้าง";
    case 4:
      return "บันทึกข้อความส่งเบิกงบประมาณ";
    case 5:
      return "ประกาศผลผู้ชนะเสนอราคาที่ดีที่สุด";
    case 6:
      return "คำสั่งแต่งตั้งคณะพัสดุ";
    case 7:
      return "ใบเบิกพัสดุ แผนกพัสดุกลาง";
    case 8:
      return "รายงานผลการพิจารณาสัญญา";
    case 9:
      return "ใบสั่งซื้อสั่งจ้างบริการพัสดุ (Purchase Order)";
    default:
      return "แบบสอบร่างพัสดุ";
  }
}
