import { Prisma } from '@prisma/client';
import { Currency, Difficulty } from '@prisma/client';

export interface TourSeedData {
  name: string;
  slug: string;
  description: string;
  summary: string;
  duration: number;
  maxGroupSize: number;
  priceAmount: number;
  currency: Currency;
  difficulty: Difficulty;
  imageCover: string;
  images: string[];
  startDates: Date[];
  startLocation: {
    description: string;
    address: string;
    longitude: number;
    latitude: number;
  };
  locations: Array<{
    description: string;
    address: string;
    longitude: number;
    latitude: number;
    day: number;
  }>;
  guides: string[]; // Will be populated after users are created
}

export const KENYA_TOURS: TourSeedData[] = [
  {
    name: 'Maasai Mara Great Migration Safari',
    slug: 'maasai-mara-great-migration-safari',
    description: 'Experience the world-famous Great Migration in the Maasai Mara. Witness millions of wildebeest, zebras, and gazelles crossing the Mara River while predators lurk nearby. This 7-day adventure includes game drives, Maasai village visits, and luxury tented camp accommodation.',
    summary: 'Witness the spectacular Great Migration in Kenya\'s premier wildlife reserve',
    duration: 7,
    maxGroupSize: 8,
    priceAmount: 3500,
    currency: 'USD',
    difficulty: 'MEDIUM',
    imageCover: '/images/tours/maasai-mara-migration.jpg',
    images: [
      '/images/tours/mara-wildebeest.jpg',
      '/images/tours/mara-lions.jpg',
      '/images/tours/mara-camp.jpg',
    ],
    startDates: [
      new Date('2026-07-15'),
      new Date('2026-08-10'),
      new Date('2026-09-05'),
    ],
    startLocation: {
      description: 'Nairobi Jomo Kenyatta International Airport',
      address: 'Embakasi, Nairobi, Kenya',
      longitude: 36.9278,
      latitude: -1.3192,
    },
    locations: [
      {
        description: 'Maasai Mara National Reserve - Main Gate',
        address: 'Maasai Mara, Narok County, Kenya',
        longitude: 35.1426,
        latitude: -1.4061,
        day: 1,
      },
      {
        description: 'Mara River Crossing Point',
        address: 'Mara River, Maasai Mara, Kenya',
        longitude: 35.2891,
        latitude: -1.3856,
        day: 3,
      },
      {
        description: 'Maasai Village Cultural Visit',
        address: 'Near Talek Gate, Maasai Mara, Kenya',
        longitude: 35.2156,
        latitude: -1.4523,
        day: 5,
      },
    ],
    guides: [],
  },

  {
    name: 'Amboseli Elephant Paradise',
    slug: 'amboseli-elephant-paradise',
    description: 'Explore Amboseli National Park, famous for its large elephant herds and stunning views of Mount Kilimanjaro. This 5-day safari offers incredible photography opportunities with elephants against the backdrop of Africa\'s highest peak.',
    summary: 'Photograph elephants with Mount Kilimanjaro as your backdrop',
    duration: 5,
    maxGroupSize: 6,
    priceAmount: 2200,
    currency: 'USD',
    difficulty: 'EASY',
    imageCover: '/images/tours/amboseli-elephants.jpg',
    images: [
      '/images/tours/amboseli-kilimanjaro.jpg',
      '/images/tours/amboseli-wildlife.jpg',
      '/images/tours/amboseli-lodge.jpg',
    ],
    startDates: [
      new Date('2026-06-20'),
      new Date('2026-07-25'),
      new Date('2026-08-30'),
    ],
    startLocation: {
      description: 'Nairobi Jomo Kenyatta International Airport',
      address: 'Embakasi, Nairobi, Kenya',
      longitude: 36.9278,
      latitude: -1.3192,
    },
    locations: [
      {
        description: 'Amboseli National Park - Meshanani Gate',
        address: 'Amboseli, Kajiado County, Kenya',
        longitude: 37.2636,
        latitude: -2.6527,
        day: 1,
      },
      {
        description: 'Observation Hill Viewpoint',
        address: 'Amboseli National Park, Kenya',
        longitude: 37.2891,
        latitude: -2.6423,
        day: 2,
      },
      {
        description: 'Amboseli Swamp - Elephant Watering Hole',
        address: 'Central Amboseli, Kenya',
        longitude: 37.2556,
        latitude: -2.6712,
        day: 3,
      },
    ],
    guides: [],
  },
];

export const TANZANIA_TOURS: TourSeedData[] = [
  {
    name: 'Serengeti & Ngorongoro Crater Explorer',
    slug: 'serengeti-ngorongoro-crater-explorer',
    description: 'Discover two of Africa\'s most iconic wildlife destinations. Explore the vast Serengeti plains teeming with wildlife, then descend into the Ngorongoro Crater, a natural wonder hosting the Big Five in a volcanic caldera.',
    summary: 'Experience Tanzania\'s premier wildlife parks in one epic journey',
    duration: 8,
    maxGroupSize: 8,
    priceAmount: 4200,
    currency: 'USD',
    difficulty: 'MEDIUM',
    imageCover: '/images/tours/serengeti-crater.jpg',
    images: [
      '/images/tours/serengeti-lions.jpg',
      '/images/tours/ngorongoro-rhino.jpg',
      '/images/tours/crater-view.jpg',
    ],
    startDates: [
      new Date('2026-06-10'),
      new Date('2026-07-20'),
      new Date('2026-09-15'),
    ],
    startLocation: {
      description: 'Kilimanjaro International Airport',
      address: 'Hai District, Kilimanjaro, Tanzania',
      longitude: 37.0745,
      latitude: -3.4294,
    },
    locations: [
      {
        description: 'Serengeti National Park - Naabi Hill Gate',
        address: 'Serengeti, Mara Region, Tanzania',
        longitude: 35.2161,
        latitude: -2.1500,
        day: 2,
      },
      {
        description: 'Central Serengeti - Seronera Area',
        address: 'Seronera, Serengeti, Tanzania',
        longitude: 34.8225,
        latitude: -2.4533,
        day: 4,
      },
      {
        description: 'Ngorongoro Crater Floor',
        address: 'Ngorongoro Conservation Area, Tanzania',
        longitude: 35.5831,
        latitude: -3.2000,
        day: 6,
      },
    ],
    guides: [],
  },
];

export const UGANDA_TOURS: TourSeedData[] = [
  {
    name: 'Bwindi Gorilla Trekking Adventure',
    slug: 'bwindi-gorilla-trekking-adventure',
    description: 'Trek through the dense Bwindi Impenetrable Forest to encounter mountain gorillas in their natural habitat. This once-in-a-lifetime experience includes spending an hour with a gorilla family, observing their behavior and interactions.',
    summary: 'Face-to-face with endangered mountain gorillas in the wild',
    duration: 4,
    maxGroupSize: 8,
    priceAmount: 5500,
    currency: 'USD',
    difficulty: 'DIFFICULT',
    imageCover: '/images/tours/bwindi-gorilla.jpg',
    images: [
      '/images/tours/gorilla-family.jpg',
      '/images/tours/bwindi-forest.jpg',
      '/images/tours/gorilla-trek.jpg',
    ],
    startDates: [
      new Date('2026-06-15'),
      new Date('2026-07-10'),
      new Date('2026-08-20'),
    ],
    startLocation: {
      description: 'Entebbe International Airport',
      address: 'Entebbe, Uganda',
      longitude: 32.4435,
      latitude: 0.0424,
    },
    locations: [
      {
        description: 'Bwindi Impenetrable National Park - Buhoma Sector',
        address: 'Bwindi, Kanungu District, Uganda',
        longitude: 29.5950,
        latitude: -0.9500,
        day: 1,
      },
      {
        description: 'Gorilla Trekking Starting Point',
        address: 'Buhoma Ranger Station, Bwindi, Uganda',
        longitude: 29.5892,
        latitude: -0.9534,
        day: 2,
      },
      {
        description: 'Batwa Cultural Experience',
        address: 'Near Bwindi Forest, Uganda',
        longitude: 29.6012,
        latitude: -0.9421,
        day: 3,
      },
    ],
    guides: [],
  },

  {
    name: 'Murchison Falls Wildlife Safari',
    slug: 'murchison-falls-wildlife-safari',
    description: 'Explore Uganda\'s largest national park, home to the powerful Murchison Falls where the Nile River explodes through a narrow gorge. Enjoy game drives, boat safaris, and witness Africa\'s Big Five in their natural habitat.',
    summary: 'Experience the mighty Murchison Falls and abundant wildlife',
    duration: 6,
    maxGroupSize: 10,
    priceAmount: 2800,
    currency: 'USD',
    difficulty: 'EASY',
    imageCover: '/images/tours/murchison-falls.jpg',
    images: [
      '/images/tours/murchison-wildlife.jpg',
      '/images/tours/nile-boat-safari.jpg',
      '/images/tours/ziwa-rhinos.jpg',
    ],
    startDates: [
      new Date('2026-07-05'),
      new Date('2026-08-15'),
      new Date('2026-09-20'),
    ],
    startLocation: {
      description: 'Entebbe International Airport',
      address: 'Entebbe, Uganda',
      longitude: 32.4435,
      latitude: 0.0424,
    },
    locations: [
      {
        description: 'Ziwa Rhino Sanctuary',
        address: 'Nakasongola District, Uganda',
        longitude: 32.2956,
        latitude: 1.4853,
        day: 1,
      },
      {
        description: 'Murchison Falls National Park - Main Gate',
        address: 'Masindi District, Uganda',
        longitude: 31.7453,
        latitude: 2.2400,
        day: 2,
      },
      {
        description: 'Top of Murchison Falls',
        address: 'Murchison Falls, Uganda',
        longitude: 31.7478,
        latitude: 2.2795,
        day: 3,
      },
      {
        description: 'Nile River Boat Launch Point',
        address: 'Paraa, Murchison Falls NP, Uganda',
        longitude: 31.5198,
        latitude: 2.2156,
        day: 4,
      },
    ],
    guides: [],
  },
];

// Combine all tours
export const ALL_TOURS: TourSeedData[] = [
  ...KENYA_TOURS,
  ...TANZANIA_TOURS,
  ...UGANDA_TOURS,
];

console.log(`📦 Loaded ${ALL_TOURS.length} safari tours`);
