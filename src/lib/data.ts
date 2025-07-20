
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

export const destinations: Destination[] = [
    { id: "dest-1", name: "Paris, France", imageUrl: "https://placehold.co/600x400.png" },
    { id: "dest-2", name: "Makkah & Madinah, Saudi Arabia", imageUrl: "https://placehold.co/600x400.png" },
    { id: "dest-3", name: "Tokyo, Japan", imageUrl: "https://placehold.co/600x400.png" },
    { id: "dest-4", name: "Rome, Italy", imageUrl: "https://placehold.co/600x400.png" },
    { id: "dest-5", name: "Istanbul, Turkey", imageUrl: "https://placehold.co/600x400.png" },
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
];
