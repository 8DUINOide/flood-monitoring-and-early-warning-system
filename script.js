// script.js
let map, barangayMarkers = [], highlightedMarker = null, highlightedFeatureId = null;
let highlightedListItem = null;
let geoData = null;

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWxmcmFuY2lzYnA0IiwiYSI6ImNtajloOW4zYzBjYTAzZHNiaHVuc2V1dWUifQ.m_UdZu36KHAKXu8-3TXElQ';

const BARANGAY_COLORS = {
    'abella': '#FFB6C1',
    'bagumbayan_norte': '#98FB98',
    'bagumbayan_sur': '#228B22',
    'balatas': '#ADD8E6',
    'calauag': '#32CD32',
    'cararayan': '#9370DB',
    'carolina': '#DDA0DD',
    'concepcion_grande': '#90EE90',
    'concepcion_pequena': '#006400',
    'dayangdang': '#FFD700',
    'del_rosario': '#FFA500',
    'dinaga': '#8B4513',
    'igualdad_interior': '#FFC0CB',
    'lerma': '#FF8C00',
    'liboton': '#0000FF',
    'mabolo': '#FFFFE0',
    'pacol': '#800080',
    'panicuason': '#FFFF00',
    'penafrancia': '#FF0000',
    'sabang': '#DDA0DD',
    'san_felipe': '#87CEEB',
    'san_francisco': '#008000',
    'san_isidro': '#00FF00',
    'santa_cruz': '#FF4500',
    'tabuco': '#A52A2A',
    'tinago': '#B0E0E6',
    'triangulo': '#FF69B4'
};

const BARANGAY_NAME_MAP = {
    'abella': 'Abella',
    'bagumbayan_norte': 'Bagumbayan Norte',
    'bagumbayan_sur': 'Bagumbayan Sur',
    'balatas': 'Balatas',
    'calauag': 'Calauag',
    'cararayan': 'Cararayan',
    'carolina': 'Carolina',
    'concepcion_grande': 'Concepcion Grande',
    'concepcion_pequena': ['Concepcion Pequeña', 'Concepción Pequeña', 'Concepcion Pequena'],
    'dayangdang': 'Dayangdang',
    'del_rosario': 'Del Rosario',
    'dinaga': 'Dinaga',
    'igualdad_interior': 'Igualdad Interior',
    'lerma': 'Lerma',
    'liboton': 'Liboton',
    'mabolo': 'Mabolo',
    'pacol': 'Pacol',
    'panicuason': ['Panicuason', 'Panucuason'],
    'penafrancia': ['Peñafrancia', 'Penafrancia'],
    'sabang': 'Sabang',
    'san_felipe': 'San Felipe',
    'san_francisco': 'San Francisco',
    'san_isidro': 'San Isidro',
    'santa_cruz': 'Santa Cruz',
    'tabuco': 'Tabuco',
    'tinago': 'Tinago',
    'triangulo': 'Triangulo'
};

let statuses = [...window.NAGA_DATA.initialStatuses];

// Google Earth Engine Tile URLs (visualized with your palettes)
const DTM_TILE_URL = 'https://earthengine.googleapis.com/v1/projects/floodmonitor-482303/maps/74a756330b2519764939472db2bafee4-9c629371e37d945a4c6c662237c8bb58/tiles/{z}/{x}/{y}';
const SLOPE_TILE_URL = 'https://earthengine.googleapis.com/v1/projects/floodmonitor-482303/maps/e11f538e813eea5a699de452b6e14c9f-b06c5f750530856f1f2de5aca3c8a910/tiles/{z}/{x}/{y}';

// Visualization parameters from your EE script
const dtmVis = {min: 0, max: 50, palette: ['#008000', '#ffff00', '#ff0000']}; // green, yellow, red
const slopeVis = {min: 0, max: 15, palette: ['#ffffff', '#000000']}; // white, black

// Helper function to convert hex to RGB array
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return [
        parseInt(hex.substr(0, 2), 16),
        parseInt(hex.substr(2, 2), 16),
        parseInt(hex.substr(4, 2), 16)
    ];
}

// Async function to get approximate value at point by sampling tile color and interpolating
async function getValueAtPoint(lon, lat, tileUrl, visParams) {
    const zoom = 18; // High zoom for better precision
    const n = Math.pow(2, zoom);
    const xtile = Math.floor(n * ((lon + 180) / 360));
    let siny = Math.sin(lat * Math.PI / 180);
    siny = Math.min(Math.max(siny, -0.9999), 0.9999);
    const ytile = Math.floor(n * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)));
    const url = tileUrl.replace('{z}', zoom).replace('{x}', xtile).replace('{y}', ytile);

    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const blob = await response.blob();
        const img = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Calculate pixel position within the tile
        const mercX = n * ((lon + 180) / 360);
        const sinLat = Math.sin(lat * Math.PI / 180);
        const mercY = n * (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI));
        const px = Math.floor((mercX - xtile) * 256);
        const py = Math.floor((mercY - ytile) * 256);

        const pixelData = ctx.getImageData(px, py, 1, 1).data;
        if (pixelData[3] < 128) return null; // Semi-transparent or transparent = no data

        const [r, g, b] = pixelData;

        // Parse palette to RGB
        const paletteRGB = visParams.palette.map(hexToRgb);

        // Function to interpolate color at normalized t (0 to 1)
        function interpColor(t) {
            const pos = t * (paletteRGB.length - 1);
            const i = Math.floor(pos);
            const f = pos - i;
            const c1 = paletteRGB[i];
            const c2 = paletteRGB[i + 1] || c1;
            return [
                c1[0] + f * (c2[0] - c1[0]),
                c1[1] + f * (c2[1] - c1[1]),
                c1[2] + f * (c2[2] - c1[2])
            ];
        }

        // Find best t by minimizing distance (sample 100 points)
        let bestT = 0;
        let bestDist = Infinity;
        const steps = 100;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const interp = interpColor(t);
            const dist = (r - interp[0]) ** 2 + (g - interp[1]) ** 2 + (b - interp[2]) ** 2;
            if (dist < bestDist) {
                bestDist = dist;
                bestT = t;
            }
        }

        if (bestDist > 100) return null; // Too far from palette, likely no data

        const value = visParams.min + bestT * (visParams.max - visParams.min);
        return value;
    } catch (e) {
        console.error('Error fetching tile:', e);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/2023/geojson/barangays/lowres/barangays-munic-050260000.geojson');
        geoData = await res.json();
        geoData.features.forEach(feature => {
            const propName = feature.properties.name.trim();
            let matchedId = null;
            for (const [id, names] of Object.entries(BARANGAY_NAME_MAP)) {
                if (Array.isArray(names)) {
                    if (names.some(n => n.toLowerCase() === propName.toLowerCase())) {
                        matchedId = id;
                        break;
                    }
                } else if (propName.toLowerCase() === names.toLowerCase()) {
                    matchedId = id;
                    break;
                }
            }
            feature.properties.barangayId = matchedId || propName.toLowerCase().replace(/\s+/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            feature.properties.color = BARANGAY_COLORS[feature.properties.barangayId] || '#808080';
            feature.properties.status = 'green';
            feature.properties.statusColor = window.NAGA_DATA.STATUS_COLORS.green.primary;
        });
    } catch (err) {
        console.error('GeoJSON load error:', err);
    }

    initMap();
    generateBarangayList();
    updateStatusCounter();

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => filterByStatus(btn.dataset.status));
    });
});

function initMap() {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const { NAGA_CITY_CENTER } = window.NAGA_DATA;

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [NAGA_CITY_CENTER.lng, NAGA_CITY_CENTER.lat],
        zoom: 14
    });

    map.on('style.load', addCustomLayers);

    map.on('load', () => {
        map.addControl(new mapboxgl.NavigationControl());
        map.addControl(new mapboxgl.GeolocateControl());
        map.addControl(new mapboxgl.FullscreenControl());
        map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-right');

        window.NAGA_DATA.barangays.forEach((barangay, index) => {
            const id = index + 1;
            const color = BARANGAY_COLORS[barangay.id] || '#808080';
            const marker = new mapboxgl.Marker({ color, draggable: false })
                .setLngLat([barangay.lng, barangay.lat])
                .addTo(map);
            marker.getElement().classList.add('barangay-marker');
            marker.getElement().addEventListener('click', () => {
                selectBarangay(barangay, marker, id, barangay.id);
            });
            barangayMarkers.push({ marker, data: barangay, id, featureId: barangay.id, color, listIndex: index });
        });

        // Terrain overlay toggles
        const dtmToggle = document.getElementById('toggle-dtm');
        const slopeToggle = document.getElementById('toggle-slope');
        if (dtmToggle) {
            dtmToggle.addEventListener('change', (e) => {
                map.setLayoutProperty('dtm-layer', 'visibility', e.target.checked ? 'visible' : 'none');
            });
        }
        if (slopeToggle) {
            slopeToggle.addEventListener('change', (e) => {
                map.setLayoutProperty('slope-layer', 'visibility', e.target.checked ? 'visible' : 'none');
            });
        }

        // Click to get DTM data at point
        map.on('click', async (e) => {
            const lng = e.lngLat.lng;
            const lat = e.lngLat.lat;

            // Show loading popup
            const popup = new mapboxgl.Popup({ closeOnClick: true })
                .setLngLat(e.lngLat)
                .setHTML(`
                    <div style="font-size:0.9em; min-width:200px;">
                        <strong>Coordinates:</strong><br>${lng.toFixed(6)}, ${lat.toFixed(6)}<br><br>
                        <strong>Elevation (m):</strong> Loading...<br>
                        <strong>Slope (°):</strong> Loading...
                    </div>
                `)
                .addTo(map);

            try {
                const [elevation, slope] = await Promise.all([
                    getValueAtPoint(lng, lat, DTM_TILE_URL, dtmVis),
                    getValueAtPoint(lng, lat, SLOPE_TILE_URL, slopeVis)
                ]);

                const elevStr = elevation !== null ? elevation.toFixed(2) : 'No data available';
                const slopeStr = slope !== null ? slope.toFixed(2) : 'No data available';

                popup.setHTML(`
                    <div style="font-size:0.9em; min-width:200px;">
                        <strong>Coordinates:</strong><br>${lng.toFixed(6)}, ${lat.toFixed(6)}<br><br>
                        <strong>Elevation (m):</strong> ${elevStr}<br>
                        <strong>Slope (°):</strong> ${slopeStr}
                    </div>
                `);
            } catch (err) {
                popup.setHTML(`
                    <div style="font-size:0.9em; min-width:200px;">
                        <strong>Coordinates:</strong><br>${lng.toFixed(6)}, ${lat.toFixed(6)}<br><br>
                        <strong>Error:</strong> Unable to fetch data.
                    </div>
                `);
            }
        });

        // Change cursor to indicate clickable map
        map.getCanvas().style.cursor = 'pointer';

        map.resize();
    });
}

function addCustomLayers() {
    if (!geoData) return;

    if (!map.getSource('barangays')) {
        map.addSource('barangays', { type: 'geojson', data: geoData });
        map.addLayer({
            id: 'barangay-boundaries',
            type: 'fill',
            source: 'barangays',
            paint: { 'fill-color': ['get', 'statusColor'], 'fill-opacity': 0.2 }
        });
        map.addLayer({
            id: 'barangay-outlines',
            type: 'line',
            source: 'barangays',
            paint: { 'line-color': ['get', 'color'], 'line-width': 1, 'line-opacity': 0.5 }
        });
        if (!highlightedFeatureId) {
            const bounds = new mapboxgl.LngLatBounds();
            geoData.features.forEach(f => {
                f.geometry.coordinates.forEach(poly => {
                    poly.forEach(ring => ring.forEach(coord => bounds.extend(coord)));
                });
            });
            map.fitBounds(bounds, { padding: 50, duration: 1500 });
        }
    }

    if (!map.getSource('naga-river')) {
        const riverCoords = window.NAGA_DATA.NAGA_RIVER_PATH.map(p => [p.lng, p.lat]);
        map.addSource('naga-river', {
            type: 'geojson',
            data: { type: 'Feature', geometry: { type: 'LineString', coordinates: riverCoords } }
        });
        map.addLayer({
            id: 'naga-river-glow',
            type: 'line',
            source: 'naga-river',
            paint: { 'line-color': '#00BFFF', 'line-width': 8, 'line-opacity': 0.4 }
        });
        map.addLayer({
            id: 'naga-river-line',
            type: 'line',
            source: 'naga-river',
            paint: { 'line-color': '#1E90FF', 'line-width': 4, 'line-opacity': 0.9 }
        });
    }

    if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
        });
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    }

    if (!map.getLayer('hillshading')) {
        map.addLayer({
            id: 'hillshading',
            source: 'mapbox-dem',
            type: 'hillshade',
            paint: { 'hillshade-shadow-color': '#473B24' }
        });
    }

    if (!map.getSource('terrain')) {
        map.addSource('terrain', { type: 'vector', url: 'mapbox://mapbox.mapbox-terrain-v2' });
    }

    if (!map.getLayer('contours')) {
        map.addLayer({
            id: 'contours',
            type: 'line',
            source: 'terrain',
            'source-layer': 'contour',
            paint: { 'line-color': '#877b59', 'line-width': 1 }
        });
    }

    if (!map.getSource('dtm-source')) {
        map.addSource('dtm-source', {
            type: 'raster',
            tiles: [DTM_TILE_URL],
            tileSize: 256
        });
        map.addLayer({
            id: 'dtm-layer',
            type: 'raster',
            source: 'dtm-source',
            paint: { 'raster-opacity': 0.6 },
            layout: { 'visibility': document.getElementById('toggle-dtm').checked ? 'visible' : 'none' }
        });
    }

    if (!map.getSource('slope-source')) {
        map.addSource('slope-source', {
            type: 'raster',
            tiles: [SLOPE_TILE_URL],
            tileSize: 256
        });
        map.addLayer({
            id: 'slope-layer',
            type: 'raster',
            source: 'slope-source',
            paint: { 'raster-opacity': 0.6 },
            layout: { 'visibility': document.getElementById('toggle-slope').checked ? 'visible' : 'none' }
        });
    }
}

function selectBarangay(barangay, marker, id, featureId, fromList = false) {
    map.flyTo({ center: [barangay.lng, barangay.lat], zoom: 15, duration: 1000 });
    resetHighlights();
    if (marker) {
        const el = marker.getElement();
        el.classList.add('highlight');
        el.style.transform = 'scale(1.5)';
        el.style.boxShadow = '0 0 0 3px black, 0 0 10px 2px rgba(0,0,0,0.6)';
        el.style.zIndex = '10';
        highlightedMarker = { marker, originalColor: BARANGAY_COLORS[featureId] || '#808080' };
    }
    const brighter = brightenColor(BARANGAY_COLORS[featureId] || '#808080');
    map.setPaintProperty('barangay-boundaries', 'fill-opacity', ['case', ['==', ['get', 'barangayId'], featureId], 0.6, 0.2]);
    map.setPaintProperty('barangay-boundaries', 'fill-color', ['case', ['==', ['get', 'barangayId'], featureId], brighter, ['get', 'statusColor']]);
    map.setPaintProperty('barangay-outlines', 'line-width', ['case', ['==', ['get', 'barangayId'], featureId], 3, 1]);
    map.setPaintProperty('barangay-outlines', 'line-color', ['case', ['==', ['get', 'barangayId'], featureId], '#003A6C', ['get', 'color']]);
    highlightedFeatureId = featureId;
    const listItems = document.querySelectorAll('#barangay-list li');
    const targetIndex = window.NAGA_DATA.barangays.findIndex(b => b.id === barangay.id);
    if (targetIndex !== -1) {
        const listItem = listItems[targetIndex];
        listItem.classList.add('list-highlight');
        listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        highlightedListItem = listItem;
    }
    showFloodSidebar(barangay, id, BARANGAY_COLORS[featureId] || '#808080');
    if (!fromList) toggleMenu(true);
}

function resetHighlights() {
    if (highlightedMarker) {
        const el = highlightedMarker.marker.getElement();
        el.classList.remove('highlight');
        el.style.transform = '';
        el.style.boxShadow = '';
        el.style.zIndex = '';
        highlightedMarker = null;
    }
    if (map.getLayer('barangay-boundaries')) {
        map.setPaintProperty('barangay-boundaries', 'fill-opacity', 0.2);
        map.setPaintProperty('barangay-boundaries', 'fill-color', ['get', 'statusColor']);
        map.setPaintProperty('barangay-outlines', 'line-width', 1);
        map.setPaintProperty('barangay-outlines', 'line-color', ['get', 'color']);
        highlightedFeatureId = null;
    }
    if (highlightedListItem) {
        highlightedListItem.classList.remove('list-highlight');
        highlightedListItem = null;
    }
    // Re-apply current filter to restore correct marker visibility
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const currentFilter = activeFilterBtn ? activeFilterBtn.dataset.status : 'all';
    filterByStatus(currentFilter);
}

function brightenColor(hex) {
    const r = Math.min(255, parseInt(hex.slice(1,3), 16) + 60).toString(16).padStart(2, '0');
    const g = Math.min(255, parseInt(hex.slice(3,5), 16) + 60).toString(16).padStart(2, '0');
    const b = Math.min(255, parseInt(hex.slice(5,7), 16) + 60).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

function showFloodSidebar(barangay, id, color) {
    document.getElementById('sidebar-title').textContent = `${barangay.name} (#${id})`;
    updateSidebar(barangay);
    document.getElementById('flood-sidebar').classList.add('sidebar-visible');
}

function updateSidebar(barangay) {
    const status = statuses.find(s => s.barangayId === barangay.id);
    const statusColor = window.NAGA_DATA.STATUS_COLORS[status.status].primary;
    const badgeClass = `status-${status.status}`;
    const label = window.NAGA_DATA.STATUS_COLORS[status.status].label;
    const action = window.NAGA_DATA.ALERT_ACTIONS[status.alertLevel];
    const color = BARANGAY_COLORS[barangay.id];
    document.getElementById('sidebar-content').innerHTML = `
        <h3>Status: <span class="status-badge ${badgeClass}">${status.status.toUpperCase()}</span></h3>
        <div class="info-section">
            <div class="info-label">Alert Level:</div>
            <div class="info-value highlight">${label}</div>
        </div>
        <div class="info-section">
            <div class="info-label">Recommended Action:</div>
            <div class="info-value action-text">${action}</div>
        </div>
        <div class="sensor-section">
            <h4>≡ Flood Sensors (LMDS200 & Weather)</h4>
            <div class="info-row"><span>Water Level:</span> <span class="editable" data-field="waterLevel" data-unit=" m">${status.waterLevel.toFixed(2)} m</span></div>
            <div class="info-row"><span>Distance to Water:</span> <span class="editable" data-field="distanceToWater" data-unit=" m">${status.distanceToWater.toFixed(3)} m</span></div>
            <div class="info-row"><span>Rainfall Intensity:</span> <span class="editable" data-field="rainfallIntensity" data-unit=" mm/hr">${status.rainfallIntensity.toFixed(1)} mm/hr</span></div>
            <div class="info-row"><span>Soil Moisture:</span> <span class="editable" data-field="soilMoisture" data-unit=" %">${status.soilMoisture} %</span></div>
        </div>
        <div class="sensor-section">
            <h4>☁ Weather Sensors (LT-208S)</h4>
            <div class="info-row"><span>Air Temperature:</span> <span class="editable" data-field="airTemp" data-unit=" °C">${status.airTemp.toFixed(1)} °C</span></div>
            <div class="info-row"><span>Humidity:</span> <span class="editable" data-field="humidity" data-unit=" %RH">${status.humidity} %RH</span></div>
            <div class="info-row"><span>Atm. Pressure:</span> <span class="editable" data-field="atmPressure" data-unit=" hPa">${status.atmPressure} hPa</span></div>
            <div class="info-row"><span>Wind Speed:</span> <span class="editable" data-field="windSpeed" data-unit=" m/s">${status.windSpeed.toFixed(1)} m/s</span></div>
            <div class="info-row"><span>Wind Direction:</span> <span class="editable" data-field="windDirection" data-unit=" °">${status.windDirection} °</span></div>
        </div>
        <div class="info-row"><span>Elevation:</span> <span>${barangay.elevation} m</span></div>
        <div class="info-row"><span>Flood Risk:</span> <span>${barangay.floodRisk}</span></div>
        <div class="info-row"><span>Base Color:</span> <span><div class="color-swatch" style="background: ${color};"></div>${color}</span></div>
        <div class="info-row"><span>Last Update:</span> <span>${status.timestamp.toLocaleTimeString()}</span></div>
        <button id="edit-save-btn" class="edit-btn">Edit</button>
        <div class="menu-section">
            <h4><i class="fa-solid fa-circle-info"></i> Flood Status Conditions</h4>
            <div class="legend">
                <div class="legend-item"><span class="legend-color green"></span> Water <0.5m & Rain <7.5mm/hr</div>
                <div class="legend-item"><span class="legend-color yellow"></span> Water 0.5–1.0m or Rain 7.5–30mm/hr</div>
                <div class="legend-item"><span class="legend-color red"></span> Water >1.0m or Rain >30mm/hr</div>
            </div>
        </div>
    `;
    document.getElementById('edit-save-btn').onclick = () => toggleEdit(barangay);
}

function toggleEdit(barangay) {
    const btn = document.getElementById('edit-save-btn');
    const status = statuses.find(s => s.barangayId === barangay.id);
    if (btn.textContent === 'Edit') {
        btn.textContent = 'Save';
        document.querySelectorAll('#sidebar-content .editable').forEach(span => {
            const field = span.dataset.field;
            const unit = span.dataset.unit;
            const value = parseFloat(span.textContent.replace(unit, '').trim());
            span.innerHTML = `<input class="edit-input" type="number" step="0.01" value="${value}"><span class="unit">${unit}</span>`;
        });
    } else {
        const updates = {};
        document.querySelectorAll('#sidebar-content .editable').forEach(span => {
            const input = span.querySelector('input');
            if (input) {
                const field = span.dataset.field;
                const unit = span.dataset.unit;
                const newValue = parseFloat(input.value) || 0;
                updates[field] = newValue;
                const fixed = field === 'distanceToWater' ? 3 : ['rainfallIntensity', 'windSpeed', 'airTemp'].includes(field) ? 1 : 0;
                span.innerHTML = `${newValue.toFixed(fixed)}${unit}`;
            }
        });
        Object.assign(status, updates);
        status.timestamp = new Date();
        calculateStatus(status, barangay);
        updateSidebar(barangay);
        updateMapStatuses();
        updateStatusCounter();
        btn.textContent = 'Edit';
    }
}

function calculateStatus(status, barangay) {
    let waterStatus = 'green';
    if (status.waterLevel >= window.NAGA_DATA.ALERT_THRESHOLDS.waterLevel.greenToYellow) waterStatus = 'yellow';
    if (status.waterLevel >= window.NAGA_DATA.ALERT_THRESHOLDS.waterLevel.yellowToRed) waterStatus = 'red';
    let rainStatus = 'green';
    if (status.rainfallIntensity >= window.NAGA_DATA.ALERT_THRESHOLDS.rainfall.greenToYellow) rainStatus = 'yellow';
    if (status.rainfallIntensity >= window.NAGA_DATA.ALERT_THRESHOLDS.rainfall.yellowToRed) rainStatus = 'red';
    const statusLevels = { green: 0, yellow: 1, red: 2 };
    const maxLevel = Math.max(statusLevels[waterStatus], statusLevels[rainStatus]);
    const newStatus = Object.keys(statusLevels).find(key => statusLevels[key] === maxLevel);
    if (newStatus !== status.status) {
        status.status = newStatus;
        status.timeInCurrentStatus = 0;
        status.alertLevel = newStatus === 'green' ? 'safe' : newStatus === 'yellow' ? 'prepare' : 'evacuate';
    }
    if (status.status === 'red' && status.timeInCurrentStatus > window.NAGA_DATA.ALERT_THRESHOLDS.escalationTime.redToEvacuate) {
        status.alertLevel = 'forced_evacuation';
    }
}

function updateStatusCounter() {
    const counts = { green: 0, yellow: 0, red: 0 };
    statuses.forEach(s => counts[s.status]++);
    let statusCounterDiv = document.getElementById('status-counter');
    if (!statusCounterDiv) {
        statusCounterDiv = document.createElement('div');
        statusCounterDiv.id = 'status-counter';
        statusCounterDiv.className = 'status-counter';
        const menuHeader = document.querySelector('.menu-header');
        if (menuHeader && menuHeader.nextSibling) {
            menuHeader.parentNode.insertBefore(statusCounterDiv, menuHeader.nextSibling);
        }
    }
    statusCounterDiv.innerHTML = `
        <div class="counter-item" data-status="green">
            <i class="fa-solid fa-circle" style="color: #10b981;"></i>
            <span id="count-green">${counts.green}</span>
        </div>
        <div class="counter-item" data-status="yellow">
            <i class="fa-solid fa-circle" style="color: #f59e0b;"></i>
            <span id="count-yellow">${counts.yellow}</span>
        </div>
        <div class="counter-item" data-status="red">
            <i class="fa-solid fa-circle" style="color: #ef4444;"></i>
            <span id="count-red">${counts.red}</span>
        </div>
        <div class="counter-total">Total: ${counts.green + counts.yellow + counts.red}</div>
    `;
}

function closeFloodSidebar() {
    document.getElementById('flood-sidebar').classList.remove('sidebar-visible');
    resetHighlights();
}

function toggleMenu(open = null) {
    const menu = document.getElementById('left-menu');
    if (open !== null) menu.classList.toggle('menu-visible', open);
    else menu.classList.toggle('menu-visible');
}

function toggleBarangayList() {
    document.getElementById('barangay-list').classList.toggle('hidden');
}

function generateBarangayList() {
    const list = document.getElementById('barangay-list');
    list.classList.add('hidden');
    const { barangays } = window.NAGA_DATA;
    list.innerHTML = '';
    barangays.forEach((b, i) => {
        const li = document.createElement('li');
        const color = BARANGAY_COLORS[b.id] || '#808080';
        li.innerHTML = `<span class="number">${i+1}</span><div class="color-dot" style="background: ${color};"></div><span>${b.name}</span>`;
        li.onclick = (e) => {
            e.stopPropagation();
            const markerData = barangayMarkers.find(m => m.data.id === b.id);
            if (markerData) selectBarangay(b, markerData.marker, i+1, b.id, true);
        };
        list.appendChild(li);
    });
}

function searchLocation() {
    const query = document.getElementById('map-search-input').value.trim();
    if (!query) return;
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=PH&limit=1`)
        .then(res => res.json())
        .then(data => {
            if (data.features[0]) {
                const [lng, lat] = data.features[0].center;
                map.flyTo({ center: [lng, lat], zoom: 15 });
                new mapboxgl.Marker({ color: '#003A6C' }).setLngLat([lng, lat]).setPopup(new mapboxgl.Popup().setText(data.features[0].place_name)).addTo(map);
                showToast(`Found: ${data.features[0].place_name}`);
            } else showToast('Not found');
        }).catch(() => showToast('Search error'));
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

function setBasemap(type) {
    let style;
    if (type === 'outdoors') style = 'mapbox://styles/mapbox/outdoors-v12';
    else if (type === 'streets') style = 'mapbox://styles/mapbox/streets-v12';
    else if (type === 'satellite') style = 'mapbox://styles/mapbox/satellite-streets-v12';
    map.setStyle(style);
}

function filterByStatus(val) {
    barangayMarkers.forEach(m => {
        const status = statuses.find(s => s.barangayId === m.data.id)?.status || 'green';
        const shouldShow = (val === 'all' || status === val);
        m.marker.getElement().style.display = shouldShow ? 'block' : 'none';
    });
    if (val === 'all') {
        map.setPaintProperty('barangay-boundaries', 'fill-opacity', 0.2);
    } else {
        map.setPaintProperty('barangay-boundaries', 'fill-opacity', ['case', ['==', ['get', 'status'], val], 0.6, 0]);
    }
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.status === val);
    });
}

function updateMapStatuses() {
    if (geoData) {
        geoData.features.forEach(feature => {
            const statusObj = statuses.find(s => s.barangayId === feature.properties.barangayId);
            if (statusObj) {
                feature.properties.status = statusObj.status;
                feature.properties.statusColor = window.NAGA_DATA.STATUS_COLORS[statusObj.status].primary;
            }
        });
        if (map.getSource('barangays')) {
            map.getSource('barangays').setData(geoData);
        }
    }
    barangayMarkers.forEach(m => {
        const status = statuses.find(s => s.barangayId === m.data.id);
        if (status) m.marker.setColor(window.NAGA_DATA.STATUS_COLORS[status.status].primary);
    });
    updateStatusCounter();
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const currentFilter = activeFilterBtn ? activeFilterBtn.dataset.status : 'all';
    filterByStatus(currentFilter);
}