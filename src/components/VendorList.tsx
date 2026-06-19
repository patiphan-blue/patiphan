/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Vendor } from "../types";
import { Plus, Search, Edit2, Trash2, X, Save, AlertTriangle } from "lucide-react";

interface VendorListProps {
  vendors: Vendor[];
  onSaveVendor: (vendor: Vendor) => void;
  onDeleteVendor: (id: string) => void;
}

export default function VendorList({ vendors, onSaveVendor, onDeleteVendor }: VendorListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom delete states
  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);
  const [deleteVendorName, setDeleteVendorName] = useState("");

  // Form states
  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [taxID, setTaxID] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  const handleOpenAddModal = () => {
    setEditingVendor(null);
    setVendorName("");
    setVendorAddress("");
    setPhone("");
    setTaxID("");
    setContactPerson("");
    setStatus("Active");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setVendorName(vendor.VendorName);
    setVendorAddress(vendor.VendorAddress);
    setPhone(vendor.Phone);
    setTaxID(vendor.TaxID);
    setContactPerson(vendor.ContactPerson);
    setStatus(vendor.Status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || !vendorAddress) {
      alert("กรุณากรอกข้อมูลที่จำเป็น (ชื่อผู้รับจ้าง/ร้านค้า, ที่อยู่)");
      return;
    }

    const newVendor: Vendor = {
      VendorID: editingVendor ? editingVendor.VendorID : "V" + Date.now().toString().slice(-4),
      VendorName: vendorName,
      VendorAddress: vendorAddress,
      Phone: phone,
      TaxID: taxID,
      ContactPerson: contactPerson,
      Status: status,
    };

    onSaveVendor(newVendor);
    setIsModalOpen(false);
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.VendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.TaxID.includes(searchTerm) ||
      v.ContactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="vendor_list_view" className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">จัดการคู่สัญญาและร้านค้า</h1>
          <p className="text-slate-500 text-sm mt-1">
            รักษาข้อมูลร้านค้าร่วมค้า, ข้อมูลเลขผู้เสียภาษี และเบอร์ติดต่อเพื่อสั่งซื้อสั่งจ้างพัสดุ
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          เพิ่มร้านค้า/ผู้รับจ้าง
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="vendor_search_input"
            type="text"
            placeholder="ค้นหาด้วย ชื่อร้านค้า, รายการเลขผู้เสียภาษี, หรือผู้ประสานงาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-slate-400 text-sm"
          />
        </div>
      </div>

      {/* Vendors Table Grid */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-4 px-6 w-1/4">ชื่อร้านค้า / ผู้รับจ้าง</th>
                <th className="py-4 px-6 w-1/6">เลขประจำตัวผู้เสียภาษี</th>
                <th className="py-4 px-6 w-1/3">ที่อยู่คู่สัญญา</th>
                <th className="py-4 px-6 w-1/6">ผู้ติดต่อและเบอร์โทร</th>
                <th className="py-4 px-6 w-[10%] text-center">สถานะคู่ค้า</th>
                <th className="py-4 px-6 w-[5%] text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.VendorID} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 break-words max-w-[200px]" title={vendor.VendorName}>
                      {vendor.VendorName}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="font-mono text-xs bg-slate-100/80 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200/50">
                        {vendor.TaxID || "ไม่ทราบเลข"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs leading-relaxed max-w-sm whitespace-normal break-words" title={vendor.VendorAddress}>
                      <div className="line-clamp-2">{vendor.VendorAddress}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs">
                        <div className="text-slate-800 font-medium">{vendor.ContactPerson || "ไม่ระบุ"}</div>
                        <div className="text-slate-500 mt-0.5">โทร: {vendor.Phone || "-"}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          vendor.Status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {vendor.Status === "Active" ? "เปิดใช้งานคู่ค้า" : "ปิดชั่วคราว"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 text-slate-500">
                        <button
                          onClick={() => handleOpenEditModal(vendor)}
                          className="p-1 px-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="แก้ไขร้านค้า"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteVendorId(vendor.VendorID);
                            setDeleteVendorName(vendor.VendorName);
                          }}
                          className="p-1 px-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="ลบผู้ค้า"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                    ไม่พบข้อมูลผู้ค้ารายใดที่ระบุ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-200">
            <div className="bg-slate-50 border-b border-slate-100 py-4 px-6 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">
                {editingVendor ? "แก้ไขรายละเอียดร้านค้า/ผู้ค้า" : "ลงทะเบียนผู้ค้า/ร้านค้าใหม่"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อผู้ประกอบการ / ร้านค้า / บริษัท *</label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="เช่น บริษัท จัดการการศึกษาปาย จำกัด"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">เลขประจำตัวผู้เสียภาษี (Tax ID) *</label>
                <input
                  type="text"
                  required
                  maxLength={13}
                  value={taxID}
                  onChange={(e) => setTaxID(e.target.value)}
                  placeholder="เลขประจำตัวผู้เสียภาษี 13 หลัก"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ที่ตั้ง / ที่อยู่ที่ประกาศตามใบสำคัญ *</label>
                <textarea
                  required
                  value={vendorAddress}
                  onChange={(e) => setVendorAddress(e.target.value)}
                  placeholder="ที่อยู่เต็มรูปแบบ สำหรับระบุในใบจ่ายเงินและใบสั่งซื้อสั่งจ้าง..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อผู้ประสานงาน / ผู้แทนร้านค้า</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="เช่น คุณธวัชชัย ค้าดี"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">เบอร์โทรติดต่อ</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="053-XXXXXX หรือ 08X-XXXXXXX"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">สถานะผู้สัญญา</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input
                      type="radio"
                      checked={status === "Active"}
                      onChange={() => setStatus("Active")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    เปิดการใช้งานคู่ค้านี้
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input
                      type="radio"
                      checked={status === "Inactive"}
                      onChange={() => setStatus("Inactive")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    ระงับการจ้างชั่วคราว
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteVendorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2 bg-red-50 rounded-full">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  ยืนยันการลบข้อมูลร้านค้า/ผู้รับจ้าง?
                </h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-sans">
                คุณชัวร์หรือไม่ที่จะลบข้อมูลร้านค้า <span className="font-bold text-slate-800">"{deleteVendorName}"</span> นี้ออกจากฐานข้อมูลพัสดุ? การกระทำนี้จะมีผลต่อการอัปเดต และประวัติการจัดดึงชื่อจดหมายเวียนดัวย
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeleteVendorId(null);
                  setDeleteVendorName("");
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 text-xs font-semibold cursor-pointer transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteVendorId) {
                    onDeleteVendor(deleteVendorId);
                    setDeleteVendorId(null);
                    setDeleteVendorName("");
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
