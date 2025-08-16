
import { Timestamp } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';


export type Page = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft';
  showInMenu: boolean;
  menuOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  deletedAt?: Timestamp | null;
};

export type HomePageSettings = {
  heroImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonLabel: string;
  heroButtonLink: string;
}

export type SocialLinkPlatform = 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube';

export type SocialLink = {
    id: string;
    platform: SocialLinkPlatform;
    url: string;
};

export type FooterLink = {
    id: string;
    label: string;
    url: string;
}

export type GlobalSettings = {
    siteTitle: string;
    logoUrl: string;
    faviconUrl: string;
    searchEngineVisibility: boolean;
    footerDescription: string;
    quickLinks: {
        title: string;
        links: FooterLink[];
    };
    supportLinks: {
        title: string;
        links: FooterLink[];
    };
    socialLinks: SocialLink[];
    googleMapEmbedCode: string;
};

export type FaqItem = {
    id: string;
    question: string;
    answer: string;
}

export type SitePagesSettings = {
    aboutUs: {
        title: string;
        content: string;
    };
    faq: {
        title: string;
        items: FaqItem[];
    };
    terms: {
        title: string;
        content: string;
    };
    privacy: {
        title: string;
        content: string;
    };
}

export type GalleryImage = {
  url: string;
  hint?: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImageUrl: string;
  featuredImageHint?: string;
  galleryImages?: GalleryImage[];
  authorId: string;
  publishedAt: string; // ISO date string
  videoUrl?: string;
  categoryId?: string;
  deletedAt?: Timestamp | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Package = {
  id: string;
  slug: string;
  title: string;
  type: string;
  destination: string;
  duration: number; // in days
  price: number;
  rating: number;
  imageUrl: string;
  imageHint?: string;
  galleryImages?: GalleryImage[];
  videoUrl?: string; // Optional video URL
  description: string;
  itinerary: { day: string; title: string; details: string }[];
  inclusions: string[];
  exclusions: string[];
  deletedAt?: Timestamp | null;
};

export type Destination = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

export type PackageType = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

export type Booking = {
    id: string;
    packageId: string;
    packageName: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    travelers: number;
    departureDate: string; // ISO date string
    bookingDate: string; // ISO date string
    status: 'Pending' | 'Confirmed' | 'Cancelled';
    deletedAt?: Timestamp | null;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string; // ISO date string
  isRead: boolean;
  deletedAt?: Timestamp | null;
};

export type MediaType = "image" | "video" | "pdf" | "file";

export type MediaFile = {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  size: string;
  uploadedAt: Timestamp;
  modifiedAt?: Timestamp;
  altText?: string;
  deletedAt?: Timestamp | null;
  dataAiHint?: string;
};

// Default settings as a fallback, used by getGlobalSettings
const defaultSettings: GlobalSettings = {
    siteTitle: "TripMate",
    logoUrl: "/logo.svg",
    faviconUrl: "/favicon.svg",
    searchEngineVisibility: true,
    footerDescription: "Your adventure starts here. Discover breathtaking destinations with us.",
    quickLinks: {
        title: "Quick Links",
        links: []
    },
    supportLinks: {
        title: "Support",
        links: []
    },
    socialLinks: [],
    googleMapEmbedCode: ''
};


// New server-side function to fetch global settings
export async function getGlobalSettings(): Promise<GlobalSettings> {
  try {
    const db = getFirestore(getFirebaseApp());
    const settingsDoc = await getDoc(doc(db, "settings", "global"));
    if (settingsDoc.exists()) {
      // Combine fetched data with defaults to ensure all keys are present
      return { ...defaultSettings, ...settingsDoc.data() } as GlobalSettings;
    }
    return defaultSettings;
  } catch (error) {
    console.error("Could not fetch settings, using defaults.", error);
    // In case of error (e.g., during build time if Firebase isn't available), return defaults
    return defaultSettings;
  }
}


export const destinations: Destination[] = [
    { id: "dest-1", name: "Paris, France", slug: "paris-france", imageUrl: "https://images.pexels.com/photos/2363/mont-saint-michel-france-normandy-europe.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    { id: "dest-2", name: "Makkah & Madinah, Saudi Arabia", slug: "makkah-madinah-saudi-arabia", imageUrl: "https://images.pexels.com/photos/1683543/pexels-photo-1683543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    { id: "dest-3", name: "Tokyo, Japan", slug: "tokyo-japan", imageUrl: "https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    { id: "dest-4", name: "Rome, Italy", slug: "rome-italy", imageUrl: "https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    { id: "dest-5", name: "Istanbul, Turkey", slug: "istanbul-turkey", imageUrl: "https://images.pexels.com/photos/1549326/pexels-photo-1549326.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    { id: "dest-6", name: "Switzerland", slug: "switzerland", imageUrl: "https://images.pexels.com/photos/772429/pexels-photo-772429.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    { id: "dest-7", name: "Maldives", slug: "maldives", imageUrl: "https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
]

export const packageTypes: PackageType[] = [
    { id: "type-1", name: "Tour", slug: "tour", imageUrl: "https://images.pexels.com/photos/3889855/pexels-photo-3889855.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    { id: "type-2", name: "Hajj", slug: "hajj", imageUrl: "https://images.pexels.com/photos/8947610/pexels-photo-8947610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
    { id: "type-3", name: "Umrah", slug: "umrah", imageUrl: "https://images.pexels.com/photos/10787728/pexels-photo-10787728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" },
]


export const packages: Omit<Package, 'deletedAt'>[] = [
  {
    id: "paris-dream-tour",
    slug: "paris-dream-tour",
    title: "Parisian Dream Tour",
    type: "Tour",
    destination: "Paris, France",
    duration: 7,
    price: 180000,
    rating: 4.8,
    imageUrl: "https://images.pexels.com/photos/1125212/pexels-photo-1125212.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    imageHint: "paris eiffel tower",
    galleryImages: [
        { url: 'https://images.pexels.com/photos/2082101/pexels-photo-2082101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'louvre museum exterior' },
        { url: 'https://images.pexels.com/photos/2363/mont-saint-michel-france-normandy-europe.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'mont saint michel' }
    ],
    videoUrl: "https://youtube.com/watch?v=6WJc3PL9yYI",
    description: "Experience the magic of Paris, from the Eiffel Tower to the charming streets of Montmartre. This tour is a perfect blend of art, culture, and romance, offering an unforgettable journey through the City of Lights. Walk along the Seine, indulge in delicious pastries, and create memories that will last a lifetime.",
    itinerary: [
      { day: "1", title: "Arrival in Paris", details: "Check into your hotel and enjoy a welcome dinner cruise on the Seine River, witnessing the city's landmarks sparkle at night." },
      { day: "2", title: "Iconic Landmarks", details: "Visit the Eiffel Tower for breathtaking views, then proceed to the Arc de Triomphe and walk down the famous Champs-Élysées." },
      { day: "3", title: "Art & Culture", details: "Explore the Louvre Museum and see world-famous masterpieces. Enjoy an afternoon stroll in the Tuileries Garden." },
      { day: "4", title: "Versailles Palace", details: "A full-day trip to the magnificent Palace of Versailles. Explore the Hall of Mirrors, the King's Grand Apartments, and the stunning gardens designed by Le Nôtre." },
      { day: "5", title: "Montmartre & Sacré-Cœur", details: "Discover the artistic heart of Paris in Montmartre, watch artists at work in Place du Tertre, and visit the beautiful Sacré-Cœur Basilica." },
      { day: "6", title: "Shopping & Leisure", details: "Free day for shopping at Galeries Lafayette, exploring hidden streets, or revisiting your favorite spot. An optional cooking class is available." },
      { day: "7", title: "Departure", details: "Enjoy a final Parisian breakfast with fresh croissants and coffee before heading to the airport for your departure." },
    ],
    inclusions: ["6 nights 4-star hotel", "Airport transfers", "Guided tours with skip-the-line tickets", "Seine River dinner cruise", "Breakfast daily"],
    exclusions: ["International flights", "Lunches & Dinners (except as noted)", "Visa fees", "Personal expenses"],
  },
  {
    id: "premium-hajj-package",
    slug: "premium-hajj-package",
    title: "Premium Hajj Package",
    type: "Hajj",
    destination: "Makkah & Madinah, Saudi Arabia",
    duration: 21,
    price: 850000,
    rating: 5.0,
    imageUrl: "https://images.pexels.com/photos/8947610/pexels-photo-8947610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    imageHint: "Kaaba Mecca",
    galleryImages: [
        { url: 'https://images.pexels.com/photos/10787728/pexels-photo-10787728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'prophet mosque Madinah' },
        { url: 'https://images.pexels.com/photos/5436662/pexels-photo-5436662.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'pilgrims praying' },
        { url: 'https://images.pexels.com/photos/14493979/pexels-photo-14493979.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'madinah mosque interior' },
    ],
    videoUrl: "https://youtube.com/watch?v=6WJc3PL9yYI",
    description: "Perform the sacred pilgrimage of Hajj with utmost comfort and peace of mind. Our premium package includes 5-star hotels near the Haramain, dedicated scholarly guidance, and private transportation to ensure a focused and spiritually uplifting journey.",
    itinerary: [
      { day: "1-10", title: "Stay in Makkah", details: "Perform Umrah upon arrival. Days dedicated to Ibadah in Masjid al-Haram, with your 5-star hotel just steps away. Attend daily lectures and spiritual reminders." },
      { day: "11-15", title: "The Days of Hajj (Manasik)", details: "Guided transportation and full support through the rituals of Mina, Arafat, and Muzdalifah. Stay in upgraded, air-conditioned tents in Mina." },
      { day: "16-20", title: "Stay in Madinah", details: "Travel to Madinah via high-speed train. Stay in a 5-star hotel with direct views of Masjid an-Nabawi. Includes guided Ziyarat tours to historical sites." },
      { day: "21", title: "Departure", details: "Enjoy a final prayer in the Prophet's Mosque before departing from Madinah airport." },
    ],
    inclusions: ["5-Star Hotels in Makkah & Madinah", "Hajj visa processing", "All ground transport in private buses", "Guided Hajj rituals with a qualified scholar", "Full Board (Breakfast, Lunch, Dinner)"],
    exclusions: ["International flights", "Hajj ministry fees (if any)", "Personal expenses & shopping"],
  },
  {
    id: "economy-umrah-package",
    slug: "economy-umrah-package",
    title: "Economy Umrah Package",
    type: "Umrah",
    destination: "Makkah & Madinah, Saudi Arabia",
    duration: 10,
    price: 120000,
    rating: 4.5,
    imageUrl: "https://images.pexels.com/photos/1683543/pexels-photo-1683543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    imageHint: "kaaba mecca pilgrimage",
    videoUrl: "https://youtube.com/watch?v=6WJc3PL9yYI",
    description: "An affordable, well-organized package to fulfill your spiritual journey of Umrah. This package includes clean, comfortable hotels and reliable group ground transportation, allowing you to focus on your prayers and supplications.",
    itinerary: [
      { day: "1-5", title: "Stay in Makkah", details: "Arrival in Jeddah and transfer to your hotel in Makkah. Perform Umrah with our group leader. Dedicated time for prayers and personal Ibadah." },
      { day: "6-9", title: "Stay in Madinah", details: "Travel to Madinah via an air-conditioned bus. Check into your hotel and spend time in Masjid an-Nabawi, sending salutations upon the Prophet (PBUH)." },
      { day: "10", title: "Departure", details: "Transfer to Madinah or Jeddah airport for your flight home, with your spiritual batteries recharged." },
    ],
    inclusions: ["Clean 3-Star Hotels (walking distance)", "Umrah visa processing", "Jeddah-Makkah-Madinah transport", "Guidance from a group leader"],
    exclusions: ["Flights", "Meals", "Optional Ziyarat tours"],
  },
   {
    id: "tokyo-tech-tradition",
    slug: "tokyo-tech-tradition",
    title: "Tokyo: Tech & Tradition",
    type: "Tour",
    destination: "Tokyo, Japan",
    duration: 8,
    price: 250000,
    rating: 4.9,
    imageUrl: "https://images.pexels.com/photos/1684933/pexels-photo-1684933.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    imageHint: "Tokyo sensoji temple",
    galleryImages: [
        { url: 'https://images.pexels.com/photos/402028/pexels-photo-402028.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'fushimi inari shrine' },
        { url: 'https://images.pexels.com/photos/236111/pexels-photo-236111.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'shibuya crossing' },
        { url: 'https://images.pexels.com/photos/672358/pexels-photo-672358.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'bamboo forest arashiyama' },
    ],
    videoUrl: "https://youtube.com/watch?v=6WJc3PL9yYI",
    description: "Explore the vibrant contrast of Tokyo, from ancient temples to futuristic skyscrapers. This journey through Japan's dynamic capital offers a deep dive into its culture, cuisine, and cutting-edge technology.",
    itinerary: [
        { day: "1", title: "Arrival in Tokyo", details: "Arrive at Narita/Haneda Airport and transfer to your hotel in the lively Shinjuku district. Enjoy an evening orientation walk." },
        { day: "2", title: "Modern Tokyo Wonders", details: "Witness the iconic Shibuya Crossing, explore the trendy Takeshita Street in Harajuku, and find peace at the serene Meiji Shrine." },
        { day: "3", title: "Asakusa & Sumida River", details: "Explore Asakusa's Senso-ji Temple and the traditional Nakamise-dori street, followed by a relaxing cruise on the Sumida River." },
        { day: "4", title: "Day Trip to Hakone", details: "Enjoy stunning views of Mount Fuji from the Hakone Ropeway, a cruise on Lake Ashi, and a visit to the Hakone Open-Air Museum." },
        { day: "5", title: "Art, Anime & Tech", details: "Visit the Ghibli Museum (tickets subject to availability) for a touch of magic, then dive into the electronic and anime hub of Akihabara Electric Town." },
        { day: "6", title: "Culinary Tour", details: "Experience an authentic sushi-making class with a master chef and explore the bustling food stalls of the famous Tsukiji Outer Market." },
        { day: "7", title: "Free Day for Exploration", details: "Explore Tokyo at your own leisure. We provide a list of recommended activities, from visiting the Imperial Palace to exploring the Ginza district." },
        { day: "8", title: "Departure", details: "Enjoy a final Japanese breakfast before your transfer to the airport for your flight home." },
    ],
    inclusions: ["7 nights accommodation", "Airport transfers", "7-day Japan Rail Pass", "Guided tours on specified days", "Sushi making class"],
    exclusions: ["International flights", "Most meals", "Ghibli Museum ticket fee", "Personal expenses"],
  },
   {
    id: "roman-holiday",
    slug: "roman-holiday",
    title: "The Roman Holiday",
    type: "Tour",
    destination: "Rome, Italy",
    duration: 5,
    price: 150000,
    rating: 4.7,
    imageUrl: "https://images.pexels.com/photos/208723/pexels-photo-208723.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    imageHint: "Rome Colosseum",
    galleryImages: [
        { url: 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'colosseum interior' },
        { url: 'https://images.pexels.com/photos/753639/pexels-photo-753639.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'trevi fountain' },
        { url: 'https://images.pexels.com/photos/2249959/pexels-photo-2249959.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'vatican city square' }
    ],
    videoUrl: "https://youtube.com/watch?v=6WJc3PL9yYI",
    description: "Step back in time and walk in the footsteps of emperors and gladiators. Discover the ancient wonders, Renaissance art, and vibrant culture of the Eternal City, Rome. This short, immersive trip is perfect for first-time visitors.",
    itinerary: [
        { day: "1", title: "Benvenuti a Roma!", details: "Arrive in Rome, transfer to your charming hotel, and enjoy a traditional Italian welcome dinner in the Trastevere neighborhood." },
        { day: "2", title: "Ancient Rome Explored", details: "A comprehensive guided tour of the Colosseum, the Roman Forum, and Palatine Hill, where the city was founded." },
        { day: "3", title: "Vatican City Wonders", details: "Explore St. Peter's Basilica, St. Peter's Square, and the vast Vatican Museums, culminating in the awe-inspiring Sistine Chapel." },
        { day: "4", title: "Art, Fountains & Food", details: "Visit the architectural marvel of the Pantheon, toss a coin in the Trevi Fountain, and climb the Spanish Steps. Enjoy an authentic gelato tasting class." },
        { day: "5", title: "Arrivederci Roma", details: "Enjoy a final cappuccino and cornetto at a local cafe before departing for the airport." },
    ],
    inclusions: ["4 nights hotel in central Rome", "Airport transfers", "Guided tours with skip-the-line tickets", "Welcome dinner & gelato tasting", "Daily breakfast"],
    exclusions: ["Flights", "City taxes (paid locally)", "Lunches & other dinners"],
  },
  {
    id: "istanbul-crossroads",
    slug: "istanbul-crossroads",
    title: "Istanbul: Crossroads of Continents",
    type: "Tour",
    destination: "Istanbul, Turkey",
    duration: 6,
    price: 135000,
    rating: 4.6,
    imageUrl: "https://images.pexels.com/photos/3978518/pexels-photo-3978518.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    imageHint: "Istanbul hagia sophia",
    galleryImages: [
        { url: 'https://images.pexels.com/photos/1549326/pexels-photo-1549326.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'blue mosque' },
        { url: 'https://images.pexels.com/photos/2245436/pexels-photo-2245436.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'turkish lanterns bazaar' },
        { url: 'https://images.pexels.com/photos/262963/pexels-photo-262963.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'turkish tea' }
    ],
    videoUrl: "https://youtube.com/watch?v=6WJc3PL9yYI",
    description: "Discover the city where East meets West. Explore historic mosques, bustling bazaars, magnificent palaces, and savor delicious Turkish cuisine. This tour immerses you in the vibrant culture and rich history of Istanbul.",
    itinerary: [
        { day: "1", title: "Welcome to Istanbul", details: "Arrive and transfer to your hotel in the historic Sultanahmet district. Enjoy a welcome tea and briefing." },
        { day: "2", title: "Byzantine & Ottoman Relics", details: "Visit the Hagia Sophia, the stunning Blue Mosque, the ancient Roman Hippodrome, and the Basilica Cistern." },
        { day: "3", title: "Palaces & Bazaars", details: "Explore the opulent Topkapi Palace, former home of Ottoman sultans, and get lost in the labyrinthine alleys of the Grand Bazaar." },
        { day: "4", title: "Bosphorus Cruise & Spices", details: "Enjoy a scenic cruise on the Bosphorus strait, dividing Europe and Asia. Afterward, delight your senses at the aromatic Spice Bazaar." },
        { day: "5", title: "Modern Istanbul & Art", details: "Explore the vibrant neighborhoods of Karakoy and Galata. Walk down Istiklal Avenue and visit a modern art gallery." },
        { day: "6", title: "Departure", details: "Enjoy a final Turkish coffee and some baklava before heading to the airport for your flight." },
    ],
    inclusions: ["5 nights accommodation", "Airport transfers", "All guided tours mentioned", "Bosphorus cruise ticket", "Daily breakfast"],
    exclusions: ["International flights", "Turkish Visa fees", "Lunches & Dinners"],
  },
  {
    id: "swiss-alps-adventure",
    slug: "swiss-alps-adventure",
    title: "Swiss Alps Adventure",
    type: "Tour",
    destination: "Switzerland",
    duration: 8,
    price: 320000,
    rating: 4.9,
    imageUrl: "https://images.pexels.com/photos/1131458/pexels-photo-1131458.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    imageHint: "swiss alps village",
    videoUrl: "https://youtube.com/watch?v=6WJc3PL9yYI",
    description: "Embark on a breathtaking journey through the Swiss Alps. Experience stunning mountain scenery, pristine lakes, and charming alpine villages. This tour is a perfect mix of nature, adventure, and relaxation.",
    itinerary: [
      { day: "1", title: "Arrival in Zurich", details: "Arrive in Zurich, transfer to your hotel, and explore the beautiful lakeside city at your leisure." },
      { day: "2", title: "Lucerne & Mount Pilatus", details: "Travel to Lucerne, enjoy a boat trip on Lake Lucerne, and take the world's steepest cogwheel railway up to Mount Pilatus for panoramic views." },
      { day: "3", title: "Interlaken, Adventure Capital", details: "Journey to Interlaken, nestled between two lakes. Enjoy an afternoon of optional adventure sports like paragliding or simply enjoy the view." },
      { day: "4", title: "Top of Europe - Jungfraujoch", details: "Take a scenic train ride to Jungfraujoch, the highest railway station in Europe. Explore the Ice Palace and stand on the Sphinx Observatory." },
      { day: "5", title: "Zermatt & the Matterhorn", details: "Travel to the car-free village of Zermatt, with stunning views of the iconic Matterhorn peak. Enjoy a peaceful evening in the village." },
      { day: "6", title: "Gornergrat Railway", details: "Ride the Gornergrat railway for what is considered one of the best views of the Matterhorn and the surrounding 29 peaks." },
      { day: "7", title: "Return to Zurich", details: "Enjoy a final scenic train journey back to Zurich. Farewell dinner at a traditional Swiss restaurant featuring cheese fondue." },
      { day: "8", title: "Departure", details: "Transfer to Zurich Airport for your departure, filled with memories of the majestic Alps." },
    ],
    inclusions: ["7 nights accommodation in 4-star hotels", "8-day Swiss Travel Pass for all transport", "Excursions to Mount Pilatus and Jungfraujoch", "Daily breakfast and farewell dinner"],
    exclusions: ["International flights", "Lunches and most dinners", "Optional activities and excursions"],
  },
  {
    id: "maldives-getaway",
    slug: "maldives-getaway",
    title: "Maldives Luxury Getaway",
    type: "Tour",
    destination: "Maldives",
    duration: 5,
    price: 280000,
    rating: 5.0,
    imageUrl: "https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    imageHint: "maldives bungalow water",
    videoUrl: "https://youtube.com/watch?v=6WJc3PL9yYI",
    description: "Escape to paradise with a luxurious stay in an overwater bungalow in the Maldives. Enjoy crystal-clear turquoise waters, white sandy beaches, and ultimate relaxation in one of the world's most beautiful destinations.",
    itinerary: [
      { day: "1", title: "Arrival in Paradise", details: "Arrive at Malé International Airport and take a scenic seaplane transfer to your luxurious private island resort." },
      { day: "2", title: "Snorkeling & Water Sports", details: "Explore the vibrant house reef with a guided snorkeling tour. Enjoy complimentary non-motorized water sports like kayaking and paddleboarding." },
      { day: "3", title: "Spa & Ultimate Relaxation", details: "Indulge in a rejuvenating couple's spa treatment or simply relax on your private sun deck, dipping into the ocean whenever you please." },
      { day: "4", title: "Sunset Dolphin Cruise", details: "Embark on a romantic sunset cruise on a traditional dhoni boat and watch playful dolphins in their natural habitat as the sun paints the sky." },
      { day: "5", title: "Departure", details: "Enjoy a final leisurely breakfast in paradise before your seaplane transfer back to Malé for your departure." },
    ],
    inclusions: ["4 nights in a premium overwater bungalow", "Roundtrip seaplane transfers", "Full board (breakfast, lunch, and dinner) at select restaurants", "Sunset dolphin cruise", "Complimentary snorkeling equipment"],
    exclusions: ["International flights", "Beverages and alcoholic drinks", "Optional excursions and spa treatments", "Motorized water sports"],
  },
];

export const categories: Category[] = [
  { id: 'cat-1', name: 'Travel Tips', slug: 'travel-tips' },
  { id: 'cat-2', name: 'Spiritual Journeys', slug: 'spiritual-journeys' },
  { id: 'cat-3', name: 'City Guides', slug: 'city-guides' },
  { id: 'cat-4', name: 'Food & Drink', slug: 'food-drink' },
];

export const posts: Omit<Post, 'deletedAt'>[] = [
  {
    id: 'post-1',
    slug: '10-essential-tips-for-your-first-trip-to-japan',
    title: '10 Essential Tips for Your First Trip to Japan',
    content: 'Japan is a country of amazing contrasts, blending ancient traditions with futuristic technology. To help you navigate your first adventure in the Land of the Rising Sun, we\'ve compiled 10 essential tips. From mastering the incredibly efficient railway system (and why a JR Pass is a must-have) to understanding basic etiquette like bowing and handling money, we\'ve got you covered. Don\'t forget to try the authentic ramen from a local shop - it\'s an experience in itself! We also touch on navigating the bustling cities, finding tranquility in temples, and the convenience of 7-Eleven stores for everything from snacks to ATM withdrawals that accept foreign cards.',
    featuredImageUrl: 'https://images.pexels.com/photos/364096/pexels-photo-364096.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    featuredImageHint: 'tokyo street night',
    galleryImages: [
        { url: 'https://images.pexels.com/photos/402028/pexels-photo-402028.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'fushimi inari shrine' },
        { url: 'https://images.pexels.com/photos/236111/pexels-photo-236111.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'shibuya crossing' },
        { url: 'https://images.pexels.com/photos/672358/pexels-photo-672358.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'bamboo forest arashiyama' },
        { url: 'https://images.pexels.com/photos/37719/sushi-food-salmon-rice-37719.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'sushi platter' },
    ],
    authorId: 'user-2-admin', // Reference to Admin User
    publishedAt: '2024-05-15T10:00:00Z',
    videoUrl: 'https://youtube.com/watch?v=6WJc3PL9yYI',
    categoryId: 'cat-1',
  },
  {
    id: 'post-2',
    slug: 'a-pilgrims-guide-preparing-for-umrah',
    title: 'A Pilgrim\'s Guide: Preparing for a Meaningful Umrah',
    content: 'Performing Umrah is a profound spiritual experience for Muslims worldwide. This guide covers the essential rituals, preparations, and practical advice for a meaningful pilgrimage to the holy cities of Makkah and Madinah. We explain the spiritual significance and practical steps of entering the state of Ihram, performing the Tawaf around the Kaaba, and completing the Sa\'i between Safa and Marwah. Learn about the best times to go, what to pack (hint: less is more), and how to maintain focus and devotion throughout your journey to make it a spiritually fulfilling and accepted act of worship.',
    featuredImageUrl: 'https://images.pexels.com/photos/1683543/pexels-photo-1683543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    featuredImageHint: 'kaaba mecca pilgrimage',
    galleryImages: [
        { url: 'https://images.pexels.com/photos/1540322/pexels-photo-1540322.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'prayer beads quran' },
        { url: 'https://images.pexels.com/photos/5436662/pexels-photo-5436662.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'pilgrims praying' },
        { url: 'https://images.pexels.com/photos/14493979/pexels-photo-14493979.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'madinah mosque interior' },
        { url: 'https://images.pexels.com/photos/13444458/pexels-photo-13444458.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'dates fruit' },
    ],
    authorId: 'user-2-admin', // Reference to Admin User
    publishedAt: '2024-05-20T12:30:00Z',
    categoryId: 'cat-2',
    videoUrl: 'https://youtube.com/watch?v=6WJc3PL9yYI',
  },
   {
    id: 'post-3',
    slug: 'the-ultimate-guide-to-parisian-cafes',
    title: 'The Art of the Parisian Café: An Ultimate Guide',
    content: 'No trip to Paris is complete without whiling away an afternoon at a classic sidewalk cafe. It\'s an essential part of the city\'s culture. From historical literary haunts where Hemingway and Sartre once wrote, to modern specialty coffee shops pushing the boundaries of brewing, this guide will help you discover the best places to sip an espresso and watch the world go by. We\'ll teach you how to order like a local, explaining the difference between a "café crème", a "noisette", and an "allongé". Find your perfect spot to soak in the Parisian atmosphere and enjoy the simple pleasure of a good coffee.',
    featuredImageUrl: 'https://images.pexels.com/photos/1578332/pexels-photo-1578332.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    featuredImageHint: 'paris cafe street',
    galleryImages: [
        { url: 'https://images.pexels.com/photos/1010519/pexels-photo-1010519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'espresso croissant' },
        { url: 'https://images.pexels.com/photos/2074122/pexels-photo-2074122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'cafe interior paris' },
        { url: 'https://images.pexels.com/photos/687824/pexels-photo-687824.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'macarons assortment' },
    ],
    authorId: 'user-3-staff', // Reference to Staff Member
    publishedAt: '2024-06-01T08:00:00Z',
    videoUrl: 'https://youtube.com/watch?v=6WJc3PL9yYI',
    categoryId: 'cat-3',
  },
  {
    id: 'post-4',
    slug: 'exploring-the-grand-bazaar-of-istanbul',
    title: 'Exploring the Grand Bazaar of Istanbul',
    content: 'The Grand Bazaar in Istanbul is one of the oldest and largest covered markets in the world, with 61 covered streets and over 4,000 shops. This guide provides tips on how to navigate its labyrinthine alleys, what to buy (from beautiful carpets and intricate lanterns to spices and Turkish delight), and how to bargain like a local. Discover hidden courtyards (hans), traditional workshops, and the best places to stop for a cup of strong Turkish tea. Prepare to get lost in a sensory overload of sights, sounds, and smells in this historic marketplace that has been the heart of Istanbul\'s commerce for centuries.',
    featuredImageUrl: 'https://images.pexels.com/photos/10181373/pexels-photo-10181373.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    featuredImageHint: 'istanbul grand bazaar',
    galleryImages: [
        { url: 'https://images.pexels.com/photos/2245436/pexels-photo-2245436.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'turkish lanterns' },
        { url: 'https://images.pexels.com/photos/5623724/pexels-photo-5623724.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'turkish delight sweets' },
        { url: 'https://images.pexels.com/photos/262963/pexels-photo-262963.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'turkish tea' },
        { url: 'https://images.pexels.com/photos/813770/pexels-photo-813770.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'turkish carpets' },
    ],
    authorId: 'user-2-admin', // Reference to Admin User
    publishedAt: '2024-06-10T09:00:00Z',
    videoUrl: 'https://youtube.com/watch?v=6WJc3PL9yYI',
    categoryId: 'cat-3',
  },
  {
    id: 'post-5',
    slug: 'how-to-enjoy-coffee-like-an-italian-in-rome',
    title: 'How to Enjoy Coffee Like an Italian in Rome',
    content: 'Coffee in Italy is a culture, not just a beverage. It\'s a ritual with unwritten rules. This post explores how to drink coffee in Rome like a true local. Learn why you should only order your cappuccino in the morning, how to order an espresso "al banco" (at the counter) for a quick and cheap caffeine hit, and the different types of coffee you can find. From a simple "caffè" (an espresso) to a "macchiato" or "corretto" (with a shot of grappa), we will guide you through the rich and delicious coffee traditions of the Eternal City.',
    featuredImageUrl: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    featuredImageHint: 'rome coffee shop',
    galleryImages: [
        { url: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'cappuccino art' },
        { url: 'https://images.pexels.com/photos/1797161/pexels-photo-1797161.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'colosseum view' },
        { url: 'https://images.pexels.com/photos/97906/italian-breakfast-coffee-brioche-97906.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', hint: 'coffee breakfast' },
    ],
    authorId: 'user-3-staff', // Reference to Staff Member
    publishedAt: '2024-06-18T15:00:00Z',
    videoUrl: 'https://youtube.com/watch?v=6WJc3PL9yYI',
    categoryId: 'cat-4',
  },
];

export const bookings: Omit<Booking, 'id' | 'deletedAt'>[] = [
    {
        packageId: "paris-dream-tour",
        packageName: "Parisian Dream Tour",
        customerName: "Alice Johnson",
        customerEmail: "customer1@example.com",
        customerPhone: "444-555-6666",
        travelers: 2,
        departureDate: "2024-08-15T00:00:00.000Z",
        bookingDate: "2024-06-10T14:30:00.000Z",
        status: "Confirmed"
    },
    {
        packageId: "economy-umrah-package",
        packageName: "Economy Umrah Package",
        customerName: "Bob Williams",
        customerEmail: "customer2@example.com",
        customerPhone: "555-666-7777",
        travelers: 1,
        departureDate: "2024-07-20T00:00:00.000Z",
        bookingDate: "2024-06-12T10:00:00.000Z",
        status: "Pending"
    },
    {
        packageId: "tokyo-tech-tradition",
        packageName: "Tokyo: Tech & Tradition",
        customerName: "Diana Prince",
        customerEmail: "diana@example.com",
        customerPhone: "777-888-9999",
        travelers: 3,
        departureDate: "2024-09-05T00:00:00.000Z",
        bookingDate: "2024-06-20T11:00:00.000Z",
        status: "Confirmed"
    },
     {
        packageId: "istanbul-crossroads",
        packageName: "Istanbul: Crossroads of Continents",
        customerName: "Charlie Brown",
        customerEmail: "charlie@example.com",
        customerPhone: "123-456-7890",
        travelers: 4,
        departureDate: "2024-10-01T00:00:00.000Z",
        bookingDate: "2024-06-22T18:45:00.000Z",
        status: "Cancelled"
    }
];

export const contactMessages: Omit<ContactMessage, 'id' | 'deletedAt'>[] = [
    {
        name: "Eve Adams",
        email: "eve@example.com",
        subject: "Inquiry about Tokyo tour",
        message: "Hi, I'd like to know if there are any discounts available for the Tokyo: Tech & Tradition tour for a group of 4. Thanks!",
        submittedAt: "2024-06-15T09:00:00.000Z",
        isRead: false
    },
    {
        name: "Frank Miller",
        email: "frank@example.com",
        subject: "Feedback on Parisian Dream Tour",
        message: "Just got back from the Paris tour, it was absolutely wonderful! Our guide was fantastic. Thank you for an unforgettable experience.",
        submittedAt: "2024-06-14T18:30:00.000Z",
        isRead: true
    },
    {
        name: "Grace Lee",
        email: "grace@example.com",
        subject: "Question about Hajj package",
        message: "I am interested in the Premium Hajj package. Could you provide more details about the visa process and the expected fees for next year?",
        submittedAt: "2024-06-21T14:00:00.000Z",
        isRead: false
    }
];
