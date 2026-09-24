/**
 * Mobility, Circuit Planning & Seat Pooling Data Layer
 * Handles live seat pooling with Supabase Realtime, Carbon Offset calculations,
 * and AI-driven crowd dispersal itineraries for the Badami-Pattadakal-Aihole circuit.
 */

export interface PoolRide {
  id: string;
  driver_name: string;
  departure_time: string;
  total_seats: number;
  available_seats: number;
  route: string;
  fare_per_seat: number;
  vehicle_type: string;
  driver_phone?: string;
  rating: number;
  co2_saved_kg: number;
  tags?: string[];
}

export interface CrowdForecast {
  location: string;
  time_slot: string;
  crowd_level: 'Low' | 'Moderate' | 'Peak';
  visitor_count: number;
  carrying_capacity: number;
  recommended_action: string;
}

export interface CircuitStop {
  id: string;
  order: number;
  site: string;
  location: string;
  time: string;
  duration: string;
  crowd_level: 'Low' | 'Moderate' | 'Peak';
  visitor_count: number;
  carrying_capacity: number;
  reason: string;
  highlight: string;
  image_url: string;
  badge?: string;
  transit_to_next?: {
    destination: string;
    distance_km: number;
    travel_time_mins: number;
    road: string;
    recommended_pool?: string;
  };
}

export interface FairFareRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance_km: number;
  travel_time_mins: number;
  private_auto_fare: number;
  pool_fare: number;
  savings_pct: number;
  co2_offset_kg: number;
}

// ----------------------------------------------------------------------
// 1. Mock Pool Rides (Baseline for resilient live display & seed data)
// ----------------------------------------------------------------------
export const BASELINE_POOL_RIDES: PoolRide[] = [
  {
    id: 'pr-1',
    driver_name: 'Ramesh Pujar',
    departure_time: '08:45 AM',
    total_seats: 6,
    available_seats: 3,
    route: 'Badami Station ⇄ Cave Temples ⇄ Mahakuta',
    fare_per_seat: 60,
    vehicle_type: 'Force Trax Cruiser (EV Retrofit)',
    driver_phone: '+91 98452 11842',
    rating: 4.9,
    co2_saved_kg: 12, // (6 - 3) * 4kg = 12kg
    tags: ['Verified Local Driver', 'Luggage Rack', 'Kannada/Hindi/English'],
  },
  {
    id: 'pr-2',
    driver_name: 'Basavaraj Hallur',
    departure_time: '10:30 AM',
    total_seats: 7,
    available_seats: 2,
    route: 'Badami ⇄ Pattadakal UNESCO Complex',
    fare_per_seat: 80,
    vehicle_type: 'Mahindra Bolero Maxi Truck',
    driver_phone: '+91 94812 77319',
    rating: 4.8,
    co2_saved_kg: 20, // (7 - 2) * 4kg = 20kg
    tags: ['Fast Transit', 'Roof Shade', 'UPI Accepted'],
  },
  {
    id: 'pr-3',
    driver_name: 'Manjunath Badami',
    departure_time: '01:15 PM',
    total_seats: 6,
    available_seats: 4,
    route: 'Pattadakal ⇄ Aihole Historical Enclosure',
    fare_per_seat: 70,
    vehicle_type: 'KSRTC EV Feeder Shuttle',
    driver_phone: '+91 97401 23091',
    rating: 4.9,
    co2_saved_kg: 8, // (6 - 4) * 4kg = 8kg
    tags: ['Zero Emission EV', 'Low Floor', 'AC Cabin'],
  },
  {
    id: 'pr-4',
    driver_name: 'Suresh K. Chulachagudda',
    departure_time: '02:30 PM',
    total_seats: 6,
    available_seats: 1,
    route: 'Badami ⇄ Mahakuta ⇄ Pattadakal ⇄ Aihole (Full Circuit)',
    fare_per_seat: 140,
    vehicle_type: 'Force Cruiser 4x4 Heritage Line',
    driver_phone: '+91 96110 54921',
    rating: 4.7,
    co2_saved_kg: 20, // (6 - 1) * 4kg = 20kg
    tags: ['Full Day Circuit', 'Chilled Water Dispenser', 'Heritage Certified Guide'],
  },
  {
    id: 'pr-5',
    driver_name: 'Yallappa Ganiger',
    departure_time: '05:15 PM',
    total_seats: 6,
    available_seats: 5,
    route: 'Aihole ⇄ Mahakuta ⇄ Badami (Sunset Return)',
    fare_per_seat: 90,
    vehicle_type: 'Tata Winger Eco Shared Transit',
    driver_phone: '+91 99015 62843',
    rating: 4.8,
    co2_saved_kg: 4, // (6 - 5) * 4kg = 4kg
    tags: ['Direct Sunset Return', 'Smooth Ride', 'Family Friendly'],
  },
];

// ----------------------------------------------------------------------
// 2. Crowd Forecast Pressure Matrix (sustainability_metrics data)
// ----------------------------------------------------------------------
export const BASELINE_CROWD_METRICS: CrowdForecast[] = [
  // Badami Caves
  {
    location: 'Badami Caves',
    time_slot: '07:00 AM',
    crowd_level: 'Low',
    visitor_count: 420,
    carrying_capacity: 3500,
    recommended_action: 'Ideal for photography & quiet exploration of Cave 1-4',
  },
  {
    location: 'Badami Caves',
    time_slot: '11:00 AM',
    crowd_level: 'Peak',
    visitor_count: 2850,
    carrying_capacity: 3500,
    recommended_action: 'High heat and tour bus influx. Divert to Mahakuta or Pattadakal',
  },
  {
    location: 'Badami Caves',
    time_slot: '03:00 PM',
    crowd_level: 'Moderate',
    visitor_count: 1400,
    carrying_capacity: 3500,
    recommended_action: 'Acceptable queue times. Shadow sets on North Fort',
  },
  {
    location: 'Badami Caves',
    time_slot: '05:00 PM',
    crowd_level: 'Peak',
    visitor_count: 3100,
    carrying_capacity: 3500,
    recommended_action: 'Agastya Lake sunset peak. Pedestrian bottlenecks on ghat steps',
  },

  // Pattadakal
  {
    location: 'Pattadakal',
    time_slot: '07:00 AM',
    crowd_level: 'Low',
    visitor_count: 210,
    carrying_capacity: 4000,
    recommended_action: 'Peaceful morning light on Virupaksha & Mallikarjuna temples',
  },
  {
    location: 'Pattadakal',
    time_slot: '11:00 AM',
    crowd_level: 'Moderate',
    visitor_count: 850,
    carrying_capacity: 4000,
    recommended_action: 'Spacious riverside grounds absorb crowds evenly. Great alternate to Badami peak',
  },
  {
    location: 'Pattadakal',
    time_slot: '03:00 PM',
    crowd_level: 'Moderate',
    visitor_count: 920,
    carrying_capacity: 4000,
    recommended_action: 'Steady foot traffic with cool Malaprabha river breeze',
  },
  {
    location: 'Pattadakal',
    time_slot: '05:00 PM',
    crowd_level: 'Low',
    visitor_count: 340,
    carrying_capacity: 4000,
    recommended_action: 'Golden hour photography on Chalukyan Dravidian shikhara',
  },

  // Aihole
  {
    location: 'Aihole',
    time_slot: '07:00 AM',
    crowd_level: 'Low',
    visitor_count: 150,
    carrying_capacity: 3000,
    recommended_action: 'Empty courtyards at Durga Temple and Lad Khan',
  },
  {
    location: 'Aihole',
    time_slot: '11:00 AM',
    crowd_level: 'Low',
    visitor_count: 380,
    carrying_capacity: 3000,
    recommended_action: 'Optimal educational visit with museum and apsidal shrine access',
  },
  {
    location: 'Aihole',
    time_slot: '03:00 PM',
    crowd_level: 'Peak',
    visitor_count: 1650,
    carrying_capacity: 3000,
    recommended_action: 'Inter-district excursion groups arrive; recommend visiting Meguti Hill instead',
  },
  {
    location: 'Aihole',
    time_slot: '05:00 PM',
    crowd_level: 'Moderate',
    visitor_count: 620,
    carrying_capacity: 3000,
    recommended_action: 'Sunset view from Meguti Jain Temple overlooking Aihole valley',
  },
];

// ----------------------------------------------------------------------
// 3. Original Standard Itinerary (Subject to mid-day crowds)
// ----------------------------------------------------------------------
export const ORIGINAL_ITINERARY: CircuitStop[] = [
  {
    id: 'stop-badami-standard',
    order: 1,
    site: 'Badami Cave Temples & Agastya Lake',
    location: 'Badami Old Town',
    time: '11:00 AM - 01:00 PM',
    duration: '2 hours',
    crowd_level: 'Peak',
    visitor_count: 2850,
    carrying_capacity: 3500,
    reason: 'Standard tourist sequence arrives right at peak tour bus rush hours and midday heat.',
    highlight: '6th century rock-cut sandstone caves, Nataraja 18-armed relief, and Agastya Tirtha lake vista.',
    image_url: 'https://images.unsplash.com/photo-1600100397608-f010f443b79a?auto=format&fit=crop&w=800&q=80',
    badge: 'Standard Sequence',
    transit_to_next: {
      destination: 'Pattadakal UNESCO Complex',
      distance_km: 22,
      travel_time_mins: 35,
      road: 'SH-14 Highway corridor',
      recommended_pool: 'Ride #pr-2 (Basavaraj Hallur)',
    },
  },
  {
    id: 'stop-pattadakal-standard',
    order: 2,
    site: 'Pattadakal Temple Complex',
    location: 'Pattadakal, Malaprabha River Basin',
    time: '01:45 PM - 03:30 PM',
    duration: '1h 45m',
    crowd_level: 'Moderate',
    visitor_count: 920,
    carrying_capacity: 4000,
    reason: 'Arrives in post-lunch period with moderate footfalls.',
    highlight: 'UNESCO World Heritage fusion of Dravidian and Nagara temple architectural styles.',
    image_url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    transit_to_next: {
      destination: 'Aihole Historical Enclosure',
      distance_km: 14,
      travel_time_mins: 25,
      road: 'Aihole-Pattadakal Road',
      recommended_pool: 'Ride #pr-3 (Manjunath Badami)',
    },
  },
  {
    id: 'stop-aihole-standard',
    order: 3,
    site: 'Aihole Historical Enclosure',
    location: 'Aihole Village, Hungund Taluk',
    time: '04:00 PM - 05:45 PM',
    duration: '1h 45m',
    crowd_level: 'Moderate',
    visitor_count: 620,
    carrying_capacity: 3000,
    reason: 'Late arrival leaves limited daylight for exploring Meguti Hill and the cradle of temple architecture.',
    highlight: 'Apsidal Durga Temple, 5th century Lad Khan temple, and 125 Chalukya monument clusters.',
    image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
  },
];

// ----------------------------------------------------------------------
// 4. AI Crowd-Aware Optimized Itinerary (Ollama / Llama3 recommended)
// ----------------------------------------------------------------------
export const AI_OPTIMIZED_ITINERARY: CircuitStop[] = [
  {
    id: 'stop-badami-ai',
    order: 1,
    site: 'Badami Cave Temples & Agastya Lake',
    location: 'Badami Old Town',
    time: '07:30 AM - 09:30 AM',
    duration: '2 hours',
    crowd_level: 'Low',
    visitor_count: 420,
    carrying_capacity: 3500,
    reason: 'Shifted to 07:30 AM to beat the 11:00 AM rush (2,850 PAX). Perfect early morning lighting for Cave 3 & 4 rock reliefs and pleasant temperatures before heat rise.',
    highlight: '6th century rock-cut sandstone caves, Nataraja 18-armed relief, and Agastya Tirtha lake vista.',
    image_url: 'https://images.unsplash.com/photo-1600100397608-f010f443b79a?auto=format&fit=crop&w=800&q=80',
    badge: 'AI Dispersal Win: -85% Crowd',
    transit_to_next: {
      destination: 'Pattadakal UNESCO Complex',
      distance_km: 22,
      travel_time_mins: 35,
      road: 'SH-14 Highway corridor',
      recommended_pool: 'Ride #pr-2 (Basavaraj Hallur)',
    },
  },
  {
    id: 'stop-pattadakal-ai',
    order: 2,
    site: 'Pattadakal Temple Complex',
    location: 'Pattadakal, Malaprabha River Basin',
    time: '10:15 AM - 12:30 PM',
    duration: '2h 15m',
    crowd_level: 'Moderate',
    visitor_count: 850,
    carrying_capacity: 4000,
    reason: 'Pattadakal wide open green courtyards easily accommodate 850 visitors at 11 AM when Badami is suffocated with 2,850 PAX.',
    highlight: 'UNESCO World Heritage fusion of Dravidian and Nagara temple architectural styles along the Malaprabha river.',
    image_url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    badge: 'Open Air Cushion',
    transit_to_next: {
      destination: 'Aihole Historical Enclosure',
      distance_km: 14,
      travel_time_mins: 25,
      road: 'Aihole-Pattadakal Road',
      recommended_pool: 'Ride #pr-3 (Manjunath Badami)',
    },
  },
  {
    id: 'stop-aihole-ai',
    order: 3,
    site: 'Aihole Historical Enclosure & Meguti Hill',
    location: 'Aihole Village, Hungund Taluk',
    time: '01:15 PM - 03:00 PM',
    duration: '1h 45m',
    crowd_level: 'Low',
    visitor_count: 380,
    carrying_capacity: 3000,
    reason: 'Visited right before the 3:00 PM excursion rush (1,650 PAX). Ample time for tranquil walkthrough of Durga temple museum and local Ooru Oota Jolada Rotti lunch.',
    highlight: 'Apsidal Durga Temple, 5th century Lad Khan temple, and panoramic valley view from Meguti Hill.',
    image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    badge: 'Pre-Surge Arrival',
    transit_to_next: {
      destination: 'Mahakuta Spring Sanctuaries (Optional Sunset Stop)',
      distance_km: 18,
      travel_time_mins: 30,
      road: 'Rural Ring Road',
      recommended_pool: 'Ride #pr-5 (Yallappa Ganiger)',
    },
  },
];

// ----------------------------------------------------------------------
// 5. Fair-Fare Estimator Routes (Bottom Bar Calculation)
// ----------------------------------------------------------------------
export const FAIR_FARE_ROUTES: FairFareRoute[] = [
  {
    id: 'route-badami-pattadakal',
    name: 'Badami ⇄ Pattadakal',
    origin: 'Badami',
    destination: 'Pattadakal',
    distance_km: 22,
    travel_time_mins: 35,
    private_auto_fare: 450,
    pool_fare: 80,
    savings_pct: 82,
    co2_offset_kg: 16,
  },
  {
    id: 'route-pattadakal-aihole',
    name: 'Pattadakal ⇄ Aihole',
    origin: 'Pattadakal',
    destination: 'Aihole',
    distance_km: 14,
    travel_time_mins: 25,
    private_auto_fare: 320,
    pool_fare: 70,
    savings_pct: 78,
    co2_offset_kg: 12,
  },
  {
    id: 'route-badami-mahakuta',
    name: 'Badami ⇄ Mahakuta Springs',
    origin: 'Badami',
    destination: 'Mahakuta',
    distance_km: 12,
    travel_time_mins: 20,
    private_auto_fare: 280,
    pool_fare: 50,
    savings_pct: 82,
    co2_offset_kg: 8,
  },
  {
    id: 'route-full-triangle',
    name: 'Full Chalukya Triangle (Badami - Pattadakal - Aihole)',
    origin: 'Badami',
    destination: 'Aihole via Pattadakal',
    distance_km: 48,
    travel_time_mins: 85,
    private_auto_fare: 1100,
    pool_fare: 220,
    savings_pct: 80,
    co2_offset_kg: 32,
  },
];

/**
 * Formula: Each shared seat passenger avoids a dedicated private auto trip,
 * saving ~4kg CO2e per 15-20km transit segment.
 */
export function calculateCarbonSaved(totalSeats: number, availableSeats: number): number {
  const seatsOccupied = Math.max(0, totalSeats - availableSeats);
  return seatsOccupied * 4;
}
