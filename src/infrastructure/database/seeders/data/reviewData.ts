export const FIVE_STAR_REVIEWS = [
  'Absolutely incredible experience! Saw the Big Five and our guide was exceptional.',
  'Life-changing safari! The wildlife encounters exceeded all expectations.',
  'Perfect organization, amazing guides, and unforgettable memories. Highly recommend!',
  'Best trip of my life! Every detail was meticulously planned.',
  'Outstanding service from start to finish. Will definitely book again!',
  'Exceeded all expectations! The accommodations were luxurious and the wildlife abundant.',
  'Professional guides who truly know their craft. Saw animals I never dreamed of!',
  'Flawless execution. This safari was worth every penny and more.',
  'An adventure of a lifetime! The team made us feel safe and special.',
  'Simply phenomenal. From the game drives to the lodges, everything was perfect.',
];

export const FOUR_STAR_REVIEWS = [
  'Great safari overall! Minor delays but the wildlife made up for it.',
  'Wonderful experience with excellent guides. Accommodation could be slightly better.',
  'Very good tour. Saw most of the Big Five, just missed the rhino.',
  'Fantastic wildlife viewing. Some organizational hiccups but nothing major.',
  'Really enjoyed the safari. Guide was knowledgeable, though vehicle was a bit cramped.',
  'Solid experience. Great game drives, though weather affected one day.',
  'Very satisfied with the tour. Food could have been more varied.',
  'Excellent wildlife encounters. Lodges were nice but not quite luxury level.',
  'Great value for money. Would have liked more time at certain locations.',
  'Good safari with professional guides. A few minor timing issues.',
];

export const THREE_STAR_REVIEWS = [
  'Decent safari but had higher expectations based on the price.',
  'Good wildlife viewing but felt rushed at times.',
  'Average experience. Some organizational issues affected the flow.',
  'Satisfactory tour. Wildlife was great but service was inconsistent.',
  'Met expectations but nothing extraordinary. Good for first-timers.',
  'Okay experience. Guide was knowledgeable but vehicle had issues.',
  'Wildlife viewing was good but accommodation below advertised standard.',
  'Fair safari. Some communication problems but saw decent wildlife.',
  'Reasonable tour. Better suited for budget-conscious travelers.',
  'Adequate safari experience. Several small issues throughout the trip.',
];

export function getReviewByRating(rating: number): string {
  if (rating === 5) {
    return FIVE_STAR_REVIEWS[Math.floor(Math.random() * FIVE_STAR_REVIEWS.length)];
  } else if (rating === 4) {
    return FOUR_STAR_REVIEWS[Math.floor(Math.random() * FOUR_STAR_REVIEWS.length)];
  } else {
    return THREE_STAR_REVIEWS[Math.floor(Math.random() * THREE_STAR_REVIEWS.length)];
  }
}

export function getRandomRating(): number {
  // Weighted distribution: 40% 5-star, 40% 4-star, 20% 3-star
  const rand = Math.random();
  if (rand < 0.4) return 5;
  if (rand < 0.8) return 4;
  return 3;
}

console.log(
  `⭐ Loaded ${FIVE_STAR_REVIEWS.length + FOUR_STAR_REVIEWS.length + THREE_STAR_REVIEWS.length} review templates`
);
