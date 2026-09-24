/**
 * Spatial Directory & Haversine Distance Utilities for Ooru Oota
 * Calculates spherical distance between user location/monument coordinates and Mahila SHG Kitchens.
 */

export interface ValleyLocation {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  count: number;
  landmark: string;
}

export const HERITAGE_VALLEYS: Record<string, ValleyLocation> = {
  'All Valleys': {
    name: 'All Valleys',
    lat: 15.9500,
    lng: 75.7500,
    zoom: 11,
    count: 20,
    landmark: 'Bagalkote Heritage Valley Basin',
  },
  'Aihole': {
    name: 'Aihole',
    lat: 16.0218,
    lng: 75.8828,
    zoom: 14,
    count: 6,
    landmark: 'Durga & Lad Khan Temple Complex',
  },
  'Badami': {
    name: 'Badami',
    lat: 15.9187,
    lng: 75.6784,
    zoom: 14,
    count: 8,
    landmark: 'Badami Cave Temples & Agastya Lake',
  },
  'Pattadakal': {
    name: 'Pattadakal',
    lat: 15.9490,
    lng: 75.8160,
    zoom: 14,
    count: 4,
    landmark: 'Virupaksha & UNESCO Monumental Grid',
  },
  'Guledgudda': {
    name: 'Guledgudda',
    lat: 16.0500,
    lng: 75.7800,
    zoom: 14,
    count: 2,
    landmark: 'Khana Handloom Weavers & Market Quarter',
  },
};

export interface VerifiedKitchen {
  id: string;
  name: string;
  shg_group: string;
  valley: 'Aihole' | 'Badami' | 'Pattadakal' | 'Guledgudda' | string;
  location: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  distance_display?: string;
  walk_time?: string;
  price_inr: number;
  price_label: string;
  dietary_tags: string[];
  specialty_dishes: string[];
  signature_thali: string;
  description: string;
  capacity: string;
  open_hours: string;
  is_open_now: boolean;
  is_verified: boolean;
  rating: number;
  image_url: string;
  contact_phone?: string;
}

/**
 * Baseline verified kitchens across the Malaprabha Heritage Corridor.
 * Aligned with the Stitch design and Bagalkote Zilla Panchayat SHG registry.
 */
export const BASELINE_KITCHENS: VerifiedKitchen[] = [
  {
    id: 'k-aihole-1',
    name: 'Shri Shakambhari Jolada Rotti Mane',
    shg_group: 'Verified SHG #12',
    valley: 'Aihole',
    location: '350m from Durga Temple, Aihole',
    latitude: 16.0225,
    longitude: 75.8840,
    walk_time: '4 mins walk',
    price_inr: 90,
    price_label: 'Unlimited Thali',
    dietary_tags: ['100% Pure Veg (Sattvic)', 'Wood-fired Tawa', 'Jain Friendly'],
    specialty_dishes: ['Jolada Rotti Meals', 'Shenga Chutney & Ennegai', 'Organic Curd & Churned Butter'],
    signature_thali: 'Jolada Rotti, Ennegai (Baby Brinjal Curry), Shenga Hindi, Churned White Butter, Sajjige & Fresh Buttermilk.',
    description: 'Traditional wood-fired stone courtyard kitchen operated by 6 women from Aihole Grama Mahila Mandala. Hand-patted rottis on earthen tawas.',
    capacity: 'Capacity: 24 guests seated',
    open_hours: '11:00 AM - 4:00 PM',
    is_open_now: true,
    is_verified: true,
    rating: 4.9,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASxiStGpMxN6wXMbS6NGOT8pzkHwBsAXgQRHDoKYbMk8O3MTBw9sRJizThk6hcmRQtF2HzjQ6jvw-nuc2WE0PMSxDjawXWWVzLXZu8y5YP9KPndtvOJNkl2pOau_boA3_G1Bo1uP-gVc58L8wxDOgjZ9alKvM_q9fkzD6o8GlHueKDXn7LNmZXEF6GfWTM5eEdPAZqCInvKsYf3QHOCMLRh0-QsGdYCm1yRgfoE2neHDLNl_CtP7Bw',
  },
  {
    id: 'k-badami-1',
    name: "Akka's Village Meals & Agastya Kitchen",
    shg_group: 'Verified SHG #04',
    valley: 'Badami',
    location: '1.2 km from Badami Cave 1, North Ghat Steps',
    latitude: 15.9215,
    longitude: 75.6820,
    walk_time: '5 mins from Badami Cave 1',
    price_inr: 80,
    price_label: 'Per Thali',
    dietary_tags: ['Pure Veg', 'Gluten-Free Sorghum', 'Fresh Country Curds'],
    specialty_dishes: ['Jolada Rotti Meals', 'Organic Curd & Churned Butter', 'Shenga Chutney & Ennegai'],
    signature_thali: 'Thin crisp Jolada Rotti, Madike Kaalu Palya, spicy Garlic Shenga Chutney powder, and fresh unpasteurized A2 curds.',
    description: 'Cozy courtyard seated dining directly under red sandstone bluffs. Famous for piping hot thin rottis patted by hand.',
    capacity: 'Capacity: 16 guests seated',
    open_hours: '11:30 AM - 3:30 PM',
    is_open_now: true,
    is_verified: true,
    rating: 4.8,
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA25TSOpD8UyuYUSrwoAsR8poJgulMiFcdQeQzTrmvJo1QF9yO10xOOyWmRxaCWJatQLlztwvuCF_p7KgjJOyPMF0ko2d7BVOD_rwX8j0T3SKljdjVkNu4XoD9i1M-atLvHuYnMqj5eXQLWGHgFrQCI3XHfmkY7maDHa6MvB6piL3Y4NDBpQqSfSyXmQnmp-CQSopgZAE_PQFKcsL_wUO9INU2DOxpMTpgvm_zMS-Izw_i_96o5Yarl',
  },
  {
    id: 'k-pattadakal-1',
    name: 'Grama Devata Rasoi & Rotti Mane',
    shg_group: 'Verified Grama Panchayat Kitchen',
    valley: 'Pattadakal',
    location: '2.1 km from Pattadakal Virupaksha Temple',
    latitude: 15.9470,
    longitude: 75.8140,
    walk_time: '8 mins from Virupaksha',
    price_inr: 100,
    price_label: 'with Shenga Holige',
    dietary_tags: ['Pure Veg', 'Farm-to-Plate Millet', 'Sweet Holige Included'],
    specialty_dishes: ['Sajjige & Shenga Holige', 'Jolada Rotti Meals', 'Shenga Chutney & Ennegai'],
    signature_thali: 'Steaming Bajra Rotti, roasted Shenga Holige with pure ghee, red chilli Kaalu palya, and charred green chilli Thecha.',
    description: 'Operated by 8 women farmers from Pattadakal village. Features special red chilli Kaalu palya with roasted flaxseed podi.',
    capacity: 'Capacity: 30 guests seated',
    open_hours: '12:00 PM - 4:00 PM',
    is_open_now: true,
    is_verified: true,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'k-badami-2',
    name: 'Mallikarjuna Jolada Rotti Mane',
    shg_group: 'Verified SHG #08',
    valley: 'Badami',
    location: 'Badami Cave Temple Road',
    latitude: 15.9180,
    longitude: 75.6790,
    walk_time: '3 mins walk',
    price_inr: 85,
    price_label: 'Full North Karnataka Thali',
    dietary_tags: ['Pure Vegetarian', 'North Karnataka Thali', 'Sattvic'],
    specialty_dishes: ['Jolada Rotti Meals', 'Shenga Chutney & Ennegai'],
    signature_thali: 'Double Jolada Rotti with Yennegai baby brinjal curry, sprouted moong usli, and chilled butter churned daily.',
    description: 'Renowned heritage food stop visited by archaeologists and travelers. Fresh batches prepared continuously from noon.',
    capacity: 'Capacity: 20 guests seated',
    open_hours: '11:00 AM - 5:00 PM',
    is_open_now: true,
    is_verified: true,
    rating: 4.9,
    image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'k-badami-3',
    name: 'Basaveshwara Khanavali',
    shg_group: 'Verified SHG #02',
    valley: 'Badami',
    location: 'Near Agastya Lake East Bank, Badami',
    latitude: 15.9220,
    longitude: 75.6800,
    walk_time: '6 mins walk',
    price_inr: 90,
    price_label: 'Jowar Bhakri Special',
    dietary_tags: ['Vegetarian', 'Gluten-Free Rotti', 'Wood-fired'],
    specialty_dishes: ['Jolada Rotti Meals', 'Organic Curd & Churned Butter'],
    signature_thali: 'Authentic Jowar Bhakri, Sajje Rotti, Kaalu Palya, curd rice, and freshly pounded groundnut podi.',
    description: 'Overlooking the ancient sandstone ghats of Agastya lake. Traditional low seating with brass plates.',
    capacity: 'Capacity: 18 guests seated',
    open_hours: '11:30 AM - 4:00 PM',
    is_open_now: true,
    is_verified: true,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'k-guledgudda-1',
    name: 'Guledgudda Khana Rotti & Holige Mane',
    shg_group: 'Verified SHG #19',
    valley: 'Guledgudda',
    location: 'Weavers Lane, Main Bazaar, Guledgudda',
    latitude: 16.0510,
    longitude: 75.7820,
    walk_time: '2 mins from Khana Loom Guild',
    price_inr: 95,
    price_label: 'Weaver Special Feast',
    dietary_tags: ['Pure Veg', 'Weaver Thali', 'Sweet Holige Included'],
    specialty_dishes: ['Sajjige & Shenga Holige', 'Jolada Rotti Meals', 'Shenga Chutney & Ennegai'],
    signature_thali: 'Thin crispy Sorghum rottis, warm puran Shenga Holige, Shenga chutney powder, and thick Malaprabha curds.',
    description: 'Run by master weavers’ families. Hand-made traditional sweets and festive meals cooked on firewood stoves.',
    capacity: 'Capacity: 14 guests seated',
    open_hours: '12:00 PM - 5:00 PM',
    is_open_now: true,
    is_verified: true,
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'k-aihole-2',
    name: 'Malaprabha Rotti Mane',
    shg_group: 'Verified SHG #15',
    valley: 'Aihole',
    location: 'Near Meguti Jain Temple Hill Road, Aihole',
    latitude: 16.0180,
    longitude: 75.8850,
    walk_time: '6 mins walk',
    price_inr: 85,
    price_label: 'Standard Thali',
    dietary_tags: ['100% Pure Veg (Sattvic)', 'Gluten-Free', 'Farm Fresh'],
    specialty_dishes: ['Jolada Rotti Meals', 'Organic Curd & Churned Butter'],
    signature_thali: 'Jowar rottis with spiced country pumpkin curry, ground flaxseed chutney, and cultured butter.',
    description: 'Located at the foothills of Meguti hill. Organic ingredients harvested from local dryland sorghum farms.',
    capacity: 'Capacity: 15 guests seated',
    open_hours: '11:00 AM - 3:30 PM',
    is_open_now: true,
    is_verified: true,
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1600100397608-f010e421598b?auto=format&fit=crop&w=800&q=80',
  },
];

/**
 * Haversine distance formula in JavaScript.
 * Calculates great-circle distance between two GPS coordinates in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance in meters or kilometers
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Fetch and filter kitchens spatially and by dietary specialty.
 * Integrates live Supabase `food_kitchens` rows with verified coordinate registry.
 */
export function filterKitchens(
  kitchens: VerifiedKitchen[],
  targetValley: string,
  specialtyFilter?: string | null,
  maxDistanceKm = 5.0
): VerifiedKitchen[] {
  const valleyConfig = HERITAGE_VALLEYS[targetValley] || HERITAGE_VALLEYS['All Valleys'];
  const isAll = targetValley === 'All Valleys';

  return kitchens
    .map(kitchen => {
      const dist = calculateHaversineDistance(
        valleyConfig.lat,
        valleyConfig.lng,
        kitchen.latitude,
        kitchen.longitude
      );
      return {
        ...kitchen,
        distance_km: Number(dist.toFixed(2)),
        distance_display: isAll
          ? `${kitchen.valley} • ${formatDistance(dist)}`
          : `${formatDistance(dist)} from ${targetValley} center`,
      };
    })
    .filter(kitchen => {
      // 1. Spatial 5km radius filter (unless "All Valleys" selected)
      if (!isAll && (kitchen.distance_km || 0) > maxDistanceKm) {
        return false;
      }

      // 2. Specialty/Dietary filter
      if (specialtyFilter && specialtyFilter !== 'all') {
        const query = specialtyFilter.toLowerCase();
        const matchesDish = kitchen.specialty_dishes.some(d => d.toLowerCase().includes(query));
        const matchesTag = kitchen.dietary_tags.some(t => t.toLowerCase().includes(query));
        const matchesSignature = kitchen.signature_thali.toLowerCase().includes(query);
        if (!matchesDish && !matchesTag && !matchesSignature) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
}
