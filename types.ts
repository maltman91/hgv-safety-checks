export enum InspectionType {
  DAILY = 'Daily Walkaround',
  SIX_WEEKLY = '6-Weekly PMI'
}

export enum CheckStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  NA = 'N/A'
}

export enum DefectSeverity {
  MINOR = 'Minor',
  MAJOR = 'Major',
  DANGEROUS = 'Dangerous'
}

export interface Defect {
  id: string;
  checkItemId: string;
  checkItemName: string;
  description: string;
  severity: DefectSeverity;
  notes: string;
  photos: string[];
  aiAnalysis?: string;
}

export interface CheckItem {
  id: string;
  label: string;
  category: string;
}

export interface CheckResult {
  itemId: string;
  status: CheckStatus;
}

export interface VehicleDetails {
  registration: string;
  odometer: string;
  makeModel: string;
}

export interface InspectionRecord {
  id: string;
  date: string;
  type: InspectionType;
  vehicle: VehicleDetails;
  inspectorName: string;
  results: Record<string, CheckStatus>;
  itemImages: Record<string, string[]>;
  defects: Defect[];
  signatureUrl: string;
  location?: { lat: number; lng: number };
  completedAt: number;
}