/**
 * Weaver-to-Traveller Data Models & Provenance Ledger
 * Supports Supabase weavers synchronization, HTML5 Canvas motif compositing,
 * Ollama product suggestions, and interactive fair-price wage breakdown.
 */

export interface ProvenanceStep {
  stage: string;
  location: string;
  operator: string;
  verifier: string;
  date: string;
  txHash: string;
  details: string;
  icon: string;
}

export interface WeaverProfile {
  id: string;
  name: string;
  specialty: string;
  gi_verified: boolean;
  location: string;
  experience_years: number;
  loom_type: string;
  photo_url: string;
  rating: number;
  visits_count: number;
  open_slots: string;
  provenance_timeline: ProvenanceStep[];
  blockchain_contract: string;
}

export interface ArtisanProduct {
  id: string;
  product_name: string;
  description: string;
  estimated_price: number;
  direct_wage: number;
  image_url: string;
  badge?: string;
  warp_density: string;
  loom_compatibility: string;
  fabric: string;
}

export interface FairPriceSegment {
  id: string;
  name: string;
  percentage: number;
  amount_inr: number;
  colorClass: string;
  bgHex: string;
  tooltip: string;
  impact: string;
}

// ----------------------------------------------------------------------
// 1. Baseline Master Weavers
// ----------------------------------------------------------------------
export const BASELINE_WEAVERS: WeaverProfile[] = [
  {
    id: 'w-1',
    name: 'Shivalingappa Pattanshetti',
    specialty: 'Khana Silk & Choli Weaves',
    gi_verified: true,
    location: 'Guledgudd Central, Ward 4',
    experience_years: 28,
    loom_type: 'Traditional Pit Loom',
    photo_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAwL00CwxS6x0uXUPQpsJy3FylFyQscpYe-vcdX8KLtSn3RKmoXizTlsPNjy11gdQJZjYhB8MEiVJTOu1lKXSL-uJJ9-8IsqLjHzxmZxChLaQ01TEwK_bSu5SILP5-bXUsKIiI9NRrvtGKxd7HOUqsWC8Ef-24Je9qjhTHCZBJSPoYixaRIMopKxmGvQDWQ0YxFeyLLnHEdaSE907-U8PmTk5iVjsesCzcRcBhdjihkHndSRx41OjIY',
    rating: 4.98,
    visits_count: 84,
    open_slots: 'Today, 03:30 PM (2 slots open)',
    blockchain_contract: '0x71C...4E92 (Polygon Heritage Ledger)',
    provenance_timeline: [
      {
        stage: 'Cocoon Sourcing',
        location: 'Karnataka Sericulture Board, Bagalkote Sub-Depot',
        operator: 'Govt. Grade-A Mulberry Silkworm Lot #KSR-8841',
        verifier: 'State Silk Testing Laboratory',
        date: '14 Sep 2026',
        txHash: '0x9a3c...b819',
        details: 'Pure bivoltine white cocoons tested for zero chemical residue and high tensile strength.',
        icon: 'egg',
      },
      {
        stage: 'Handspinning',
        location: 'Guledgudd Cluster Spun Yarn Depot',
        operator: 'Mahila Charkha Self-Help Guild',
        verifier: 'Cluster Quality Auditor V. K. Pujar',
        date: '18 Sep 2026',
        txHash: '0x4d1e...7c32',
        details: 'Traditional foot-operated spinning charkha generating 120-count high twist filament yarn.',
        icon: 'all_inclusive',
      },
      {
        stage: 'Natural Dyeing',
        location: 'Indigo & Pomegranate Vat #3, Guledgudda',
        operator: 'Master Dyer Nagappa Ganiger',
        verifier: 'Eco-Textile Certified Zero-Azo Laboratory',
        date: '20 Sep 2026',
        txHash: '0x1f8a...e904',
        details: '100% plant-based madder root, natural indigo, and pomegranate rind boiled in brass cauldrons.',
        icon: 'palette',
      },
      {
        stage: 'Loom Weaving',
        location: 'Pit Loom Studio 4, Shivalingappa Workshop',
        operator: 'Shivalingappa Pattanshetti (5th Gen)',
        verifier: 'Bagalkote Handloom Weavers Cooperative (GI Tag Authority)',
        date: '24 Sep 2026',
        txHash: '0x8b2d...f461',
        details: 'Hand-thrown shuttle pit loom with 4 shafts interlacing Chalukyan temple border motifs.',
        icon: 'table_restaurant',
      },
    ],
  },
  {
    id: 'w-2',
    name: 'Kasturbai Ilkal',
    specialty: 'Tope Teni Pallu & Kasuti Embroidery',
    gi_verified: true,
    location: 'Ilkal Weavers Colony',
    experience_years: 22,
    loom_type: 'Fly Shuttle Loom',
    photo_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDtfWpKfd5F-EBjjAHOEplpSykuvP_RWwGT-Jbs38H3Jbv6rUdOWDWKnh9Pph1tRxonZoo3DQBPWkSqSIbnrjoudb_zqfwHzgxC7z49yRG7YYP1w_M6UYpVsR8-0fjbj8W8K5MzRDghbspaTdDI05AN3adYSi447vhZKutawVosoTdIo1b3lf8bZXWUv_sg_OgF9JkkNxDPgHdOdVo5FBYl2YRO5tAdpBo4VgasLQbntLJmAVA5t4jm',
    rating: 5.0,
    visits_count: 126,
    open_slots: 'Today, 05:00 PM (1 slot open)',
    blockchain_contract: '0x83A...7D14 (Polygon Heritage Ledger)',
    provenance_timeline: [
      {
        stage: 'Cocoon Sourcing',
        location: 'Karnataka Sericulture Board, Ramanagara / Bagalkote',
        operator: 'Organic Mulberry Lot #ILK-4102',
        verifier: 'State Silk Testing Laboratory',
        date: '10 Sep 2026',
        txHash: '0x3c2a...f910',
        details: 'Double-warp silk reeled with heritage red lac dye bath compatibility.',
        icon: 'egg',
      },
      {
        stage: 'Handspinning',
        location: 'Ilkal Master Spinner Guild',
        operator: 'Ilkal Mahila Cooperative',
        verifier: 'Coop Inspector S. Hallur',
        date: '15 Sep 2026',
        txHash: '0x7e8b...1a03',
        details: 'Hand-plying raw silk warp with cotton weft for the signature Ilkal breathable drape.',
        icon: 'all_inclusive',
      },
      {
        stage: 'Natural Dyeing',
        location: 'Organic Crimson Lac Dye Facility, Ilkal',
        operator: 'Kasturbai Ilkal',
        verifier: 'GI Verification Council',
        date: '18 Sep 2026',
        txHash: '0x5b3c...9d21',
        details: 'Traditional red Tope Teni pallu dyed with crushed natural lac and pomegranate peel mordant.',
        icon: 'palette',
      },
      {
        stage: 'Loom Weaving',
        location: 'Ilkal Loom House #12',
        operator: 'Kasturbai Ilkal & Daughters',
        verifier: 'All India Handloom Board',
        date: '23 Sep 2026',
        txHash: '0x2e4f...c839',
        details: 'Interlocking warp technique (Kondi) connecting body to the iconic Tope Teni pallu.',
        icon: 'table_restaurant',
      },
    ],
  },
  {
    id: 'w-3',
    name: 'Mallikarjun Badami',
    specialty: 'Pure Sandstone Terracotta & Indigo',
    gi_verified: true,
    location: 'Badami Old Town, Temple Lane',
    experience_years: 18,
    loom_type: 'Non-mechanized Jacquard',
    photo_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAY48nAfns5AlI0hE6QlfaH5c_0k1GN2JBcaoME10mQ2Yp3cwtBnPtF_DolrBY2Nb2c_cptoArNrFWUUrVwScXEDfW9Uuzq-Yf7a_RQtXP9fps0xxhGigmFgw1hYEyR0SSMsFH4rhknD0qWvDd9fx3_i4Lj5kYVvIksGiEpFpSmVNPyV0ijz75zOjciBnrUUug3M-y2kdR21D2-22U2a6KfzGzWKYAuhjmOzCZ9UdIQNKyBjNPnu6Jx',
    rating: 4.92,
    visits_count: 57,
    open_slots: 'Tomorrow, 02:00 PM (Open Studio)',
    blockchain_contract: '0x99B...3C81 (Polygon Heritage Ledger)',
    provenance_timeline: [
      {
        stage: 'Cocoon Sourcing',
        location: 'Karnataka Sericulture Board, Bagalkote',
        operator: 'Heritage Wild Tussar & Mulberry Lot #BDM-1102',
        verifier: 'Central Silk Board of India',
        date: '08 Sep 2026',
        txHash: '0x1a8f...39a1',
        details: 'Sustainably gathered wild tussar cocoons blended with mulberry silk filaments.',
        icon: 'egg',
      },
      {
        stage: 'Handspinning',
        location: 'Badami Village Artisan Common Facility',
        operator: 'Chalukya Heritage Spinners',
        verifier: 'Khadi & Village Industries Commission',
        date: '12 Sep 2026',
        txHash: '0x6d4b...88f2',
        details: 'Slow solar-assisted amber spinning preserving natural raw silk luster and slubs.',
        icon: 'all_inclusive',
      },
      {
        stage: 'Natural Dyeing',
        location: 'Badami Natural Indigo & Iron-Rust Vat',
        operator: 'Mallikarjun Badami',
        verifier: 'Ecological Heritage Craft Council',
        date: '17 Sep 2026',
        txHash: '0x4c9e...2a71',
        details: 'Deep indigo fermented with jaggery and iron water mordant yielding enduring terracotta.',
        icon: 'palette',
      },
      {
        stage: 'Loom Weaving',
        location: 'Badami Rock-View Pit Loom Studio',
        operator: 'Mallikarjun Badami',
        verifier: 'ASI Heritage Crafts Guild',
        date: '22 Sep 2026',
        txHash: '0x9d1a...55e4',
        details: 'Manual jacquard cards punched with Badami Cave 1 flying Gandharva stone reliefs.',
        icon: 'table_restaurant',
      },
    ],
  },
];

// ----------------------------------------------------------------------
// 2. Chitra-Sutra AI Suggested Products (Prompt 4.3.1)
// ----------------------------------------------------------------------
export const DEFAULT_SUGGESTED_PRODUCTS: ArtisanProduct[] = [
  {
    id: 'prod-stole',
    product_name: 'Pure Khana Silk Stole',
    description:
      '100% natural Mulberry silk with zari borders featuring the Gandharva frieze. Reversible weaving with reinforced selvages.',
    estimated_price: 3200,
    direct_wage: 2050,
    image_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAiTYAiamGS7Bl0pEXY66ma-UT5uuP6Almb6WLVgwavIu2VZqGCVwJ6QL-YVA5f9CJVy2iHRzvn1rWrMqxXzEXQeQF8zpIv4QkqcLkm2F884MdQDoxG0CLmoby9Gwi7SjtTb67junnDvH29ywa7YUP8bPwCaCigYisnzNGOxzxxd0Mlz-GGHU9hi1KiZ2KoQMyIH7mGh6vqsr1cohIISjIvyws2GR0hWggOPik-Xvke-Yft7uKK9RRC',
    badge: 'Best Seller',
    warp_density: '120 Ends / Inch',
    loom_compatibility: 'Khana 4-Shaft Pit Loom',
    fabric: 'Pure Mulberry Silk',
  },
  {
    id: 'prod-dupatta',
    product_name: 'Artisanal Kasuti Dupatta',
    description:
      'Classic Ilkal red Tope Teni pallu infused with Gandharva medallion centerpieces and hand-embroidered Gavanti stitches.',
    estimated_price: 4800,
    direct_wage: 2900,
    image_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDU2E1EntdhiAkx-ifPepiqKRQirG4Bqrx8UuWFk11_N9Ji4nYHrknekQaRxZ3IkQaqs49a472uH3Ig_pYx1ZX63VClZH1zwQZETalqIYM48eRfoLTeIWvNNlJHeeY09ffGH0aHuxU_McIHLlQXVE2MO2l6oBJxBE05bZuPFM_-A9_LeHEBk36POCqQxSwFYuqQ60scmKZ12-m-KvZcLAv2buyTo_qxLT8yFM-X9WKKki6_ErAhlUEF',
    badge: 'Heritage Classic',
    warp_density: '140 Ends / Inch',
    loom_compatibility: 'Ilkal Kondi Fly Loom',
    fabric: 'Artisanal Silk-Cotton Blend',
  },
  {
    id: 'prod-heirloom',
    product_name: 'Framed Textile Heirloom',
    description:
      'Museum-grade 24x24 tapestry woven with 100% organic indigo & pomegranate natural dyed threads with certified seal.',
    estimated_price: 7500,
    direct_wage: 4800,
    image_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCcTaGGscogaLxjtq20cZ5kRnnbzuZD5SmINDLk_xNqG6CbDXY6OBllb10eFMDwreuCUrAbC0kfIeI7GYzcswjBJN6Nr7q1YASXP1mMrrHrG_IfMvk8a3huDU1vKB_aNxt9bVnk2S2Eh5c3x--gdnN1HIKLzB3d2E72Fq9ZtLyJD5gdP9ztlYQzytV0bksp9LkJ31Re3O7EeIu37-kEec9LOXGGrQfCRRfKsAgtydtIob8uj1k2oH5s',
    badge: 'Collector Edition',
    warp_density: '180 Ends / Inch',
    loom_compatibility: 'Heritage Jacquard Pit Loom',
    fabric: 'Organic Wild Tussar Silk',
  },
];

// ----------------------------------------------------------------------
// 3. Fair-Price Breakdown Segments (Prompt 4.3.2)
// ----------------------------------------------------------------------
export const FAIR_PRICE_SEGMENTS: FairPriceSegment[] = [
  {
    id: 'wage',
    name: "Weaver's Direct Wage",
    percentage: 64,
    amount_inr: 2050,
    colorClass: 'bg-[#00685f]',
    bgHex: '#00685f',
    tooltip:
      '₹2,050 direct to artisan. Paid via UPI instantly upon loom output logging.',
    impact: 'Covers 3 days of skilled master pit-loom labor and family livelihood.',
  },
  {
    id: 'raw',
    name: 'Raw Silk & Zari',
    percentage: 25,
    amount_inr: 800,
    colorClass: 'bg-[#9a452c]',
    bgHex: '#9a452c',
    tooltip:
      '₹800 paid to Bagalkote Sericulture Cooperative for pure mulberry silk & tested zari.',
    impact: 'Funds local sericulture farmers and zero-chemical dyeing vats.',
  },
  {
    id: 'cad',
    name: 'Design Assist & CAD',
    percentage: 6,
    amount_inr: 190,
    colorClass: 'bg-[#896f66]',
    bgHex: '#896f66',
    tooltip:
      '₹190 computational fee for Chitra-Sutra neural rasterization and card punching.',
    impact: 'Maintains open-source AI models and hardware for rural weaver clusters.',
  },
  {
    id: 'coop',
    name: 'Coop & Welfare Reserve',
    percentage: 5,
    amount_inr: 160,
    colorClass: 'bg-[#6d7a77]',
    bgHex: '#6d7a77',
    tooltip:
      '₹160 allocated to Badami Weavers Welfare Trust & Loom Maintenance Emergency Fund.',
    impact: 'Provides health insurance and retirement support for aging artisans.',
  },
];
