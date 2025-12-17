// Globals
let map, barangayMarkers = [], highlightedMarker = null, highlightedFeatureId = null;
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWxmcmFuY2lzYnA0IiwiYSI6ImNtajloOW4zYzBjYTAzZHNiaHVuc2V1dWUifQ.m_UdZu36KHAKXu8-3TXElQ';

// Image-matched colors for 27 barangays (HEX from legend)
const BARANGAY_COLORS = {
    'abella': '#FFB6C1', // Pink
    'bagumbayan_norte': '#98FB98', // Light green
    'bagumbayan_sur': '#228B22', // Dark green
    'balatas': '#ADD8E6', // Light blue
    'calauag': '#32CD32', // Lime green
    'cararayan': '#9370DB', // Medium purple
    'carolina': '#DDA0DD', // Plum
    'concepcion_grande': '#90EE90', // Light green
    'concepcion_pequena': '#006400', // Dark green
    'dayangdang': '#FFD700', // Gold
    'del_rosario': '#FFA500', // Orange
    'dinaga': '#8B4513', // Saddle brown
    'igualdad_interior': '#FFC0CB', // Pink
    'lerma': '#FF8C00', // Dark orange
    'liboton': '#0000FF', // Blue
    'mabolo': '#FFFFE0', // Light yellow
    'pacol': '#800080', // Purple
    'panicuason': '#FFFF00', // Yellow
    'penafrancia': '#FF0000', // Red
    'sabang': '#DDA0DD', // Plum
    'san_felipe': '#87CEEB', // Sky blue
    'san_francisco': '#008000', // Green
    'san_isidro': '#00FF00', // Lime
    'santa_cruz': '#FF4500', // Orange red
    'tabuco': '#A52A2A', // Brown
    'tinago': '#B0E0E6', // Powder blue
    'triangulo': '#FF69B4' // Hot pink
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    generateBarangayList();
});

// Map init with real GeoJSON
function initMap() {
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const { NAGA_CITY_CENTER, weatherStations } = window.NAGA_DATA;

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [NAGA_CITY_CENTER.lng, NAGA_CITY_CENTER.lat],
        zoom: 12.5  // Closer for Naga coverage
    });

    map.on('load', () => {
        // Load real GeoJSON for boundaries
        fetch('https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/2023/geojson/barangays/lowres/barangays-munic-050260000.geojson')
            .then(res => res.json())
            .then(geojson => {
                // Enhance with colors
                geojson.features.forEach(feature => {
                    const name = feature.properties.name.toLowerCase().replace(/\s+/g, '_');
                    feature.properties.color = BARANGAY_COLORS[name] || '#808080'; // Default gray
                    feature.properties.status = 'green'; // Initial
                });
                map.addSource('barangays', { type: 'geojson', data: geojson });
                map.addLayer({
                    id: 'barangay-boundaries',
                    type: 'fill',
                    source: 'barangays',
                    paint: {
                        'fill-color': ['get', 'color'],
                        'fill-opacity': 0.2
                    }
                });
                map.addLayer({
                    id: 'barangay-outlines',
                    type: 'line',
                    source: 'barangays',
                    paint: {
                        'line-color': ['get', 'color'],
                        'line-width': 1,
                        'line-opacity': 0.5
                    }
                });
            })
            .catch(err => console.error('GeoJSON load error:', err)); // Fallback to mock if fail

        // Controls
        map.addControl(new mapboxgl.NavigationControl());
        map.addControl(new mapboxgl.GeolocateControl());
        map.addControl(new mapboxgl.FullscreenControl());
        map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-right');

        // Markers (color-matched pins)
        window.NAGA_DATA.barangays.forEach((barangay, index) => {
            const id = index + 1;
            const color = BARANGAY_COLORS[barangay.id] || BARANGAY_COLORS[Object.keys(BARANGAY_COLORS)[index % Object.keys(BARANGAY_COLORS).length]];
            const marker = new mapboxgl.Marker({ color })
                .setLngLat([barangay.lng, barangay.lat])
                .addTo(map);

            marker.getElement().classList.add('barangay-marker');
            marker.getElement().addEventListener('click', () => selectBarangay(barangay, marker, id, barangay.id));
            barangayMarkers.push({ marker, data: barangay, id, featureId: barangay.id, color });
        });

        // Stations
        weatherStations.forEach(station => {
            const el = document.createElement('div');
            el.className = 'station-marker';
            el.title = station.name;
            new mapboxgl.Marker({ element: el }).setLngLat([station.lng, station.lat]).addTo(map);
        });

        map.resize();
    });
}

// Select & highlight
function selectBarangay(barangay, marker, id, featureId) {
    map.flyTo({ center: [barangay.lng, barangay.lat], zoom: 15, duration: 1000 });

    // Reset previous
    if (highlightedMarker) {
        highlightedMarker.marker.getElement().classList.remove('highlight');
        highlightedMarker.marker.getElement().style.backgroundColor = highlightedMarker.color;
    }
    if (highlightedFeatureId) {
        map.setPaintProperty('barangay-boundaries', 'fill-opacity', ['case', ['==', ['get', 'id'], highlightedFeatureId], 0.6, 0.2]);
        map.setPaintProperty('barangay-boundaries', 'fill-color', ['case', ['==', ['get', 'id'], highlightedFeatureId], BARANGAY_COLORS[highlightedFeatureId], ['get', 'color']]);
        map.setPaintProperty('barangay-outlines', 'line-width', ['case', ['==', ['get', 'id'], highlightedFeatureId], 3, 1]);
        map.setPaintProperty('barangay-outlines', 'line-color', ['case', ['==', ['get', 'id'], highlightedFeatureId], '#003A6C', ['get', 'color']]);
    }

    // Highlight new
    marker.getElement().classList.add('highlight');
    marker.getElement().style.backgroundColor = '#FFD700'; // Gold
    highlightedMarker = { marker, color: marker.getElement().style.backgroundColor };

    // Polygon highlight
    map.setPaintProperty('barangay-boundaries', 'fill-opacity', ['case', ['==', ['get', 'id'], featureId], 0.6, 0.2]);
    const brighter = brightenColor(BARANGAY_COLORS[featureId] || '#808080');
    map.setPaintProperty('barangay-boundaries', 'fill-color', ['case', ['==', ['get', 'id'], featureId], brighter, ['get', 'color']]);
    map.setPaintProperty('barangay-outlines', 'line-width', ['case', ['==', ['get', 'id'], featureId], 3, 1]);
    map.setPaintProperty('barangay-outlines', 'line-color', ['case', ['==', ['get', 'id'], featureId], '#003A6C', ['get', 'color']]);
    highlightedFeatureId = featureId;

    showFloodSidebar(barangay, id, BARANGAY_COLORS[featureId] || '#808080');
    toggleMenu(true);
}

// Brighten HEX
function brightenColor(hex) {
    const r = Math.min(255, parseInt(hex.slice(1,3), 16) + 50).toString(16).padStart(2, '0');
    const g = Math.min(255, parseInt(hex.slice(3,5), 16) + 50).toString(16).padStart(2, '0');
    const b = Math.min(255, parseInt(hex.slice(5,7), 16) + 50).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}

// Sidebar with color
function showFloodSidebar(barangay, id, color) {
    document.getElementById('sidebar-title').textContent = `${barangay.name} (#${id})`;
    document.getElementById('sidebar-content').innerHTML = `
        <h3>Status: <span class="status-badge status-green">GREEN</span></h3>
        <div class="info-row"><span>Water Level:</span> <span>0 m</span></div>
        <div class="info-row"><span>Rainfall:</span> <span>0 mm/hr</span></div>
        <div class="info-row"><span>Elevation:</span> <span>${barangay.elevation} m</span></div>
        <div class="info-row"><span>Flood Risk:</span> <span>${barangay.floodRisk}</span></div>
        <div class="info-row"><span>Color ID:</span> <span><div class="color-swatch" style="background: ${color};"></div>${color}</span></div>
        <p><strong>Alert:</strong> Safe - Monitor conditions.</p>
    `;
    document.getElementById('flood-sidebar').classList.add('sidebar-visible');
}

function closeFloodSidebar() {
    document.getElementById('flood-sidebar').classList.remove('sidebar-visible');
    if (highlightedMarker) {
        highlightedMarker.marker.getElement().classList.remove('highlight');
        highlightedMarker.marker.getElement().style.backgroundColor = highlightedMarker.color;
        highlightedMarker = null;
    }
    if (highlightedFeatureId) {
        map.setPaintProperty('barangay-boundaries', 'fill-opacity', 0.2);
        map.setPaintProperty('barangay-outlines', 'line-width', 1);
        highlightedFeatureId = null;
    }
}

// Menu functions
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
        li.onclick = (e) => { e.stopPropagation(); selectBarangay(b, null, i+1, b.id); };
        list.appendChild(li);
    });
}

// Filter
function filterBarangays(status) {
    barangayMarkers.forEach(item => {
        const show = status === 'all' || item.data.status === status;
        if (show) item.marker.addTo(map); else item.marker.remove();
    });
    map.setLayoutProperty('barangay-boundaries', 'visibility', status === 'all' ? 'visible' : 'none'); // Simple filter
    showToast(`Filtered: ${status}`);
}

// Layers
function toggleLayers() {
    if (!map.getSource('river')) {
        map.addSource('river', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: window.NAGA_DATA.NAGA_RIVER_PATH } } });
        map.addLayer({ id: 'river', type: 'line', source: 'river', paint: { 'line-color': '#1e90ff', 'line-width': 3 } });
    }
    const vis = map.getLayoutProperty('river', 'visibility') === 'visible' ? 'none' : 'visible';
    map.setLayoutProperty('river', 'visibility', vis);

    if (!map.getSource('hillshade')) {
        map.addSource('hillshade', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1' });
        map.addLayer({ id: 'hillshade', type: 'hillshade', source: 'hillshade' });
    }
    const hillVis = map.getLayoutProperty('hillshade', 'visibility') === 'visible' ? 'none' : 'visible';
    map.setLayoutProperty('hillshade', 'visibility', hillVis);

    showToast('Layers toggled');
}

// Search
function searchLocation() {
    const query = document.getElementById('map-search-input').value.trim();
    if (!query) return;
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=PH&limit=1`)
        .then(res => res.json())
        .then(data => {
            if (data.features[0]) {
                const [lng, lat] = data.features[0].center;
                map.flyTo({ center: [lng, lat], zoom: 12 });
                new mapboxgl.Marker({ color: '#003A6C' }).setLngLat([lng, lat]).setPopup(new mapboxgl.Popup().setText(data.features[0].place_name)).addTo(map);
                showToast(`Found: ${data.features[0].place_name}`);
            } else showToast('Not found');
        }).catch(() => showToast('Search error'));
}

// Toast
function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}