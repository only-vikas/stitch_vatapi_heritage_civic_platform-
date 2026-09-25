/**
 * Vatapi Voice - Multilingual Translation & Epigraphy Data Models & Dictionary
 * Supports context-aware translation (Tourist vs Vendor mode), Web Speech API TTS,
 * and 6th-century Old Kannada Badami Cave 3 Inscription Deciphering.
 */

export interface VoiceMessage {
  id: string;
  sender: 'user' | 'assistant';
  mode: 'tourist' | 'vendor';
  originalText: string;
  translatedText: string;
  kannadaScript?: string;
  transliteration?: string;
  culturalTip?: string;
  audioText: string;
  timestamp: string;
}

export interface VendorPhrase {
  id: string;
  kannada: string;
  transliteration: string;
  english: string;
  category: 'fare' | 'food' | 'craft' | 'timings';
}

export interface InscriptionData {
  title: string;
  monument: string;
  commissioner: string;
  date: string;
  epigraphType: string;
  extractedHalegannada: string;
  romanizedText: string;
  englishTranslation: string;
  historicalStory: string;
  badge: string;
  dynastyContext: string;
  locationDetails: string;
}

// ----------------------------------------------------------------------
// 1. Quick One-Tap Vendor / Driver Phrases (Reverse Mode)
// ----------------------------------------------------------------------
export const VENDOR_PRESET_PHRASES: VendorPhrase[] = [
  {
    id: 'vp-1',
    kannada: 'ಪಟ್ಟದಕಲ್ಲು ತಲುಪಲು ಆಟೋ ಬಾಡಿಗೆ ₹80 ಒಬ್ಬರಿಗೆ (ಪೂಲಿಂಗ್).',
    transliteration: 'Pattadakallu talupalu auto badige 80 rupayi obbarige (pooling).',
    english: 'Auto fare to Pattadakal is ₹80 per seat in shared pool.',
    category: 'fare',
  },
  {
    id: 'vp-2',
    kannada: 'ನಮ್ಮ ಖಾನಾವಳಿಯಲ್ಲಿ ಬಿಸಿ ಜೋಳದ ರೊಟ್ಟಿ ಮತ್ತು ಎಣ್ಣೆಗಾಯಿ ಬದನೆಕಾಯಿ ಊಟ ಸಿದ್ಧವಿದೆ.',
    transliteration: 'Namma khanavaliyalli bisi jolada rotti mattu ennegayi badanekayi oota siddhavide.',
    english: 'Hot Jolada Rotti with stuffed brinjal ennegai meal is freshly prepared.',
    category: 'food',
  },
  {
    id: 'vp-3',
    kannada: 'ಇದು ಅಧಿಕೃತ ಗುಳೇದಗುಡ್ಡ ಖಣ ಕೈಮಗ್ಗ ಸೀರೆ, ಜಿಐ ಟ್ಯಾಗ್ ಪ್ರಮಾಣೀಕೃತ.',
    transliteration: 'Idu adhikrita Guledagudda khana kaimagga seere, GI tag pramanikrita.',
    english: 'This is authentic handloom Guledgudda Khun fabric, certified with GI Tag.',
    category: 'craft',
  },
  {
    id: 'vp-4',
    kannada: 'ಬಾದಾಮಿ ಗುಹಾಲಯಗಳು ಸಂಜೆ 6:00 ಗಂಟೆಗೆ ಮುಚ್ಚುತ್ತವೆ, ದಯವಿಟ್ಟು 5:30 ರೊಳಗೆ ಪ್ರವೇಶಿಸಿ.',
    transliteration: 'Badami guhalayagalu sanje 6 gantege mucchuttave, dayavittu 5:30 rolagae praveshisi.',
    english: 'Badami Cave Temples close at 6:00 PM; please enter before 5:30 PM.',
    category: 'timings',
  },
  {
    id: 'vp-5',
    kannada: 'ಆನ್ಲೈನ್ ಯುಪಿಐ (PhonePe/GPay) ಪಾವತಿ ಸ್ವೀಕರಿಸಲಾಗುತ್ತದೆ.',
    transliteration: 'Online UPI (PhonePe/GPay) pavati sveekarisalaguttade.',
    english: 'UPI digital payments (PhonePe/Google Pay/QR) are accepted here.',
    category: 'fare',
  },
  {
    id: 'vp-6',
    kannada: 'ಮಹಾಕೂಟ ತೀರ್ಥಯಾತ್ರೆಗೆ ನಮ್ಮ ಶಟಲ್ ಕ್ರೂಸರ್ ಲಭ್ಯವಿದೆ.',
    transliteration: 'Mahakuta teerthayatrege namma shuttle cruiser labhyavide.',
    english: 'Our shared shuttle cruiser is available for the Mahakuta pilgrimage corridor.',
    category: 'fare',
  },
];

// ----------------------------------------------------------------------
// 2. Verified Tourist Dialogue Starters
// ----------------------------------------------------------------------
export const TOURIST_PROMPT_SUGGESTIONS = [
  'How much is the shared auto fare to Pattadakal?',
  'Where can I find authentic Jolada Rotti meals nearby?',
  'Is photography allowed inside Cave 3?',
  'How do I respectfully greet temple elders in Badami?',
  'Which road leads to Mahakuta temple springs?',
];

// ----------------------------------------------------------------------
// 3. Badami Cave 3 Inscription Benchmark (Mangalesha, 578 CE)
// ----------------------------------------------------------------------
export const BADAMI_CAVE3_INSCRIPTION: InscriptionData = {
  title: 'Badami Cave No. 3 Pillar Foundation Inscription',
  monument: 'Badami Cave Temple 3 (Maha-Vishnu Sanctuary)',
  commissioner: 'King Mangalesha (Early Western Chalukya Dynasty)',
  date: 'Saka 500 (31 October 578 CE)',
  epigraphType: 'Epigraphical Halegannada (Old Kannada) & Classical Sanskrit',
  extractedHalegannada:
    'ಸ್ವಸ್ತಿ ಶ್ರೀಮತ್ ಚಳುಕ್ಯ ವಂಶೋದ್ಭವಃ ಶ್ರೀ ಕೀರ್ತಿವರ್ಮ ಪುಣ್ಯಪ್ರವರ್ಧನಾರ್ಥಂ ತಸ್ಯಾನುಜೇನ ಶ್ರೀ ಮಂಗಳೀಶೇನ ಮಹಾವಿಷ್ಣು ಭವನಮಿದಂ ನಿರ್ಮಿತಂ ಲಂಜೀಶ್ವರ ನಾಮ ಗ್ರಾಮಂ ಪ್ರಾಚೀಕರಣಾಯ ದತ್ತಂ ॥',
  romanizedText:
    'Svasti! Śrīmat Caḷukya-vaṁśodbhavaḥ Śrī Kīrtivarma-puṇyapravardhanārthaṁ tasyānujena Śrī Maṅgalīśena Mahāviṣṇu-bhavanamidaṁ nirmitaṁ Lañjīśvara-nāma-grāmaṁ prācīkaraṇāya dattaṁ ||',
  englishTranslation:
    'Hail! In the victorious lineage of the illustrious Chalukyas, for the expansion of religious merit of King Kirtivarman, his younger brother the glorious King Mangalesha caused this sublime rock-cut sanctuary of Maha-Vishnu to be carved, granting the perpetual revenues of the village of Lanjisvara for ritual upkeep and the feeding of Brahmin scholars.',
  historicalStory:
    'Commissioned on the auspicious full-moon day in 578 CE, Chalukya King Mangalesha dedicated this monumental cliff temple to Lord Vishnu as a tribute to his elder brother Kirtivarman I. Carved entirely out of Badami\'s monolithic sandstone cliff, it stands as the earliest firmly dated rock-cut temple inscription in Karnataka, marking the zenith of early Chalukyan stonecraft and epigraphy.',
  badge: 'Simulated Translation',
  dynastyContext: 'Badami Chalukya Golden Age (6th-8th Century CE)',
  locationDetails: 'Engraved on the outer eastern verandah stone pillar of Cave 3.',
};

// ----------------------------------------------------------------------
// 4. North Karnataka Tourist Context-Aware Dictionary Fallbacks
// ----------------------------------------------------------------------
export const KANNADA_TRANSLATION_MAP: Record<
  string,
  { kannada: string; transliteration: string; tip: string }
> = {
  fare: {
    kannada: 'ಪಟ್ಟದಕಲ್ಲು ತಲುಪಲು ಆಟೋ ಬಾಡಿಗೆ ಎಷ್ಟು?',
    transliteration: 'Pattadakallu talupalu auto badige eshtu?',
    tip: "Polite Tip: Start with 'Namaskara' (Hello). Drivers respond warmly when greeted respectfully.",
  },
  food: {
    kannada: 'ಇಲ್ಲಿ ಹತ್ತಿರದಲ್ಲಿ ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಜೋಳದ ರೊಟ್ಟಿ ಊಟ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?',
    transliteration: 'Illi hattiradalli shuddha sasyahari jolada rotti oota elli siguttade?',
    tip: "Culinary Tip: Ask for 'Bisi Jolada Rotti' (Hot Jowar bread) with 'Shenga Chutney' (Peanut relish).",
  },
  photo: {
    kannada: 'ಗುಹೆ ನಂಬರ್ 3 ರಲ್ಲಿ ಫೋಟೋ ತೆಗೆಯಲು ಅನುಮತಿ ಇದೆಯೇ?',
    transliteration: 'Guhe number 3 ralli photo tegeyalu anumati ideye?',
    tip: 'ASI Rule: Non-commercial phone photography is allowed; tripods and flash are restricted to protect pigments.',
  },
  greeting: {
    kannada: 'ನಮಸ್ಕಾರ! ನೀವು ಹೇಗಿದ್ದೀರಿ? ನನಗೆ ಇಲ್ಲಿ ದಾರಿ ತೋರಿಸಬಹುದೇ?',
    transliteration: 'Namaskara! Neevu hegiddiri? Nanage illi dari torisabahude?',
    tip: "Cultural Tip: Joining hands in 'Namaskara' is the most revered greeting in North Karnataka.",
  },
  mahakuta: {
    kannada: 'ಮಹಾಕೂಟ ದೇವಸ್ಥಾನದ ಬುಗ್ಗೆಗಳಿಗೆ ಹೋಗಲು ರಸ್ತೆ ಯಾವುದು?',
    transliteration: 'Mahakuta devasthanada buggegalige hogalu raste yavudu?',
    tip: 'Travel Tip: Mahakuta is 14 km from Badami; best visited during daylight hours.',
  },
  water: {
    kannada: 'ಕುಡಿಯುವ ನೀರು ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?',
    transliteration: 'Kudiyuva neeru elli siguttade?',
    tip: 'Eco Tip: Use reusable copper or steel bottles to keep Agastya Lake plastic-free.',
  },
  ticket: {
    kannada: 'ಪ್ರವೇಶ ಟಿಕೆಟ್ ಕೌಂಟರ್ ಎಲ್ಲಿದೆ?',
    transliteration: 'Pravesha ticket counter ellide?',
    tip: 'ASI Info: Online QR ticketing via ASI portal is 10% cheaper and saves queue time.',
  },
  timing: {
    kannada: 'ಗುಹಾಲಯಗಳು ಎಷ್ಟು ಗಂಟೆಗೆ ತೆರೆಯುತ್ತವೆ ಮತ್ತು ಮುಚ್ಚುತ್ತವೆ?',
    transliteration: 'Guhalayagalu eshtu gantege tereyuttave mattu mucchuttave?',
    tip: 'Timings: Open from sunrise (6:00 AM) to sunset (6:00 PM) daily.',
  },
  toilet: {
    kannada: 'ಹತ್ತಿರದಲ್ಲಿ ಸಾರ್ವಜನಿಕ ಶೌಚಾಲಯ ಎಲ್ಲಿದೆ?',
    transliteration: 'Hattiradalli sarvajanika shouchalaya ellide?',
    tip: 'Civic Grid: Clean ASI facilities are located near the parking area outside Cave 1.',
  },
  hotel: {
    kannada: 'ಇಲ್ಲಿ ಉಳಿದುಕೊಳ್ಳಲು ಒಳ್ಳೆಯ ಹೋಟೆಲ್ ಅಥವಾ ವಸತಿ ಗೃಹ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?',
    transliteration: 'Illi ulidukollalu olleya hotel athava vasati gruha elli siguttade?',
    tip: 'Stay Tip: KSTDC Mayura Chalukya and Station Road lodges offer reliable tourist lodging.',
  },
  bus: {
    kannada: 'ಬಸ್ ನಿಲ್ದಾಣಕ್ಕೆ ಹೋಗುವ ದಾರಿ ಯಾವುದು?',
    transliteration: 'Bus nildanakke hoguva dari yavudu?',
    tip: 'Transit Tip: Badami KSRTC/NWKRTC bus stand connects directly to Hubballi and Bagalkote.',
  },
  train: {
    kannada: 'ರೈಲ್ವೆ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ? ಆಟೋ ಸಿಗುತ್ತದೆಯೇ?',
    transliteration: 'Railway nildana ellide? Auto siguttadeye?',
    tip: 'Transit Tip: Badami Railway Station (BDM) is 4.5 km from the cave complex.',
  },
  hospital: {
    kannada: 'ಹತ್ತಿರದಲ್ಲಿ ಆಸ್ಪತ್ರೆ ಅಥವಾ ಔಷಧಿ ಅಂಗಡಿ ಎಲ್ಲಿದೆ?',
    transliteration: 'Hattiradalli aaspatre athava aushadhi angadi ellide?',
    tip: 'Emergency: Badami Taluk Government Hospital is situated on Station Road.',
  },
  saree: {
    kannada: 'ಅಧಿಕೃತ ಇಳಕಲ್ ಸೀರೆಗಳು ಮತ್ತು ಗುಳೇದಗುಡ್ಡ ಖಣ ಎಲ್ಲಿ ಖರೀದಿಸಬಹುದು?',
    transliteration: 'Adhikrita Ilkal seeregalu mattu Guledagudda khana elli kharidisabahudu?',
    tip: 'Artisan Tip: Look for the authentic Handloom Mark & GI certificate before purchasing.',
  },
  guide: {
    kannada: 'ಇಲ್ಲಿ ಪ್ರಮಾಣೀಕೃತ ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಗೈಡ್ ಸಿಗುತ್ತಾರೆಯೇ?',
    transliteration: 'Illi pramanikrita Kannada mattu English guide siguttareye?',
    tip: 'Guide Tip: Hire only ASI-badged guides wearing official photo credentials.',
  },
  atm: {
    kannada: 'ಹತ್ತಿರದಲ್ಲಿ ಎಟಿಎಂ ಅಥವಾ ಬ್ಯಾಂಕ್ ಎಲ್ಲಿದೆ?',
    transliteration: 'Hattiradalli ATM athava bank ellide?',
    tip: 'Cash Tip: SBI and Canara Bank ATMs are available near Badami Town Circle.',
  },
  thankyou: {
    kannada: 'ತುಂಬಾ ಧನ್ಯವಾದಗಳು, ನಮಸ್ಕಾರ-ರೀ!',
    transliteration: 'Tumba dhanyavadagalu, namaskara-ri!',
    tip: "Polite Tip: Ending with 'Ri' expresses warm North Karnataka gratitude.",
  },
};

// ----------------------------------------------------------------------
// 5. Intelligent Heuristic English -> Kannada Translation Engine
// ----------------------------------------------------------------------

const VOCAB_MAP: Record<string, { kn: string; rom: string }> = {
  water: { kn: 'ನೀರು', rom: 'neeru' },
  'drinking water': { kn: 'ಕುಡಿಯುವ ನೀರು', rom: 'kudiyuva neeru' },
  food: { kn: 'ಊಟ', rom: 'oota' },
  breakfast: { kn: 'ತಿಂಡಿ', rom: 'tindi' },
  tea: { kn: 'ಚಹಾ', rom: 'chaha' },
  coffee: { kn: 'ಕಾಫಿ', rom: 'coffee' },
  ticket: { kn: 'ಟಿಕೆಟ್', rom: 'ticket' },
  tickets: { kn: 'ಟಿಕೆಟ್', rom: 'ticket' },
  counter: { kn: 'ಕೌಂಟರ್', rom: 'counter' },
  hotel: { kn: 'ಹೋಟೆಲ್', rom: 'hotel' },
  lodge: { kn: 'ವಸತಿ', rom: 'vasati' },
  stay: { kn: 'ವಸತಿ', rom: 'vasati' },
  room: { kn: 'ಕೋಣೆ', rom: 'kone' },
  toilet: { kn: 'ಶೌಚಾಲಯ', rom: 'shouchalaya' },
  washroom: { kn: 'ಶೌಚಾಲಯ', rom: 'shouchalaya' },
  restroom: { kn: 'ಶೌಚಾಲಯ', rom: 'shouchalaya' },
  bathroom: { kn: 'ಶೌಚಾಲಯ', rom: 'shouchalaya' },
  bus: { kn: 'ಬಸ್', rom: 'bus' },
  'bus stand': { kn: 'ಬಸ್ ನಿಲ್ದಾಣ', rom: 'bus nildana' },
  'bus station': { kn: 'ಬಸ್ ನಿಲ್ದಾಣ', rom: 'bus nildana' },
  train: { kn: 'ರೈಲು', rom: 'railu' },
  'railway station': { kn: 'ರೈಲ್ವೆ ನಿಲ್ದಾಣ', rom: 'railway nildana' },
  auto: { kn: 'ಆಟೋ', rom: 'auto' },
  rickshaw: { kn: 'ಆಟೋ ರಿಕ್ಷಾ', rom: 'auto rickshaw' },
  fare: { kn: 'ಬಾಡಿಗೆ', rom: 'badige' },
  price: { kn: 'ಬೆಲೆ', rom: 'bele' },
  cost: { kn: 'ವೆಚ್ಚ', rom: 'veccha' },
  caves: { kn: 'ಗುಹೆಗಳು', rom: 'guhegalu' },
  'cave 1': { kn: 'ಗುಹೆ ನಂಬರ್ 1', rom: 'guhe number 1' },
  'cave 2': { kn: 'ಗುಹೆ ನಂಬರ್ 2', rom: 'guhe number 2' },
  'cave 3': { kn: 'ಗುಹೆ ನಂಬರ್ 3', rom: 'guhe number 3' },
  'cave 4': { kn: 'ಗುಹೆ ನಂಬರ್ 4', rom: 'guhe number 4' },
  temple: { kn: 'ದೇವಸ್ಥಾನ', rom: 'devasthana' },
  lake: { kn: 'ಕೆರೆ', rom: 'kere' },
  'agastya lake': { kn: 'ಅಗಸ್ತ್ಯ ಕೆರೆ', rom: 'Agastya kere' },
  fort: { kn: 'ಕೋಟೆ', rom: 'kote' },
  pattadakal: { kn: 'ಪಟ್ಟದಕಲ್ಲು', rom: 'Pattadakallu' },
  aihole: { kn: 'ಐಹೊಳೆ', rom: 'Aihole' },
  mahakuta: { kn: 'ಮಹಾಕೂಟ', rom: 'Mahakuta' },
  banashankari: { kn: 'ಬನಶಂಕರಿ', rom: 'Banashankari' },
  badami: { kn: 'ಬಾದಾಮಿ', rom: 'Badami' },
  saree: { kn: 'ಸೀರೆ', rom: 'seere' },
  sarees: { kn: 'ಸೀರೆಗಳು', rom: 'seeregalu' },
  cloth: { kn: 'ಬಟ್ಟೆ', rom: 'batte' },
  weavers: { kn: 'ನೇಕಾರರು', rom: 'nekararu' },
  shop: { kn: 'ಅಂಗಡಿ', rom: 'angadi' },
  market: { kn: 'ಮಾರುಕಟ್ಟೆ', rom: 'marukatte' },
  hospital: { kn: 'ಆಸ್ಪತ್ರೆ', rom: 'aaspatre' },
  doctor: { kn: 'ವೈದ್ಯರು', rom: 'vaidyaru' },
  medicine: { kn: 'ಔಷಧಿ', rom: 'aushadhi' },
  pharmacy: { kn: 'ಔಷಧಿ ಅಂಗಡಿ', rom: 'aushadhi angadi' },
  police: { kn: 'ಪೊಲೀಸ್', rom: 'police' },
  guide: { kn: 'ಮಾರ್ಗದರ್ಶಿ (ಗೈಡ್)', rom: 'margadarshi (guide)' },
  atm: { kn: 'ಎಟಿಎಂ', rom: 'ATM' },
  bank: { kn: 'ಬ್ಯಾಂಕ್', rom: 'bank' },
  money: { kn: 'ಹಣ', rom: 'hana' },
  cash: { kn: 'ನಗದು', rom: 'nagadu' },
  photo: { kn: 'ಫೋಟೋ', rom: 'photo' },
  photography: { kn: 'ಫೋಟೋಗ್ರಫಿ', rom: 'photography' },
  entry: { kn: 'ಪ್ರವೇಶ', rom: 'pravesha' },
  timing: { kn: 'ಸಮಯ', rom: 'samaya' },
  timings: { kn: 'ಸಮಯ', rom: 'samaya' },
  time: { kn: 'ಸಮಯ', rom: 'samaya' },
  road: { kn: 'ರಸ್ತೆ', rom: 'raste' },
  way: { kn: 'ದಾರಿ', rom: 'dari' },
};

/**
 * Robust rule-based translation fallback when network LLM is offline.
 * Produces genuine Kannada sentences with zero left-over raw English.
 */
export function heuristicTranslateEnglishToKannada(rawText: string): {
  kannada: string;
  transliteration: string;
  tip: string;
} {
  const text = rawText.trim().toLowerCase();

  // 1. Direct topic match from dictionary
  if (text.includes('water')) return KANNADA_TRANSLATION_MAP.water;
  if (text.includes('ticket') || text.includes('entry fee') || text.includes('pass')) return KANNADA_TRANSLATION_MAP.ticket;
  if (text.includes('fare') || text.includes('auto') || text.includes('rickshaw')) return KANNADA_TRANSLATION_MAP.fare;
  if (text.includes('food') || text.includes('rotti') || text.includes('meal') || text.includes('eat') || text.includes('lunch') || text.includes('dinner')) return KANNADA_TRANSLATION_MAP.food;
  if (text.includes('photo') || text.includes('camera') || text.includes('video')) return KANNADA_TRANSLATION_MAP.photo;
  if (text.includes('toilet') || text.includes('washroom') || text.includes('restroom') || text.includes('latrine')) return KANNADA_TRANSLATION_MAP.toilet;
  if (text.includes('hotel') || text.includes('lodge') || text.includes('stay') || text.includes('room')) return KANNADA_TRANSLATION_MAP.hotel;
  if (text.includes('bus') || text.includes('ksrtc') || text.includes('nwkrtc')) return KANNADA_TRANSLATION_MAP.bus;
  if (text.includes('train') || text.includes('railway') || text.includes('station')) return KANNADA_TRANSLATION_MAP.train;
  if (text.includes('hospital') || text.includes('doctor') || text.includes('medicine') || text.includes('pharmacy')) return KANNADA_TRANSLATION_MAP.hospital;
  if (text.includes('saree') || text.includes('weaver') || text.includes('handloom') || text.includes('khun') || text.includes('khana') || text.includes('ilkal')) return KANNADA_TRANSLATION_MAP.saree;
  if (text.includes('time') || text.includes('timing') || text.includes('open') || text.includes('close')) return KANNADA_TRANSLATION_MAP.timing;
  if (text.includes('guide')) return KANNADA_TRANSLATION_MAP.guide;
  if (text.includes('atm') || text.includes('bank') || text.includes('cash') || text.includes('money')) return KANNADA_TRANSLATION_MAP.atm;
  if (text.includes('thank') || text.includes('thanks')) return KANNADA_TRANSLATION_MAP.thankyou;
  if (text.includes('mahakuta')) return KANNADA_TRANSLATION_MAP.mahakuta;
  if (text.includes('hello') || text.includes('hi') || text.includes('greet') || text.includes('how are you')) return KANNADA_TRANSLATION_MAP.greeting;

  // 2. Synthesize sentence from vocabulary detection
  // Detect primary subject
  let subjectKn = 'ಈ ಸ್ಥಳ';
  let subjectRom = 'ee sthala';

  for (const [key, val] of Object.entries(VOCAB_MAP)) {
    if (text.includes(key)) {
      subjectKn = val.kn;
      subjectRom = val.rom;
      break;
    }
  }

  // Question intent detection
  if (text.includes('where is') || text.includes('where are') || text.includes('where can')) {
    return {
      kannada: `ದಯವಿಟ್ಟು ತಿಳಿಸಿ, ${subjectKn} ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?`,
      transliteration: `Dayavittu thilisi, ${subjectRom} elli siguttade?`,
      tip: "Courtesy Tip: Asking with 'Dayavittu' (Please) ensures locals guide you with great warmth.",
    };
  }

  if (text.includes('how much') || text.includes('what is the price') || text.includes('cost')) {
    return {
      kannada: `ನಮಸ್ಕಾರ, ${subjectKn} ಬೆಲೆ ಅಥವಾ ಬಾಡಿಗೆ ಎಷ್ಟು?`,
      transliteration: `Namaskara, ${subjectRom} bele athava badige eshtu?`,
      tip: "Market Tip: Always confirm prices before boarding autos or purchasing unmetered goods.",
    };
  }

  if (text.includes('how to go') || text.includes('how do i reach') || text.includes('way to') || text.includes('direction')) {
    return {
      kannada: `ನಮಸ್ಕಾರ-ರೀ, ${subjectKn} ಗೆ ಹೋಗಲು ದಾರಿ ಯಾವುದು?`,
      transliteration: `Namaskara-ri, ${subjectRom} ge hogalu dari yavudu?`,
      tip: "Route Tip: Most central heritage sites are within 2–5 km radius of Badami lake.",
    };
  }

  if (text.includes('when') || text.includes('time')) {
    return {
      kannada: `ನಮಸ್ಕಾರ, ${subjectKn} ಸಮಯ ಎಷ್ಟು ಗಂಟೆಗೆ?`,
      transliteration: `Namaskara, ${subjectRom} samaya eshtu gantege?`,
      tip: "Timing Tip: Cave temples are best visited early in the morning for soft natural light.",
    };
  }

  if (text.includes('is it allowed') || text.includes('can i') || text.includes('permission')) {
    return {
      kannada: `ದಯವಿಟ್ಟು ಹೇಳಿ, ಇಲ್ಲಿ ${subjectKn} ಅನುಮತಿ ಇದೆಯೇ?`,
      transliteration: `Dayavittu heli, illi ${subjectRom} anumati ideye?`,
      tip: "Monument Rule: Respect protected heritage guidelines posted at ASI ticket counters.",
    };
  }

  // Universal fallback with pure Kannada phrasing (No raw English words)
  return {
    kannada: `ನಮಸ್ಕಾರ-ರೀ! ನನಗೆ ಈ ಬಗ್ಗೆ ಮಾಹಿತಿ ನೀಡಿ: ${subjectKn} ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?`,
    transliteration: `Namaskara-ri! Nanage ee bagge mahiti needi: ${subjectRom} elli siguttade?`,
    tip: "Polite Tip: Start your question with 'Namaskara-ri' for the friendliest local response in Badami.",
  };
}

