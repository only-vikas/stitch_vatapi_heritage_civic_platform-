import { create } from 'zustand';

export type AccessProfile = 'Wheelchair' | 'Senior' | 'Low Vision' | 'Family with Pram' | 'None';

export interface AccessItineraryStop {
  id: string;
  step_number: number;
  time: string;
  site_name: string;
  description: string;
  accessibility_notes: string;
  rest_point_title: string;
  rest_point_desc: string;
  image_url: string;
  badge_labels: string[];
  slope_or_metric: string;
  doorway_or_passage: string;
  is_accessible_verified: boolean;
  audio_narrative?: string;
  isAiGenerated?: boolean;
}

interface AccessState {
  accessProfile: AccessProfile;
  setAccessProfile: (profile: AccessProfile) => void;
  textSizeLevel: number; // e.g. 1.0 (default), 0.9 to 1.3
  adjustTextSize: (delta: number) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  audioDescriptionActive: boolean;
  toggleAudioDescription: () => void;
}

export const useAccessStore = create<AccessState>((set) => ({
  accessProfile: 'Wheelchair',
  setAccessProfile: (profile) => set({ accessProfile: profile }),
  textSizeLevel: 1.0,
  adjustTextSize: (delta) =>
    set((state) => ({
      textSizeLevel: Math.max(0.85, Math.min(1.35, +(state.textSizeLevel + delta).toFixed(2))),
    })),
  highContrast: false,
  toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
  audioDescriptionActive: false,
  toggleAudioDescription: () =>
    set((state) => ({ audioDescriptionActive: !state.audioDescriptionActive })),
}));

/**
 * Global Filter Hook (Prompt 5.2.1)
 * Used by Heritage Watch, Circuit Planner, and Access Mode to adapt to active profile.
 */
export function useAccessFilter() {
  const { accessProfile, highContrast, audioDescriptionActive } = useAccessStore();

  const isAccessModeActive = accessProfile !== 'None';

  // Filter issues for Heritage Watch
  const filterIssues = <T extends { category?: string; description?: string; title?: string }>(
    issues: T[]
  ): T[] => {
    if (!isAccessModeActive) return issues;
    if (accessProfile === 'Wheelchair') {
      // Prioritize accessibility, ramps, and non-blocked pathways
      return issues.filter(
        (issue) =>
          issue.category === 'Accessibility' ||
          issue.category?.toLowerCase().includes('signage') ||
          issue.description?.toLowerCase().includes('ramp') ||
          issue.description?.toLowerCase().includes('step') ||
          issue.description?.toLowerCase().includes('barrier')
      );
    }
    return issues;
  };

  // Filter pool rides for Circuit Planner
  const filterRides = <T extends { vehicle_type?: string; route?: string }>(rides: T[]): T[] => {
    if (!isAccessModeActive) return rides;
    if (accessProfile === 'Wheelchair' || accessProfile === 'Senior') {
      // Prioritize EV low-floor or ramp-equipped vehicles
      return rides.filter(
        (ride) =>
          ride.vehicle_type?.toLowerCase().includes('ev') ||
          ride.vehicle_type?.toLowerCase().includes('cruiser') ||
          ride.vehicle_type?.toLowerCase().includes('eco')
      );
    }
    return rides;
  };

  return {
    accessProfile,
    isAccessModeActive,
    highContrast,
    audioDescriptionActive,
    filterIssues,
    filterRides,
  };
}

// ----------------------------------------------------------------------
// Baseline Accessible Itinerary Dataset
// ----------------------------------------------------------------------
export const BASELINE_ACCESSIBLE_ITINERARY: AccessItineraryStop[] = [
  {
    id: 'stop-1',
    step_number: 1,
    time: '09:00 AM',
    site_name: 'Badami Cave Complex - North Promenade',
    description:
      'Smooth, polished flagstone path leading directly to the Cave 1 lower plateau. Motorized wheelchair charging bay available at entry gate ticket booth with dedicated disability assistance marshals.',
    accessibility_notes: 'Audited Jan 2025 • Grade limit: 1:12 slope (4.2° slope) • 100% Barrier-Free Ramped Access',
    rest_point_title: 'Rest Alcove • 60m Interval',
    rest_point_desc:
      'Continuous carved stone shaded pavilions with backrest support and emergency alert pull-chords.',
    image_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBWf2yv2PLvIG_ZpEmsJX6B_ZkbOOvF2tdriawit_bGTSDNu2ah8UNGisZEnekOlidR1jR9mI-_hGyM2lOoJHA_ZXD81PE5Ph9mcbkN_F2RAiqjHFD1wGCJdjNoz9OEJiABL4pf-i7dgaIdn84MJUVac616M7tEW8Z-KcmpcXYUIwtWG7UA9l5YNPXG7mYcIReq7dB2z9Hi3GiLBNcRxVOeGa5e1jLzYXeD88nc1LLzurF-bmLNz_C9',
    badge_labels: ['Accessible Route', 'Audio Description', 'Ramped Access (1:12 Grade)'],
    slope_or_metric: 'Slope: 4.2°',
    doorway_or_passage: 'Surface: Honed Red Sandstone',
    is_accessible_verified: true,
    audio_narrative:
      'You are approaching the Badami Cave Complex North Promenade. The pathway is laid with smooth, honed red sandstone with an average grade of four degrees, well below the maximum safety threshold. To your left, a sheltered carved stone pavilion offers cool shade and emergency assistance pull-chords.',
  },
  {
    id: 'stop-2',
    step_number: 2,
    time: '11:30 AM',
    site_name: 'Agastya Lake Promenade & Bhootnath Pathway',
    description:
      'Level paved lakeside promenade with wide turning radiuses (1800mm) and unobstructed, ground-level panoramic vistas of the 7th-century Bhutanatha temple cluster reflected in sacred waters.',
    accessibility_notes: 'Passage Width: 2.4m • 100% Step-Free Lake Ghat Ramp with continuous safety guardrails.',
    rest_point_title: 'Comfort & Cooling Point',
    rest_point_desc: 'Mist cooling station & sensor-activated RO drinking water fountain at Ghat 2.',
    image_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_NZVMccupIki3xn_ALpebAdCz-zTCas1HfU-SjibruIRXYPwfzQ8O4jYMR7gCbpp0xVs7-9u7gFmH3ILEvgF_XWXdun89gRXSPMuDRFnl1UcNR8FSO7t3nt7m5hIUYCsaYyHVVp5UXofu0SAqSMmv8QMWOEmB2vlCQNYQ9bSufy5ECKBdKYw42Cnu3jzl-tltYIb0qp1E7tprYdKyp-dtmbT0C-dwN0t_nxJmuNrXTQ4eYryt2NHe',
    badge_labels: ['Accessible Route', 'Tactile Paving', 'Misting Canopy'],
    slope_or_metric: '100% Step-Free',
    doorway_or_passage: 'Passage Width: 2.4m',
    is_accessible_verified: true,
    audio_narrative:
      'The Agastya Lake Promenade extends before you with a wide, two-point-four meter smooth path. Gentle misting canopies keep the air cool as you take in the panoramic view of the ancient Bhutanatha temple reflecting across the sandstone lake reservoir.',
  },
  {
    id: 'stop-3',
    step_number: 3,
    time: '01:30 PM',
    site_name: 'Ooru Oota Verified Step-Free Dining',
    description:
      'Grama Devata Rasoi — 100% flat threshold entrance with wide doors, lowered ordering counter, and accessible unisex washroom audited and certified by Bagalkote Zilla Panchayat Disability Cell. Traditional North Karnataka jolada rotti meals served.',
    accessibility_notes: 'ZP Certified #BAG-401 • Doorway Clearance: 950mm • Braille Menu & Adaptive Seating available.',
    rest_point_title: 'Sanitary Amenities',
    rest_point_desc:
      'Braille signage, support grab-bars on both sides, and emergency alarm cords linked to staff.',
    image_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD-T0UZ05hbRGVY1jqYJVrzV-sxwxKI5kXUqdgX4cFx5Ns3wQIfifnLdZjuuuh25yNMVwHjEsYQMfiwYfCaWqRZMrPIftobmHLyv2kzC6zZfnR6k30WO4AbYq1y_LxhUF9Ft8WlzQCcQLVq8MCnJ2h-CCDn3CEvSXJFInxAzRU-sr-n6kUNDsYO_p2RTS2xqxbS8i9SkBB_XcuO791uVBzD6vXEcjLONQ9_nVlI7V63JuUbmBWSvVpp',
    badge_labels: ['Accessible Route', 'Braille Menu & Adaptive Seating', 'Zero Threshold'],
    slope_or_metric: 'Doorway: 950mm',
    doorway_or_passage: 'Seating: Chairs & Floor Options',
    is_accessible_verified: true,
    audio_narrative:
      'Step-free dining at Grama Devata Rasoi features wide, level doorways with zero floor threshold. All tables accommodate wheelchairs with ample legroom, and menus are available in large print, Braille, and audio formats.',
  },
  {
    id: 'stop-4',
    step_number: 4,
    time: '03:45 PM',
    site_name: 'Pattadakal UNESCO World Heritage Complex',
    description:
      'ASI modular timber ramps connecting the Virupaksha and Mallikarjuna temple porticos without drilling into sacred rock. Multi-lingual tactile 3D relief models on-site allowing sensory tactile appreciation of Rekha-Nagara and Dravida architecture.',
    accessibility_notes: 'UNESCO Monitored • 100% Ramp Connected • Electric Buggy Shuttles every 12 mins.',
    rest_point_title: 'Tactile Heritage Station',
    rest_point_desc:
      'Scaled bronze and resin Chalukya relief replicas with Kannada, English, and Braille legends.',
    image_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAlBM4zmYJlm1yH6k4ur24MUzbtOkp2Ykh92udlaTc7XaVoO6ohQGFi8g-jthf5uoB_UA-oOlmeqSxydc4w2DBijZK_y-_MJwlu3Jcfm4uZHyuQZDI2ag9ge4zdA99X-AjR3RuCl6grxf8NYCcBDeEJvXmK7kf8aOOTbxK8L8p4v_fDoLBVCCEcF0oQ835t9y-FC81mMTSjMFovex2mu_DgkGEEPELtXVTtLsvimJrhGXiU_rhCpWmN',
    badge_labels: ['Accessible Route', 'Electric Buggy Transit', 'Multi-lingual Audio', 'Tactile Models'],
    slope_or_metric: '100% Ramp Connected',
    doorway_or_passage: 'Buggy Interval: 12 mins',
    is_accessible_verified: true,
    audio_narrative:
      'At Pattadakal, modular wooden ramps glide seamlessly across temple platforms. Electric golf carts are on standby to take you between the monumental Virupaksha and Mallikarjuna sanctuaries, with tactile 3D architectural models available at the portico.',
  },
];
