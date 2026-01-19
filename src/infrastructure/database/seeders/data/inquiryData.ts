export const SPECIAL_REQUESTS = [
  'Vegetarian meals required',
  'Honeymoon package with romantic setup',
  'Photography-focused tour with extra stops',
  'Family with children under 10',
  'Celebrating anniversary - special arrangements needed',
  'First-time safari - extra guidance appreciated',
  'Wildlife photography enthusiast',
  'Bird watching focus',
  'Cultural immersion preferred',
  'Luxury accommodation only',
  'Budget-conscious traveler',
  'Solo traveler seeking group',
  'Elderly travelers - slower pace needed',
  'Wheelchair accessible accommodation',
  'Vegan meals required',
  'Private vehicle requested',
  'Early morning game drives preferred',
  'Sunset photography priority',
  'Hot air balloon ride interest',
  'Bush dinner experience requested',
];

export const PHONE_FORMATS = {
  USA: '+1-XXX-XXX-XXXX',
  UK: '+44-XXXX-XXX-XXX',
  CANADA: '+1-XXX-XXX-XXXX',
  AUSTRALIA: '+61-X-XXXX-XXXX',
  GERMANY: '+49-XX-XXXXXXXX',
  FRANCE: '+33-X-XX-XX-XX-XX',
  NETHERLANDS: '+31-XX-XXX-XXXX',
  SPAIN: '+34-XX-XXX-XXXX',
  ITALY: '+39-XX-XXXX-XXXX',
  JAPAN: '+81-X-XXXX-XXXX',
  SOUTH_AFRICA: '+27-XX-XXX-XXXX',
  BRAZIL: '+55-XX-XXXXX-XXXX',
  INDIA: '+91-XX-XXXX-XXXX',
  KENYA: '+254-XXX-XXX-XXX',
  TANZANIA: '+255-XXX-XXX-XXX',
  UGANDA: '+256-XXX-XXX-XXX',
};

export function getRandomSpecialRequest(): string | undefined {
  // 60% chance of having a special request
  if (Math.random() > 0.6) {
    return undefined;
  }
  return SPECIAL_REQUESTS[Math.floor(Math.random() * SPECIAL_REQUESTS.length)];
}

export function generatePhoneNumber(country: keyof typeof PHONE_FORMATS): string {
  const format = PHONE_FORMATS[country];
  return format.replace(/X/g, () => Math.floor(Math.random() * 10).toString());
}

// Get a random country for phone generation
export function getRandomCountry(): keyof typeof PHONE_FORMATS {
  const countries = Object.keys(PHONE_FORMATS) as (keyof typeof PHONE_FORMATS)[];
  return countries[Math.floor(Math.random() * countries.length)];
}

console.log(
  `📞 Loaded ${SPECIAL_REQUESTS.length} special request templates and ${Object.keys(PHONE_FORMATS).length} phone formats`
); 
