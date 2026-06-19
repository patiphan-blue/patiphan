/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchoolSettings, Teacher, Vendor, RequestRecord, RequestStatus, ProcurementMethod } from "./types";

export const defaultSettings: SchoolSettings = {
  SchoolName: "โรงเรียนปายวิทยาคาร",
  SchoolAddress: "104 หมู่ที่ 5 ตำบลเวียงใต้ อำเภอปาย จังหวัดแม่ฮ่องสอน 58130",
  SchoolPhone: "053-699555",
  DirectorName: "นายวิเชียร ชูประเสริฐ",
  DirectorPosition: "ผู้อำนวยการโรงเรียนปายวิทยาคาร",
  CurrentBudgetYear: "2569",
  AppsScriptUrl: "",
};

export const defaultTeachers: Teacher[] = [
  {
    TeacherID: "T001",
    Prefix: "นาย",
    FirstName: "สมหมาย",
    LastName: "ใจดี",
    FullName: "นายสมหมาย ใจดี",
    Position: "ครูชำนาญการพิเศษ",
    Department: "กลุ่มสาระการเรียนรู้คณิตศาสตร์",
    Phone: "081-2345678",
    Email: "sommai.j@paiwit.ac.th",
    Status: "Active",
  },
  {
    TeacherID: "T002",
    Prefix: "นาง",
    FirstName: "สายใจ",
    LastName: "ดีเด่น",
    FullName: "นางสายใจ ดีเด่น",
    Position: "ครูชำนาญการ",
    Department: "กลุ่มบริหารงานงบประมาณและบุคคล",
    Phone: "089-8765432",
    Email: "saijai.d@paiwit.ac.th",
    Status: "Active",
  },
  {
    TeacherID: "T003",
    Prefix: "นางสาว",
    FirstName: "พัชรี",
    LastName: "ทองแท้",
    FullName: "นางสาวพัชรี ทองแท้",
    Position: "เจ้าหน้าที่พัสดุ",
    Department: "กลุ่มบริหารงานทั่วไป (งานพัสดุ)",
    Phone: "086-1112222",
    Email: "patcharee.t@paiwit.ac.th",
    Status: "Active",
  },
  {
    TeacherID: "T004",
    Prefix: "นาย",
    FirstName: "สุรชัย",
    LastName: "แสงสว่าง",
    FullName: "นายสุรชัย แสงสว่าง",
    Position: "ครู",
    Department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    Phone: "084-5556666",
    Email: "surachai.s@paiwit.ac.th",
    Status: "Active",
  },
  {
    TeacherID: "T005",
    Prefix: "นางสาว",
    FirstName: "กานดา",
    LastName: "รักเรียน",
    FullName: "นางสาวกานดา รักเรียน",
    Position: "ครูอัตราจ้าง",
    Department: "กลุ่มสาระการเรียนรู้ภาษาต่างประเทศ",
    Phone: "083-9998888",
    Email: "kanda.r@paiwit.ac.th",
    Status: "Active",
  },
];

export const defaultVendors: Vendor[] = [
  {
    VendorID: "V001",
    VendorName: "ร้านปายศึกษาภัณฑ์",
    VendorAddress: "45/2 ถนนเขตเขลางค์ ตำบลเวียงใต้ อำเภอปาย จังหวัดแม่ฮ่องสอน 58130",
    Phone: "053-699123",
    TaxID: "3580100245671",
    ContactPerson: "นายอัครพล ค้าดี",
    Status: "Active",
  },
  {
    VendorID: "V002",
    VendorName: "บริษัท เชียงใหม่ไอที ซัพพลาย จำกัด",
    VendorAddress: "123/4 ถนนห้วยแก้ว ตำบลสุเทพ อำเภอเมือง จังหวัดเชียงใหม่ 50200",
    Phone: "053-211900",
    TaxID: "0505560012345",
    ContactPerson: "นางกุลปรียา คอมดี",
    Status: "Active",
  },
  {
    VendorID: "V003",
    VendorName: "ร้านสมบูรณ์พาณิชย์",
    VendorAddress: "12 หมู่ที่ 1 ตำบลแม่ฮี้ อำเภอปาย จังหวัดแม่ฮ่องสอน 58130",
    Phone: "081-5556677",
    TaxID: "1580199922883",
    ContactPerson: "นายสมบูรณ์ แซ่ลี้",
    Status: "Active",
  },
];

export const defaultRequests: RequestRecord[] = [
  {
    RequestID: "REQ-2569-001",
    DocumentNo: "มส 0023.401/124",
    BudgetYear: "2569",
    CreatedDate: "2026-06-15",
    UpdatedDate: "2026-06-18",
    Status: RequestStatus.SUBMITTED,

    // Page 1
    StartDate: "2026-06-15",
    Subject: "จ้างเหมาบริการปรับปรุงและซ่อมแซมห้องคอมพิวเตอร์เพื่อการเรียนรู้",
    Department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    NecessityReason: "เนื่องจากเครื่องคอมพิวเตอร์หลักมีอุณหภูมิสูงและสายสัญญาณชำรุดเสียหาย ส่งผลต่อการเรียนการสอนคอมพิวเตอร์",
    BudgetSource: "เงินอุดหนุนรายหัว (โครงการพัฒนาสื่อการเรียนการสอน)",
    TotalAmount: 18500.0,
    TotalAmountText: "หนึ่งหมื่นแปดพันห้าร้อยบาทถ้วน",
    DeliveryDays: 15,
    ItemsJSON: [
      {
        id: "item_1",
        name: "ปรับปรุงระบบสายสัญญาณ LAN และสวิตช์ควบคุมเครือข่าย",
        qty: 1,
        unit: "ห้อง",
        price: 8500.0,
        total: 8500.0,
      },
      {
        id: "item_2",
        name: "เปลี่ยนพัดลมระบายความร้อนและอุปกรณ์เก็บฝุ่นกระจายลม",
        qty: 2,
        unit: "ชุด",
        price: 5000.0,
        total: 10000.0,
      },
    ],
    PriceCommitteeJSON: [
      {
        teacherId: "T001",
        fullName: "นายสมหมาย ใจดี",
        position: "ครูชำนาญการพิเศษ",
        role: "ประธานกรรมการ",
      },
      {
        teacherId: "T004",
        fullName: "นายสุรชัย แสงสว่าง",
        position: "ครู",
        role: "กรรมการ",
      },
    ],
    InspectionCommitteeJSON: [
      {
        teacherId: "T002",
        fullName: "นางสายใจ ดีเด่น",
        position: "ครูชำนาญการ",
        role: "ประธานกรรมการ",
      },
      {
        teacherId: "T003",
        fullName: "นางสาวพัชรี ทองแท้",
        position: "เจ้าหน้าที่พัสดุ",
        role: "กรรมการ",
      },
      {
        teacherId: "T005",
        fullName: "นางสาวกานดา รักเรียน",
        position: "ครูอัตราจ้าง",
        role: "กรรมการ",
      },
    ],

    // Page 2
    ActivityName: "โครงการจัดการเรียนการสอนวิทยาศาสตร์และคณิตศาสตร์ยุคดิจิทัล",

    // Page 3
    DueDate: "2026-06-30",
    DeliveryPerson: "บริษัท เชียงใหม่ไอที ซัพพลาย จำกัด",
    WorkAmount: "1 งาน",
    DeliveryBookNo: "เล่มที่ 05",
    DeliveryBookRef: "เลขที่ 1122",
    ProjectNo: "PROJ-69022",
    ContractControlNo: "CNTR-2569-105",
    InspectionControlNo: "INSP-2569-331",

    // Page 4
    PaymentMemo: "ขออนุมัติจ่ายเงินหลังจากตรวจงานพ้นเงื่อนไขเรียบร้อยตามมาตรฐานโรงเรียน",

    // Page 5
    ProcurementMethod: ProcurementMethod.SPECIFIC,

    // Page 6
    AppointmentSubject: "แต่งตั้งผู้ตรวจรับพัสดุสำหรับการซ่อมแซมห้องคอมพิวเตอร์และเชื่อมต่อระบบเครืองข่าย",

    // Page 7
    WithdrawDate: "2026-06-16",
    ResponsiblePerson: "T004",
    WithdrawItemsJSON: [
      {
        id: "w_1",
        name: "สายสัญญาณ LAN UTP Cat6 (สายแชร์ร่วม)",
        qty: 1,
        unit: "กล่อง",
      },
    ],

    // Page 8
    ResultItemsJSON: [
      {
        id: "r_1",
        name: "จ้างปรับปรุงซ่อมแซมห้องคอมพิวเตอร์",
        midPrice: 18500,
        actualPrice: 18500,
      },
    ],

    // Page 9
    SchoolAddress: defaultSettings.SchoolAddress,
    SchoolPhone: defaultSettings.SchoolPhone,
    VendorName: "บริษัท เชียงใหม่ไอที ซัพพลาย จำกัด",
    VendorAddress: "123/4 ถนนห้วยแก้ว ตำบลสุเทพ อำเภอเมือง จังหวัดเชียงใหม่ 50200",
    VendorPhone: "053-211900",
    VendorTaxID: "0505560012345",
    OrderItemsJSON: [
      {
        id: "o_1",
        name: "งานปรับปรุงระบบสายสัญญาณ LAN และพัดลมระบายอากาศคอมพิวเตอร์",
        qty: 1,
        unit: "งาน",
        price: 18500.0,
        total: 18500.0,
      },
    ],
    VATAmount: 0,
    GrandTotal: 18500.0,
    GrandTotalText: "หนึ่งหมื่นแปดพันห้าร้อยบาทถ้วน",
  },
  {
    RequestID: "REQ-2569-002",
    DocumentNo: "มส 0023.401/148",
    BudgetYear: "2569",
    CreatedDate: "2026-06-17",
    UpdatedDate: "2026-06-17",
    Status: RequestStatus.DRAFT,

    // Page 1
    StartDate: "2026-06-18",
    Subject: "ซื้อพัสดุการศึกษาและเครื่องใช้สำนักกิจกรรมโรงเรียนปายวิทยาคาร",
    Department: "กลุ่มบริหารงานงบประมาณและบุคคล",
    NecessityReason: "เพื่อเติมอุปกรณ์การทำงานและจัดเตรียมพัสดุสำหรับการใช้การสอบเข้าชั้น ม.1 และ ม.4 ประจำครึ่งปีแรก",
    BudgetSource: "เงินอุดหนุนรายหัว (พัสดุสำนักงานและกิจกรรม)",
    TotalAmount: 7350.0,
    TotalAmountText: "เจ็ดพันสามร้อยห้าสิบบาทถ้วน",
    DeliveryDays: 7,
    ItemsJSON: [
      {
        id: "item_1",
        name: "กระดาษ A4 สำหรับถ่ายเอกสาร 80 แกรม Double A",
        qty: 50,
        unit: "รีม",
        price: 125.0,
        total: 6250.0,
      },
      {
        id: "item_2",
        name: "ปากกาเคมีเขียนไวท์บอร์ดสีน้ำเงิน",
        qty: 40,
        unit: "ด้าม",
        price: 27.5,
        total: 1100.0,
      },
    ],
    PriceCommitteeJSON: [
      {
        teacherId: "T002",
        fullName: "นางสายใจ ดีเด่น",
        position: "ครูชำนาญการ",
        role: "ประธานกรรมการ",
      },
    ],
    InspectionCommitteeJSON: [
      {
        teacherId: "T003",
        fullName: "นางสาวพัชรี ทองแท้",
        position: "เจ้าหน้าที่พัสดุ",
        role: "ประธานกรรมการ",
      },
    ],

    // Page 2
    ActivityName: "กิจกรรมเตรียมการจัดสอบวัดประเมินผลกลางภาคปีการศึกษา 2569",

    // Page 3
    DueDate: "2026-06-25",
    DeliveryPerson: "ร้านปายศึกษาภัณฑ์",
    WorkAmount: "2 รายการ",
    DeliveryBookNo: "",
    DeliveryBookRef: "",
    ProjectNo: "",
    ContractControlNo: "",
    InspectionControlNo: "",

    // Page 4
    PaymentMemo: "",

    // Page 5
    ProcurementMethod: ProcurementMethod.SPECIFIC,

    // Page 6
    AppointmentSubject: "แต่งตั้งคณะกรรมการจัดเตรียมและตรวจรับพัสดุจัดสอบพับแบบเร่งรัด",

    // Page 7
    WithdrawDate: "2026-06-19",
    ResponsiblePerson: "T002",
    WithdrawItemsJSON: [
      {
        id: "w_1",
        name: "กระดาษ A4 ถ่ายเอกสาร 80 แกรม",
        qty: 10,
        unit: "รีม",
      },
    ],

    // Page 8
    ResultItemsJSON: [],

    // Page 9
    SchoolAddress: defaultSettings.SchoolAddress,
    SchoolPhone: defaultSettings.SchoolPhone,
    VendorName: "ร้านปายศึกษาภัณฑ์",
    VendorAddress: "45/2 ถนนเขตเขลางค์ ตำบลเวียงใต้ อำเภอปาย จังหวัดแม่ฮ่องสอน 58130",
    VendorPhone: "053-699123",
    VendorTaxID: "3580100245671",
    OrderItemsJSON: [
      {
        id: "o_1",
        name: "กระดาษ A4 สำหรับถ่ายเอกสาร 80 แกรม Double A",
        qty: 50,
        unit: "รีม",
        price: 125.0,
        total: 6250.0,
      },
      {
        id: "o_2",
        name: "ปากกาเคมีเขียนไวท์บอร์ดสีน้ำเงิน",
        qty: 40,
        unit: "ด้าม",
        price: 27.5,
        total: 1100.0,
      },
    ],
    VATAmount: 0,
    GrandTotal: 7350.0,
    GrandTotalText: "เจ็ดพันสามร้อยห้าสิบบาทถ้วน",
  },
];

export function bahtText(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return "";
  num = Math.round(num * 100) / 100;
  if (num === 0) return "ศูนย์บาทถ้วน";

  const textNum = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const textDigit = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  const parts = num.toFixed(2).split(".");
  const baht = parts[0];
  const satang = parts[1];

  let bahtStr = "";
  const bahtLen = baht.length;
  for (let i = 0; i < bahtLen; i++) {
    const digit = parseInt(baht.charAt(i));
    if (digit !== 0) {
      const position = bahtLen - 1 - i;
      if (position > 0 && position % 6 === 0) {
        bahtStr += "ล้าน";
      }
      const digitPart = position % 6;
      if (digitPart === 1 && digit === 1) {
        bahtStr += "";
      } else if (digitPart === 1 && digit === 2) {
        bahtStr += "ยี่";
      } else if (digitPart === 0 && digit === 1 && bahtStr !== "" && bahtLen > 1) {
        bahtStr += "เอ็ด";
      } else {
        bahtStr += textNum[digit];
      }
      bahtStr += textDigit[digitPart];
    }
  }

  if (bahtStr !== "") bahtStr += "บาท";

  let satangStr = "";
  const satangVal = parseInt(satang);
  if (satangVal !== 0) {
    const satangLen = satang.length;
    for (let i = 0; i < satangLen; i++) {
      const digit = parseInt(satang.charAt(i));
      if (digit !== 0) {
        const position = satangLen - 1 - i;
        if (position === 1 && digit === 1) {
          satangStr += "";
        } else if (position === 1 && digit === 2) {
          satangStr += "ยี่";
        } else if (position === 0 && digit === 1 && satangStr !== "") {
          satangStr += "เอ็ด";
        } else {
          satangStr += textNum[digit];
        }
        satangStr += position === 1 ? "สิบ" : "";
      }
    }
    satangStr += "สตางค์";
  } else {
    satangStr = "ถ้วน";
  }

  return bahtStr + satangStr;
}

export function formatCurrency(num: number | string | null | undefined): string {
  if (num === null || num === undefined || num === "") return "";
  const val = typeof num === "number" ? num : Number(String(num).replace(/,/g, ""));
  if (isNaN(val)) return "";
  return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function cleanDateString(dateString: string): string {
  if (!dateString) return "";
  let s = String(dateString).trim();

  // If it's a full ISO String or similar
  if (s.includes("T")) {
    s = s.split("T")[0];
  }

  // Check if it's already in YYYY-MM-DD
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return s;
  }

  // Try standard JS Date parsing if there are no Thai characters
  if (!isNaN(Date.parse(s)) && !s.match(/[\u0e00-\u0e7f]/)) {
    try {
      const parsedDate = new Date(s);
      if (!isNaN(parsedDate.getTime())) {
        const y = parsedDate.getFullYear();
        const m = parsedDate.getMonth() + 1;
        const d = parsedDate.getDate();
        return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      }
    } catch (e) {
      // ignore
    }
  }

  // Check if it has slash or dash (e.g. "19/06/2569" or "19-06-2569" or "2026/06/19")
  if (s.includes("/") || s.includes("-")) {
    const cleaned = s.replace(/\//g, "-");
    const parts = cleaned.split("-");
    if (parts.length === 3) {
      let d = parseInt(parts[0]);
      let m = parseInt(parts[1]);
      let y = parseInt(parts[2]);
      
      // If parts[0] is year (length 4)
      if (parts[0].length === 4) {
        y = parseInt(parts[0]);
        m = parseInt(parts[1]);
        d = parseInt(parts[2]);
      }
      
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        // Handle Buddhist Era / Thai Year (usually > 2400)
        if (y > 2400) {
          y -= 543;
        }
        return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      }
    }
  }

  // Check for Thai text date format: e.g. "19 มิถุนายน พ.ศ. 2569", "19 มิถุนายน 2569", "19 มิ.ย. 2569"
  const thMonths = [
    ["มกราคม", "ม.ค."],
    ["กุมภาพันธ์", "ก.พ."],
    ["มีนาคม", "มี.ค."],
    ["เมษายน", "เม.ย."],
    ["พฤษภาคม", "พ.ค."],
    ["มิถุนายน", "มิ.ย."],
    ["กรกฎาคม", "ก.ค."],
    ["สิงหาคม", "ส.ค."],
    ["กันยายน", "ก.ย."],
    ["ตุลาคม", "ต.ค."],
    ["พฤศจิกายน", "พ.ย."],
    ["ธันวาคม", "ธ.ค."]
  ];

  const words = s.split(/\s+/);
  if (words.length >= 3) {
    // Attempt to extract Day
    const d = parseInt(words[0]);
    if (!isNaN(d)) {
      // Find Month
      let m = -1;
      for (let i = 0; i < thMonths.length; i++) {
        const [full, short] = thMonths[i];
        if (words.some(word => word.includes(full) || word.replace(/\./g, "") === short.replace(/\./g, ""))) {
          m = i + 1;
          break;
        }
      }
      
      // Find Year (usually the last word or one of the last words)
      let y = -1;
      for (let i = words.length - 1; i >= 1; i--) {
        const val = parseInt(words[i]);
        if (!isNaN(val) && val > 2000) {
          y = val;
          break;
        }
      }

      if (m !== -1 && y !== -1) {
        if (y > 2400) {
          y -= 543;
        }
        return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      }
    }
  }

  return s;
}

export function formatDateToThai(dateString: string): string {
  if (!dateString) return "";
  const cleaned = cleanDateString(dateString);
  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  try {
    const parts = cleaned.split("-");
    if (parts.length !== 3) return dateString;
    const year = parseInt(parts[0]) + 543;
    const monthIndex = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    return `${day} ${months[monthIndex]} พ.ศ. ${year}`;
  } catch (e) {
    return dateString;
  }
}

// Function to flatten request records into direct Excel-ready columns (Total > 150 columns)
export function flattenRequest(req: RequestRecord, idx: number, teachers: Teacher[]): Record<string, string | number> {
  const getTeacherName = (tid: string) => {
    const t = teachers.find((teach) => teach.TeacherID === tid);
    return t ? t.FullName : tid;
  };
  const getTeacherPos = (tid: string) => {
    const t = teachers.find((teach) => teach.TeacherID === tid);
    return t ? t.Position : "";
  };

  const row: Record<string, string | number> = {
    // General
    Index: idx + 1,
    RequestID: req.RequestID || "",
    DocumentNo: req.DocumentNo || "",
    BudgetYear: req.BudgetYear || "",
    CreatedDate: cleanDateString(req.CreatedDate || ""),
    UpdatedDate: cleanDateString(req.UpdatedDate || ""),
    Status: req.Status || "",

    // Page 1: Report Request
    StartDate: cleanDateString(req.StartDate || ""),
    StartDate_Thai: req.Reserved01 || formatDateToThai(req.StartDate),
    Subject: req.Subject || "",
    Department: req.Department || "",
    NecessityReason: req.NecessityReason || "",
    BudgetSource: req.BudgetSource || "",
    TotalAmount: formatCurrency(req.TotalAmount),
    TotalAmountText: req.TotalAmountText || "",
    DeliveryDays: Number(req.DeliveryDays) || 0,

    // Page 2: Budget Table
    ActivityName: req.ActivityName || "",

    // Page 3: Inspection
    DueDate: cleanDateString(req.DueDate || ""),
    DueDate_Thai: req.Reserved02 || formatDateToThai(req.DueDate),
    DeliveryPerson: req.DeliveryPerson || "",
    WorkAmount: req.WorkAmount || "",
    DeliveryBookNo: req.DeliveryBookNo || "",
    DeliveryBookRef: req.DeliveryBookRef || "",
    ProjectNo: req.ProjectNo || "",
    ContractControlNo: req.ContractControlNo || "",
    InspectionControlNo: req.InspectionControlNo || "",

    // Page 4: Payment Request
    PaymentMemo: req.PaymentMemo || "",

    // Page 5: Winner Announcement
    ProcurementMethod: req.ProcurementMethod || "",

    // Page 6: Appointment Order
    AppointmentSubject: req.AppointmentSubject || "",

    // Page 7: Withdraw Materials
    WithdrawDate: cleanDateString(req.WithdrawDate || ""),
    WithdrawDate_Thai: req.Reserved03 || formatDateToThai(req.WithdrawDate),
    WithdrawResponsiblePersonID: req.ResponsiblePerson || "",
    WithdrawResponsiblePersonName: getTeacherName(req.ResponsiblePerson || ""),
    WithdrawResponsiblePersonPos: getTeacherPos(req.ResponsiblePerson || ""),

    // Page 9: Purchase Order
    SchoolAddress: req.SchoolAddress || "",
    SchoolPhone: req.SchoolPhone || "",
    VendorName: req.VendorName || "",
    VendorAddress: req.VendorAddress || "",
    VendorPhone: req.VendorPhone || "",
    VendorTaxID: req.VendorTaxID || "",
    VATAmount: formatCurrency(req.VATAmount),
    GrandTotal: formatCurrency(req.GrandTotal),
    GrandTotalText: req.GrandTotalText || "",
  };

  // 1. Price committee members (up to 5 flattened paths)
  for (let i = 0; i < 5; i++) {
    const colIdx = i + 1;
    const comm = req.PriceCommitteeJSON?.[i];
    row[`PriceCommittee_TeacherID_0${colIdx}`] = comm?.teacherId || "";
    row[`PriceCommittee_FullName_0${colIdx}`] = comm?.fullName || "";
    row[`PriceCommittee_Position_0${colIdx}`] = comm?.position || "";
    row[`PriceCommittee_Role_0${colIdx}`] = comm?.role || "";
  }

  // 2. Inspection committee members (up to 5 flattened paths)
  for (let i = 0; i < 5; i++) {
    const colIdx = i + 1;
    const comm = req.InspectionCommitteeJSON?.[i];
    row[`InspectionCommittee_TeacherID_0${colIdx}`] = comm?.teacherId || "";
    row[`InspectionCommittee_FullName_0${colIdx}`] = comm?.fullName || "";
    row[`InspectionCommittee_Position_0${colIdx}`] = comm?.position || "";
    row[`InspectionCommittee_Role_0${colIdx}`] = comm?.role || "";
  }

  // 3. Purchase items (up to 10 items)
  for (let i = 0; i < 10; i++) {
    const colIdx = i + 1;
    const item = req.ItemsJSON?.[i];
    row[`Item_Name_0${colIdx}`] = item?.name || "";
    row[`Item_Qty_0${colIdx}`] = item?.qty || "";
    row[`Item_Unit_0${colIdx}`] = item?.unit || "";
    row[`Item_UnitPrice_0${colIdx}`] = item ? formatCurrency(item.price) : "";
    row[`Item_Total_0${colIdx}`] = item ? formatCurrency(item.total) : "";
  }

  // 4. Withdraw items (up to 10 items)
  for (let i = 0; i < 10; i++) {
    const colIdx = i + 1;
    const item = req.WithdrawItemsJSON?.[i];
    row[`WithdrawItem_Name_0${colIdx}`] = item?.name || "";
    row[`WithdrawItem_Qty_0${colIdx}`] = item?.qty || "";
    row[`WithdrawItem_Unit_0${colIdx}`] = item?.unit || "";
  }

  // 5. Result items (up to 10 items)
  for (let i = 0; i < 10; i++) {
    const colIdx = i + 1;
    const item = req.ResultItemsJSON?.[i];
    row[`ResultItem_Name_0${colIdx}`] = item?.name || "";
    row[`ResultItem_MidPrice_0${colIdx}`] = item ? formatCurrency(item.midPrice) : "";
    row[`ResultItem_ActualPrice_0${colIdx}`] = item ? formatCurrency(item.actualPrice) : "";
  }

  // 6. Reserved fields (20 fields)
  row["Reserved01"] = req.Reserved01 || "";
  row["Reserved02"] = req.Reserved02 || "";
  row["Reserved03"] = req.Reserved03 || "";
  row["Reserved04"] = req.Reserved04 || "";
  row["Reserved05"] = req.Reserved05 || "";
  row["Reserved06"] = req.Reserved06 || "";
  row["Reserved07"] = req.Reserved07 || "";
  row["Reserved08"] = req.Reserved08 || "";
  row["Reserved09"] = req.Reserved09 || "";
  row["Reserved10"] = req.Reserved10 || "";
  row["Reserved11"] = req.Reserved11 || "";
  row["Reserved12"] = req.Reserved12 || "";
  row["Reserved13"] = req.Reserved13 || "";
  row["Reserved14"] = req.Reserved14 || "";
  row["Reserved15"] = req.Reserved15 || "";
  row["Reserved16"] = req.Reserved16 || "";
  row["Reserved17"] = req.Reserved17 || "";
  row["Reserved18"] = req.Reserved18 || "";
  row["Reserved19"] = req.Reserved19 || "";
  row["Reserved20"] = req.Reserved20 || "";

  return row;
}
