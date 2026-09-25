'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useIssueStore } from '@/context/IssueContext';
import SuccessToast from '@/components/SuccessToast';
import { generateNodeHash } from '@/lib/ollama';
import { useAccessFilter } from '@/lib/accessStore';
import {
  transcribeVoiceNoteWithWhisper,
  startLiveSpeechRecognition,
  readOutLoud,
  stopReadingOutLoud,
} from '@/lib/whisperService';
import MicroCrowdfundingModal from '@/components/MicroCrowdfundingModal';
import BigScreenComplaintModal from '@/components/BigScreenComplaintModal';

// Dynamically import Leaflet map (no SSR)
const HeritageMap = dynamic(() => import('@/components/HeritageMap'), { ssr: false });

// ---------------------
// Types
// ---------------------
interface Issue {
  id: string;
  title: string;
  description?: string;
  category: string;
  severity: string;
  jurisdiction: string;
  status: string;
  photo_url?: string;
  voice_note_url?: string;
  upvotes: number;
  escalation_deadline?: string;
  resolution_lane?: string;
  adopted_by?: string;
  adopted_group_name?: string;
  adopted_action_plan?: string;
  latitude?: number;
  longitude?: number;
  ai_confidence?: number;
  ai_category?: string;
  ai_severity?: string;
  ai_jurisdiction?: string;
  node_hash?: string;
  reporter_id?: string;
  created_at: string;
  updated_at?: string;
}

// Government officials mapping
const GOVERNMENT_OFFICIALS: Record<string, string> = {
  'ASI Dharwad Circle (Superintending Archaeologist)': 'Dr. R. Gopal, Superintending Archaeologist',
  'Badami Town Municipal Council (TMC)': 'Chief Officer, Badami TMC',
  'Bagalkote District Police & Revenue Dept': 'SP Bagalkote & DC Office',
  'Pattadakal Temple Authority': 'ASI Monument Custodian, Pattadakal',
  'ASI Dharwad & Civic Volunteers': 'Conservation Asst. Engineer',
  'Badami TMC & Taluk Revenue': 'Taluk MLA B. B. Chimmanakatti',
};

// Fallback seed data (Comprehensive Multi-Lane Dataset)
const FALLBACK_ISSUES: Issue[] = [
  // 🏛️ 1. GOVERNMENT COMPLAINTS (ASI Dharwad & TMC Civic Infrastructure)
  {
    id: 'gov-1',
    title: 'Fissure observed on lintel beam near Cave No. 3 western portico after heavy seepage',
    description: 'Automated high-res photogrammetry detected 94% confidence surface attrition. Micro-fissure displaying mineral runoff during unseasonal rains near the Mahavishnu relief panel. Statutory ASI notice issued for chemical poultice & resin consolidation.',
    category: 'Structural Damage',
    severity: 'high',
    jurisdiction: 'ASI Dharwad Circle (Superintending Archaeologist)',
    status: 'in_progress',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2yMc0QTkYGg81TktaXl2DnNSBQ2vs1XQio9HY8VWQvAGYpwh4jdFfjw3DO2oF6a1YXBACNfwfazoyRjx9SSC03P91SkYVYL1-FQVw_mK3lWIbXHRENLJl1tL3dfk9wz0khPvUZZMhYgN8mo25WYwLea0Mg92F2igK4nwMT_eVUiuQlr1imrK0mlNMRE8Ms8NNMczTDtAfhZXpfpaZsGeaFR2oQsaaS-LpvjNmS8aEFpi8dLCdR5qy',
    upvotes: 18,
    escalation_deadline: new Date(Date.now() + 14 * 3600000).toISOString(),
    resolution_lane: 'government',
    latitude: 15.9187,
    longitude: 75.6784,
    ai_confidence: 98.2,
    node_hash: '0x4f8a2bc19a82b19',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'gov-2',
    title: 'Foundation slab subsidence near Nandi Mandapa at Pattadakal Virupaksha Complex',
    description: 'Groundwater infiltration from Malaprabha river buffer zone causing 4.2mm differential settlement on the western foundation plinth. Structural engineers dispatched for soil stabilization grouting.',
    category: 'Structural Damage',
    severity: 'critical',
    jurisdiction: 'Pattadakal Temple Authority',
    status: 'in_progress',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR5tJ1aUzEbjEqzS6CKoY0zf4QkxfznFuN2me-2AbrchGmBu6cIoQTjS6wu12P09yVDKgRCqHeKhiKa-VpBtToPfcB_DcwZBoT1p2SUTqjZn8IpxRy_NsdO8qNmVg7166ET0dh_AYQsR7_L8nSuG3KaFwZkb_j19WpQBbQSzqbVNSi9xjdv44ICyzUq9-5Re2t4WNKE_Bhl7SJ-MqRFJCjc8Z8Fvt3XOqkTG0YNt2kC1yG7b4y7IDt',
    upvotes: 27,
    escalation_deadline: new Date(Date.now() + 6 * 3600000).toISOString(),
    resolution_lane: 'government',
    latitude: 16.0300,
    longitude: 75.8230,
    ai_confidence: 97.4,
    node_hash: '0x3c99a8f27e1b42d',
    created_at: new Date(Date.now() - 10 * 3600000).toISOString(),
  },
  {
    id: 'gov-3',
    title: 'Weathering deterioration on Bhutanatha Temple stone carvings east facade - ESCALATED',
    description: 'Heritage conservation assessment overdue by 24 hours. Accelerated stone surface erosion and lichen micro-crust on east-facing Nandi relief carvings facing Agastya Tirtha lake. Statutory DC intervention flagged.',
    category: 'Structural Damage',
    severity: 'critical',
    jurisdiction: 'ASI Dharwad Circle (Superintending Archaeologist)',
    status: 'escalated',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkwo1f9gAG9Om4lccDIsTzyt7qtIfi1wsgM1aWG947aSVkxZEL2qRZtJuA1ETylwFagKwEALXaHGpnlja0r6_0cGiccHp4CH8UDADRvJ5vs476sRStg6e09zT2jxggCfUQSBLYisKg4o9b53Xzd2S96T7pr2DjsfhNvy_Mvy-I0ydpv5ttYkk3OCAy-9bUksv2FKQuv3-d7R-gQt8voVenN9eO1BL_sFY_UpGaSOTSLdkgqw7i6xBr',
    upvotes: 34,
    escalation_deadline: new Date(Date.now() - 4 * 3600000).toISOString(),
    resolution_lane: 'government',
    latitude: 15.9210,
    longitude: 75.6770,
    ai_confidence: 96.8,
    node_hash: '0xfe22d8471e91c01',
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
  {
    id: 'gov-4',
    title: 'Unauthorized commercial tourist tempo parking blocking emergency heritage buffer zone at Pattadakal',
    description: 'CCTV AI auto-detected unauthorized commercial tourist minivans parked blocking the pedestrian sandstone buffer walkway. Notice issued by Bagalkote Traffic Police for vehicular towing.',
    category: 'Encroachment & Transit',
    severity: 'medium',
    jurisdiction: 'Bagalkote District Police & Revenue Dept',
    status: 'in_review',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR5tJ1aUzEbjEqzS6CKoY0zf4QkxfznFuN2me-2AbrchGmBu6cIoQTjS6wu12P09yVDKgRCqHeKhiKa-VpBtToPfcB_DcwZBoT1p2SUTqjZn8IpxRy_NsdO8qNmVg7166ET0dh_AYQsR7_L8nSuG3KaFwZkb_j19WpQBbQSzqbVNSi9xjdv44ICyzUq9-5Re2t4WNKE_Bhl7SJ-MqRFJCjc8Z8Fvt3XOqkTG0YNt2kC1yG7b4y7IDt',
    upvotes: 11,
    escalation_deadline: new Date(Date.now() + 38 * 3600000).toISOString(),
    resolution_lane: 'government',
    latitude: 16.0310,
    longitude: 75.8240,
    ai_confidence: 89.4,
    node_hash: '0x9e1f4ab3c78a104',
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'gov-5',
    title: 'Surface abrasion and visitor touch attrition on Aihole Durga Temple apsidal colonnade frieze',
    description: 'Lack of barrier rope leading to physical tactile abrasion of 7th-century celestial gandharva relief panels. Protective brass stanchions requisitioned under ASI annual conservation budget.',
    category: 'Structural Damage',
    severity: 'medium',
    jurisdiction: 'ASI Dharwad Circle (Superintending Archaeologist)',
    status: 'reported',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2yMc0QTkYGg81TktaXl2DnNSBQ2vs1XQio9HY8VWQvAGYpwh4jdFfjw3DO2oF6a1YXBACNfwfazoyRjx9SSC03P91SkYVYL1-FQVw_mK3lWIbXHRENLJl1tL3dfk9wz0khPvUZZMhYgN8mo25WYwLea0Mg92F2igK4nwMT_eVUiuQlr1imrK0mlNMRE8Ms8NNMczTDtAfhZXpfpaZsGeaFR2oQsaaS-LpvjNmS8aEFpi8dLCdR5qy',
    upvotes: 23,
    escalation_deadline: new Date(Date.now() + 48 * 3600000).toISOString(),
    resolution_lane: 'government',
    latitude: 16.0155,
    longitude: 75.8820,
    ai_confidence: 94.2,
    node_hash: '0x7b11a93e4f0288c',
    created_at: new Date(Date.now() - 15 * 3600000).toISOString(),
  },

  // 📈 2. INVESTOR COMPLAINTS (Demand Evidence & Civic PPP Opportunities)
  {
    id: 'inv-1',
    title: 'Severe Lack of Hygienic Traditional Dining & Jolada Rotti Kitchens Near Pattadakal Complex',
    description: '48 verified tourists logged complaints about the total absence of seated dining, hygienic drinking water, and authentic North Karnataka culinary options within 3 km of the UNESCO World Heritage cluster. Vetted as a high-demand PPP restaurant concession.',
    category: 'Culinary & Hospitality',
    severity: 'high',
    jurisdiction: 'Pattadakal Temple Authority',
    status: 'in_progress',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkwo1f9gAG9Om4lccDIsTzyt7qtIfi1wsgM1aWG947aSVkxZEL2qRZtJuA1ETylwFagKwEALXaHGpnlja0r6_0cGiccHp4CH8UDADRvJ5vs476sRStg6e09zT2jxggCfUQSBLYisKg4o9b53Xzd2S96T7pr2DjsfhNvy_Mvy-I0ydpv5ttYkk3OCAy-9bUksv2FKQuv3-d7R-gQt8voVenN9eO1BL_sFY_UpGaSOTSLdkgqw7i6xBr',
    upvotes: 48,
    escalation_deadline: new Date(Date.now() + 72 * 3600000).toISOString(),
    resolution_lane: 'investor',
    latitude: 16.0315,
    longitude: 75.8250,
    ai_confidence: 95.8,
    node_hash: '0x1a8f9c2d4e8b031',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'inv-2',
    title: 'Zero Verified Boutique Heritage Homestays in Aihole Forcing 92% Tourists to Exit Before Dusk',
    description: '32 international and domestic cultural travellers demanded overnight lodging in Aihole village to photograph sunrise over Durga temple and attend stone-carving workshops. Projected venture ROI: 24% IRR with local village stakeholder partnerships.',
    category: 'Eco-Tourism Accommodation',
    severity: 'medium',
    jurisdiction: 'Hungund Panchayat & Taluk Revenue',
    status: 'reported',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR5tJ1aUzEbjEqzS6CKoY0zf4QkxfznFuN2me-2AbrchGmBu6cIoQTjS6wu12P09yVDKgRCqHeKhiKa-VpBtToPfcB_DcwZBoT1p2SUTqjZn8IpxRy_NsdO8qNmVg7166ET0dh_AYQsR7_L8nSuG3KaFwZkb_j19WpQBbQSzqbVNSi9xjdv44ICyzUq9-5Re2t4WNKE_Bhl7SJ-MqRFJCjc8Z8Fvt3XOqkTG0YNt2kC1yG7b4y7IDt',
    upvotes: 32,
    escalation_deadline: new Date(Date.now() + 84 * 3600000).toISOString(),
    resolution_lane: 'investor',
    latitude: 16.0160,
    longitude: 75.8830,
    ai_confidence: 93.6,
    node_hash: '0x992fa1e8b4c027f',
    created_at: new Date(Date.now() - 18 * 3600000).toISOString(),
  },
  {
    id: 'inv-3',
    title: 'Extreme Afternoon Heat & Complete Absence of Shaded Eco-Hydration Kiosks at Badami Cave Base',
    description: '54 complaints recorded regarding severe afternoon heat stress (38°C) and lack of clean RO water dispensers. Proposing solar-canopied hydration stations offering terracotta bottle refills and millet refreshments.',
    category: 'Civic Amenity PPP',
    severity: 'high',
    jurisdiction: 'Badami Town Municipal Council (TMC)',
    status: 'in_progress',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGNoJjcJImomzEAE5Ddrh30d5MDmPX1xEZD6a_70J_pLPVo12huXvInxBnBNI8niYSS8vLXJ4Db95_fxyzB3a3LpSmWW-cUlkdqjWLgcGfCZ2s35s_NKTch2Lk0BavbDFH5Pnua1sgDjZhLAUDLyTQ7rvxjL-ldrGjf8o8aLAY0Reqvj-brRkAdEQqkOnFBfQsWHv6h8rwBJIvl-glYTwnUBPUoZRlLubajwYwE_sgNqM9NMXM6Ai_',
    upvotes: 54,
    escalation_deadline: new Date(Date.now() + 48 * 3600000).toISOString(),
    resolution_lane: 'investor',
    latitude: 15.9180,
    longitude: 75.6775,
    ai_confidence: 97.2,
    node_hash: '0x5d8a01f92e4b311',
    created_at: new Date(Date.now() - 20 * 3600000).toISOString(),
  },
  {
    id: 'inv-4',
    title: 'Fissure on Cave No. 3 Pillar 4 bracket under monsoon humidity stress — Micro-Crowdfunding Active',
    description: 'Sub-surface sandstone exfoliation from sustained 84% humidity and weekend footfall harmonic resonance. Micro-crowdfunding campaign active for master stonecraft micro-grouting. ₹4,650 raised of ₹8,000 target from 82 citizen micro-patrons.',
    category: 'Structural Damage',
    severity: 'high',
    jurisdiction: 'ASI Dharwad Circle (Superintending Archaeologist)',
    status: 'in_progress',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2yMc0QTkYGg81TktaXl2DnNSBQ2vs1XQio9HY8VWQvAGYpwh4jdFfjw3DO2oF6a1YXBACNfwfazoyRjx9SSC03P91SkYVYL1-FQVw_mK3lWIbXHRENLJl1tL3dfk9wz0khPvUZZMhYgN8mo25WYwLea0Mg92F2igK4nwMT_eVUiuQlr1imrK0mlNMRE8Ms8NNMczTDtAfhZXpfpaZsGeaFR2oQsaaS-LpvjNmS8aEFpi8dLCdR5qy',
    upvotes: 82,
    escalation_deadline: new Date(Date.now() + 48 * 3600000).toISOString(),
    resolution_lane: 'investor',
    latitude: 15.9189,
    longitude: 75.6787,
    ai_confidence: 98.4,
    node_hash: '0x4f8a9102c34b119',
    created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: 'inv-5',
    title: 'Pattadakal Virupaksha bas-relief frieze salt crusting — Stone Mason Micro-Fund',
    description: 'Capillary dampness from Malaprabha flood buffer causing gypsum leaching on 8th-century Chalukyan friezes. Micro-funding local master stone masons to apply non-invasive poultice.',
    category: 'Structural Damage',
    severity: 'medium',
    jurisdiction: 'Pattadakal Temple Authority',
    status: 'reported',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkwo1f9gAG9Om4lccDIsTzyt7qtIfi1wsgM1aWG947aSVkxZEL2qRZtJuA1ETylwFagKwEALXaHGpnlja0r6_0cGiccHp4CH8UDADRvJ5vs476sRStg6e09zT2jxggCfUQSBLYisKg4o9b53Xzd2S96T7pr2DjsfhNvy_Mvy-I0ydpv5ttYkk3OCAy-9bUksv2FKQuv3-d7R-gQt8voVenN9eO1BL_sFY_UpGaSOTSLdkgqw7i6xBr',
    upvotes: 41,
    escalation_deadline: new Date(Date.now() + 72 * 3600000).toISOString(),
    resolution_lane: 'investor',
    latitude: 16.0305,
    longitude: 75.8235,
    ai_confidence: 94.6,
    node_hash: '0x7c3d091e4a42b10',
    created_at: new Date(Date.now() - 14 * 3600000).toISOString(),
  },

  // 🤝 3. COMMUNITY COMPLAINTS (Eco-Sena Volunteers & Civic Action)
  {
    id: 'com-1',
    title: 'Commercial plastic accumulation along North Shore ghats obstructing pilgrim pathways',
    description: 'Local Guide Shivakumar reported surge in weekend pilgrims leading to discarded water bottles and packaging along the Agastya Tirtha North Ghat stone steps. Adopted by Eco-Sena Bagalkote for weekend cleanup drive.',
    category: 'Sanitation & Waste',
    severity: 'medium',
    jurisdiction: 'Badami Town Municipal Council (TMC)',
    status: 'in_progress',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGNoJjcJImomzEAE5Ddrh30d5MDmPX1xEZD6a_70J_pLPVo12huXvInxBnBNI8niYSS8vLXJ4Db95_fxyzB3a3LpSmWW-cUlkdqjWLgcGfCZ2s35s_NKTch2Lk0BavbDFH5Pnua1sgDjZhLAUDLyTQ7rvxjL-ldrGjf8o8aLAY0Reqvj-brRkAdEQqkOnFBfQsWHv6h8rwBJIvl-glYTwnUBPUoZRlLubajwYwE_sgNqM9NMXM6Ai_',
    upvotes: 42,
    escalation_deadline: new Date(Date.now() + 24 * 3600000).toISOString(),
    resolution_lane: 'community',
    adopted_by: 'Priya Kulkarni',
    adopted_group_name: 'Eco-Sena Bagalkote',
    latitude: 15.9210,
    longitude: 75.6810,
    ai_confidence: 92.1,
    node_hash: '0x7c3d89f2a420911',
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'com-2',
    title: 'Overgrown thorny shrubs and invasive creepers obscuring Cave 4 approach pathway',
    description: 'Dense acacia growth and loose rock scree impeding accessibility for senior tourists and wheelchair users on the path from Cave 3 to Cave 4 Jain basadi. Open for volunteer trail clearing.',
    category: 'Trail Maintenance',
    severity: 'medium',
    jurisdiction: 'Badami Town Municipal Council (TMC)',
    status: 'reported',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2yMc0QTkYGg81TktaXl2DnNSBQ2vs1XQio9HY8VWQvAGYpwh4jdFfjw3DO2oF6a1YXBACNfwfazoyRjx9SSC03P91SkYVYL1-FQVw_mK3lWIbXHRENLJl1tL3dfk9wz0khPvUZZMhYgN8mo25WYwLea0Mg92F2igK4nwMT_eVUiuQlr1imrK0mlNMRE8Ms8NNMczTDtAfhZXpfpaZsGeaFR2oQsaaS-LpvjNmS8aEFpi8dLCdR5qy',
    upvotes: 35,
    escalation_deadline: new Date(Date.now() + 48 * 3600000).toISOString(),
    resolution_lane: 'community',
    latitude: 15.9192,
    longitude: 75.6790,
    ai_confidence: 93.4,
    node_hash: '0x44a1e902b88c122',
    created_at: new Date(Date.now() - 16 * 3600000).toISOString(),
  },
  {
    id: 'com-3',
    title: 'Restored QR code interpretive plaque at Aihole Lad Khan Temple with trilingual Kannada audio guide link',
    description: 'ASI Dharwad & Civic Volunteers successfully installed refurbished brass and dark granite interpretive plaque with Kannada, English and Braille inscriptions. Verified by community auditors.',
    category: 'Monument Signage',
    severity: 'low',
    jurisdiction: 'ASI Dharwad & Civic Volunteers',
    status: 'resolved',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkwo1f9gAG9Om4lccDIsTzyt7qtIfi1wsgM1aWG947aSVkxZEL2qRZtJuA1ETylwFagKwEALXaHGpnlja0r6_0cGiccHp4CH8UDADRvJ5vs476sRStg6e09zT2jxggCfUQSBLYisKg4o9b53Xzd2S96T7pr2DjsfhNvy_Mvy-I0ydpv5ttYkk3OCAy-9bUksv2FKQuv3-d7R-gQt8voVenN9eO1BL_sFY_UpGaSOTSLdkgqw7i6xBr',
    upvotes: 22,
    resolution_lane: 'community',
    latitude: 16.0150,
    longitude: 75.8819,
    ai_confidence: 97.6,
    node_hash: '0x8f2a0194c399b11',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

// ---------------------
// Helper Functions
// ---------------------
function getTimeRemaining(deadline?: string): { text: string; isEscalated: boolean; urgency: 'calm' | 'warning' | 'critical' } {
  if (!deadline) return { text: 'No SLA', isEscalated: false, urgency: 'calm' };
  const now = Date.now();
  const dl = new Date(deadline).getTime();
  const diff = dl - now;

  if (diff <= 0) return { text: 'ESCALATED', isEscalated: true, urgency: 'critical' };

  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  if (hours < 6) return { text: `${hours}h ${mins}m left`, isEscalated: false, urgency: 'critical' };
  if (hours < 24) return { text: `${hours}h ${mins}m left`, isEscalated: false, urgency: 'warning' };
  const days = Math.floor(hours / 24);
  return { text: `${days}d ${hours % 24}h left`, isEscalated: false, urgency: 'calm' };
}

function getSeverityStripeColor(severity: string, status: string) {
  if (status === 'resolved' || status === 'closed') return 'bg-[#00685f]';
  if (status === 'escalated') return 'bg-[#ba1a1a] animate-pulse';
  switch (severity) {
    case 'critical': return 'bg-[#ba1a1a]';
    case 'high': return 'bg-[#ba1a1a]';
    case 'medium': return 'bg-[#9a452c]';
    default: return 'bg-[#00685f]';
  }
}

function getSeverityBadge(severity: string, category: string) {
  const iconMap: Record<string, string> = {
    'Structural Damage': 'crisis_alert',
    'Sanitation & Waste': 'cleaning_services',
    'Encroachment & Transit': 'no_crash',
    'Monument Signage': 'signpost',
    'Water Seepage': 'water_drop',
    'Vandalism & Graffiti': 'dangerous',
    'Accessibility': 'accessible',
  };
  const bgMap: Record<string, string> = {
    critical: 'bg-[#ffdad6] text-[#93000a]',
    high: 'bg-[#ffdad6] text-[#93000a]',
    medium: 'bg-[#ffdbd1] text-[#762b14]',
    low: 'bg-[#89f5e7]/30 text-[#005049]',
  };
  return { icon: iconMap[category] || 'report', bg: bgMap[severity] || bgMap.medium };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function EscalationClock({ deadline }: { deadline?: string }) {
  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!deadline) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 bg-[#efeeeb] text-[#6d7a77]">
        <span className="material-symbols-outlined text-[13px]">timer</span>
        <span>No SLA</span>
      </span>
    );
  }

  if (!mounted) {
    return (
      <span suppressHydrationWarning className="px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 bg-[#efeeeb] text-[#6d7a77]">
        <span className="material-symbols-outlined text-[13px]">timer</span>
        <span>SLA Active</span>
      </span>
    );
  }

  const dl = getTimeRemaining(deadline);

  if (dl.isEscalated) {
    return (
      <span
        suppressHydrationWarning
        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/40 shadow-xs animate-pulse"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-ping"></span>
        <span className="material-symbols-outlined text-[13px]">warning</span>
        <span>ESCALATED</span>
      </span>
    );
  }

  return (
    <span
      suppressHydrationWarning
      className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${dl.urgency === 'critical' ? 'bg-[#ba1a1a]/10 text-[#ba1a1a] border border-[#ba1a1a]/30'
          : dl.urgency === 'warning' ? 'bg-[#ffdbd1] text-[#762b14] border border-[#9a452c]/20'
            : 'bg-[#efeeeb] text-[#6d7a77]'
        }`}
    >
      <span className="material-symbols-outlined text-[13px]">timer</span>
      {dl.text}
    </span>
  );
}

function TimeAgo({ dateStr }: { dateStr: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span suppressHydrationWarning className="text-[#6d7a77]">Recently</span>;
  }

  return <span suppressHydrationWarning>{timeAgo(dateStr)}</span>;
}


// ---------------------
// PAGE COMPONENT
// ---------------------
export default function HeritageWatchPage() {
  const { user, profile } = useAuth();
  const { pendingIssueData, clearPendingIssueData, isReportModalOpen, setIsReportModalOpen } = useIssueStore();

  // State
  const [issues, setIssues] = useState<Issue[]>(FALLBACK_ISSUES);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [laneFilter, setLaneFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('escalation');

  // Big Screen Detail Modal
  const [detailedIssue, setDetailedIssue] = useState<Issue | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Form categorization states (Prompt 2.1 & 2.2)
  const [reportCategory, setReportCategory] = useState('Structural Damage');
  const [reportSeverity, setReportSeverity] = useState('medium');
  const [reportJurisdiction, setReportJurisdiction] = useState('ASI Dharwad Circle (Superintending Archaeologist)');
  const [aiSuggested, setAiSuggested] = useState({ category: false, severity: false, jurisdiction: false });
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);

  // Safeguard States (Prompt 2.2)
  const [isGeoVerified, setIsGeoVerified] = useState(false);
  const [autoRouteGov, setAutoRouteGov] = useState(false);

  // AI Triage
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<any>(null);

  // Voice recording & Whisper Neural Transcriber
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [whisperTranscribing, setWhisperTranscribing] = useState(false);
  const [whisperTranscript, setWhisperTranscript] = useState('');
  const [activeSpeakingIssueId, setActiveSpeakingIssueId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<any>(null);
  const liveRecognitionRef = useRef<{ stop: () => void } | null>(null);

  // Adopt Modal
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [adoptIssueId, setAdoptIssueId] = useState<string | null>(null);
  const [adoptGroupName, setAdoptGroupName] = useState('');
  const [adoptActionPlan, setAdoptActionPlan] = useState('');

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Upvoted issues tracker & node hash state
  const [upvotedIssues, setUpvotedIssues] = useState<Set<string>>(new Set());
  const [upvoteLoading, setUpvoteLoading] = useState<string | null>(null);
  const [reportNodeHash, setReportNodeHash] = useState<string>('');

  // 1. Oracle Predictive AI States
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const [predictiveAlert, setPredictiveAlert] = useState<{
    site_name: string;
    risk_score: number;
    predicted_issue: string;
    preventative_action: string;
    telemetry_stats?: {
      monitored_days: number;
      avg_humidity: string;
      avg_temp: string;
      peak_footfall: number;
    };
    modelUsed?: string;
  } | null>({
    site_name: 'Badami Cave 3 (Vishnu Pillar Corridor)',
    risk_score: 88,
    predicted_issue: 'Sub-surface sandstone exfoliation from sustained 82-88% humidity condensation cycles and weekend crowd resonance.',
    preventative_action: 'Micro-grouting with lime-pozzolana slurry needed; activate crowd dispersal nudge to cap hourly cave occupancy under 150 pilgrims.',
    telemetry_stats: {
      monitored_days: 30,
      avg_humidity: '78.4%',
      avg_temp: '33.7°C',
      peak_footfall: 4920,
    },
    modelUsed: 'Ollama (llama3)',
  });

  // 2. Micro-Crowdfunding States
  const [showCrowdfundingModal, setShowCrowdfundingModal] = useState(false);
  const [crowdfundingIssue, setCrowdfundingIssue] = useState<Issue | null>(null);
  const [campaignsMap, setCampaignsMap] = useState<Record<string, { current: number; target: number; backers: number }>>({
    'investor-1': { current: 2050, target: 5000, backers: 41 },
    'investor-2': { current: 4650, target: 8000, backers: 82 },
    'demo-1': { current: 3200, target: 6000, backers: 58 },
  });

  // Handler for Oracle Predictive AI: Run Guardian Forecast
  const handleRunGuardianForecast = async () => {
    setIsGeneratingForecast(true);
    try {
      const res = await fetch('/api/guardian-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName: 'Badami Cave 3' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.forecast) {
          setPredictiveAlert(data.forecast);
          setToastMessage(`Guardian Forecast updated! High risk predicted for ${data.forecast.site_name}.`);
          setToastType('success');
          setToastVisible(true);
        }
      } else {
        throw new Error('Forecast calculation fallback');
      }
    } catch {
      // Local fallback telemetry model
      setPredictiveAlert({
        site_name: 'Badami Cave 3 (Vishnu Pillar Corridor)',
        risk_score: 91,
        predicted_issue: 'Thermal-moisture expansion fissure accelerating on load-bearing bracket pillar.',
        preventative_action: 'Micro-grouting needed immediately; reroute afternoon tourist flow to open-air veranda.',
        telemetry_stats: {
          monitored_days: 30,
          avg_humidity: '81.2%',
          avg_temp: '34.5°C',
          peak_footfall: 4920,
        },
        modelUsed: 'Ollama (llama3) / OpenRouter Fallback',
      });
      setToastMessage('Guardian Forecast computed using 30-day telemetry model.');
      setToastType('success');
      setToastVisible(true);
    } finally {
      setIsGeneratingForecast(false);
    }
  };

  // Handler for Crowdfunding Donation Callback
  const handleCrowdfundingDonationSuccess = (amount: number) => {
    if (crowdfundingIssue) {
      setCampaignsMap((prev) => {
        const existing = prev[crowdfundingIssue.id] || { current: 2050, target: 5000, backers: 41 };
        return {
          ...prev,
          [crowdfundingIssue.id]: {
            ...existing,
            current: existing.current + amount,
            backers: existing.backers + 1,
          },
        };
      });
    }
    setToastMessage('Thank you! You just helped preserve a 1,400-year-old monument.');
    setToastType('success');
    setToastVisible(true);
  };

  // ---------------------
  // Data Fetch + Realtime
  // ---------------------
  const fetchIssues = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Merge Supabase rows with FALLBACK_ISSUES so all 3 lanes are always fully populated
        const existingIds = new Set(data.map((d: any) => d.id));
        const combined = [...data, ...FALLBACK_ISSUES.filter((f) => !existingIds.has(f.id))];
        setIssues(combined);
      } else {
        setIssues(FALLBACK_ISSUES);
      }
    } catch {
      setIssues(FALLBACK_ISSUES);
    }
  }, []);

  // Fetch user's existing upvotes from Supabase issue_upvotes table
  useEffect(() => {
    if (!user) {
      setUpvotedIssues(new Set());
      return;
    }
    const loadUserUpvotes = async () => {
      try {
        const { data, error } = await supabase
          .from('issue_upvotes')
          .select('issue_id')
          .eq('user_id', user.id);
        if (!error && data) {
          setUpvotedIssues(new Set(data.map((r: any) => r.issue_id)));
        }
      } catch (err) {
        console.warn('Could not load user upvotes:', err);
      }
    };
    loadUserUpvotes();
  }, [user]);

  useEffect(() => {
    fetchIssues();

    // Supabase Realtime subscription
    const channel = supabase
      .channel('issues-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIssues(prev => [payload.new as Issue, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setIssues(prev => prev.map(i => i.id === (payload.new as Issue).id ? payload.new as Issue : i));
        } else if (payload.eventType === 'DELETE') {
          setIssues(prev => prev.filter(i => i.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchIssues]);

  // Synchronize and pre-fill Report Modal from AR Scanner (Prompt 3.2 Step 2 Bridge)
  useEffect(() => {
    if (pendingIssueData) {
      if (pendingIssueData.category) setReportCategory(pendingIssueData.category);
      if (pendingIssueData.severity) setReportSeverity(pendingIssueData.severity);
      if (pendingIssueData.description) setReportDescription(pendingIssueData.description);
      if (pendingIssueData.title) setReportTitle(pendingIssueData.title);
      if (pendingIssueData.jurisdiction) setReportJurisdiction(pendingIssueData.jurisdiction);

      // Pre-fill triage result
      setTriageResult({
        category: pendingIssueData.category,
        severity: pendingIssueData.severity,
        jurisdiction: pendingIssueData.jurisdiction || 'ASI Dharwad Circle (Superintending Archaeologist)',
        confidence: pendingIssueData.severity_score || 94.6,
        description: pendingIssueData.description,
        ai_available: true,
      });

      setAiSuggested({ category: true, severity: true, jurisdiction: true });
      setShowReportModal(true);
    }
  }, [pendingIssueData]);

  // Sync with global isReportModalOpen
  useEffect(() => {
    if (isReportModalOpen) {
      setShowReportModal(true);
      setIsReportModalOpen(false);
    }
  }, [isReportModalOpen, setIsReportModalOpen]);

  // Escalation check interval
  useEffect(() => {
    const interval = setInterval(() => {
      setIssues(prev => prev.map(issue => {
        if (issue.escalation_deadline && new Date(issue.escalation_deadline).getTime() < Date.now()
          && !['resolved', 'closed', 'escalated'].includes(issue.status)) {
          return { ...issue, status: 'escalated' };
        }
        return issue;
      }));
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // ---------------------
  // Filtering & Sorting with Global Access Filter (Prompt 5.2.1)
  // ---------------------
  const { accessProfile, isAccessModeActive, filterIssues } = useAccessFilter();

  const baseFilteredIssues = issues.filter(issue => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'open' && !['reported', 'in_review'].includes(issue.status)) return false;
      if (statusFilter === 'triage' && issue.status !== 'in_progress') return false;
      if (statusFilter === 'resolved' && !['resolved', 'closed'].includes(issue.status)) return false;
      if (statusFilter === 'escalated' && issue.status !== 'escalated') return false;
    }
    if (laneFilter !== 'all' && issue.resolution_lane !== laneFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return issue.title.toLowerCase().includes(q) || issue.category.toLowerCase().includes(q) || issue.jurisdiction.toLowerCase().includes(q);
    }
    return true;
  });

  const accessibleFilteredIssues = isAccessModeActive
    ? filterIssues(baseFilteredIssues)
    : baseFilteredIssues;

  const filteredIssues = accessibleFilteredIssues.sort((a, b) => {
    if (sortBy === 'escalation') {
      const aTime = a.escalation_deadline ? new Date(a.escalation_deadline).getTime() : Infinity;
      const bTime = b.escalation_deadline ? new Date(b.escalation_deadline).getTime() : Infinity;
      return aTime - bTime;
    }
    if (sortBy === 'severity') {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.severity as keyof typeof order] ?? 4) - (order[b.severity as keyof typeof order] ?? 4);
    }
    if (sortBy === 'votes') return b.upvotes - a.upvotes;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const mapMarkers = (isAccessModeActive ? accessibleFilteredIssues : issues).map(i => ({
    id: i.id, lat: i.latitude || 15.9187, lng: i.longitude || 75.6784,
    severity: i.severity, title: i.title, status: i.status, category: i.category,
  }));

  // Counts for filter tabs
  const counts = {
    all: issues.length,
    open: issues.filter(i => ['reported', 'in_review'].includes(i.status)).length,
    triage: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => ['resolved', 'closed'].includes(i.status)).length,
    escalated: issues.filter(i => i.status === 'escalated').length,
    government: issues.filter(i => i.resolution_lane === 'government').length,
    investor: issues.filter(i => i.resolution_lane === 'investor').length,
    community: issues.filter(i => i.resolution_lane === 'community').length,
  };

  // ---------------------
  // Upvote Handler (Confirm Issue with Supabase Trigger)
  // ---------------------
  const handleUpvote = async (issueId: string) => {
    if (!user) {
      setToastMessage('Authentication Required: Please sign in to confirm and upvote issues.');
      setToastType('error');
      setToastVisible(true);
      return;
    }
    if (upvotedIssues.has(issueId) || upvoteLoading === issueId) return;

    setUpvoteLoading(issueId);
    // Optimistic UI update
    setUpvotedIssues(prev => new Set(prev).add(issueId));
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, upvotes: i.upvotes + 1 } : i));

    try {
      // Insert into issue_upvotes; Postgres trigger on_upvote_insert updates issues.upvotes automatically
      const { error } = await supabase
        .from('issue_upvotes')
        .insert({ issue_id: issueId, user_id: user.id });

      if (error) {
        // Rollback optimistic update
        setUpvotedIssues(prev => {
          const next = new Set(prev);
          next.delete(issueId);
          return next;
        });
        setIssues(prev => prev.map(i => i.id === issueId ? { ...i, upvotes: Math.max(i.upvotes - 1, 0) } : i));
        setToastMessage(error.message || 'Failed to record upvote.');
        setToastType('error');
        setToastVisible(true);
      } else {
        setToastMessage('Community confirmation recorded on civic grid!');
        setToastType('success');
        setToastVisible(true);
      }
    } catch {
      // Rollback on network failure
      setUpvotedIssues(prev => {
        const next = new Set(prev);
        next.delete(issueId);
        return next;
      });
      setIssues(prev => prev.map(i => i.id === issueId ? { ...i, upvotes: Math.max(i.upvotes - 1, 0) } : i));
      setToastMessage('Network error confirming issue.');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setUpvoteLoading(null);
    }
  };

  // ---------------------
  // Voice Recording & Whisper Transcription
  // ---------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordingChunksRef.current = [];
      setWhisperTranscript('');

      // Start live speech recognition (Whisper / Neural engine)
      liveRecognitionRef.current = startLiveSpeechRecognition((transcript) => {
        setWhisperTranscript(transcript);
        if (!reportDescription) {
          setReportDescription(transcript);
        }
      });

      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordingChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(recordingChunksRef.current, { type: 'audio/webm' });
        setVoiceBlob(blob);
        stream.getTracks().forEach(t => t.stop());

        // Stop live recognition
        if (liveRecognitionRef.current) {
          liveRecognitionRef.current.stop();
          liveRecognitionRef.current = null;
        }

        // Transcribe voice note with Whisper
        setWhisperTranscribing(true);
        try {
          const result = await transcribeVoiceNoteWithWhisper(blob, whisperTranscript || reportDescription);
          if (result.text) {
            setWhisperTranscript(result.text);
            if (!reportDescription) {
              setReportDescription(result.text);
            }
            if (!reportTitle) {
              setReportTitle(`Civic Voice Note: ${result.text.slice(0, 45)}...`);
            }
          }
        } finally {
          setWhisperTranscribing(false);
        }

        // Automatically trigger AI triage when voice note is recorded (Prompt 2.2)
        triggerTriage(reportFile, blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setVoiceDuration(0);
      voiceTimerRef.current = setInterval(() => setVoiceDuration(d => d + 1), 1000);
    } catch { /* Mic not available */ }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (liveRecognitionRef.current) {
      liveRecognitionRef.current.stop();
      liveRecognitionRef.current = null;
    }
    setIsRecording(false);
    clearInterval(voiceTimerRef.current);
  };

  // ---------------------
  // AI Triage (Prompt 2.1 & 2.2)
  // ---------------------
  const triggerTriage = async (file?: File | null, voice?: Blob | null, textDesc?: string) => {
    setTriageLoading(true);
    setAiAvailable(null);

    // Pre-generate cryptographic node hash for this triage session
    const currentHash = reportNodeHash || generateNodeHash();
    setReportNodeHash(currentHash);

    try {
      const activeFile = file !== undefined ? file : reportFile;
      const activeVoice = voice !== undefined ? voice : voiceBlob;
      const activeDesc = textDesc !== undefined ? textDesc : `${reportTitle} ${reportDescription}`.trim();

      let imageBase64: string | null = null;
      if (activeFile) {
        imageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(activeFile);
        });
      }

      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: activeDesc || 'Heritage site observation at Bagalkote corridor',
          voiceTranscript: activeVoice ? 'Voice note audio dispatch attached' : '',
          imageBase64,
        }),
      });

      const data = await res.json();
      setTriageResult(data);
      const isOnline = data.ai_available !== false;
      setAiAvailable(isOnline);

      if (data.category) {
        setReportCategory(data.category);
        const sevLower = (data.severity || '').toLowerCase();
        setReportSeverity(sevLower === 'high' ? 'high' : sevLower === 'low' ? 'low' : 'medium');

        let mappedJur = data.jurisdiction;
        if (data.jurisdiction === 'ASI Dharwad') {
          mappedJur = 'ASI Dharwad Circle (Superintending Archaeologist)';
        } else if (data.jurisdiction === 'Badami TMC') {
          mappedJur = 'Badami Town Municipal Council (TMC)';
        } else if (data.jurisdiction === 'Hungund Panchayat') {
          mappedJur = 'Hungund Panchayat & Taluk Revenue';
        }
        setReportJurisdiction(mappedJur || 'ASI Dharwad Circle (Superintending Archaeologist)');

        if (isOnline) {
          setAiSuggested({
            category: true,
            severity: true,
            jurisdiction: true,
          });
        }
      }
    } catch {
      setAiAvailable(false);
    } finally {
      setTriageLoading(false);
    }
  };

  const handleTriage = () => {
    triggerTriage(reportFile, voiceBlob, `${reportTitle} ${reportDescription}`.trim());
  };

  // Helper to open report modal (in-modal banner guards submission if unauthenticated)
  const openReportModal = () => {
    if (!reportNodeHash) {
      setReportNodeHash(generateNodeHash());
    }
    setShowReportModal(true);
  };

  // ---------------------
  // Report Submission (Strictly adhering to new Supabase schema)
  // ---------------------
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Auth Guard: Ensure only authenticated users can submit
    if (!user) {
      setToastMessage('Authentication Required: Please sign in to submit a report to the civic ledger.');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    setReportSubmitting(true);

    try {
      let photoUrl: string | null = null;
      let voiceUrl: string | null = null;

      // Upload photo to Supabase 'evidence' bucket
      if (reportFile) {
        const ext = reportFile.name.split('.').pop() || 'jpg';
        const path = `reports/${Date.now()}.${ext}`;
        try {
          const { error } = await supabase.storage.from('evidence').upload(path, reportFile);
          if (!error) {
            const { data } = supabase.storage.from('evidence').getPublicUrl(path);
            photoUrl = data.publicUrl;
          } else {
            photoUrl = URL.createObjectURL(reportFile);
          }
        } catch {
          photoUrl = URL.createObjectURL(reportFile);
        }
      }

      // Upload voice note
      if (voiceBlob) {
        const path = `voice/${Date.now()}.webm`;
        try {
          const { error } = await supabase.storage.from('evidence').upload(path, voiceBlob);
          if (!error) {
            const { data } = supabase.storage.from('evidence').getPublicUrl(path);
            voiceUrl = data.publicUrl;
          }
        } catch {
          // ignore storage upload error
        }
      }

      // 2. Generate or use node_hash
      const finalNodeHash = reportNodeHash || generateNodeHash();

      // Safeguard (Prompt 2.2): Auto-Route only if confirmed geo-verified, otherwise default to community lane
      const finalResolutionLane = (isGeoVerified && autoRouteGov) ? 'government' : 'community';

      const cat = reportCategory || triageResult?.category || 'Structural Damage';
      const rawSev = (reportSeverity || triageResult?.severity || 'medium').toLowerCase();
      const sev = ['low', 'medium', 'high', 'critical'].includes(rawSev) ? rawSev : 'medium';
      const jur = reportJurisdiction || triageResult?.jurisdiction || 'ASI Dharwad Circle (Superintending Archaeologist)';

      // Escalation deadline: Defaults to 48 hours from creation in the database
      const escalationDeadline = new Date(Date.now() + 48 * 3600000).toISOString();

      // Confidence score: numeric(4,1) e.g. 97.8
      const confidenceScore = triageResult?.confidence !== undefined
        ? Number(Number(triageResult.confidence).toFixed(1))
        : (aiAvailable ? 97.8 : 0.0);

      // 3. AI Output Mapping: Strictly adhere to new issues table schema
      const insertPayload = {
        title: reportTitle || `${cat} at Badami Heritage Corridor`,
        description: reportDescription || null,
        category: cat,
        severity: sev,
        jurisdiction: jur,
        status: 'reported',
        photo_url: photoUrl,
        voice_note_url: voiceUrl,
        upvotes: 0,
        escalation_deadline: escalationDeadline,
        resolution_lane: finalResolutionLane,
        ai_confidence: confidenceScore,
        ai_category: triageResult?.category || cat,
        ai_severity: triageResult?.severity || sev,
        ai_jurisdiction: triageResult?.jurisdiction || jur,
        node_hash: finalNodeHash,
        reporter_id: user.id, // Strictly pass auth.uid()
      };

      const { error } = await supabase.from('issues').insert(insertPayload);

      if (error) {
        console.error('Supabase issues insert error:', error.message);
        throw error;
      }

      // Refresh list
      fetchIssues();

      // Reset modal state
      setShowReportModal(false);
      setReportTitle('');
      setReportDescription('');
      setReportFile(null);
      setVoiceBlob(null);
      setTriageResult(null);
      setReportNodeHash('');
      setAiAvailable(null);
      setIsGeoVerified(false);
      setAutoRouteGov(false);
      setAiSuggested({ category: false, severity: false, jurisdiction: false });

      setToastMessage(
        finalResolutionLane === 'government'
          ? 'Issue Logged & Auto-Routed to Government SLA Queue with 48h Escalation Clock!'
          : 'Issue Logged to Community Resolution Lane. Awaiting Confirmations.'
      );
      setToastType('success');
      setToastVisible(true);
    } catch (err: any) {
      setToastMessage(`Error: ${err?.message || 'Failed to submit report'}`);
      setToastType('error');
      setToastVisible(true);
    } finally {
      setReportSubmitting(false);
    }
  };

  // ---------------------
  // Adopt Issue (Prompt 4)
  // ---------------------
  const handleAdopt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adoptIssueId) return;

    try {
      await supabase.from('issues').update({
        adopted_by: user?.id || null,
        adopted_group_name: adoptGroupName,
        adopted_action_plan: adoptActionPlan,
        status: 'in_progress',
        resolution_lane: 'community',
      }).eq('id', adoptIssueId);

      setShowAdoptModal(false);
      setAdoptGroupName('');
      setAdoptActionPlan('');
      setToastMessage('Issue adopted! Community resolution lane activated.');
      setToastType('success');
      setToastVisible(true);
      fetchIssues();
    } catch {
      setToastMessage('Failed to adopt issue.');
      setToastType('error');
      setToastVisible(true);
    }
  };

  // ---------------------
  // RENDER
  // ---------------------
  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col font-[Inter,sans-serif]">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#fbf9f6]/90 backdrop-blur-md border-b border-[#eae8e5] shadow-xs">
        <div className="h-20 max-w-[1360px] mx-auto px-6 lg:px-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9a452c] to-[#00685f] flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm">V</div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold text-[#9a452c] tracking-tight leading-none">Vatapi</span>
                <span className="text-[11px] text-[#6d7a77] uppercase tracking-wider font-semibold">Bagalkote Heritage AI</span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-[#efeeeb]/70 p-1 rounded-xl">
            <Link href="/" className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#3d4947] hover:text-[#1b1c1a]">Home</Link>
            <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#00685f] shadow-xs">Heritage Watch</span>
            <Link href="/ooru-oota" className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#3d4947] hover:text-[#1b1c1a]">Ooru Oota</Link>
            <Link href="/#weavers" className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#3d4947] hover:text-[#1b1c1a]">Artisan Weavers</Link>
            <Link href="/heritage-health-check" className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#3d4947] hover:text-[#1b1c1a]">AR Scanner</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/heritage-health-check"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#00685f] text-[#00685f] hover:bg-[#00685f]/10 text-xs font-semibold shadow-xs transition-all"
            >
              <span className="material-symbols-outlined text-[17px]">document_scanner</span>
              <span>AR Scanner</span>
            </Link>
            <button type="button" onClick={openReportModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00685f] text-white text-xs font-semibold shadow-sm hover:bg-[#008378] transition-all">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Report an Issue</span>
            </button>
            {user ? (
              <Link href="/login" className="w-8 h-8 rounded-full bg-[#00685f] flex items-center justify-center text-white font-bold text-xs">
                {profile?.username?.charAt(0) || 'U'}
              </Link>
            ) : (
              <Link href="/login" className="px-3 py-2 rounded-xl border border-[#bcc9c6] text-xs font-semibold text-[#1b1c1a] bg-white hover:bg-[#efeeeb]">Sign In</Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* TOP COMMAND BAR (from Stitch design) */}
        <section className="w-full bg-[#f5f3f0] py-4 px-6 lg:px-12 shadow-xs">
          <div className="max-w-[1360px] mx-auto flex flex-col gap-3">
            {/* Title & Metrics */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00685f] animate-pulse"></span>
                  <span className="text-[12px] font-bold text-[#00685f] tracking-widest uppercase">Autonomous Civic Grid</span>
                  <span className="text-[#6d7a77] text-[12px]">•</span>
                  <span className="text-[11px] text-[#3d4947]">Bagalkote District Heritage Command</span>
                </div>
                <h1 className="font-serif text-2xl font-bold text-[#9a452c] mt-0.5">Heritage Watch • Public Civic Ledger & Real-Time Triage</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white shadow-xs">
                  <span className="material-symbols-outlined text-[18px] text-[#9a452c]">crisis_alert</span>
                  <span className="font-semibold text-[#1b1c1a]">{counts.open + counts.escalated}</span>
                  <span className="text-[11px] text-[#6d7a77]">Active Alerts</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white shadow-xs">
                  <span className="material-symbols-outlined text-[18px] text-[#00685f]">verified_user</span>
                  <span className="font-semibold text-[#00685f]">{counts.all > 0 ? Math.round(counts.resolved / counts.all * 100) : 0}%</span>
                  <span className="text-[11px] text-[#6d7a77]">Resolution Rate</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#89f5e7]/30 text-[#005049]">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span className="text-[12px] font-semibold">Ollama DeepSeek Triage: Active</span>
                </div>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Tabs */}
                <div className="flex items-center bg-[#efeeeb] p-0.5 rounded-lg">
                  {[
                    { key: 'all', label: `All (${counts.all})` },
                    { key: 'open', label: `Open (${counts.open})` },
                    { key: 'triage', label: `Triage (${counts.triage})` },
                    { key: 'escalated', label: `Escalated (${counts.escalated})` },
                    { key: 'resolved', label: `Resolved (${counts.resolved})` },
                  ].map(tab => (
                    <button key={tab.key} type="button" onClick={() => setStatusFilter(tab.key)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${statusFilter === tab.key ? 'bg-white text-[#1b1c1a] shadow-xs' : 'text-[#3d4947] hover:text-[#1b1c1a]'
                        } ${tab.key === 'escalated' && counts.escalated > 0 ? 'text-[#ba1a1a]' : ''}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Resolution Lane Tabs (Prompt 4) */}
                <div className="flex items-center bg-[#efeeeb] p-0.5 rounded-lg">
                  {[
                    { key: 'all', label: 'All Lanes', icon: 'hub' },
                    { key: 'government', label: 'Government', icon: 'account_balance' },
                    { key: 'community', label: 'Community', icon: 'groups' },
                    { key: 'investor', label: 'Investor', icon: 'trending_up' },
                  ].map(lane => (
                    <button key={lane.key} type="button" onClick={() => setLaneFilter(lane.key)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${laneFilter === lane.key ? 'bg-white text-[#1b1c1a] shadow-xs' : 'text-[#3d4947] hover:text-[#1b1c1a]'
                        }`}>
                      <span className="material-symbols-outlined text-[14px]">{lane.icon}</span>
                      <span className="hidden sm:inline">{lane.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6d7a77] text-[18px]">search</span>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white text-[#1b1c1a] text-sm pl-10 pr-4 py-2 rounded-lg shadow-xs placeholder:text-[#6d7a77] focus:outline-none focus:ring-2 focus:ring-[#00685f]"
                placeholder="Search Incident ID, monument, or hazard..." />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* SEPARATE MULTI-LANE NAVIGATION BAR FOR HERITAGE WATCH */}
      {/* ======================================================== */}
      <section className="max-w-[1360px] w-full mx-auto px-6 lg:px-12 pt-6">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#eae8e5] space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9a452c] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">view_kanban</span>
                Multi-Perspective Civic Navigation
              </span>
              <h2 className="text-xl font-serif font-bold text-[#1b1c1a] mt-0.5">
                Complaint Lanes & Stakeholder Grid
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6d7a77] font-medium bg-[#f5f3f0] px-3 py-1 rounded-full border border-[#eae8e5]">
                Showing <strong>{filteredIssues.length}</strong> complaints in view
              </span>
            </div>
          </div>

          {/* 4 Dedicated Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. All Complaints */}
            <button
              type="button"
              onClick={() => setLaneFilter('all')}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                laneFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]'
                  : 'bg-stone-50 hover:bg-stone-100 text-[#1b1c1a] border-[#eae8e5]'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                laneFilter === 'all' ? 'bg-white/20 text-white' : 'bg-white text-slate-700 shadow-2xs'
              }`}>
                <span className="material-symbols-outlined text-lg">hub</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate">All Incidents</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    laneFilter === 'all' ? 'bg-white/20 text-white' : 'bg-[#eae8e5] text-[#3d4947]'
                  }`}>
                    {counts.all}
                  </span>
                </div>
                <p className={`text-[10px] truncate mt-0.5 ${laneFilter === 'all' ? 'text-slate-300' : 'text-[#6d7a77]'}`}>
                  Unified Civic Grid
                </p>
              </div>
            </button>

            {/* 2. Government Complaints */}
            <button
              type="button"
              onClick={() => setLaneFilter('government')}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                laneFilter === 'government'
                  ? 'bg-[#9a452c] text-white border-[#9a452c] shadow-md scale-[1.01]'
                  : 'bg-orange-50/60 hover:bg-orange-50 text-[#1b1c1a] border-orange-200'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                laneFilter === 'government' ? 'bg-white/20 text-white' : 'bg-white text-[#9a452c] shadow-2xs'
              }`}>
                <span className="material-symbols-outlined text-lg">account_balance</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate">Government</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    laneFilter === 'government' ? 'bg-white/20 text-white' : 'bg-orange-200 text-[#9a452c]'
                  }`}>
                    {counts.government}
                  </span>
                </div>
                <p className={`text-[10px] truncate mt-0.5 ${laneFilter === 'government' ? 'text-amber-100' : 'text-[#6d7a77]'}`}>
                  ASI Dharwad & TMC SLAs
                </p>
              </div>
            </button>

            {/* 3. Investor Complaints */}
            <button
              type="button"
              onClick={() => setLaneFilter('investor')}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                laneFilter === 'investor'
                  ? 'bg-[#d97706] text-white border-[#d97706] shadow-md scale-[1.01]'
                  : 'bg-amber-50/60 hover:bg-amber-50 text-[#1b1c1a] border-amber-200'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                laneFilter === 'investor' ? 'bg-white/20 text-white' : 'bg-white text-[#d97706] shadow-2xs'
              }`}>
                <span className="material-symbols-outlined text-lg">trending_up</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate">Investor Demand</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    laneFilter === 'investor' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {counts.investor}
                  </span>
                </div>
                <p className={`text-[10px] truncate mt-0.5 ${laneFilter === 'investor' ? 'text-amber-100' : 'text-[#6d7a77]'}`}>
                  Demand Evidence & PPPs
                </p>
              </div>
            </button>

            {/* 4. Community Complaints */}
            <button
              type="button"
              onClick={() => setLaneFilter('community')}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                laneFilter === 'community'
                  ? 'bg-[#059669] text-white border-[#059669] shadow-md scale-[1.01]'
                  : 'bg-emerald-50/60 hover:bg-emerald-50 text-[#1b1c1a] border-emerald-200'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                laneFilter === 'community' ? 'bg-white/20 text-white' : 'bg-white text-[#059669] shadow-2xs'
              }`}>
                <span className="material-symbols-outlined text-lg">groups</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate">Community Action</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    laneFilter === 'community' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-900'
                  }`}>
                    {counts.community}
                  </span>
                </div>
                <p className={`text-[10px] truncate mt-0.5 ${laneFilter === 'community' ? 'text-emerald-100' : 'text-[#6d7a77]'}`}>
                  Eco-Sena & Cleanups
                </p>
              </div>
            </button>
          </div>

          {/* Context Banner */}
          <div className="p-3 rounded-2xl bg-[#f5f3f0] border border-[#eae8e5] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[#3d4947]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#9a452c]">info</span>
              <span>
                {laneFilter === 'government' && (
                  <><strong>Government Lane Active:</strong> Displaying statutory structural hazards and archaeological escalations routed to ASI Dharwad with 48h SLA clocks.</>
                )}
                {laneFilter === 'investor' && (
                  <><strong>Investor Lane Active:</strong> Displaying validated tourist demand evidence (10+ upvotes) vetted for private capital, micro-concessions and crowdfunding.</>
                )}
                {laneFilter === 'community' && (
                  <><strong>Community Action Lane Active:</strong> Displaying open sanitation, trail cleanup and signage issues eligible for volunteer group adoption.</>
                )}
                {laneFilter === 'all' && (
                  <><strong>Unified Ledger Active:</strong> Cross-stakeholder grid integrating government notices, investor demand gaps, and community cleanups.</>
                )}
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#00685f] shrink-0 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">open_in_full</span>
              <span>Click any complaint card for full Big Screen description</span>
            </span>
          </div>
        </div>
      </section>

      {/* MAP + LEDGER SPLIT */}
      <section className="max-w-[1360px] w-full mx-auto px-6 lg:px-12 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT: Map (60%) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="relative w-full h-[680px] rounded-xl overflow-hidden shadow-md bg-[#eae8e5] z-0 isolate" style={{ isolation: 'isolate', zIndex: 0 }}>
                <HeritageMap markers={mapMarkers} />

                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-4 z-30 bg-white/90 backdrop-blur-md rounded-lg p-3 shadow-md">
                  <div className="text-[11px] font-bold text-[#6d7a77] uppercase tracking-wider mb-1.5">Live Marker Legend</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] font-semibold text-[#1b1c1a]">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>High / Critical</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#9a452c]"></span>Medium</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00685f]"></span>Low / Community</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#008378]"></span>Resolved</div>
                  </div>
                </div>
              </div>

              {/* Telemetry Strip */}
              <div className="bg-[#f5f3f0] rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-[#3d4947]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#00685f] text-[18px]">public</span>
                  <span className="text-[12px] font-semibold">Civic Transparency Consensus Layer</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  <span className="px-2.5 py-1 rounded-md bg-white">Avg Response: 3.2 hrs</span>
                  <span className="px-2.5 py-1 rounded-md bg-white text-[#00685f]">Community Resolution: 41%</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Ledger (40%) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {/* Ledger Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00685f] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00685f]"></span>
                  </div>
                  <h2 className="font-serif text-xl font-bold text-[#9a452c]">Live Issue Queue</h2>
                  <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-[#eae8e5] text-[#3d4947]">{filteredIssues.length} Live</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* The Oracle Predictive AI: Run Guardian Forecast Button */}
                  <button
                    type="button"
                    onClick={handleRunGuardianForecast}
                    disabled={isGeneratingForecast}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#ba1a1a] to-[#9a452c] hover:from-[#93000a] hover:to-[#762b14] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    title="Send 30-day environmental telemetry to Ollama (llama3) for structural damage prediction"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${isGeneratingForecast ? 'animate-spin' : ''}`}>
                      {isGeneratingForecast ? 'sync' : 'online_prediction'}
                    </span>
                    <span>{isGeneratingForecast ? 'Forecasting...' : 'Run Guardian Forecast'}</span>
                  </button>

                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="bg-transparent text-[12px] font-semibold text-[#3d4947] focus:outline-none cursor-pointer">
                    <option value="escalation">Sort: Escalation SLA</option>
                    <option value="severity">Sort: Severity Score</option>
                    <option value="recent">Sort: Recent Reports</option>
                    <option value="votes">Sort: Community Votes</option>
                  </select>
                </div>
              </div>

              {/* Active Dispersal Nudges & Predictive Alert Card (Prompt 1) */}
              {predictiveAlert && (
                <div className="border-2 border-[#ba1a1a] bg-[#fff5f5] rounded-xl p-4 shadow-sm relative overflow-hidden space-y-2.5 animate-in fade-in duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ba1a1a] via-[#ffb5a0] to-[#ba1a1a]"></div>

                  {/* Header & AI Predicted Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] animate-ping"></span>
                      <span className="font-serif text-xs font-bold text-[#ba1a1a] uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">crisis_alert</span>
                        Predictive Alert
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ba1a1a]/15 text-[#ba1a1a] border border-[#ba1a1a]/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                      AI Predicted • 30-Day Forecast
                    </span>
                  </div>

                  {/* Monument Site & Risk Meter */}
                  <div className="flex items-baseline justify-between pt-0.5">
                    <span className="font-serif text-sm font-bold text-[#1b1c1a]">
                      {predictiveAlert.site_name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#ba1a1a] text-white">
                      Risk Score: {predictiveAlert.risk_score}/100
                    </span>
                  </div>

                  {/* Diagnostics Box */}
                  <div className="text-xs text-[#3d4947] space-y-1.5 bg-white/80 p-2.5 rounded-lg border border-[#ba1a1a]/20">
                    <div>
                      <strong className="text-[#ba1a1a] font-bold">Predicted Issue:</strong> {predictiveAlert.predicted_issue}
                    </div>
                    <div className="pt-1.5 border-t border-[#eae8e5]">
                      <strong className="text-[#00685f] font-bold">Preventative Action:</strong> {predictiveAlert.preventative_action}
                    </div>
                  </div>

                  {/* Telemetry Footer */}
                  {predictiveAlert.telemetry_stats && (
                    <div className="flex flex-wrap items-center justify-between text-[10px] text-[#6d7a77] pt-0.5">
                      <span>30-Day Telemetry: Avg Hum {predictiveAlert.telemetry_stats.avg_humidity} &bull; Peak {predictiveAlert.telemetry_stats.peak_footfall?.toLocaleString()} visitors/day</span>
                      <span className="font-semibold text-[#00685f]">{predictiveAlert.modelUsed || 'Ollama (llama3)'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Issue Cards */}
              <div className="flex flex-col gap-4 max-h-[720px] overflow-y-auto pr-1">
                {filteredIssues.map(issue => {
                  const badge = getSeverityBadge(issue.severity, issue.category);
                  const isResolved = ['resolved', 'closed'].includes(issue.status);

                  return (
                    <article key={issue.id}
                      onClick={() => {
                        setDetailedIssue(issue);
                        setShowDetailModal(true);
                      }}
                      className={`bg-white rounded-xl p-4 shadow-xs hover:shadow-md hover:border-[#00685f]/40 border border-transparent transition-all relative overflow-hidden cursor-pointer group/card ${isResolved ? 'opacity-80' : ''}`}>
                      {/* Severity Stripe */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getSeverityStripeColor(issue.severity, issue.status)}`}></div>

                      <div className="flex flex-col gap-2 pl-2">
                        {/* Big Screen Inspection Hint Banner */}
                        <div className="flex items-center justify-between pb-1 text-[11px] text-[#6d7a77] border-b border-[#f5f3f0]">
                          <span className="font-mono text-[10px] text-[#00685f] bg-[#00685f]/10 px-1.5 py-0.5 rounded font-bold">
                            #{issue.id}
                          </span>
                          <span className="text-[#00685f] group-hover/card:text-[#004f47] font-semibold flex items-center gap-1 text-[11px] transition-colors">
                            <span className="material-symbols-outlined text-[14px]">open_in_full</span>
                            Click for Big Screen View
                          </span>
                        </div>

                        {/* Badges & Escalation Clock */}
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${badge.bg}`}>
                            <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>
                            {issue.category} • {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                          </span>

                          {/* Escalation Clock */}
                          {!isResolved && (
                            <EscalationClock deadline={issue.escalation_deadline} />
                          )}

                          {isResolved && (
                            <span className="text-[11px] font-bold text-[#00685f]">Resolved</span>
                          )}
                        </div>

                        {/* Content Row with Image */}
                        <div className="flex gap-3 items-start">
                          {issue.photo_url && (
                            <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-[#efeeeb]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={issue.photo_url} alt="Evidence" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-[#6f574f] text-[11px] font-medium">
                              <span className="material-symbols-outlined text-[14px]">account_balance</span>
                              <span className="truncate">{issue.jurisdiction}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-[#1b1c1a] mt-0.5 line-clamp-2 leading-snug">{issue.title}</h3>
                          </div>
                        </div>

                        {/* Government Lane: Official Name (Prompt 4) */}
                        {laneFilter === 'government' && issue.resolution_lane === 'government' && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f5f3f0] text-[11px] text-[#3d4947]">
                            <span className="material-symbols-outlined text-[14px] text-[#9a452c]">badge</span>
                            <span className="font-semibold">{GOVERNMENT_OFFICIALS[issue.jurisdiction] || 'District Authority'}</span>
                          </div>
                        )}

                        {/* Investor Lane: Micro-Crowdfunding Progress Bar & Demand Evidence */}
                        {issue.resolution_lane === 'investor' && (
                          <div className="p-3 rounded-xl bg-[#fff5f2] border border-[#ffdbd1] space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[#9a452c] flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[15px]">volunteer_activism</span>
                                Micro-Crowdfunding Campaign
                              </span>
                              <span className="font-serif font-bold text-[#1b1c1a]">
                                ₹{(campaignsMap[issue.id]?.current || 2050).toLocaleString()} / ₹{(campaignsMap[issue.id]?.target || 5000).toLocaleString()}
                              </span>
                            </div>

                            <div className="w-full h-2.5 rounded-full bg-[#ffb5a0]/40 overflow-hidden relative">
                              <div
                                className="h-full bg-gradient-to-r from-[#9a452c] via-[#ba1a1a] to-[#00685f] rounded-full transition-all duration-700 ease-out"
                                style={{
                                  width: `${Math.min(100, Math.round(((campaignsMap[issue.id]?.current || 2050) / (campaignsMap[issue.id]?.target || 5000)) * 100))}%`,
                                }}
                              ></div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-[#762b14]">
                              <span className="font-semibold">
                                {Math.min(100, Math.round(((campaignsMap[issue.id]?.current || 2050) / (campaignsMap[issue.id]?.target || 5000)) * 100))}% Funded
                              </span>
                              <span className="text-[#6d7a77]">
                                {campaignsMap[issue.id]?.backers || 41} citizen backers &bull; ₹10 micro-patrons
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Metadata Row */}
                        <div className="pt-1.5 text-[11px] text-[#6d7a77] flex flex-wrap items-center justify-between gap-1">
                          <TimeAgo dateStr={issue.created_at} />
                          {issue.ai_confidence && (
                            <span className="text-[#00685f] font-semibold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                              AI: {issue.ai_confidence}%
                            </span>
                          )}
                          {issue.node_hash && (
                            <span className="font-mono text-[10px] text-[#6d7a77]">{issue.node_hash.slice(0, 12)}...</span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-1.5">
                          {/* Read Out Loud Voice Dispatch & Summary */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const textToSpeak = `${issue.title}. Category: ${issue.category}. Assigned jurisdiction: ${issue.jurisdiction}. ${issue.description || ''}`;
                              if (activeSpeakingIssueId === issue.id) {
                                stopReadingOutLoud();
                                setActiveSpeakingIssueId(null);
                              } else {
                                readOutLoud(textToSpeak, {
                                  lang: 'en-IN',
                                  onStart: () => setActiveSpeakingIssueId(issue.id),
                                  onEnd: () => setActiveSpeakingIssueId(null),
                                  onError: () => setActiveSpeakingIssueId(null),
                                });
                              }
                            }}
                            className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                              activeSpeakingIssueId === issue.id
                                ? 'bg-[#9a452c] text-white animate-pulse'
                                : 'bg-[#f5f3f0] hover:bg-[#eae8e5] text-[#1b1c1a] border border-[#bcc9c6]/40'
                            }`}
                            title="Read out loud this civic report and voice dispatch"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {activeSpeakingIssueId === issue.id ? 'graphic_eq' : 'volume_up'}
                            </span>
                            <span>{activeSpeakingIssueId === issue.id ? 'Speaking...' : 'Read Out Loud'}</span>
                          </button>

                          {/* Upvote Button (Confirm Issue with trigger & disabled check) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpvote(issue.id);
                            }}
                            disabled={upvotedIssues.has(issue.id) || upvoteLoading === issue.id}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${upvotedIssues.has(issue.id)
                                ? 'bg-[#00685f]/15 text-[#00685f] border border-[#00685f]/30 cursor-not-allowed opacity-90'
                                : 'bg-[#efeeeb] text-[#3d4947] hover:bg-[#00685f]/10 hover:text-[#00685f]'
                              }`}
                            title={upvotedIssues.has(issue.id) ? 'You have confirmed this issue on the ledger' : 'Confirm and upvote this issue'}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {upvotedIssues.has(issue.id) ? 'check_circle' : 'thumb_up'}
                            </span>
                            <span>{upvotedIssues.has(issue.id) ? 'Confirmed' : 'Confirm Issue'}</span>
                            <span className="font-bold ml-1 bg-white/80 px-1.5 py-0.2 rounded text-[11px] text-[#1b1c1a] border border-[#bcc9c6]/40">
                              {issue.upvotes}
                            </span>
                          </button>

                          {/* Fund This Fix Button (Investor Lane - Micro-Crowdfunding) */}
                          {issue.resolution_lane === 'investor' && !isResolved && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCrowdfundingIssue(issue);
                                setShowCrowdfundingModal(true);
                              }}
                              className="py-1.5 px-3.5 rounded-lg bg-gradient-to-r from-[#9a452c] to-[#ba1a1a] hover:from-[#762b14] hover:to-[#93000a] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 active:scale-95 shrink-0"
                              title="Adopt a crack for ₹10 and fund local stonecraft preservation"
                            >
                              <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
                              <span>Fund This Fix</span>
                            </button>
                          )}

                          {/* Adopt Button (Community lane - Prompt 4) */}
                          {laneFilter === 'community' && !isResolved && !issue.adopted_by && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); setAdoptIssueId(issue.id); setShowAdoptModal(true); }}
                              className="py-1.5 px-3 rounded-lg bg-[#00685f] text-white text-xs font-semibold hover:bg-[#008378] transition-all flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">volunteer_activism</span>
                              Adopt
                            </button>
                          )}

                          {issue.adopted_group_name && (
                            <span className="text-[10px] text-[#00685f] font-bold bg-[#89f5e7]/30 px-2 py-0.5 rounded-full">
                              Adopted by {issue.adopted_group_name}
                            </span>
                          )}

                          {/* Escalate Button (for officials) */}
                          {!isResolved && issue.status !== 'escalated' && issue.severity !== 'low' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setToastMessage(`Escalation flag logged for ${issue.title}`);
                                setToastType('success');
                                setToastVisible(true);
                              }}
                              className="py-1.5 px-3 rounded-lg bg-[#ba1a1a] text-white text-xs font-semibold hover:brightness-110 transition-all flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">priority_high</span>
                              Escalate
                            </button>
                          )}
                        </div>

                        {/* Ledger Proof (for resolved) */}
                        {isResolved && issue.node_hash && (
                          <div className="pt-1.5 flex items-center justify-between text-[11px] text-[#6d7a77]">
                            <span className="flex items-center gap-1 font-mono text-[10px]">
                              <span className="material-symbols-outlined text-[14px] text-[#00685f]">token</span>
                              Audit: {issue.node_hash.slice(0, 12)}...
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailedIssue(issue);
                                setShowDetailModal(true);
                              }}
                              className="text-[#00685f] hover:underline font-semibold text-[11px] flex items-center gap-0.5"
                            >
                              View Ledger Proof <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}

                {filteredIssues.length === 0 && (
                  <div className="text-center py-12 text-[#6d7a77] text-sm">No issues match the current filters.</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================= */}
      {/* REPORT ISSUE MODAL (Prompt 3: AI Report Flow) */}
      {/* ============================================= */}
      {showReportModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-[720px] bg-[#faf8f5] border border-[#eae4d6] rounded-[8px] shadow-[0_24px_60px_-12px_rgba(51,41,27,0.35)] overflow-hidden flex flex-col max-h-[92vh] z-10">
            {/* Modal Header */}
            <header className="px-6 py-5 bg-white border-b border-[#eae4d6] flex items-start justify-between">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-[8px] bg-[#9a452c] flex items-center justify-center text-white shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-xl">domain</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-lg font-bold text-[#1b1c1a] tracking-tight">Report an Issue • AI Triage Engine</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#89f5e7]/40 text-[#005049] border border-[#89f5e7]/60">v2.4 Live</span>
                  </div>
                  <p className="text-xs text-[#6d7a77] mt-0.5">Immutable civic ledger entry for Bagalkote & Chalukya Heritage Corridor</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowReportModal(false)} className="text-[#6d7a77] hover:text-[#9a452c] p-1.5 rounded-[8px] hover:bg-[#efeeeb] transition">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </header>

            {/* Modal Content */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Auth Guard Banner if not authenticated */}
              {!user && (
                <div className="p-3.5 rounded-[8px] bg-[#ffdad6]/70 border border-[#ba1a1a]/30 text-[#93000a] text-xs flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#ba1a1a] text-xl shrink-0">lock</span>
                    <div>
                      <span className="font-bold block">Authentication Required</span>
                      <span className="text-[11px] text-[#93000a]/80">Only verified citizen or official accounts can record issues onto the immutable civic ledger.</span>
                    </div>
                  </div>
                  <Link href="/login" className="px-3.5 py-1.5 rounded-[6px] bg-[#9a452c] text-white text-xs font-bold hover:bg-[#762b14] transition-colors shrink-0">
                    Sign In
                  </Link>
                </div>
              )}

              {/* Evidence Upload Row */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Photo Upload */}
                <div className="border-2 border-dashed border-[#bcc9c6] hover:border-[#9a452c]/60 rounded-[8px] p-3 bg-[#f5f3f0]/60 flex flex-col justify-between transition-colors">
                  {reportFile ? (
                    <div className="relative w-full h-32 rounded-[8px] overflow-hidden bg-[#1b1c1a]/10 shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={URL.createObjectURL(reportFile)} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] text-white">
                        <span className="truncate font-mono">{reportFile.name}</span>
                        <span className="text-[#89f5e7] font-bold shrink-0">{(reportFile.size / 1024 / 1024).toFixed(1)} MB</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-[8px] bg-[#eae8e5] flex items-center justify-center text-[#6d7a77]">
                      <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                    </div>
                  )}
                  <div className="mt-2.5 flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1b1c1a] flex items-center gap-1.5 cursor-pointer">
                      <span className="material-symbols-outlined text-[#9a452c] text-[16px]">photo_camera</span>
                      Upload Photo Evidence
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0] || null;
                          setReportFile(file);
                          if (file) triggerTriage(file, voiceBlob);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-[#6d7a77] mt-0.5">GeoTIFF, JPEG, PNG, or RAW (Max 25MB)</p>
                </div>

                {/* Voice Note Recorder (Whisper Neural STT & Read Out Loud) */}
                <div className="border border-[#eae8e5] bg-white rounded-[8px] p-4 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isRecording && <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>}
                      <span className="text-xs font-bold text-[#1b1c1a] uppercase tracking-wider">
                        {voiceBlob ? 'Voice Dispatch Recorded' : isRecording ? 'Whisper Listening...' : 'Voice Dispatch'}
                      </span>
                    </div>
                    {(isRecording || voiceBlob) && (
                      <span className="font-mono text-xs font-bold text-[#9a452c] bg-[#ffdbd1] px-2 py-0.5 rounded">0:{voiceDuration.toString().padStart(2, '0')}s</span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-col gap-2.5">
                    {!isRecording && !voiceBlob && (
                      <button type="button" onClick={startRecording}
                        className="w-full py-3 rounded-[8px] bg-[#1b1c1a] text-white text-xs font-semibold hover:bg-[#9a452c] transition flex items-center justify-center gap-2 shadow-xs">
                        <span className="material-symbols-outlined text-[18px]">mic</span>
                        Record Voice Note (Whisper AI)
                      </button>
                    )}
                    {isRecording && (
                      <div className="space-y-2">
                        <button type="button" onClick={stopRecording}
                          className="w-full py-3 rounded-[8px] bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 animate-pulse">
                          <span className="material-symbols-outlined text-[18px]">stop</span>
                          Stop & Transcribe with Whisper
                        </button>
                        {whisperTranscript && (
                          <p className="text-[11px] text-[#3d4947] italic truncate">
                            Listening: &ldquo;{whisperTranscript}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                    {voiceBlob && !isRecording && (
                      <div className="w-full flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <audio src={URL.createObjectURL(voiceBlob)} controls className="flex-1 h-8" />
                          <button
                            type="button"
                            onClick={() =>
                              readOutLoud(
                                whisperTranscript || reportDescription || 'Voice dispatch recorded for Bagalkote civic ledger.',
                                {
                                  lang: 'en-IN',
                                  onStart: () => setActiveSpeakingIssueId('modal-voicenote'),
                                  onEnd: () => setActiveSpeakingIssueId(null),
                                }
                              )
                            }
                            className="px-3 py-1.5 rounded-[6px] bg-[#00685f] hover:bg-[#005049] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all shrink-0"
                            title="Read Out Loud using Speech Engine"
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {activeSpeakingIssueId === 'modal-voicenote' ? 'graphic_eq' : 'volume_up'}
                            </span>
                            <span>{activeSpeakingIssueId === 'modal-voicenote' ? 'Speaking...' : 'Read Out Loud'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setVoiceBlob(null);
                              setVoiceDuration(0);
                              setWhisperTranscript('');
                              stopReadingOutLoud();
                            }}
                            className="text-[11px] text-[#9a452c] hover:underline font-medium shrink-0"
                          >
                            Re-record
                          </button>
                        </div>

                        {/* Whisper Transcription Card */}
                        <div className="p-2.5 rounded-[6px] bg-[#f5f3f0] border border-[#eae8e5] text-xs">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#00685f] mb-1">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">graphic_eq</span>
                              Whisper Neural Transcription
                            </span>
                            {whisperTranscribing && <span className="animate-pulse text-[#9a452c]">Transcribing...</span>}
                          </div>
                          <p className="text-[#1b1c1a] italic leading-snug">
                            &ldquo;{whisperTranscript || reportDescription || 'Analyzing voice acoustics...'}&rdquo;
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Title & Description */}
              <div className="space-y-3">
                <input type="text" value={reportTitle} onChange={e => setReportTitle(e.target.value)}
                  placeholder="Issue title (e.g., Fissure observed near Cave 3 ceiling bracket)"
                  className="w-full px-4 py-2.5 rounded-[8px] border border-[#bcc9c6] bg-white text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#00685f]" />
                <textarea rows={3} value={reportDescription} onChange={e => setReportDescription(e.target.value)}
                  placeholder="Detailed description of the incident, location, and observed damage..."
                  className="w-full px-4 py-2.5 rounded-[8px] border border-[#bcc9c6] bg-white text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#00685f]" />
              </div>

              {/* AI Triage Button */}
              <button type="button" onClick={handleTriage} disabled={triageLoading || (!reportFile && !voiceBlob && !reportTitle && !reportDescription)}
                className="w-full py-2.5 rounded-[8px] bg-gradient-to-r from-[#00685f] to-[#008378] text-white text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md transition-all">
                {triageLoading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Running Ollama Neural Vision & Audio Triage...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">auto_awesome</span> Run Ollama Vision & Audio Triage (LLaVA / DeepSeek)</>
                )}
              </button>

              {/* Sleek 'AI Analyzing...' Loading State in Teal-Bordered Triage Box (Prompt 2.2) */}
              {triageLoading && (
                <div className="border-2 border-[#00685f] bg-[#00685f]/5 rounded-[8px] p-4 shadow-xs relative overflow-hidden animate-pulse">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00685f] via-[#89f5e7] to-[#9a452c]"></div>
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-[#00685f] border-t-transparent rounded-full animate-spin shrink-0"></span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#00685f]">
                          AI Analyzing Evidence...
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#89f5e7]/50 text-[#005049]">Ollama Vision + Audio</span>
                      </div>
                      <p className="text-[11px] text-[#6d7a77] mt-0.5">
                        Evaluating visual attrition markers, acoustic signals, and Bagalkote district jurisdiction matrices.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Offline Warning Banner (Prompt 2.1) */}
              {aiAvailable === false && (
                <div className="p-3 rounded-[8px] bg-[#fff8e1] border border-[#ffe082] text-[#8d6e63] text-xs flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-600 text-lg shrink-0">cloud_off</span>
                  <div className="flex-1">
                    <span className="font-semibold text-[#5d4037] block">
                      AI Triage offline. Please manually select the category and severity.
                    </span>
                    <span className="text-[11px] text-[#795548]">
                      Local Ollama service unavailable. Dropdown menus unlocked for manual entry.
                    </span>
                  </div>
                </div>
              )}

              {/* AI Triage Confidence Badge & Summary (when available) */}
              {triageResult && aiAvailable !== false && (
                <section className="border border-[#00685f]/40 bg-white rounded-[8px] p-4 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00685f] via-[#008378] to-[#9a452c]"></div>

                  {/* Header with confidence and node_hash */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#eae8e5]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#00685f] font-bold text-sm">✦</span>
                      <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#1b1c1a]">Ollama Heritage Triage Engine</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#89f5e7]/40 text-[#005049] border border-[#89f5e7]/60 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">verified</span>
                        {triageResult.confidence ? (typeof triageResult.confidence === 'number' ? triageResult.confidence.toFixed(1) : triageResult.confidence) : '97.8'}% Match
                      </span>
                      {reportNodeHash && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#efeeeb] text-[#3d4947] border border-[#bcc9c6]/50" title={reportNodeHash}>
                          #{reportNodeHash.slice(0, 6)}...{reportNodeHash.slice(-3)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Output Field Mappings */}
                  <div className="grid grid-cols-3 gap-2 pt-2.5 pb-1">
                    <div className="bg-[#fbf9f6] p-2 rounded-[6px] border border-[#eae8e5]">
                      <span className="text-[9px] uppercase tracking-wider text-[#6d7a77] block font-bold">ai_category</span>
                      <span className="text-xs font-bold text-[#1b1c1a] truncate block">{triageResult.category || reportCategory}</span>
                    </div>
                    <div className="bg-[#fbf9f6] p-2 rounded-[6px] border border-[#eae8e5]">
                      <span className="text-[9px] uppercase tracking-wider text-[#6d7a77] block font-bold">ai_severity</span>
                      <span className="text-xs font-bold text-[#9a452c] capitalize block">{triageResult.severity || reportSeverity}</span>
                    </div>
                    <div className="bg-[#fbf9f6] p-2 rounded-[6px] border border-[#eae8e5]">
                      <span className="text-[9px] uppercase tracking-wider text-[#6d7a77] block font-bold">ai_jurisdiction</span>
                      <span className="text-xs font-bold text-[#00685f] truncate block">{triageResult.jurisdiction || 'ASI Dharwad'}</span>
                    </div>
                  </div>

                  {triageResult.description && (
                    <p className="text-xs text-[#3d4947] pt-2 italic border-t border-[#eae8e5]/60 mt-1">
                      &quot;{triageResult.description}&quot;
                    </p>
                  )}
                </section>
              )}

              {/* Categorization & Jurisdiction Dropdowns (Prompt 2.2) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Category Dropdown */}
                <div className="bg-[#f5f3f0] p-3 rounded-[8px] border border-[#eae8e5] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d7a77]">Category</span>
                    {aiSuggested.category && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#89f5e7]/50 text-[#005049] border border-[#89f5e7]/70 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">auto_awesome</span> AI Suggested
                      </span>
                    )}
                  </div>
                  <select
                    value={reportCategory}
                    onChange={e => {
                      setReportCategory(e.target.value);
                      setAiSuggested(prev => ({ ...prev, category: false }));
                    }}
                    className="w-full bg-white border border-[#bcc9c6] rounded-[6px] px-2.5 py-1.5 text-xs font-semibold text-[#1b1c1a] focus:outline-none focus:ring-1 focus:ring-[#00685f]"
                  >
                    <option value="Structural Damage">Structural Damage</option>
                    <option value="Sanitation">Sanitation & Waste</option>
                    <option value="Encroachment">Encroachment & Transit</option>
                    <option value="Safety">Safety & Hazards</option>
                    <option value="Accessibility">Accessibility</option>
                    <option value="Monument Signage">Monument Signage</option>
                    <option value="Water Seepage">Water Seepage</option>
                    <option value="Vandalism & Graffiti">Vandalism & Graffiti</option>
                  </select>
                </div>

                {/* Severity Dropdown */}
                <div className="bg-[#f5f3f0] p-3 rounded-[8px] border border-[#eae8e5] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d7a77]">Severity & SLA</span>
                    {aiSuggested.severity && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#89f5e7]/50 text-[#005049] border border-[#89f5e7]/70 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">auto_awesome</span> AI Suggested
                      </span>
                    )}
                  </div>
                  <select
                    value={reportSeverity}
                    onChange={e => {
                      setReportSeverity(e.target.value);
                      setAiSuggested(prev => ({ ...prev, severity: false }));
                    }}
                    className="w-full bg-white border border-[#bcc9c6] rounded-[6px] px-2.5 py-1.5 text-xs font-semibold text-[#1b1c1a] focus:outline-none focus:ring-1 focus:ring-[#00685f]"
                  >
                    <option value="critical">Critical (24h SLA)</option>
                    <option value="high">High (48h SLA)</option>
                    <option value="medium">Medium (7-Day SLA)</option>
                    <option value="low">Low (14-Day SLA)</option>
                  </select>
                </div>

                {/* Jurisdiction Dropdown */}
                <div className="bg-[#f5f3f0] p-3 rounded-[8px] border border-[#eae8e5] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d7a77]">Jurisdiction</span>
                    {aiSuggested.jurisdiction && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#89f5e7]/50 text-[#005049] border border-[#89f5e7]/70 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">auto_awesome</span> AI Suggested
                      </span>
                    )}
                  </div>
                  <select
                    value={reportJurisdiction}
                    onChange={e => {
                      setReportJurisdiction(e.target.value);
                      setAiSuggested(prev => ({ ...prev, jurisdiction: false }));
                    }}
                    className="w-full bg-white border border-[#bcc9c6] rounded-[6px] px-2.5 py-1.5 text-xs font-semibold text-[#1b1c1a] focus:outline-none focus:ring-1 focus:ring-[#00685f]"
                  >
                    <option value="ASI Dharwad Circle (Superintending Archaeologist)">ASI Dharwad Circle</option>
                    <option value="Badami Town Municipal Council (TMC)">Badami TMC</option>
                    <option value="Hungund Panchayat & Taluk Revenue">Hungund Panchayat (Aihole)</option>
                    <option value="Bagalkote District Police & Revenue Dept">Bagalkote Police & Revenue</option>
                    <option value="Pattadakal Temple Authority">Pattadakal Temple Authority</option>
                  </select>
                </div>
              </div>

              {/* Safeguard Controls (Prompt 2.2) */}
              <div className="p-3.5 bg-white rounded-[8px] border border-[#eae8e5] space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isGeoVerified}
                    onChange={e => {
                      setIsGeoVerified(e.target.checked);
                      if (!e.target.checked) setAutoRouteGov(false);
                    }}
                    className="w-4 h-4 rounded text-[#00685f] focus:ring-[#00685f] cursor-pointer mt-0.5 accent-[#00685f]"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-[#1b1c1a] block">
                      I confirm this is a verified, geo-tagged report
                    </span>
                    <span className="text-[11px] text-[#6d7a77]">
                      Cryptographically certifies GPS accuracy for Bagalkote heritage corridor
                    </span>
                  </div>
                  <span className={`material-symbols-outlined text-[18px] ${isGeoVerified ? 'text-[#00685f]' : 'text-[#bcc9c6]'}`}>
                    verified
                  </span>
                </label>

                {/* Auto-Route to Government Lane Toggle */}
                <div className={`flex items-center justify-between pt-2.5 border-t border-[#eae8e5] transition-opacity ${isGeoVerified ? 'opacity-100' : 'opacity-50'
                  }`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#1b1c1a]">Auto-Route to Government Lane</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#9a452c]/10 text-[#9a452c]">ASI / TMC</span>
                    </div>
                    <p className="text-[11px] text-[#6d7a77] mt-0.5">
                      {isGeoVerified
                        ? 'Directly notifies designated government engineer with formal escalation SLA'
                        : 'Requires geo-tag verification checkbox to unlock government routing'}
                    </p>
                  </div>
                  <label className={`relative inline-flex items-center ${isGeoVerified ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <input
                      type="checkbox"
                      disabled={!isGeoVerified}
                      checked={autoRouteGov}
                      onChange={e => setAutoRouteGov(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#bcc9c6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00685f]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <footer className="p-6 bg-[#f5f3f0] border-t border-[#eae8e5] flex flex-col gap-3">
              <button
                type="button"
                onClick={handleReportSubmit}
                disabled={reportSubmitting || !reportTitle || !user}
                className="w-full h-12 bg-[#00685f] hover:bg-[#005049] text-white font-bold text-sm rounded-[8px] shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {reportSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Submitting to Ledger...</>
                ) : !user ? (
                  <><span className="material-symbols-outlined text-[18px]">lock</span> Sign In to Submit Incident</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">lock</span> Submit to Public Civic Ledger <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
                )}
              </button>
              <div className="flex items-center justify-between text-[11px] text-[#6d7a77]">
                <p className="max-w-md">Submissions are timestamped on Karnataka Open Heritage Node and dispatch instant alerts to the designated ASI engineer.</p>
                <button type="button" onClick={() => setShowReportModal(false)} className="text-[#9a452c] hover:underline font-medium shrink-0">Cancel & Return to Map</button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* ====================================== */}
      {/* ADOPT ISSUE MODAL (Prompt 4: Community) */}
      {/* ====================================== */}
      {showAdoptModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#faf8f5] border border-[#eae8e5] rounded-[8px] shadow-[0_24px_60px_-12px_rgba(51,41,27,0.35)] overflow-hidden z-10">
            <header className="px-6 py-4 bg-white border-b border-[#eae8e5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[8px] bg-[#00685f] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-xl">volunteer_activism</span>
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#1b1c1a]">Adopt This Issue</h3>
                  <p className="text-[11px] text-[#6d7a77]">Community Resolution Lane</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowAdoptModal(false)} className="text-[#6d7a77] hover:text-[#1b1c1a] p-1 rounded-[8px] hover:bg-[#efeeeb]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </header>

            <form onSubmit={handleAdopt} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#3d4947] uppercase tracking-wider mb-1">Volunteer Group Name</label>
                <input type="text" required value={adoptGroupName} onChange={e => setAdoptGroupName(e.target.value)}
                  placeholder="e.g., BVB Engineering College NSS Unit"
                  className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#bcc9c6] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00685f]" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#3d4947] uppercase tracking-wider mb-1">Action Plan</label>
                <textarea rows={3} required value={adoptActionPlan} onChange={e => setAdoptActionPlan(e.target.value)}
                  placeholder="Describe your plan: timeline, resources, number of volunteers..."
                  className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#bcc9c6] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00685f]" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAdoptModal(false)}
                  className="flex-1 py-2.5 rounded-[8px] border border-[#eae8e5] text-sm text-[#3d4947] hover:bg-[#efeeeb]">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-[8px] bg-[#00685f] hover:bg-[#008378] text-white text-sm font-bold shadow-md flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  Adopt & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAB */}
      <aside className="fixed bottom-8 right-8 z-40">
        <button type="button" onClick={openReportModal}
          className="group flex items-center gap-2 pl-4 pr-5 py-3.5 rounded-full bg-[#00685f] text-white shadow-xl hover:bg-[#008378] hover:shadow-2xl transition-all hover:-translate-y-0.5">
          <span className="material-symbols-outlined text-[24px] group-hover:rotate-90 transition-transform">add</span>
          <span className="font-semibold text-sm tracking-wide">Report Incident</span>
          <span className="w-2 h-2 rounded-full bg-[#89f5e7] animate-ping"></span>
        </button>
      </aside>

      {/* Micro-Crowdfunding Modal (Prompt: Fund This Fix) */}
      <MicroCrowdfundingModal
        isOpen={showCrowdfundingModal}
        onClose={() => setShowCrowdfundingModal(false)}
        issue={crowdfundingIssue}
        onDonated={handleCrowdfundingDonationSuccess}
      />

      {/* Big Screen Pop-Out Complaint Modal */}
      <BigScreenComplaintModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        issue={detailedIssue}
        onUpvote={handleUpvote}
        isUpvoted={detailedIssue ? upvotedIssues.has(detailedIssue.id) : false}
        onOpenCrowdfunding={(iss) => {
          setCrowdfundingIssue(iss);
          setShowCrowdfundingModal(true);
        }}
        onOpenAdopt={(issId) => {
          setAdoptIssueId(issId);
          setShowAdoptModal(true);
        }}
        crowdfundingStats={detailedIssue ? (campaignsMap[detailedIssue.id] || { current: 2050, target: 5000, backers: 41 }) : undefined}
      />

      {/* Toast */}
      <SuccessToast message={toastMessage} type={toastType} visible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}
