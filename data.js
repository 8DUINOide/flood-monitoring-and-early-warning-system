// data.js
// 27 Barangays of Naga City, Camarines Sur
// Cleaned version - removed unnecessary data (population, area, elevation, floodRisk, nearWaterway)

const NAGA_CITY_CENTER = {
  lat: 13.6244,
  lng: 123.1864,
};

// Highly accurate Naga River path – traced from satellite imagery (Dec 2025)
const NAGA_RIVER_PATH = [
  { lng: 123.1858, lat: 13.6105 },
  { lng: 123.1872, lat: 13.6130 },
  { lng: 123.1885, lat: 13.6158 },
  { lng: 123.1898, lat: 13.6182 },
  { lng: 123.1905, lat: 13.6205 },
  { lng: 123.1910, lat: 13.6228 },
  { lng: 123.1902, lat: 13.6250 },
  { lng: 123.1888, lat: 13.6272 },
  { lng: 123.1875, lat: 13.6290 },
  { lng: 123.1860, lat: 13.6315 },
  { lng: 123.1852, lat: 13.6338 },
  { lng: 123.1850, lat: 13.6360 },
  { lng: 123.1858, lat: 13.6385 },
  { lng: 123.1870, lat: 13.6405 },
  { lng: 123.1885, lat: 13.6422 }
];

const barangays = [
  { id: 'abella', name: 'Abella', lat: 13.6232621, lng: 123.1818874 },
  { id: 'bagumbayan_norte', name: 'Bagumbayan Norte', lat: 13.6357009, lng: 123.1850491 },
  { id: 'bagumbayan_sur', name: 'Bagumbayan Sur', lat: 13.631397, lng: 123.1843465 },
  { id: 'balatas', name: 'Balatas', lat: 13.6305476, lng: 123.2068269 },
  { id: 'calauag', name: 'Calauag', lat: 13.6411574, lng: 123.1906697 },
  { id: 'cararayan', name: 'Cararayan', lat: 13.6336728, lng: 123.2447508 },
  { id: 'carolina', name: 'Carolina', lat: 13.6600721, lng: 123.2868712 },
  { id: 'concepcion_grande', name: 'Concepcion Grande', lat: 13.6219344, lng: 123.2222792 },
  { id: 'concepcion_pequena', name: 'Concepcion Pequeña', lat: 13.6196276, lng: 123.204047 },
  { id: 'dayangdang', name: 'Dayangdang', lat: 13.6271938, lng: 123.1955874 },
  { id: 'del_rosario', name: 'Del Rosario', lat: 13.6194072, lng: 123.2391334 },
  { id: 'dinaga', name: 'Dinaga', lat: 13.6221064, lng: 123.1854004 },
  { id: 'igualdad_interior', name: 'Igualdad Interior', lat: 13.6220025, lng: 123.1818874 },
  { id: 'lerma', name: 'Lerma', lat: 13.6223155, lng: 123.1882107 },
  { id: 'liboton', name: 'Liboton', lat: 13.6359078, lng: 123.1920747 },
  { id: 'mabolo', name: 'Mabolo', lat: 13.6141824, lng: 123.1815361 },
  { id: 'pacol', name: 'Pacol', lat: 13.6550718, lng: 123.2531764 },
  { id: 'panicuason', name: 'Panicuason', lat: 13.6633692, lng: 123.3317795 },
  { id: 'penafrancia', name: 'Peñafrancia', lat: 13.6326533, lng: 123.1927773 },
  { id: 'sabang', name: 'Sabang', lat: 13.6189064, lng: 123.1794282 },
  { id: 'san_felipe', name: 'San Felipe', lat: 13.6437704, lng: 123.2110414 },
  { id: 'san_francisco', name: 'San Francisco', lat: 13.6255698, lng: 123.1875081 },
  { id: 'san_isidro', name: 'San Isidro', lat: 13.6292504, lng: 123.2658133 },
  { id: 'santa_cruz', name: 'Santa Cruz', lat: 13.6263581, lng: 123.1843465 },
  { id: 'tabuco', name: 'Tabuco', lat: 13.6153359, lng: 123.1864543 },
  { id: 'tinago', name: 'Tinago', lat: 13.624571, lng: 123.1920747 },
  { id: 'triangulo', name: 'Triangulo', lat: 13.6175384, lng: 123.1927773 },
];

const weatherStations = barangays.map((b, index) => ({
  id: `station_${b.id}`,
  barangayId: b.id,
  name: `${b.name} Weather Station`,
  lat: b.lat,
  lng: b.lng,
  type: index % 3 === 0 ? 'combined' : (index % 2 === 0 ? 'rainfall' : 'water_level'),
}));

const initialStatuses = barangays.map(b => ({
  barangayId: b.id,
  status: 'green',
  alertLevel: 'safe',
  waterLevel: 0.08,
  rainfallIntensity: 0.7,
  timestamp: new Date(),
  timeInCurrentStatus: 0,
  distanceToWater: 0.306,
  soilMoisture: 55,
  airTemp: 28.3,
  humidity: 84,
  atmPressure: 1018,
  windSpeed: 5.4,
  windDirection: 185
}));

const ALERT_THRESHOLDS = {
  waterLevel: { greenToYellow: 0.5, yellowToRed: 1.0 },
  rainfall: { greenToYellow: 7.5, yellowToRed: 30 },
  escalationTime: { yellowToRed: 30, redToEvacuate: 15 },
};

const STATUS_COLORS = {
  green: { primary: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', label: 'Safe' },
  yellow: { primary: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', label: 'Prepare' },
  red: { primary: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', label: 'Critical' },
};

const ALERT_ACTIONS = {
  safe: 'Continue monitoring. Normal conditions.',
  prepare: 'Secure belongings. Monitor updates closely. Be ready to evacuate.',
  evacuate: 'EVACUATE NOW to designated evacuation centers.',
  forced_evacuation: 'MANDATORY EVACUATION. Leave immediately for your safety.',
};

window.NAGA_DATA = {
  NAGA_CITY_CENTER,
  NAGA_RIVER_PATH,
  barangays,
  weatherStations,
  initialStatuses,
  ALERT_THRESHOLDS,
  STATUS_COLORS,
  ALERT_ACTIONS
};