/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Download, FileCode, CheckSquare, ListPlus, Terminal } from "lucide-react";

export default function AppsScriptExporter() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(null), 3000);
  };

  const appsScriptCode = `/**
 * Google Apps Script Backend for Pai Witthayakhan Procurement Document Assistant
 * Save this file as "Code.gs" in your Google Apps Script editor.
 * Create a Google Sheet with sheets names: "Requests", "Teachers", "Vendors", "Settings"
 */

function doGet(e) {
  if (e && e.parameter && e.parameter.action === "getDatabase") {
    var data = getDatabase();
    return ContentService.createTextOutput(JSON.stringify(data))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Otherwise, render full UI if they want to load as Web App
  try {
    var template = HtmlService.createTemplateFromFile('index');
    return template.evaluate()
      .setTitle('ระบบช่วยจัดทำเอกสารจัดซื้อจัดจ้าง - โรงเรียนปายวิทยาคาร')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch(err) {
    return ContentService.createTextOutput("Pai Witthayakhan Web App portal is running correctly. For data endpoints, specify action parameter.")
                         .setMimeType(ContentService.MimeType.TEXT);
  }
}

function doPost(e) {
  var params;
  try {
    params = JSON.parse(e.postData.contents);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: "Invalid JSON: " + err.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (params.action === "saveRequest") {
    var result = saveRequest(params.record);
    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON);
  } else if (params.action === "deleteRequest") {
    var result = deleteRequest(params.requestId);
    return ContentService.createTextOutput(JSON.stringify({success: result}))
                         .setMimeType(ContentService.MimeType.JSON);
  } else if (params.action === "getDatabase") {
    var result = getDatabase();
    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: false, error: "Unknown action"}))
                       .setMimeType(ContentService.MimeType.JSON);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Setup sheet headers dynamically (RUN THIS ONCE from developer bar)
 */
function setupDatabaseSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Requests Sheet
  var reqSheet = ss.getSheetByName("Requests") || ss.insertSheet("Requests");
  reqSheet.clear();
  
  var headers = [
    "Index", "RequestID", "DocumentNo", "BudgetYear", "CreatedDate", "UpdatedDate", "Status",
    "StartDate", "StartDate_Thai", "Subject", "Department", "NecessityReason", "BudgetSource", "TotalAmount", "TotalAmountText", "DeliveryDays",
    "ActivityName",
    "DueDate", "DueDate_Thai", "DeliveryPerson", "WorkAmount", "DeliveryBookNo", "DeliveryBookRef", "ProjectNo", "ContractControlNo", "InspectionControlNo",
    "PaymentMemo",
    "ProcurementMethod",
    "AppointmentSubject",
    "WithdrawDate", "WithdrawDate_Thai", "WithdrawResponsiblePersonID", "WithdrawResponsiblePersonName", "WithdrawResponsiblePersonPos",
    "SchoolAddress", "SchoolPhone",
    "VendorName", "VendorAddress", "VendorPhone", "VendorTaxID", "VATAmount", "GrandTotal", "GrandTotalText"
  ];
  
  // 1.1 Price Committees (5 slots)
  for (var i = 1; i <= 5; i++) {
    headers.push("PriceCommittee_TeacherID_0" + i);
    headers.push("PriceCommittee_FullName_0" + i);
    headers.push("PriceCommittee_Position_0" + i);
    headers.push("PriceCommittee_Role_0" + i);
  }
  
  // 1.2 Inspection Committees (5 slots)
  for (var i = 1; i <= 5; i++) {
    headers.push("InspectionCommittee_TeacherID_0" + i);
    headers.push("InspectionCommittee_FullName_0" + i);
    headers.push("InspectionCommittee_Position_0" + i);
    headers.push("InspectionCommittee_Role_0" + i);
  }
  
  // 1.3 Purchase Items (10 slots)
  for (var i = 1; i <= 10; i++) {
    headers.push("Item_Name_0" + i);
    headers.push("Item_Qty_0" + i);
    headers.push("Item_Unit_0" + i);
    headers.push("Item_UnitPrice_0" + i);
    headers.push("Item_Total_0" + i);
  }
  
  // 1.4 Withdraw Items (10 slots)
  for (var i = 1; i <= 10; i++) {
    headers.push("WithdrawItem_Name_0" + i);
    headers.push("WithdrawItem_Qty_0" + i);
    headers.push("WithdrawItem_Unit_0" + i);
  }
  
  // 1.5 Result Items (10 slots)
  for (var i = 1; i <= 10; i++) {
    headers.push("ResultItem_Name_0" + i);
    headers.push("ResultItem_MidPrice_0" + i);
    headers.push("ResultItem_ActualPrice_0" + i);
  }
  
  // 1.6 Reserved Fields (20 slots)
  for (var i = 1; i <= 20; i++) {
    headers.push("Reserved" + (i < 10 ? "0" + i : i));
  }
  
  reqSheet.appendRow(headers);
  // ตั้งค่าคอลัมน์ทั้งหมดให้รองรับรูปแบบข้อความธรรมดาก่อน เพื่อป้องกันไม่ให้ Google Sheets แปลงตัวเลข เช่น '6' ในคอลัมน์ DeliveryDays เป็นวันที่ 1900-01-06
  if (reqSheet.getMaxRows() > 1) {
    reqSheet.getRange(2, 1, 1000, headers.length).setNumberFormat("@");
  }
  
  // 2. Setup Teachers Sheet
  var teachSheet = ss.getSheetByName("Teachers") || ss.insertSheet("Teachers");
  if (teachSheet.getLastRow() === 0) {
    teachSheet.appendRow(["TeacherID", "Prefix", "FirstName", "LastName", "FullName", "Position", "Department", "Phone", "Email", "Status"]);
  }
  
  // 3. Setup Vendors Sheet
  var vendSheet = ss.getSheetByName("Vendors") || ss.insertSheet("Vendors");
  if (vendSheet.getLastRow() === 0) {
    vendSheet.appendRow(["VendorID", "VendorName", "VendorAddress", "Phone", "TaxID", "ContactPerson", "Status"]);
  }
  
  // 4. Setup Settings Sheet
  var setSheet = ss.getSheetByName("Settings") || ss.insertSheet("Settings");
  if (setSheet.getLastRow() === 0) {
    setSheet.appendRow(["SchoolName", "SchoolAddress", "SchoolPhone", "DirectorName", "DirectorPosition", "CurrentBudgetYear"]);
    setSheet.appendRow(["โรงเรียนปายวิทยาคาร", "104 หมู่ที่ 5 ตำบลเวียงใต้ อำเภอปาย จังหวัดแม่ฮ่องสอน 58130", "053-699555", "นายวิเชียร ชูประเสริฐ", "ผู้อำนวยการโรงเรียนปายวิทยาคาร", "2569"]);
  }
  
  return "ฐานข้อมูลตั้งค่าเสร็จสิ้นแล้ว! คอลัมน์รวม " + headers.length + " ฟิลด์ ปลอดภัยในการจับคู่ Word Mail Merge";
}

/**
 * Fetch all tables
 */
function getDatabase() {
  return {
    requests: getTableData("Requests"),
    teachers: getTableData("Teachers"),
    vendors: getTableData("Vendors"),
    settings: getSettingsData()
  };
}

function getTableData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  var range = sheet.getDataRange();
  var values = range.getValues();
  if (values.length <= 1) return [];
  
  var headers = values[0];
  var data = [];
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    data.push(obj);
  }
  return data;
}

function getSettingsData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Settings");
  if (!sheet) return {};
  
  var range = sheet.getDataRange();
  var values = range.getValues();
  if (values.length < 2) return {};
  
  var headers = values[0];
  var row = values[1];
  var obj = {};
  for (var j = 0; j < headers.length; j++) {
    obj[headers[j]] = row[j];
  }
  return obj;
}

/**
 * Submit or update form requests (1 Row = 1 Record)
 */
function saveRequest(flatRecord) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Requests");
  if (!sheet) {
    setupDatabaseSheets();
    sheet = ss.getSheetByName("Requests");
  }
  
  var range = sheet.getDataRange();
  var values = range.getValues();
  var headers = values[0];
  
  var idColIdx = headers.indexOf("RequestID");
  var existingRowIdx = -1;
  
  // Find if request already exists
  if (idColIdx !== -1) {
    for (var i = 1; i < values.length; i++) {
      if (values[i][idColIdx] === flatRecord.RequestID) {
        existingRowIdx = i + 1; // 1-based index
        break;
      }
    }
  }
  
  // Prepare row values based on column order
  var rowValues = [];
  for (var j = 0; j < headers.length; j++) {
    var key = headers[j];
    rowValues.push(flatRecord[key] !== undefined ? flatRecord[key] : "");
  }
  
  if (existingRowIdx !== -1) {
    var rangeToSet = sheet.getRange(existingRowIdx, 1, 1, headers.length);
    rangeToSet.setValues([rowValues]);
    rangeToSet.setNumberFormat("@"); // บังคับข้อมูลเป็นข้อความธรรมดา เพื่อสยบปัญหา Google Sheets แปลงตัวเลขเป็นวันที่ 1900-01-06
    return { success: true, action: "updated", id: flatRecord.RequestID };
  } else {
    sheet.appendRow(rowValues);
    var newRowIdx = sheet.getLastRow();
    sheet.getRange(newRowIdx, 1, 1, headers.length).setNumberFormat("@"); // บังคับข้อมูลเป็นข้อความธรรมดา เพื่อสยบปัญหา Google Sheets แปลงตัวเลขเป็นวันที่ 1900-01-06
    return { success: true, action: "inserted", id: flatRecord.RequestID };
  }
}

function deleteRequest(requestId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Requests");
  if (!sheet) return false;
  
  var range = sheet.getDataRange();
  var values = range.getValues();
  var headers = values[0];
  var idColIdx = headers.indexOf("RequestID");
  
  if (idColIdx === -1) return false;
  for (var i = 1; i < values.length; i++) {
    if (values[i][idColIdx] === requestId) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}
`;

  return (
    <div id="apps_script_exporter" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">คู่มือและสคริปต์ Google Apps Script (GAS)</h1>
        <p className="text-slate-500 text-sm mt-1">
          คัดลอกสคริปต์ด้านล่างเพื่อผูกหน้าจอของระบบ เข้ากับ Google Sheets ของโรงเรียนปายวิทยาคาร สำหรับทำงานหลายเครื่องพร้อมกัน
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              ข้อกำหนดเบื้องต้น
            </h3>
            <ol className="text-xs text-slate-600 list-decimal list-inside space-y-2 leading-relaxed">
              <li>สร้าง Google Sheet เปล่าขึ้นมา 1 ไฟล์</li>
              <li>เปิดเมนู <b>ส่วนขยาย &gt; Apps Script</b></li>
              <li>สร้างไฟล์เขียนโค้ดและตั้งชื่อว่า <code>Code.gs</code></li>
              <li>ลบโค้ดเริ่มต้นออก แล้วนำสคริปต์ด้านขวาไปวาง</li>
              <li>รันฟังก์ชัน <code>setupDatabaseSheets</code> เพื่อผูกคอลัมน์ Excel Mail Merge (150+ ช่อง) โดยอัตโนมัติ</li>
            </ol>
          </div>

          <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 space-y-2">
            <h4 className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
              <ListPlus className="w-3.5 h-3.5" />
              คุณลักษณะตารางกลาง
            </h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              การจัดเก็บใน Apps Script จะถอดรหัส (Flatten) โครงสร้างข้อมูล JSON สันดาป ออกมาเป็นพิกัดคอลัมน์เดี่ยว
              <b> 1 บรรทัด = 1 เรื่อง</b> รองรับการนำเข้าไฟล์ไปยัง Microsoft Word เพื่อทำพัสดุจดหมายเวียนทันที
            </p>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          {/* Code block */}
          <div className="bg-slate-900 rounded-xl shadow-md border border-slate-800 overflow-hidden">
            <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between text-slate-400 text-xs">
              <span className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-orange-400" />
                Code.gs (Backend Google Apps Script)
              </span>
              <button
                onClick={() => copyToClipboard(appsScriptCode, "gas")}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors text-xs cursor-pointer"
              >
                {copiedSection === "gas" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    คัดลอกแล้ว!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    คัดลอกไฟล์
                  </>
                )}
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-96 text-xs text-slate-300 font-mono leading-relaxed bg-slate-950">
              <pre>{appsScriptCode}</pre>
            </div>
          </div>

          {/* Integration instruction */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              ขั้นตอนการติดตั้งให้คนในแผนกพัสดุครูใช้ร่วมกัน
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              หลังจากเขียนสคริปต์และเซฟเรียบร้อย ให้กดปุ่ม <b>"การติดตั้งใช้งาน" (Deploy) &gt; "การจัดการการติดตั้งใช้งานใหม่" (New Deployment)</b> เลือกประเภทเป็น <b>"เว็บแอป" (Web App)</b> ตั้งค่าสิทธิ์การเข้าถึงให้เป็น <b>"ทุกคน" (Anyone)</b>
              เมื่อกด Deploy จะได้รับ URL เว็บแอปของท่าน สำหรับเป็นพอร์ทัลกลางเข้าใช้งานได้ทันทีในสมาร์ทโฟน แท็บเล็ต และเครื่องคอมพิวเตอร์
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
