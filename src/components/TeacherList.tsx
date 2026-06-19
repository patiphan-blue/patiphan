/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Teacher } from "../types";
import { Plus, Search, Edit2, Trash2, X, Check, Save, AlertTriangle } from "lucide-react";

interface TeacherListProps {
  teachers: Teacher[];
  onSaveTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
}

export default function TeacherList({ teachers, onSaveTeacher, onDeleteTeacher }: TeacherListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom delete states
  const [deleteTeacherId, setDeleteTeacherId] = useState<string | null>(null);
  const [deleteTeacherName, setDeleteTeacherName] = useState("");

  // Form states
  const [prefix, setPrefix] = useState("นาย");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setPrefix("นาย");
    setFirstName("");
    setLastName("");
    setPosition("");
    setDepartment("");
    setPhone("");
    setEmail("");
    setStatus("Active");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setPrefix(teacher.Prefix);
    setFirstName(teacher.FirstName);
    setLastName(teacher.LastName);
    setPosition(teacher.Position);
    setDepartment(teacher.Department);
    setPhone(teacher.Phone);
    setEmail(teacher.Email);
    setStatus(teacher.Status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !position) {
      alert("กรุณากรอกข้อมูลที่จำเป็น (คำนำหน้า, ชื่อ, นามสกุล, ตำแหน่ง)");
      return;
    }

    const fullName = `${prefix}${firstName} ${lastName}`;
    const newTeacher: Teacher = {
      TeacherID: editingTeacher ? editingTeacher.TeacherID : "T" + Date.now().toString().slice(-4),
      Prefix: prefix,
      FirstName: firstName,
      LastName: lastName,
      FullName: fullName,
      Position: position,
      Department: department,
      Phone: phone,
      Email: email,
      Status: status,
    };

    onSaveTeacher(newTeacher);
    setIsModalOpen(false);
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.Position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.Department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="teacher_list_view" className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">จัดการข้อมูลครูและคณะกรรมการ</h1>
          <p className="text-slate-500 text-sm mt-1">
            บันทึกฐานข้อมูลเพื่อนำไปใช้เลือกเป็น คณะกรรมการ และผู้ดูแลพัสดุในเอกสาร
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          เพิ่มบุคลากรใหม่
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 id-search-icon w-4 text-slate-400" />
          <input
            id="teacher_search_input"
            type="text"
            placeholder="ค้นหาด้วย ชื่อ-นามสกุล, ตำแหน่ง หรือ กลุ่มงาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-slate-400 text-sm"
          />
        </div>
      </div>

      {/* Teachers Table Grid */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-xs uppercase tracking-wider">
                <th className="py-4 px-6">ชื่อ-นามสกุล</th>
                <th className="py-4 px-6">ตำแหน่ง</th>
                <th className="py-4 px-6">กลุ่มงาน</th>
                <th className="py-4 px-6">ติดต่อ</th>
                <th className="py-4 px-6 text-center">สถานะ</th>
                <th className="py-4 px-6 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.TeacherID} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">{teacher.FullName}</td>
                    <td className="py-4 px-6 text-slate-600">{teacher.Position}</td>
                    <td className="py-4 px-6 text-slate-500">{teacher.Department || "-"}</td>
                    <td className="py-4 px-6">
                      <div className="text-xs text-slate-500">
                        <div>โทร: {teacher.Phone || "-"}</div>
                        <div>อีเมล: {teacher.Email || "-"}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          teacher.Status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {teacher.Status === "Active" ? "พร้อมปฏิบัติงาน" : "ระงับชั่วคราว"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 text-slate-500">
                        <button
                          onClick={() => handleOpenEditModal(teacher)}
                          className="p-1 px-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="แก้ไขรายละเอียด"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTeacherId(teacher.TeacherID);
                            setDeleteTeacherName(teacher.FullName);
                          }}
                          className="p-1 px-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="ลบข้อมูล"
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
                    ไม่พบข้อมูลบุคลากรครูที่ต้องการค้นหา
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
                {editingTeacher ? "แก้ไขข้อมูลบุคลากรครู" : "เพิ่มข้อมูลบุคลากรครู"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">คำนำหน้า *</label>
                  <select
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"
                  >
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="ดร.">ดร.</option>
                    <option value="ว่าที่ร้อยตรี">ว่าที่ร้อยตรี</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ชื่อจริง *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="สมศักดิ์"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="รักสงบ"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ตำแหน่งวิชาการ/พัสดุ *</label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="เช่น ครูชำนาญการพิเศษ, เจ้าหน้าที่พัสดุ"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">กลุ่มงาน/กลุ่มสาระฯ</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="เช่น กลุ่มบริหารงบประมาณ, กลุ่มสาระการเรียนรู้ภาษาไทย"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08X-XXXXXXX"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">อีเมลโรงเรียน</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@paiwit.ac.th"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">สถานะพร้อมทำงาน</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input
                      type="radio"
                      checked={status === "Active"}
                      onChange={() => setStatus("Active")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    พร้อมเป็นคณะกรรมการ / ทำงาน
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input
                      type="radio"
                      checked={status === "Inactive"}
                      onChange={() => setStatus("Inactive")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    ระงับชั่วคราว
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
      {deleteTeacherId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <div className="p-2 bg-red-55 rounded-full">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  ยืนยันการลบข้อมูลครู?
                </h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-sans">
                คุณชัวร์หรือไม่ที่จะลบรายชื่อบุคลากรครู <span className="font-bold text-slate-800">"{deleteTeacherName}"</span> นีออกจากฐานข้อมูล? การลบนี้รวมความถึงการเชื่อมความสัมพันธ์ในแบบร่างพัสดุและ Google Sheets ดัวย
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeleteTeacherId(null);
                  setDeleteTeacherName("");
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 text-xs font-semibold cursor-pointer transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteTeacherId) {
                    onDeleteTeacher(deleteTeacherId);
                    setDeleteTeacherId(null);
                    setDeleteTeacherName("");
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
