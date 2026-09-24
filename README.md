# Vatapi — Civic & Heritage Intelligence Platform
<img width="1376" height="768" alt="vatapi_hp" src="https://github.com/user-attachments/assets/8a96f6cb-9b69-42bc-864e-07a71137301b" />

> **Preserving Bagalkote's Chalukyan Heritage, Empowering Local Communities, and Elevating Visitor Experiences.**

---

## 🏛️ Executive Summary

**Vatapi** is a multi-modal civic-heritage platform designed for the Badami–Pattadakal–Aihole heritage circuit in Bagalkote District, Karnataka, India. Combining AI-driven heritage preservation, transparent last-mile mobility, direct artisan support, sustainable environmental planning, and universal accessibility, Vatapi Bridges the gap between local municipal governance, rural artisans, and heritage travelers.

---

## 🏗️ System Architecture & Tech Stack

- **Frontend Framework:** Next.js 15 (React 19, TypeScript, App Router)
- **UI & Styling:** Tailwind CSS, Lucide React icons, Custom Sandstone/Terracotta/Teal 8pt Grid System
- **Backend & Database:** Supabase (PostgreSQL, Realtime Subscriptions, Row-Level Security)
- **Cloud Storage:** Supabase Storage Bucket (`evidence` bucket for defect photos & voice notes)
- **AI & ML Engine:** Ollama / Local LLM (LLaVA for Vision Triage, Llama 3 / DeepSeek-R1 for text & translation) with fallback to Gemini API endpoints (`/api/gemini/*`)
- **Mapping & GIS:** Leaflet / React-Leaflet with custom map markers and spatial distance calculators

---

## 📸 Platform Highlights & Visual Showcase

| Module | Feature Snapshot | Visual Interface |
| :--- | :--- | :--- |
| **Heritage Watch & Health Check** | Split-screen Interactive Map & Public Issue Ledger with 3 Resolution Lanes (Government, Community, Investor) | ![Heritage Watch Dashboard](public/images/screenshots/Screenshot%20%28436%29.png) |
| **Vatapi Voice & Epigraphical Lens** | Bhashini-inspired Multilingual Concierge with Two-Way Vendor Bridge & 578 CE Inscription Scanner | ![Vatapi Voice Concierge](public/images/screenshots/Screenshot%20%28437%29.png) |
| **Circuit Mobility & Fair-Fare** | Last-Mile Bus Schedule, Fair-Fare Rickshaw Calculator, & Interactive Seat Pooling Board | ![Circuit Mobility](public/images/screenshots/Screenshot%20%28438%29.png) |
| **Inclusive Growth & Weavers** | Guledgudda Khana & Ilkal Handlooms Fair-Price Breakdown & AI Motif Translator | ![Weaver to Traveller](public/images/screenshots/Screenshot%20%28439%29.png) |
| **Ooru Oota Verified Village Meals** | Zero-hallucination SHG Khanavali Directory with Interactive Leaflet Map & Menu Explainer | ![Ooru Oota Meals](public/images/screenshots/Screenshot%20%28440%29.png) |
| **Sustainable Planning & Access Mode** | Agastya Lake Water Monitor, Clean Trail Hotspots, Crowd Forecasts & 360° Universal Access Walkthrough | ![Sustainable Planning & Access](public/images/screenshots/Screenshot%20%28442%29.png) |

---

## 🚀 Key Features & Detailed Phase Breakdown

---

### Phase 1: Core Module — Heritage Watch (Public Ledger & AI Triage)

The spine of the Vatapi platform, establishing transparent civic accountability for Bagalkote's monuments.

- **Interactive Heritage Map & Public Ledger:** Split-screen layout featuring a live Leaflet map of Badami, Pattadakal, and Aihole alongside a real-time feed of reported heritage issues.
- **AI Triage Engine (`/api/triage`):** Ingests photo evidence and audio notes, running local LLaVA / Gemini vision analysis to detect category (*Structural Damage, Sanitation, Vandalism, Encroachment*), severity (*High, Medium, Low*), and governing jurisdiction (*ASI, Tourism Dept, Municipal Council*).
- **Three Resolution Lanes:**
  1. **Government Lane:** High-severity structural defects with strict SLA countdown clocks (e.g. 72h countdown).
  2. **Community Lane:** Volunteer cleanup tasks (litter removal, weed clearing) with before/after verification.
  3. **Investor / CSR Lane:** Large infrastructure adopt-a-monument projects.
- **Escalation Countdown Clock:** Displays dynamic hours remaining based on `created_at` timestamp to hold authorities accountable.

---

### Phase 2: Smart Technology — Heritage Health Check & Multilingual Vatapi Voice

#### 🩺 Heritage Health Check (`/api/gemini/health-check`)
- **Sandstone Masonry Analysis:** Real-time AI scanner detecting crack morphology, micro-vegetation root wedging, and salt efflorescence (subflorescence) on ancient red sandstone walls.
- **One-Click Ledger Integration:** Seamlessly transfers detected masonry defects directly into the Heritage Watch public ledger for official ASI tracking.

#### 🏛️ Debunking Myths & Curated Monuments
- **10 Verified Circuit Monuments:** Comprehensive historical facts for Badami Caves, Pattadakal Group, Durga Temple Aihole, Lad Khan, and surrounding temples.
- **Terrain Realities:** Clears common misconceptions (such as the misleading "2,000 steps" claim for Badami Fort, providing accurate step counts and shade ratings).

#### 📜 Mangalesha 578 CE Epigraphical Lens
- **Hale Kannada Inscription Reader (`/api/inscription-analyze`):** Interactive visual annotation of the 578 CE Old Kannada inscription located on Badami Cave 3's veranda pillar.
- **Art Historical Dating:** Outlines King Mangalesha's dedication of the Vishnu cave temple, cementing its foundational role in establishing the exact timeline for Western Chalukya art and architecture.

#### 🗣️ Vatapi Voice Concierge (`/api/gemini/voice`)
- **Bhashini-Inspired Multilingual Support:** Spoken and textual AI conversation across Kannada, Marathi, Hindi, English, and Telugu.
- **Two-Way Vendor Bridge Mode:** Facilitates fair, respectful negotiations between non-Kannada tourists and local Kannada auto drivers, weavers, and stall vendors with cultural etiquette tips.

---

### Phase 3: Circuit Mobility — Fair-Fare Estimator & Seat Pooling

#### 🚌 Addressing the Last-Mile Gap
- **Transit Transparency:** Explicitly documents local transport constraints (only 2–3 NWKRTC daily buses run between Pattadakal and Aihole), guiding visitors on optimal travel times.

#### 🛺 Fair-Fare Auto Rickshaw Calculator
- **Transparent Formula:** $\text{Fare} = ₹40 \text{ (Base)} + (₹16 \times \text{Distance in km}) + (₹60 \times \text{Waiting Hours})$.
- **Tariff Confidence:** Helps travelers calculate exact costs before boarding, preventing overcharging while ensuring auto operators earn fair local rates.

#### 🚗 Shared Tempo & Ride Pooling
- **Interactive Pooling Board:** Real-time Supabase-backed pooling system enabling solo travelers and small groups to coordinate shared tempo rides.
- **8:00 AM Departure Coordination:** Alignment with KSTDC hotel departure schedules, lowering individual transit costs by up to 60% and reducing carbon emissions.

---

### Phase 4: Inclusive Growth — Weaver-to-Traveller & Ooru Oota (Verified Village Meals)

#### 🧵 Guledgudda Khana & Ilkal Handlooms
- **Artisan Attrition Insights:** Cites peer-reviewed 2025 textile studies documenting yarn debt and weaver attrition in Bagalkote district.
- **Transparent Fair-Price Breakdown:** Interactive bar visualizer breaking down a product's price (e.g., ₹2,400 Ilkal Saree) showing exact raw material cost, dye expense, platform fee, and the direct living wage (e.g. ₹1,450) delivered to the weaver.

#### 🎨 AI Weaver Design Assist (`/api/gemini/artisan-design` / Chitra-Sutra)
- **Motif Translator:** Ingests photos of temple carvings (e.g., Badami Nataraja ceiling motifs) and projects contemporary product adaptations (laptop folios, stoles, dupattas) using traditional *Chaukadi* and *Siddheshwara* weave patterns without displacing manual handloom skills.

#### 🍲 Ooru Oota Verified Village Meals (`/api/gemini/ooda-qa`)
- **Zero-Hallucination Guarantee:** Queries exclusively against physically verified Mahila SHG (Self-Help Group) listings and traditional Khanavalis.
- **Authentic Culinary Directory:** Connects tourists to local women cooks serving authentic North Karnataka cuisine: *Jolada Rotti* (sorghum flatbread), *Ennegai* (stuffed eggplant curry), *Shenga Chutney* (peanut chutney), and *Sajje Rotti*.

---

### Phase 5: Sustainable Planning — Water-Smart Agastya, Clean Trail & Crowds

#### 💧 Timely Drought Response (Sept 17, 2026 Notification)
- **State Drought Integration:** Integrates official Bagalkote District drought declarations (89% rainfall deficit in the Malaprabha river basin).
- **Agastya Lake Health Monitor:** Real-time tracking of water storage levels, dissolved oxygen, and turbidity on Badami's historic 7th-century reservoir.

#### 🧺 Civic Laundry Platform Proposal
- **Reservoir Protection:** Architectural proposal for a modern municipal washing deck equipped with multi-stage greywater filtration to divert laundry detergents away from Agastya Lake's ancient stone ghat steps.

#### 🚰 Water Refill Kiosks
- **Single-Use Plastic Reduction:** Directory and map of free municipal RO water refill kiosks across Badami, Pattadakal, and Aihole.

#### 🧹 Clean Trail & Crowd Density Forecasting
- **Photo-Verified Cleanups:** Volunteers log litter hotspots and upload post-cleanup photo verification to earn civic trust points.
- **Crowd Forecast Heatmaps:** Predictive density maps guiding tourists to quiet visits (e.g. 7:00 AM Pattadakal) and warning against peak festival bottlenecks (*Banashankari Jatre*).

---

### Phase 6: Universal Access Mode & Civic Executive Dashboard

#### 🧑‍🦽 Access Mode for Non-Climbers
- **360° Virtual Walkthrough (`VirtualCaveTourModal`):** Immersive virtual tour of Badami Cave 3 with spoken audio descriptions for wheelchair users and frail seniors at the lower garden level.
- **Detailed Artwork Narration:** Guides non-climbers through the 10-foot Trivikrama sculpture, Vishnu on Ananta, and intricate ceiling carvings.

#### 🗺️ Profile-Based Inclusive Routes
- **Tailored Itineraries:** Dynamic route generation for:
  - *Wheelchair Users:* Step-free ramps, smooth stone paths, accessible toilets.
  - *Seniors:* Shaded rest benches, maximum 15-minute walking intervals.
  - *Low Vision Visitors:* High-contrast visual modes and full screen-reader audio description tags.
  - *Families with Prams:* Stroller-friendly paths and nursery amenities.

#### 📊 Civic Executive Dashboard
- **District Magistrate & MLA View:** Comprehensive analytics portal monitoring open civic grievances, SLA countdown warnings, department resolution rates, and visitor feedback scores.

---

## 🛠️ API Routes Reference

| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/triage` | `POST` | AI analysis of uploaded defect photo & voice note using LLaVA / Gemini. |
| `/api/gemini/health-check` | `POST` | Sandstone degradation diagnosis (cracks, roots, salt efflorescence). |
| `/api/gemini/voice` | `POST` | Multilingual translation & two-way vendor negotiation assistance. |
| `/api/gemini/artisan-design` | `POST` | Generates contemporary handloom design adaptations from temple motifs. |
| `/api/gemini/ooda-qa` | `POST` | Strictly verified Q&A for SHG Khanavalis and local food recommendations. |
| `/api/inscription-analyze` | `POST` | Hale Kannada epigraphy translation for 578 CE Badami Cave 3 pillar. |
| `/api/optimize-itinerary` | `POST` | AI crowd dispersal and route optimization. |
| `/api/verify-cleanup` | `POST` | Automated vision verification of community cleanup proof photos. |

---

## 💻 Local Setup & Installation

### Prerequisites
- **Node.js:** v18.17.0 or higher
- **npm / pnpm / yarn / bun**
- **Supabase Account & Project** (or local Supabase instance)
- **Ollama** (optional local LLM backend with `llava` and `llama3` models)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/vatapi.git
cd vatapi
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OLLAMA_BASE_URL=http://localhost:11434
```

### 3. Supabase Database Schema Setup
Execute the following SQL commands in your Supabase SQL Editor:
```sql
-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT,
  role TEXT DEFAULT 'citizen',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues table (Heritage Watch)
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  lane TEXT DEFAULT 'government',
  status TEXT DEFAULT 'open',
  description TEXT,
  photo_url TEXT,
  voice_note_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reporter_id UUID REFERENCES auth.users(id)
);

-- Food Kitchens table (Ooru Oota)
CREATE TABLE IF NOT EXISTS food_kitchens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  valley TEXT NOT NULL,
  shg_name TEXT,
  distance TEXT,
  specialties TEXT[],
  verified BOOLEAN DEFAULT TRUE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

-- Weavers table
CREATE TABLE IF NOT EXISTS weavers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  village TEXT NOT NULL,
  specialty TEXT NOT NULL,
  gi_verified BOOLEAN DEFAULT TRUE,
  fair_price_percentage INT DEFAULT 60
);

-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏆 Hackathon Demo Narrative

When presenting Vatapi to judges or district stakeholders:

1. **The Core Challenge:** Start with the systemic tension in Aihole/Badami — 942 local families living alongside protected 6th-century monuments under strict heritage regulations, facing 45% ASI staff vacancies and fragmented jurisdictional accountability.
2. **The Full Loop Demo:**
   - Scan sandstone masonry using **Heritage Health Check**.
   - AI automatically triages defect severity and routes it to the **Public Ledger**.
   - Watch the **Escalation Countdown Clock** initiate for the relevant governing authority.
3. **Socio-Economic Impact:**
   - Demonstrate **Vatapi Voice** bridging vendor-tourist language barriers.
   - Show transparent fair-price breakdowns supporting **Guledgudda weavers** and **Mahila SHG Khanavalis**.
4. **Universal Inclusion:**
   - Showcase **360° Access Mode** bringing Badami Cave 3's high cliff carvings to wheelchair users at ground level.

---

*Made with ❤️ for Bagalkote, Badami, Pattadakal, and Aihole.*
