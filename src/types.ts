/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum RequestStatus {
  DRAFT = "Draft",
  SUBMITTED = "Submitted",
  COMPLETED = "Completed",
}

export enum ProcurementMethod {
  SPECIFIC = "เฉพาะเจาะจง",
  PRICE_AGREEMENT = "สอบราคา",
  E_MARKET = "e-market",
  SELECT = "คัดเลือก",
  E_BIDDING = "e-bidding",
  INTERNATIONAL = "ประกวดราคานานาชาติ",
}

export interface Item {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
  total: number;
}

export interface CommitteeMember {
  teacherId: string;
  fullName: string;
  position: string;
  role: string; // "ประธานกรรมการ", "กรรมการ"
}

export interface WithdrawItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
}

export interface ResultItem {
  id: string;
  name: string;
  midPrice: number;
  actualPrice: number;
}

export interface RequestRecord {
  RequestID: string;
  DocumentNo: string;
  BudgetYear: string;
  CreatedDate: string;
  UpdatedDate: string;
  Status: RequestStatus;

  // Page 1
  StartDate: string;
  Subject: string;
  Department: string;
  NecessityReason: string;
  BudgetSource: string;
  TotalAmount: number;
  TotalAmountText: string;
  DeliveryDays: number;
  ItemsJSON: Item[];
  PriceCommitteeJSON: CommitteeMember[];
  InspectionCommitteeJSON: CommitteeMember[];

  // Page 2
  ActivityName: string;

  // Page 3
  DueDate: string;
  DeliveryPerson: string;
  WorkAmount: string;
  DeliveryBookNo: string;
  DeliveryBookRef: string;
  ProjectNo: string;
  ContractControlNo: string;
  InspectionControlNo: string;

  // Page 4
  PaymentMemo: string;

  // Page 5
  ProcurementMethod: ProcurementMethod;

  // Page 6
  AppointmentSubject: string;

  // Page 7
  WithdrawDate: string;
  ResponsiblePerson: string; // Teacher ID
  WithdrawItemsJSON: WithdrawItem[];

  // Page 8
  ResultItemsJSON: ResultItem[];

  // Page 9
  SchoolAddress: string;
  SchoolPhone: string;
  VendorName: string;
  VendorAddress: string;
  VendorPhone: string;
  VendorTaxID: string;
  OrderItemsJSON: Item[];
  VATAmount: number;
  GrandTotal: number;
  GrandTotalText: string;

  // Reserved Fields
  Reserved01?: string;
  Reserved02?: string;
  Reserved03?: string;
  Reserved04?: string;
  Reserved05?: string;
  Reserved06?: string;
  Reserved07?: string;
  Reserved08?: string;
  Reserved09?: string;
  Reserved10?: string;
  Reserved11?: string;
  Reserved12?: string;
  Reserved13?: string;
  Reserved14?: string;
  Reserved15?: string;
  Reserved16?: string;
  Reserved17?: string;
  Reserved18?: string;
  Reserved19?: string;
  Reserved20?: string;
}

export interface Teacher {
  TeacherID: string;
  Prefix: string;
  FirstName: string;
  LastName: string;
  FullName: string;
  Position: string;
  Department: string;
  Phone: string;
  Email: string;
  Status: "Active" | "Inactive";
}

export interface Vendor {
  VendorID: string;
  VendorName: string;
  VendorAddress: string;
  Phone: string;
  TaxID: string;
  ContactPerson: string;
  Status: "Active" | "Inactive";
}

export interface SchoolSettings {
  SchoolName: string;
  SchoolAddress: string;
  SchoolPhone: string;
  DirectorName: string;
  DirectorPosition: string;
  CurrentBudgetYear: string;
  AppsScriptUrl?: string;
}
