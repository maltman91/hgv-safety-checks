import { CheckItem, InspectionType } from './types';

export const DAILY_CHECKLIST: CheckItem[] = [
  { id: 'd1', category: 'External', label: 'Lights & Indicators' },
  { id: 'd2', category: 'External', label: 'Tyres & Wheels' },
  { id: 'd3', category: 'External', label: 'Mirrors & Glass' },
  { id: 'd4', category: 'External', label: 'Wipers & Washers' },
  { id: 'd5', category: 'External', label: 'Bodywork & Doors' },
  { id: 'd6', category: 'External', label: 'Coupling Security' },
  { id: 'd7', category: 'Engine', label: 'Fuel / Oil Leaks' },
  { id: 'd8', category: 'Engine', label: 'AdBlue / Fluids' },
  { id: 'd9', category: 'Cab', label: 'Brakes (Air build-up)' },
  { id: 'd10', category: 'Cab', label: 'Steering & Horn' },
  { id: 'd11', category: 'Cab', label: 'Tachograph & Speedo' },
  { id: 'd12', category: 'Cab', label: 'View to Front' },
];

export const SIX_WEEKLY_CHECKLIST: CheckItem[] = [
  ...DAILY_CHECKLIST,
  { id: 'w1', category: 'Under Vehicle', label: 'Chassis Condition' },
  { id: 'w2', category: 'Under Vehicle', label: 'Suspension Units' },
  { id: 'w3', category: 'Under Vehicle', label: 'Axle Hubs' },
  { id: 'w4', category: 'Under Vehicle', label: 'Exhaust System' },
  { id: 'w5', category: 'Brakes', label: 'Brake Linings/Pads' },
  { id: 'w6', category: 'Brakes', label: 'Brake Actuators' },
  { id: 'w7', category: 'Steering', label: 'Steering Linkage' },
  { id: 'w8', category: 'Electrical', label: 'Battery Security' },
  { id: 'w9', category: 'Compliance', label: 'Speed Limiter Plaque' },
  { id: 'w10', category: 'Compliance', label: 'Plate Display' },
];

export const MOCK_HISTORY: any[] = []; // Start empty
