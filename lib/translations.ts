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
};
