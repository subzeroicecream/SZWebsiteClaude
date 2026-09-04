export interface Location {
  id: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone?: string;
  latitude: number;
  longitude: number;
  marqiiEmbedId?: string;
  orderUrl?: string;
  serviceType?: "store" | "catering";
  storeType?: "standard" | "flagship" | "premium" | "catering";
  country?: string;
  email?: string;
  website?: string;
  description?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  googleMapsUrl?: string;
  showLocationPage?: boolean;
  showDoorDashButton?: boolean;
  isActive?: boolean;
}

export const locations: Location[] = [
  {
    id: "sandy-utah",
    name: "Sub Zero Nitrogen Ice Cream — Sandy",
    shortName: "Sandy",
    address: "9860 S 700 E",
    city: "Sandy",
    state: "UT",
    postalCode: "84070",
    phone: "(801) 935-9262",
    latitude: 40.5711909,
    longitude: -111.8729745,
    marqiiEmbedId: "fb39799d-cea4-47e7-be8c-f3cc74f89d40",
  },
  {
    id: "sandy-springs-georgia",
    name: "Sub Zero Nitrogen Ice Cream — Sandy Springs",
    shortName: "Sandy Springs",
    address: "5590 Roswell Rd. Suite 130",
    city: "Sandy Springs",
    state: "GA",
    postalCode: "30342",
    phone: "(404) 255-8484",
    latitude: 33.9074587,
    longitude: -84.3802014,
    marqiiEmbedId: "169967ca-c99a-4f70-9b5d-d302e7d515d9",
  },
  {
    id: "indianapolis-mass-ave",
    name: "Sub Zero Nitrogen Ice Cream — Indy Mass Ave",
    shortName: "Indy Mass Ave",
    address: "427 Massachusetts Ave",
    city: "Indianapolis",
    state: "IN",
    postalCode: "46204",
    phone: "(317) 600-3429",
    latitude: 39.7731324,
    longitude: -86.1512992,
    marqiiEmbedId: "77c64dfd-ce6b-47f6-a6a1-37c1d7d0a4ef",
  },
  {
    id: "kennewick-washington",
    name: "Sub Zero Nitrogen Ice Cream — Kennewick",
    shortName: "Kennewick",
    address: "321 N Columbia Center Blvd Suite G",
    city: "Kennewick",
    state: "WA",
    postalCode: "99336",
    phone: "(509) 396-9402",
    latitude: 46.2118831,
    longitude: -119.22631,
    marqiiEmbedId: "1b7adbb4-8828-4385-9f9b-99e17a8038dd",
  },
  {
    id: "cedar-city-utah",
    name: "Sub Zero Nitrogen Ice Cream — Cedar City",
    shortName: "Cedar City",
    address: "1390 S Providence Center Dr Suite 2",
    city: "Cedar City",
    state: "UT",
    postalCode: "84720",
    phone: "(435) 572-7888",
    latitude: 37.653024,
    longitude: -113.0855709,
    marqiiEmbedId: "195af749-5405-490e-a4db-ba5d1c0fbd88",
  },
  {
    id: "sarasota-florida",
    name: "Sub Zero Nitrogen Ice Cream — Sarasota",
    shortName: "Sarasota",
    address: "4065 Clark Rd",
    city: "Sarasota",
    state: "FL",
    postalCode: "34233",
    phone: "(941) 922-3690",
    latitude: 27.2698351,
    longitude: -82.4875646,
    marqiiEmbedId: "2e96641d-1b0c-45a4-ba1f-77911b040cf3",
  },
  {
    id: "wesley-chapel-florida",
    name: "Sub Zero Nitrogen Ice Cream — Wesley Chapel",
    shortName: "Wesley Chapel",
    address: "5863 Goldview Parkway",
    city: "Wesley Chapel",
    state: "FL",
    postalCode: "33544",
    phone: "(813) 345-8467",
    latitude: 28.241914,
    longitude: -82.3521187,
    marqiiEmbedId: "7f385c47-5b1a-4f53-9569-f7318e297ebd",
  },
  {
    id: "ashland-massachusetts",
    name: "Sub Zero Nitrogen Ice Cream — Ashland",
    shortName: "Ashland",
    address: "91 Main St",
    city: "Ashland",
    state: "MA",
    postalCode: "01721",
    phone: "(508) 202-9790",
    latitude: 42.2614407,
    longitude: -71.4662754,
    marqiiEmbedId: "b86e72e1-e4f1-4253-bc4e-25d27b37e9ce",
  },
  {
    id: "worcester-massachusetts",
    name: "Sub Zero Nitrogen Ice Cream — Worcester",
    shortName: "Worcester",
    address: "44 Front St",
    city: "Worcester",
    state: "MA",
    postalCode: "01608",
    phone: "(774) 418-5546",
    latitude: 42.263194,
    longitude: -71.8007177,
    marqiiEmbedId: "f5cff9f1-7f29-4e33-b675-668a7bc87846",
  },
  {
    id: "provo-utah",
    name: "Sub Zero Nitrogen Ice Cream — Provo",
    shortName: "Provo",
    address: "62 West Center Street",
    city: "Provo",
    state: "UT",
    postalCode: "84601",
    phone: "(385) 375-2617",
    latitude: 40.2340724,
    longitude: -111.6596912,
    marqiiEmbedId: "c0f63af1-a076-4116-a689-6bee13a5baf9",
  },
  {
    id: "nashua-new-hampshire",
    name: "Sub Zero Nitrogen Ice Cream Nashua",
    shortName: "Nashua",
    address: "83 Main Street",
    city: "Nashua",
    state: "NH",
    postalCode: "03060",
    phone: "(603) 943-8491",
    email: "subzeronashuanh@aol.com",
    country: "United States",
    facebookUrl: "https://www.facebook.com/SubZeroNashua",
    googleMapsUrl: "https://www.google.com/maps/place/Sub+Zero+Nitrogen+Ice+Cream/@42.7626546,-71.4689103,17z/data=!3m1!4b1!4m6!3m5!1s0x89e3b7d493e3521d:0xd6e69535914a7adc!8m2!3d42.7626546!4d-71.4663354!16s%2Fg%2F11b5ytlvwd?entry=ttu&g_ep=EgoyMDI1MTAxNC4wIKXMDSoASAFQAw%3D%3D",
    showLocationPage: true,
    showDoorDashButton: true,
    latitude: 42.7626546,
    longitude: -71.4663354,
    marqiiEmbedId: "a8cdb27a-feac-451f-9eec-920a521fd302",
    storeType: "premium",
    isActive: true,
  },
  {
    id: "manchester-new-hampshire",
    name: "Sub Zero Nitrogen Ice Cream — Manchester",
    shortName: "Manchester",
    address: "119 Hanover St",
    city: "Manchester",
    state: "NH",
    postalCode: "03101",
    phone: "(603) 327-9694",
    latitude: 42.9907434,
    longitude: -71.4604085,
    marqiiEmbedId: "f17bfdbe-a92e-4a09-bac6-758ab26a831a",
  },
  {
    id: "simi-valley-california",
    name: "Sub Zero Nitrogen Ice Cream — Simi Valley",
    shortName: "Simi Valley",
    address: "875 Cochran Street, Suite 6",
    city: "Simi Valley",
    state: "CA",
    postalCode: "93065",
    phone: "(805) 587-4262",
    latitude: 34.27944780783584,
    longitude: -118.78152776827307,
    marqiiEmbedId: "257f4cd2-2224-4d75-95d8-ebc8abad53df",
  },
  {
    id: "federal-way-washington-catering",
    name: "Sub Zero Nitrogen Ice Cream - Federal Way Catering",
    shortName: "Federal Way",
    address: "",
    city: "Federal Way",
    state: "WA",
    postalCode: "98003",
    phone: "(253) 941-3248",
    latitude: 47.3073,
    longitude: -122.3119,
    marqiiEmbedId: "b2734ea0-8708-4f3c-9388-8ecbfcc4929a",
    serviceType: "catering",
  },
  {
    id: "fort-collins-colorado",
    name: "Sub Zero Nitrogen Ice Cream — Fort Collins",
    shortName: "Fort Collins",
    address: "1501 W Elizabeth Street",
    city: "Fort Collins",
    state: "CO",
    postalCode: "80521",
    latitude: 40.5739299,
    longitude: -105.1033183,
    marqiiEmbedId: "46c3b3f3-a135-4a4f-8b05-d269dd4e8db3",
  },
  {
    id: "carmel-indiana",
    name: "Sub Zero Nitrogen Ice Cream — Carmel",
    shortName: "Carmel",
    address: "111 West Main Street Suite 130",
    city: "Carmel",
    state: "IN",
    postalCode: "46032",
    phone: "(317) 564-8158",
    latitude: 39.9782536,
    longitude: -86.1292822,
    marqiiEmbedId: "81be11f5-509c-4041-b888-9cfad1071d41",
  },
  {
    id: "naples-florida",
    name: "Sub Zero Nitrogen Ice Cream — Naples",
    shortName: "Naples",
    address: "2359 Vanderbilt Beach Road Suite 408",
    city: "Naples",
    state: "FL",
    postalCode: "34109",
    phone: "(239) 260-5716",
    latitude: 26.2469695,
    longitude: -81.7707739,
    marqiiEmbedId: "fa8de4b7-2d6d-41b6-b39d-917a81e70af8",
  },
  {
    id: "downtown-atlanta-georgia",
    name: "Sub Zero Nitrogen Ice Cream — Downtown Atlanta",
    shortName: "Downtown Atlanta",
    address: "250 Park Avenue West",
    city: "Atlanta",
    state: "GA",
    postalCode: "30313",
    phone: "(404) 343-4837",
    latitude: 33.7615102,
    longitude: -84.3948784,
    marqiiEmbedId: "86704140-4503-4194-94a7-15132720f07a",
  },
  {
    id: "hayden-idaho-triple-play",
    name: "Sub Zero Nitrogen Ice Cream — Triple Play Fun Center",
    shortName: "Hayden — Triple Play",
    address: "175 W Orchard Ave",
    city: "Hayden",
    state: "ID",
    postalCode: "83835",
    phone: "(801) 319-7859",
    latitude: 47.7562109,
    longitude: -116.7891263,
    marqiiEmbedId: "effd46da-4552-4cc3-af57-27a5dc08164b",
  },
];

export function fullAddress(location: Location) {
  return [location.address, `${location.city}, ${location.state} ${location.postalCode}`].filter(Boolean).join(", ");
}

const STORAGE_KEY = "subzero-managed-locations";

export function getLocations(): Location[] {
  if (typeof window === "undefined") return locations;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return locations;
    const parsed = JSON.parse(saved) as Location[];
    return Array.isArray(parsed) ? parsed : locations;
  } catch {
    return locations;
  }
}

export function saveLocations(nextLocations: Location[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLocations));
  window.dispatchEvent(new CustomEvent("subzero-locations-updated"));
}
