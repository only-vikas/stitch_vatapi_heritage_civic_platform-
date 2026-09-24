/**
 * Sustainable Planning Dashboard Data Models & Helpers
 * Handles Crowd Pressure Matrix, Citizen-Science Water Sentinel,
 * Leave-No-Trace Waste Management, and Dispersal Nudges.
 */

export interface CrowdForecast {
  id: string;
  site_name: string;
  hour_slot: string;
  visitor_count: number;
  capacity_limit: number;
  recorded_at?: string;
}

export interface DispersalNudge {
  id: string;
  title: string;
  crowdDiff: string;
  bestTime: string;
  perk?: string;
  description: string;
  isAiGenerated?: boolean;
  suggestedSite?: string;
}

export interface WaterReading {
  id: string;
  metric_type: string;
  location: string;
  dissolved_oxygen: number; // mg/L
  ph: number; // pH
  turbidity: number; // NTU
  algal_biomass: number; // RFU
  purity_index: number;
  photo_url?: string;
  notes?: string;
  reported_by?: string;
  recorded_at: string;
}

export interface TrailHotspot {
  id: string;
  name: string;
  pressure_label: string;
  status: 'Cleared' | 'Team en-route' | 'Optimal' | 'Pending';
  status_color: 'primary' | 'secondary' | 'error';
  cleared_ago?: string;
}

export interface LeaveNoTraceMetrics {
  score: number;
  grade: string;
  plastic_free_percent: number;
  composting_compliance_percent: number;
  can_proximity_percent: number;
}

export interface EcoSenaRemoval {
  id: string;
  location: string;
  timestamp: string;
  before_img: string;
  after_img: string;
  before_debris: string;
  resolved_by: string;
  status: string;
}

// ----------------------------------------------------------------------
// 1. BASELINE CROWD DATA
// ----------------------------------------------------------------------
export const BASELINE_CROWD_FORECASTS: CrowdForecast[] = [
  // Badami Caves (Capacity: 3500)
  { id: 'cf-1', site_name: 'Badami Caves', hour_slot: '07:00 AM', visitor_count: 420, capacity_limit: 3500 },
  { id: 'cf-2', site_name: 'Badami Caves', hour_slot: '11:00 AM', visitor_count: 3325, capacity_limit: 3500 },
  { id: 'cf-3', site_name: 'Badami Caves', hour_slot: '03:00 PM', visitor_count: 1850, capacity_limit: 3500 },
  { id: 'cf-4', site_name: 'Badami Caves', hour_slot: '05:00 PM', visitor_count: 3290, capacity_limit: 3500 },

  // Pattadakal (Capacity: 4000)
  { id: 'cf-5', site_name: 'Pattadakal', hour_slot: '07:00 AM', visitor_count: 210, capacity_limit: 4000 },
  { id: 'cf-6', site_name: 'Pattadakal', hour_slot: '11:00 AM', visitor_count: 1400, capacity_limit: 4000 },
  { id: 'cf-7', site_name: 'Pattadakal', hour_slot: '03:00 PM', visitor_count: 1650, capacity_limit: 4000 },
  { id: 'cf-8', site_name: 'Pattadakal', hour_slot: '05:00 PM', visitor_count: 380, capacity_limit: 4000 },

  // Aihole (Capacity: 3000)
  { id: 'cf-9', site_name: 'Aihole Ring', hour_slot: '07:00 AM', visitor_count: 150, capacity_limit: 3000 },
  { id: 'cf-10', site_name: 'Aihole Ring', hour_slot: '11:00 AM', visitor_count: 450, capacity_limit: 3000 },
  { id: 'cf-11', site_name: 'Aihole Ring', hour_slot: '03:00 PM', visitor_count: 1650, capacity_limit: 3000 },
  { id: 'cf-12', site_name: 'Aihole Ring', hour_slot: '05:00 PM', visitor_count: 620, capacity_limit: 3000 },
];

// Helper to determine severity level & colors from capacity ratio
export function getCrowdLevel(visitorCount: number, capacityLimit: number): {
  label: 'Low' | 'Mod' | 'Peak';
  bgClass: string;
  textClass: string;
  ratio: number;
} {
  const ratio = visitorCount / Math.max(capacityLimit, 1);
  if (ratio >= 0.75) {
    return {
      label: 'Peak',
      bgClass: 'bg-[#ffdad6]',
      textClass: 'text-[#93000a]',
      ratio,
    };
  }
  if (ratio >= 0.35) {
    return {
      label: 'Mod',
      bgClass: 'bg-[#ffdbd1]',
      textClass: 'text-[#3b0900]',
      ratio,
    };
  }
  return {
    label: 'Low',
    bgClass: 'bg-[#89f5e7]',
    textClass: 'text-[#00201d]',
    ratio,
  };
}

// ----------------------------------------------------------------------
// 2. DISPERSAL NUDGES (Prompt 5.1.1)
// ----------------------------------------------------------------------
export const BASELINE_NUDGES: DispersalNudge[] = [
  {
    id: 'nudge-1',
    title: 'Pattadakal Shoreline',
    crowdDiff: '-82% Crowd',
    bestTime: 'Best morning window at 7:00 AM.',
    perk: 'Free Heritage Token + Audio Guide',
    description: 'Spacious riverside grounds absorb crowds evenly. Gentle breeze off the Malaprabha.',
    isAiGenerated: false,
  },
  {
    id: 'nudge-2',
    title: 'Mahakuta Banyan Grove',
    crowdDiff: 'Mild Surge',
    bestTime: 'Ideal solitary window: 1:30 PM - 3:00 PM.',
    description: 'Natural spring shade cool corridor with ancient Pushkarini waters.',
    isAiGenerated: false,
  },
  {
    id: 'nudge-3',
    title: 'Aihole Megalithic Ridge',
    crowdDiff: 'Open Sanctuary',
    bestTime: 'Quiet window open now.',
    description: 'Zero tour bus parking pressure recorded. Uncrowded apsidal temple shrines.',
    isAiGenerated: false,
  },
];

// ----------------------------------------------------------------------
// 3. WATER SENTINEL BASELINE (Prompt 5.1.2)
// ----------------------------------------------------------------------
export const BASELINE_WATER_READINGS: WaterReading[] = [
  {
    id: 'water-1',
    metric_type: 'Water',
    location: 'North Ghat',
    dissolved_oxygen: 6.8,
    ph: 7.4,
    turbidity: 14.0,
    algal_biomass: 0.12,
    purity_index: 82,
    photo_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBkdRVaVwWe2-n_1MD1jf_sqVLgEbYBRzzr0F6FHMf6Sk37BxGc2XQBcOcCQzgzucHQwQJ-MMsXkk5LxiNwIOMPFNv2cGsTSBHLWZrv4HSyQXBAvPhC0NH0Q40PDuaR575JaxbI-k94q5dJbZPtgLLx-hESg8jzXFAd8cebCkpyXOUL4kz9Y6fZcc5k3P5QGK2wwb2kRZtXRCAcl0KK_ExrYvDiVUAW7EMjHrVcUFbafe-XqWa9VEYr',
    notes: 'Serene sandstone ghats with clean water reflecting Bhutanatha Temple.',
    reported_by: 'KSPCB Station #1',
    recorded_at: 'Today, 08:30 AM',
  },
  {
    id: 'water-2',
    metric_type: 'Water',
    location: 'Silt Trap #2',
    dissolved_oxygen: 6.5,
    ph: 7.3,
    turbidity: 16.5,
    algal_biomass: 0.14,
    purity_index: 78,
    photo_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBAJso531CrM-pfXq_R2d8YDc3-DS7nrrUslLlk2UU61SppAsZ-JfbX2HqKDyVoJTRKvJ6K5LnkaJwnqfs91XQpvenY7ksU93PY2OV29Zj5kmCVmR32eKmo1gp70P2PghqAkLiLQcfGAsrLKUUFuo0IaVrEpCuxJWPV1smhSYrsFiwW9gKUzEaY7O0WxL5DcTTD-X_uVGhFThUPjENhpAZfOlzNeovSIooLr1perze4qknTBuLgPQ6_',
    notes: 'Clear water inlet channel of Agastya lake stone pushkarini free from plastic.',
    reported_by: 'Field Officer Suresh',
    recorded_at: 'Today, 09:15 AM',
  },
  {
    id: 'water-3',
    metric_type: 'Water',
    location: 'East Basin',
    dissolved_oxygen: 7.1,
    ph: 7.5,
    turbidity: 12.0,
    algal_biomass: 0.10,
    purity_index: 85,
    photo_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDmPCnRDXtITFdwoVg2sWR09C1DnHfytvXH3zaAG5htmxy7y5RbOSIIHXNYCXlymr0stXi9xPu7eG1UjIup-L2WeR-1F6h9_8d969sVA9lMNLTmYLeNWIJYv4kGjAt2yNYDr22vpk1M1xE9jaJZX-F2mu50Z91ysTusPEXDMP9U-xQP7p6TcUPQOnfxlIy4WOz4YXmiq-hwfbaNgaDxFtiVnXSk0zh8Cds0ADruwnIYV5XPklbokZGB',
    notes: 'Calm water ripple around ancient red sandstone boulders near cave shoreline.',
    reported_by: 'Citizen Sentinel Basamma',
    recorded_at: 'Today, 10:00 AM',
  },
];

// Calculate Water Purity Index (0-100) from physical metrics
export function calculatePurityIndex(doVal: number, phVal: number, turbVal: number): number {
  // Ideal: DO ~ 6.5-8.5 mg/L, pH ~ 7.0-8.0, Turbidity < 15 NTU
  let score = 100;
  
  // Dissolved Oxygen penalty
  if (doVal < 5.0) score -= 30;
  else if (doVal < 6.5) score -= 15;
  else if (doVal > 9.0) score -= 5;

  // pH penalty
  const phDiff = Math.abs(phVal - 7.4);
  score -= Math.min(25, phDiff * 20);

  // Turbidity penalty
  if (turbVal > 25) score -= 25;
  else if (turbVal > 15) score -= (turbVal - 15) * 1.5;

  return Math.max(30, Math.min(98, Math.round(score)));
}

// ----------------------------------------------------------------------
// 4. CLEAN TRAIL & WASTE BASELINE (Prompt 5.1.3)
// ----------------------------------------------------------------------
export const BASELINE_TRAIL_HOTSPOTS: TrailHotspot[] = [
  {
    id: 'hs-1',
    name: 'Cave 1 Stairs & Ticket Plaza',
    pressure_label: 'High Litter Pressure',
    status: 'Cleared',
    status_color: 'primary',
    cleared_ago: 'Cleared 8m ago',
  },
  {
    id: 'hs-2',
    name: 'North Fort Trail Vista',
    pressure_label: 'Medium Pack-In Waste',
    status: 'Team en-route',
    status_color: 'secondary',
    cleared_ago: 'Team en-route',
  },
  {
    id: 'hs-3',
    name: 'Aihole Durga Temple Promenade',
    pressure_label: 'Zero Waste Baseline',
    status: 'Optimal',
    status_color: 'primary',
    cleared_ago: 'Optimal',
  },
];

export const BASELINE_LNT_METRICS: LeaveNoTraceMetrics = {
  score: 88,
  grade: 'Grade A',
  plastic_free_percent: 94,
  composting_compliance_percent: 89,
  can_proximity_percent: 82,
};

export const BASELINE_ECO_SENA_REMOVAL: EcoSenaRemoval = {
  id: 'removal-1',
  location: 'Cave 2 Escarpment',
  timestamp: 'Today, 09:15 AM',
  before_img:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA_pf0ZQ9rzqSFDmS6EIbbHo6U8Mjn7aaS75lUFo7lkRtpNbcuJUfACquX8fSqVTismh-0nB4YfAm6Bqj677yvOqD71cXJjnMybpcpp4NqYO23Pal-FtN6tjRWCxyoA6uMxFFYv6wrRiiGBYRU5q0X-hX01QhwxCiphyeYaVjpqRV1ylbDZgMk2zmgyhp-VfRK4AklY1DIOmwb5kDVcJuXQa-o2msOYC_JVuRuLs919LYdyg2MZXAP3',
  after_img:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCHAoRs6maCaYtJvkR3DSfaWBMq5kCOiYqRvIXKBkwKd23ENDIlqYEkcN7Cd4JODz5vF_Kl3VMN5VVShJC86LlbDeEw4i3ed2nJwrhAxUB-cQ5m3Uyf4zeXtIq5caVS2zN3788CVs9u-F00JJ1oRvWLtCBbeohobB_HJFQbij5IPyuQzp5mQYhy59_LoyS9xIMIfPSrc3VtVvenqTCntp6Z7GWuoJO_gRYAZibyzs0FC7kkZbyfFECD',
  before_debris: '12kg debris detected',
  resolved_by: 'Cleared by Sena Unit #4',
  status: 'RESOLVED',
};
