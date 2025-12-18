// 27 Barangays of Naga City, Camarines Sur
// Coordinates updated with accurate centers from Google Maps (December 2025)
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
  // Updated with real coordinates
  { id: 'abella', name: 'Abella', lat: 13.6232621, lng: 123.1818874, population: 5757, area: 120, elevation: 12, floodRisk: 'medium', nearWaterway: true },
  { id: 'bagumbayan_norte', name: 'Bagumbayan Norte', lat: 13.6357009, lng: 123.1850491, population: 2203, area: 45, elevation: 10, floodRisk: 'high', nearWaterway: true },
  { id: 'bagumbayan_sur', name: 'Bagumbayan Sur', lat: 13.631397, lng: 123.1843465, population: 7867, area: 85, elevation: 9, floodRisk: 'high', nearWaterway: true },
  { id: 'balatas', name: 'Balatas', lat: 13.6305476, lng: 123.2068269, population: 11112, area: 280, elevation: 15, floodRisk: 'low', nearWaterway: false },
  { id: 'calauag', name: 'Calauag', lat: 13.6411574, lng: 123.1906697, population: 11295, area: 320, elevation: 14, floodRisk: 'medium', nearWaterway: true },
  { id: 'cararayan', name: 'Cararayan', lat: 13.6336728, lng: 123.2447508, population: 19692, area: 450, elevation: 20, floodRisk: 'low', nearWaterway: false },
  { id: 'carolina', name: 'Carolina', lat: 13.6600721, lng: 123.2868712, population: 6870, area: 150, elevation: 11, floodRisk: 'medium', nearWaterway: true },
  { id: 'concepcion_grande', name: 'Concepcion Grande', lat: 13.6219344, lng: 123.2222792, population: 11125, area: 380, elevation: 8, floodRisk: 'high', nearWaterway: true },
  { id: 'concepcion_pequena', name: 'Concepcion Pequeña', lat: 13.6196276, lng: 123.204047, population: 25139, area: 180, elevation: 9, floodRisk: 'high', nearWaterway: true },
  { id: 'dayangdang', name: 'Dayangdang', lat: 13.6271938, lng: 123.1955874, population: 4130, area: 65, elevation: 8, floodRisk: 'high', nearWaterway: true },
  { id: 'del_rosario', name: 'Del Rosario', lat: 13.6194072, lng: 123.2391334, population: 10337, area: 200, elevation: 10, floodRisk: 'medium', nearWaterway: false },
  { id: 'dinaga', name: 'Dinaga', lat: 13.6221064, lng: 123.1854004, population: 344, area: 280, elevation: 35, floodRisk: 'low', nearWaterway: false },
  { id: 'igualdad_interior', name: 'Igualdad Interior', lat: 13.6220025, lng: 123.1818874, population: 3008, area: 55, elevation: 11, floodRisk: 'medium', nearWaterway: false },
  { id: 'lerma', name: 'Lerma', lat: 13.6223155, lng: 123.1882107, population: 1640, area: 35, elevation: 9, floodRisk: 'high', nearWaterway: true },
  { id: 'liboton', name: 'Liboton', lat: 13.6359078, lng: 123.1920747, population: 3105, area: 50, elevation: 8, floodRisk: 'high', nearWaterway: true },
  { id: 'mabolo', name: 'Mabolo', lat: 13.6141824, lng: 123.1815361, population: 8125, area: 160, elevation: 12, floodRisk: 'medium', nearWaterway: false },
  { id: 'pacol', name: 'Pacol', lat: 13.6550718, lng: 123.2531764, population: 14747, area: 520, elevation: 6, floodRisk: 'high', nearWaterway: true },
  { id: 'panicuason', name: 'Panicuason', lat: 13.6633692, lng: 123.3317795, population: 3100, area: 680, elevation: 45, floodRisk: 'low', nearWaterway: false },
  { id: 'penafrancia', name: 'Peñafrancia', lat: 13.6326533, lng: 123.1927773, population: 4503, area: 75, elevation: 9, floodRisk: 'high', nearWaterway: true },
  { id: 'sabang', name: 'Sabang', lat: 13.6189064, lng: 123.1794282, population: 6838, area: 180, elevation: 7, floodRisk: 'high', nearWaterway: true },
  { id: 'san_felipe', name: 'San Felipe', lat: 13.6437704, lng: 123.2110414, population: 21098, area: 380, elevation: 18, floodRisk: 'low', nearWaterway: false },
  { id: 'san_francisco', name: 'San Francisco', lat: 13.6255698, lng: 123.1875081, population: 722, area: 25, elevation: 8, floodRisk: 'high', nearWaterway: true },
  { id: 'san_isidro', name: 'San Isidro', lat: 13.6292504, lng: 123.2658133, population: 3432, area: 220, elevation: 22, floodRisk: 'low', nearWaterway: false },
  { id: 'santa_cruz', name: 'Santa Cruz', lat: 13.6263581, lng: 123.1843465, population: 7135, area: 140, elevation: 7, floodRisk: 'high', nearWaterway: true },
  { id: 'tabuco', name: 'Tabuco', lat: 13.6153359, lng: 123.1864543, population: 4240, area: 190, elevation: 6, floodRisk: 'high', nearWaterway: true },
  { id: 'tinago', name: 'Tinago', lat: 13.624571, lng: 123.1920747, population: 2904, area: 45, elevation: 8, floodRisk: 'high', nearWaterway: true },
  { id: 'triangulo', name: 'Triangulo', lat: 13.6175384, lng: 123.1927773, population: 8702, area: 95, elevation: 10, floodRisk: 'medium', nearWaterway: true },
];
// Weather stations - one per barangay (exact same location as barangay center)
const weatherStations = barangays.map((b, index) => ({
  id: `station_${b.id}`,
  barangayId: b.id,
  name: `${b.name} Weather Station`,
  lat: b.lat,
  lng: b.lng,
  type: b.nearWaterway ? 'combined' : (index % 2 === 0 ? 'rainfall' : 'water_level'),
}));
// Initial statuses (all green; will be updated in sim)
const initialStatuses = barangays.map(b => ({
  barangayId: b.id,
  status: 'green',
  alertLevel: 'safe',
  waterLevel: 0.08, // in meters
  rainfallIntensity: 0.7, // mm/hr
  timestamp: new Date(),
  timeInCurrentStatus: 0, // minutes
  distanceToWater: 0.306,
  soilMoisture: 55,
  airTemp: 28.3,
  humidity: 84,
  atmPressure: 1018,
  windSpeed: 5.4,
  windDirection: 185
}));
// Alert thresholds based on HEC-HMS/HEC-RAS parameters
const ALERT_THRESHOLDS = {
  waterLevel: {
    normal: 0.5, // < 0.5m - Green
    warning: 1.5, // 0.5-1.5m - Yellow
    critical: 2.5, // >2.5m - Red (adjusted for clarity)
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