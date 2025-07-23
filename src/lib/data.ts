

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


export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  imageHint?: string;
  author: string;
  publishedAt: string; // ISO date string
  videoUrl?: string;
  categoryId?: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Package = {
  id: string;
  title: string;
  type: string;
  destination: string;
  duration: number; // in days
  price: number;
  rating: number;
  imageUrl: string;
  imageHint: string;
  videoUrl?: string; // Optional video URL
  description: string;
  itinerary: { day: string; title: string; details: string }[];
  inclusions: string[];
  exclusions: string[];
};

export type Destination = {
  id: string;
  name: string;
  imageUrl: string;
}

export type PackageType = {
  id: string;
  name: string;
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
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string; // ISO date string
  isRead: boolean;
};


export const destinations: Destination[] = [
    { id: "dest-1", name: "Paris, France", imageUrl: "https://placehold.co/600x400.png" },
    { id: "dest-2", name: "Makkah & Madinah, Saudi Arabia", imageUrl: "https://placehold.co/600x400.png" },
    { id: "dest-3", name: "Tokyo, Japan", imageUrl: "https://placehold.co/600x400.png" },
    { id: "dest-4", name: "Rome, Italy", imageUrl: "https://placehold.co/600x400.png" },
    { id: "dest-5", name: "Istanbul, Turkey", imageUrl: "https://placehold.co/600x400.png" },
    { id: "dest-6", name: "Switzerland", imageUrl: "https://placehold.co/600x400.png" },
    { id: "dest-7", name: "Maldives", imageUrl: "https://placehold.co/600x400.png" },
]

export const packageTypes: PackageType[] = [
    { id: "type-1", name: "Tour", imageUrl: "https://placehold.co/600x400.png" },
    { id: "type-2", name: "Hajj", imageUrl: "https://placehold.co/600x400.png" },
    { id: "type-3", name: "Umrah", imageUrl: "https://placehold.co/600x400.png" },
]


export const packages: Package[] = [
  {
    id: "paris-dream-tour",
    title: "Parisian Dream Tour",
    type: "Tour",
    destination: "Paris, France",
    duration: 7,
    price: 180000,
    rating: 4.8,
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "paris eiffel tower",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Experience the magic of Paris, from the Eiffel Tower to the charming streets of Montmartre. A perfect blend of art, culture, and romance.",
    itinerary: [
      { day: "1", title: "Arrival in Paris", details: "Check into your hotel and enjoy a welcome dinner cruise on the Seine River." },
      { day: "2", title: "Iconic Landmarks", details: "Visit the Eiffel Tower, Arc de Triomphe, and Champs-Élysées." },
      { day: "3", title: "Art & Culture", details: "Explore the Louvre Museum and see the Mona Lisa. Afternoon stroll in the Tuileries Garden." },
      { day: "4", title: "Versailles Palace", details: "A full-day trip to the magnificent Palace of Versailles and its stunning gardens." },
      { day: "5", title: "Montmartre & Sacré-Cœur", details: "Discover the artistic heart of Paris in Montmartre and visit the Sacré-Cœur Basilica." },
      { day: "6", title: "Shopping & Leisure", details: "Free day for shopping at Galeries Lafayette or exploring at your own pace." },
      { day: "7", title: "Departure", details: "Enjoy a final Parisian breakfast before heading to the airport." },
    ],
    inclusions: ["Accommodation", "Airport transfers", "Guided tours", "Breakfast daily"],
    exclusions: ["Flights", "Lunches & Dinners", "Visa fees"],
  },
  {
    id: "premium-hajj-package",
    title: "Premium Hajj Package",
    type: "Hajj",
    destination: "Makkah & Madinah, Saudi Arabia",
    duration: 21,
    price: 850000,
    rating: 5.0,
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "Kaaba Mecca",
    description: "Perform the sacred pilgrimage of Hajj with comfort and peace of mind. Our premium package includes 5-star hotels and dedicated guidance.",
    itinerary: [
      { day: "1-10", title: "Stay in Makkah", details: "Perform Umrah upon arrival. Days dedicated to Ibadah, with proximity to Masjid al-Haram." },
      { day: "11-15", title: "The Days of Hajj", details: "Guided transportation and support through the rituals of Mina, Arafat, and Muzdalifah." },
      { day: "16-20", title: "Stay in Madinah", details: "Travel to Madinah. Stay in a 5-star hotel near Masjid an-Nabawi. Ziyarat tours included." },
      { day: "21", title: "Departure", details: "Depart from Madinah airport." },
    ],
    inclusions: ["5-Star Hotels", "Visa processing", "All ground transport", "Guided Hajj rituals", "Meals (Full Board)"],
    exclusions: ["Flights", "Personal expenses"],
  },
  {
    id: "economy-umrah-package",
    title: "Economy Umrah Package",
    type: "Umrah",
    destination: "Makkah & Madinah, Saudi Arabia",
    duration: 10,
    price: 120000,
    rating: 4.5,
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "prophet mosque Madinah",
    description: "An affordable package to fulfill your spiritual journey of Umrah. Includes clean, comfortable hotels and ground transportation.",
    itinerary: [
      { day: "1-5", title: "Stay in Makkah", details: "Arrival in Jeddah and transfer to Makkah. Perform Umrah. Dedicated time for prayers." },
      { day: "6-9", title: "Stay in Madinah", details: "Travel to Madinah. Check into your hotel and spend time in Masjid an-Nabawi." },
      { day: "10", title: "Departure", details: "Transfer to Madinah or Jeddah airport for departure." },
    ],
    inclusions: ["3-Star Hotels", "Visa processing", "Jeddah-Makkah-Madinah transport"],
    exclusions: ["Flights", "Meals", "Ziyarat tours"],
  },
   {
    id: "tokyo-tech-tradition",
    title: "Tokyo: Tech & Tradition",
    type: "Tour",
    destination: "Tokyo, Japan",
    duration: 8,
    price: 250000,
    rating: 4.9,
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "Tokyo skyline",
    description: "Explore the vibrant contrast of Tokyo, from ancient temples to futuristic skyscrapers. A journey through Japan's dynamic capital.",
    itinerary: [
        { day: "1", title: "Arrival in Tokyo", details: "Arrive at Narita/Haneda Airport and transfer to your hotel in Shinjuku." },
        { day: "2", title: "Modern Tokyo", details: "Visit Shibuya Crossing, Harajuku's Takeshita Street, and the Meiji Shrine." },
        { day: "3", title: "Traditional Tokyo", details: "Explore Asakusa's Senso-ji Temple and the traditional Nakamise-dori street." },
        { day: "4", title: "Day Trip to Hakone", details: "Enjoy stunning views of Mount Fuji, a cruise on Lake Ashi, and a ropeway ride." },
        { day: "5", title: "Culture & Tech", details: "Visit the Ghibli Museum (tickets subject to availability) and Akihabara Electric Town." },
        { day: "6", title: "Culinary Tour", details: "Experience a sushi-making class and explore the famous Tsukiji Outer Market." },
        { day: "7", title: "Free Day", details: "Explore Tokyo at your own leisure. Optional tours available." },
        { day: "8", title: "Departure", details: "Transfer to the airport for your flight home." },
    ],
    inclusions: ["7 nights accommodation", "Airport transfers", "Japan Rail Pass for select journeys", "Guided tours on specified days"],
    exclusions: ["International flights", "Most meals", "Personal expenses"],
  },
   {
    id: "roman-holiday",
    title: "The Roman Holiday",
    type: "Tour",
    destination: "Rome, Italy",
    duration: 5,
    price: 150000,
    rating: 4.7,
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "Rome Colosseum",
    description: "Step back in time and walk in the footsteps of emperors and gladiators. Discover the ancient wonders and vibrant culture of Rome.",
    itinerary: [
        { day: "1", title: "Benvenuti a Roma!", details: "Arrive in Rome, transfer to your hotel, and enjoy a traditional Italian welcome dinner." },
        { day: "2", title: "Ancient Rome", details: "Guided tour of the Colosseum, Roman Forum, and Palatine Hill." },
        { day: "3", title: "Vatican City", details: "Explore St. Peter's Basilica, St. Peter's Square, and the Vatican Museums, including the Sistine Chapel." },
        { day: "4", title: "Art & Fountains", details: "Visit the Pantheon, toss a coin in the Trevi Fountain, and climb the Spanish Steps. Enjoy a gelato tasting." },
        { day: "5", title: "Arrivederci Roma", details: "Enjoy a final cappuccino and cornetto before departing." },
    ],
    inclusions: ["4 nights hotel", "Airport transfers", "Guided tours with skip-the-line tickets", "Welcome dinner & breakfast daily"],
    exclusions: ["Flights", "City taxes", "Lunches & other dinners"],
  },
  {
    id: "istanbul-crossroads",
    title: "Istanbul: Crossroads of Continents",
    type: "Tour",
    destination: "Istanbul, Turkey",
    duration: 6,
    price: 135000,
    rating: 4.6,
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "Istanbul mosque",
    description: "Discover the city where East meets West. Explore historic mosques, bustling bazaars, and magnificent palaces in Istanbul.",
    itinerary: [
        { day: "1", title: "Welcome to Istanbul", details: "Arrive and transfer to your hotel in the historic Sultanahmet district." },
        { day: "2", title: "Byzantine & Ottoman Relics", details: "Visit the Hagia Sophia, Blue Mosque, and the ancient Hippodrome." },
        { day: "3", title: "Palaces & Bazaars", details: "Explore Topkapi Palace and get lost in the labyrinthine Grand Bazaar." },
        { day: "4", title: "Bosphorus Cruise", details: "Enjoy a cruise on the Bosphorus strait, dividing Europe and Asia. Visit the Spice Bazaar." },
        { day: "5", title: "Modern Istanbul", details: "Explore the vibrant neighborhoods of Beyoglu and Galata. Walk down Istiklal Avenue." },
        { day: "6", title: "Departure", details: "Enjoy a Turkish coffee before heading to the airport." },
    ],
    inclusions: ["5 nights accommodation", "Airport transfers", "Guided tours", "Bosphorus cruise", "Daily breakfast"],
    exclusions: ["Flights", "Visa fees", "Lunches & Dinners"],
  },
  {
    id: "swiss-alps-adventure",
    title: "Swiss Alps Adventure",
    type: "Tour",
    destination: "Switzerland",
    duration: 8,
    price: 320000,
    rating: 4.9,
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "swiss alps",
    description: "Embark on a breathtaking journey through the Swiss Alps. Experience stunning mountain scenery, pristine lakes, and charming alpine villages.",
    itinerary: [
      { day: "1", title: "Arrival in Zurich", details: "Arrive in Zurich, transfer to your hotel, and explore the city at your leisure." },
      { day: "2", title: "Lucerne & Mount Pilatus", details: "Travel to Lucerne, enjoy a boat trip on Lake Lucerne, and take a cogwheel railway up to Mount Pilatus for panoramic views." },
      { day: "3", title: "Interlaken, Jungfrau Region", details: "Journey to Interlaken, the adventure capital of Switzerland. Optional skydiving or paragliding." },
      { day: "4", title: "Top of Europe - Jungfraujoch", details: "Take a scenic train ride to Jungfraujoch, the highest railway station in Europe. Explore the Ice Palace and Sphinx Observatory." },
      { day: "5", title: "Zermatt & the Matterhorn", details: "Travel to the car-free village of Zermatt, with stunning views of the iconic Matterhorn peak." },
      { day: "6", title: "Gornergrat Railway", details: "Ride the Gornergrat railway for spectacular views of the Matterhorn and surrounding glaciers." },
      { day: "7", title: "Return to Zurich", details: "Enjoy a scenic train journey back to Zurich. Farewell dinner at a traditional Swiss restaurant." },
      { day: "8", title: "Departure", details: "Transfer to Zurich Airport for your departure." },
    ],
    inclusions: ["7 nights accommodation in 4-star hotels", "Swiss Travel Pass for all train journeys", "Excursions to Mount Pilatus and Jungfraujoch", "Daily breakfast and farewell dinner"],
    exclusions: ["International flights", "Lunches and most dinners", "Optional activities"],
  },
  {
    id: "maldives-getaway",
    title: "Maldives Luxury Getaway",
    type: "Tour",
    destination: "Maldives",
    duration: 5,
    price: 280000,
    rating: 5.0,
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "maldives bungalow water",
    description: "Escape to paradise with a luxurious stay in an overwater bungalow in the Maldives. Enjoy crystal-clear waters, white sandy beaches, and ultimate relaxation.",
    itinerary: [
      { day: "1", title: "Arrival in Malé", details: "Arrive at Malé International Airport and take a scenic seaplane transfer to your resort." },
      { day: "2", title: "Snorkeling & Water Sports", details: "Explore the vibrant house reef with a guided snorkeling tour. Enjoy complimentary non-motorized water sports." },
      { day: "3", title: "Spa & Relaxation", details: "Indulge in a rejuvenating spa treatment or simply relax on your private sun deck." },
      { day: "4", title: "Sunset Dolphin Cruise", details: "Embark on a romantic sunset cruise and watch playful dolphins in their natural habitat." },
      { day: "5", title: "Departure", details: "Enjoy a final breakfast in paradise before your seaplane transfer back to Malé for your departure." },
    ],
    inclusions: ["4 nights in an overwater bungalow", "Seaplane transfers", "Full board (breakfast, lunch, and dinner)", "Sunset dolphin cruise", "Snorkeling equipment"],
    exclusions: ["International flights", "Beverages", "Optional excursions and spa treatments"],
  },
];

export const categories: Category[] = [
  { id: 'cat-1', name: 'Travel Tips' },
  { id: 'cat-2', name: 'Spiritual Journeys' },
  { id: 'cat-3', name: 'City Guides' },
  { id: 'cat-4', name: 'Food & Drink' },
];

export const posts: Post[] = [
  {
    id: 'post-1',
    title: '10 Essential Tips for Your First Trip to Japan',
    slug: '10-essential-tips-for-your-first-trip-to-japan',
    content: 'Japan is a country of amazing contrasts, blending ancient traditions with futuristic technology. To help you navigate your first adventure in the Land of the Rising Sun, we\'ve compiled 10 essential tips. From mastering the incredibly efficient railway system (and why a JR Pass is a must-have) to understanding basic etiquette like bowing and handling money, we\'ve got you covered. Don\'t forget to try the authentic ramen from a local shop - it\'s an experience in itself! We also touch on navigating the bustling cities, finding tranquility in temples, and the convenience of 7-Eleven stores.',
    imageUrl: 'https://images.pexels.com/photos/364096/pexels-photo-364096.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    imageHint: 'tokyo street night',
    author: 'Admin User',
    publishedAt: '2024-05-15T10:00:00Z',
    categoryId: 'cat-1'
  },
  {
    id: 'post-2',
    title: 'A Pilgrim\'s Guide: Preparing for a Meaningful Umrah',
    slug: 'a-pilgrims-guide-preparing-for-umrah',
    content: 'Performing Umrah is a profound spiritual experience for Muslims worldwide. This guide covers the essential rituals, preparations, and practical advice for a meaningful pilgrimage to the holy cities of Makkah and Madinah. We explain the spiritual significance and practical steps of entering the state of Ihram, performing the Tawaf around the Kaaba, and completing the Sa\'i between Safa and Marwah. Learn about the best times to go, what to pack, and how to maintain focus and devotion throughout your journey to make it a success.',
    imageUrl: 'https://images.pexels.com/photos/1683543/pexels-photo-1683543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    imageHint: 'kaaba mecca pilgrimage',
    author: 'Admin User',
    publishedAt: '2024-05-20T12:30:00Z',
    categoryId: 'cat-2',
    videoUrl: 'https://www.youtube.com/watch?v=sB4hRA_t_ao',
  },
   {
    id: 'post-3',
    title: 'The Art of the Parisian Café: An Ultimate Guide',
    slug: 'the-ultimate-guide-to-parisian-cafes',
    content: 'No trip to Paris is complete without whiling away an afternoon at a classic sidewalk cafe. It\'s an essential part of the city\'s culture. From historical literary haunts where Hemingway and Sartre once wrote, to modern specialty coffee shops pushing the boundaries of brewing, this guide will help you discover the best places to sip an espresso and watch the world go by. We\'ll teach you how to order like a local, explaining the difference between a "café crème", a "noisette", and an "allongé". Find your perfect spot to soak in the Parisian atmosphere.',
    imageUrl: 'https://images.pexels.com/photos/1578332/pexels-photo-1578332.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    imageHint: 'paris cafe street',
    author: 'Staff Member',
    publishedAt: '2024-06-01T08:00:00Z',
    categoryId: 'cat-3'
  },
  {
    id: 'post-4',
    title: 'Exploring the Grand Bazaar of Istanbul',
    slug: 'exploring-the-grand-bazaar-of-istanbul',
    content: 'The Grand Bazaar in Istanbul is one of the oldest and largest covered markets in the world. This guide provides tips on how to navigate its labyrinthine streets, what to buy (from beautiful carpets to intricate lanterns), and how to bargain like a local. Discover hidden courtyards, traditional workshops, and the best places to stop for a cup of Turkish tea. Prepare to get lost in a sensory overload of sights, sounds, and smells in this historic marketplace.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'istanbul grand bazaar',
    author: 'Admin User',
    publishedAt: '2024-06-10T09:00:00Z',
    categoryId: 'cat-3',
  },
  {
    id: 'post-5',
    title: 'How to Enjoy Coffee Like an Italian in Rome',
    slug: 'how-to-enjoy-coffee-like-an-italian-in-rome',
    content: 'Coffee in Italy is a culture, not just a beverage. This post explores the unwritten rules of drinking coffee in Rome. Learn why you should drink your cappuccino only in the morning, how to order an espresso "al banco" (at the counter) like a true Roman, and the different types of coffee you can find. From a simple "caffè" to a "macchiato" or "corretto", we will guide you through the rich coffee traditions of the Eternal City.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'rome coffee shop',
    author: 'Staff Member',
    publishedAt: '2024-06-18T15:00:00Z',
    categoryId: 'cat-4',
  },
];

export const bookings: Booking[] = [
    {
        id: "booking-1",
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
        id: "booking-2",
        packageId: "economy-umrah-package",
        packageName: "Economy Umrah Package",
        customerName: "Bob Williams",
        customerEmail: "customer2@example.com",
        customerPhone: "555-666-7777",
        travelers: 1,
        departureDate: "2024-07-20T00:00:00.000Z",
        bookingDate: "2024-06-12T10:00:00.000Z",
        status: "Pending"
    }
];

export const contactMessages: ContactMessage[] = [
    {
        id: "msg-1",
        name: "Charlie Brown",
        email: "charlie@example.com",
        subject: "Inquiry about Tokyo tour",
        message: "Hi, I'd like to know if there are any discounts available for the Tokyo: Tech & Tradition tour for a group of 4. Thanks!",
        submittedAt: "2024-06-15T09:00:00.000Z",
        isRead: false
    },
    {
        id: "msg-2",
        name: "Diana Prince",
        email: "diana@example.com",
        subject: "Feedback on Parisian Dream Tour",
        message: "Just got back from the Paris tour, it was absolutely wonderful! Our guide was fantastic. Thank you for an unforgettable experience.",
        submittedAt: "2024-06-14T18:30:00.000Z",
        isRead: true
    }
]
