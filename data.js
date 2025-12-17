// 27 Barangays of Naga City, Camarines Sur
// Coordinates approximated based on geographic distribution around city center (13.6244°N, 123.1864°E)

// Naga City Center
const NAGA_CITY_CENTER = {
  lat: 13.6244,
  lng: 123.1864,
};

// The Naga River (Bicol River tributary) flows through the city
const NAGA_RIVER_PATH = [
  [123.165, 13.640],
  [123.175, 13.635],
  [123.185, 13.628],
  [123.190, 13.620],
  [123.195, 13.612],
  [123.200, 13.605],
  [123.210, 13.598],
];

const barangays = [
  // Northern Barangays
  { id: 'abella', name: 'Abella', lat: 13.6380, lng: 123.1780, population: 5757, area: 120, elevation: 12, floodRisk: 'medium', nearWaterway: true },
  { id: 'bagumbayan_norte', name: 'Bagumbayan Norte', lat: 13.6350, lng: 123.1820, population: 2203, area: 45, elevation: 10, floodRisk: 'high', nearWaterway: true },
  { id: 'bagumbayan_sur', name: 'Bagumbayan Sur', lat: 13.6320, lng: 123.1830, population: 7867, area: 85, elevation: 9, floodRisk: 'high', nearWaterway: true },
  { id: 'balatas', name: 'Balatas', lat: 13.6450, lng: 123.1750, population: 11112, area: 280, elevation: 15, floodRisk: 'low', nearWaterway: false },

  // Central-North Barangays
  { id: 'calauag', name: 'Calauag', lat: 13.6280, lng: 123.1700, population: 11295, area: 320, elevation: 14, floodRisk: 'medium', nearWaterway: true },
  { id: 'cararayan', name: 'Cararayan', lat: 13.6520, lng: 123.1680, population: 19692, area: 450, elevation: 20, floodRisk: 'low', nearWaterway: false },
  { id: 'carolina', name: 'Carolina', lat: 13.6200, lng: 123.1720, population: 6870, area: 150, elevation: 11, floodRisk: 'medium', nearWaterway: true },
  { id: 'concepcion_grande', name: 'Concepcion Grande', lat: 13.6150, lng: 123.1950, population: 11125, area: 380, elevation: 8, floodRisk: 'high', nearWaterway: true },

  // Central Barangays (Downtown)
  { id: 'concepcion_pequena', name: 'Concepcion Pequeña', lat: 13.6220, lng: 123.1880, population: 25139, area: 180, elevation: 9, floodRisk: 'high', nearWaterway: true },
  { id: 'dayangdang', name: 'Dayangdang', lat: 13.6180, lng: 123.1850, population: 4130, area: 65, elevation: 8, floodRisk: 'high', nearWaterway: true },
  { id: 'del_rosario', name: 'Del Rosario', lat: 13.6250, lng: 123.1920, population: 10337, area: 200, elevation: 10, floodRisk: 'medium', nearWaterway: false },
  { id: 'dinaga', name: 'Dinaga', lat: 13.6580, lng: 123.1600, population: 344, area: 280, elevation: 35, floodRisk: 'low', nearWaterway: false },

  // Eastern Barangays
  { id: 'igualdad_interior', name: 'Igualdad Interior', lat: 13.6300, lng: 123.1950, population: 3008, area: 55, elevation: 11, floodRisk: 'medium', nearWaterway: false },
  { id: 'lerma', name: 'Lerma', lat: 13.6270, lng: 123.1850, population: 1640, area: 35, elevation: 9, floodRisk: 'high', nearWaterway: true },
  { id: 'liboton', name: 'Liboton', lat: 13.6230, lng: 123.1800, population: 3105, area: 50, elevation: 8, floodRisk: 'high', nearWaterway: true },
  { id: 'mabolo', name: 'Mabolo', lat: 13.6350, lng: 123.1900, population: 8125, area: 160, elevation: 12, floodRisk: 'medium', nearWaterway: false },

  // Southern Barangays
  { id: 'pacol', name: 'Pacol', lat: 13.6050, lng: 123.1750, population: 14747, area: 520, elevation: 6, floodRisk: 'high', nearWaterway: true },
  { id: 'panicuason', name: 'Panicuason', lat: 13.6650, lng: 123.1550, population: 3100, area: 680, elevation: 45, floodRisk: 'low', nearWaterway: false },
  { id: 'penafrancia', name: 'Peñafrancia', lat: 13.6190, lng: 123.1900, population: 4503, area: 75, elevation: 9, floodRisk: 'high', nearWaterway: true },
  { id: 'sabang', name: 'Sabang', lat: 13.6100, lng: 123.1850, population: 6838, area: 180, elevation: 7, floodRisk: 'high', nearWaterway: true },

  // Western Barangays
  { id: 'san_felipe', name: 'San Felipe', lat: 13.6400, lng: 123.1650, population: 21098, area: 380, elevation: 18, floodRisk: 'low', nearWaterway: false },
  { id: 'san_francisco', name: 'San Francisco', lat: 13.6240, lng: 123.1860, population: 722, area: 25, elevation: 8, floodRisk: 'high', nearWaterway: true },
  { id: 'san_isidro', name: 'San Isidro', lat: 13.6480, lng: 123.1720, population: 3432, area: 220, elevation: 22, floodRisk: 'low', nearWaterway: false },
  { id: 'santa_cruz', name: 'Santa Cruz', lat: 13.6130, lng: 123.1780, population: 7135, area: 140, elevation: 7, floodRisk: 'high', nearWaterway: true },

  // Remaining Barangays
  { id: 'tabuco', name: 'Tabuco', lat: 13.6080, lng: 123.1920, population: 4240, area: 190, elevation: 6, floodRisk: 'high', nearWaterway: true },
  { id: 'tinago', name: 'Tinago', lat: 13.6160, lng: 123.1820, population: 2904, area: 45, elevation: 8, floodRisk: 'high', nearWaterway: true },
  { id: 'triangulo', name: 'Triangulo', lat: 13.6290, lng: 123.1780, population: 8702, area: 95, elevation: 10, floodRisk: 'medium', nearWaterway: true },
];

// Weather stations - one per barangay
const weatherStations = barangays.map((b, index) => ({
  id: `station_${b.id}`,
  barangayId: b.id,
  name: `${b.name} Weather Station`,
  lat: b.lat + (Math.random() - 0.5) * 0.002, // Slight offset from barangay center
  lng: b.lng + (Math.random() - 0.5) * 0.002,
  type: b.nearWaterway ? 'combined' : (index % 2 === 0 ? 'rainfall' : 'water_level'),
}));

// Initial statuses (all green; will be updated in sim)
const initialStatuses = barangays.map(b => ({
  barangayId: b.id,
  status: 'green',
  alertLevel: 'safe',
  waterLevel: 0, // in meters
  rainfallIntensity: 0, // mm/hr
  timestamp: new Date()
}));

// Alert thresholds based on HEC-HMS/HEC-RAS parameters
const ALERT_THRESHOLDS = {
  waterLevel: {
    normal: 0.5, // < 0.5m - Green
    warning: 1.5, // 0.5-1.5m - Yellow
    critical: 2.5, // > 1.5m - Red
  },
  rainfall: {
    light: 2.5, // mm/hr
    moderate: 7.5, // mm/hr
    heavy: 15, // mm/hr
    intense: 30, // mm/hr
  },
  // Time-based escalation (minutes)
  escalationTime: {
    yellowToRed: 30,
    redToEvacuate: 15,
  },
};

// Color mapping for flood status
const STATUS_COLORS = {
  green: { primary: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', label: 'Safe / Monitor' },
  yellow: { primary: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', label: 'Prepare' },
  red: { primary: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', label: 'Critical' },
};

const ALERT_ACTIONS = {
  safe: 'Continue monitoring. Normal conditions.',
  prepare: 'Secure belongings. Monitor updates closely. Be ready to evacuate.',
  evacuate: 'EVACUATE NOW to designated evacuation centers.',
  forced_evacuation: 'MANDATORY EVACUATION. Leave immediately for your safety.',
};

// Export for script.js
window.NAGA_DATA = { NAGA_CITY_CENTER, NAGA_RIVER_PATH, barangays, weatherStations, initialStatuses, ALERT_THRESHOLDS, STATUS_COLORS, ALERT_ACTIONS };