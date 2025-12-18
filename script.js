// Globals
let map, barangayMarkers = [], highlightedMarker = null, highlightedFeatureId = null;
let highlightedListItem = null; // Track currently highlighted list item
let geoData = null; // Store fetched GeoJSON
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
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch GeoJSON once
    try {
        const res = await fetch('https://raw.githubusercontent.com/faeldon/philippines-json-maps/master/2023/geojson/barangays/lowres/barangays-munic-050260000.geojson');
        geoData = await res.json();
        geoData.features.forEach(feature => {
            const name = feature.properties.name.toLowerCase().replace(/\s+/g, '_');
            feature.properties.color = BARANGAY_COLORS[name] || '#808080';
            feature.properties.status = 'green';
        });
    } catch (err) {
        console.error('GeoJSON load error:', err);
    }
    initMap();
    generateBarangayList();
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
        // Add barangay markers (these pins now also represent weather stations)
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
        map.resize();
    });
}
function addCustomLayers() {
    if (!geoData) return;
    // Add barangays
    if (!map.getSource('barangays')) {
        map.addSource('barangays', { type: 'geojson', data: geoData });
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
        // Fit map to Naga City (only on first load)
        if (!highlightedFeatureId) {
            const bounds = new mapboxgl.LngLatBounds();
            geoData.features.forEach(feature => {
                const coords = feature.geometry.coordinates;
                const polygonCoords = Array.isArray(coords[0][0][0]) ? coords : [coords];
                polygonCoords.forEach(poly => {
                    poly.forEach(ring => {
                        ring.forEach(coord => bounds.extend(coord));
                    });
                });
            });
            map.fitBounds(bounds, { padding: 50, duration: 1500 });
        }
    }
    // Add terrain DEM for hillshade
    if (!map.getSource('mapbox-dem')) {
        map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
        });
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
    }
    // Add hillshade layer
    if (!map.getLayer('hillshading')) {
        map.addLayer({
            id: 'hillshading',
            source: 'mapbox-dem',
            type: 'hillshade',
            paint: {
                'hillshade-shadow-color': '#473B24'
            }
        });
    }
    // Add terrain vector for contours
    if (!map.getSource('terrain')) {
        map.addSource('terrain', {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-terrain-v2'
        });
    }
    // Add contour lines
    if (!map.getLayer('contours')) {
        map.addLayer({
            id: 'contours',
            type: 'line',
            source: 'terrain',
            'source-layer': 'contour',
            paint: {
                'line-color': '#877b59',
                'line-width': 1
            }
        });
    }
}
// Main selection function - called from both marker click and list click
function selectBarangay(barangay, marker, id, featureId, fromList = false) {
    // Fly to location
    map.flyTo({ center: [barangay.lng, barangay.lat], zoom: 15, duration: 1000 });
    // Reset previous highlights
    resetHighlights();
    // Highlight marker
    if (marker) {
        marker.getElement().classList.add('highlight');
        marker.getElement().style.backgroundColor = '#FFD700';
        highlightedMarker = { marker, originalColor: BARANGAY_COLORS[featureId] || '#808080' };
    }
    // Highlight polygon
    const brighter = brightenColor(BARANGAY_COLORS[featureId] || '#808080');
    map.setPaintProperty('barangay-boundaries', 'fill-opacity', ['case', ['==', ['get', 'name'], barangay.name], 0.6, 0.2]);
    map.setPaintProperty('barangay-boundaries', 'fill-color', ['case', ['==', ['get', 'name'], barangay.name], brighter, ['get', 'color']]);
    map.setPaintProperty('barangay-outlines', 'line-width', ['case', ['==', ['get', 'name'], barangay.name], 3, 1]);
    map.setPaintProperty('barangay-outlines', 'line-color', ['case', ['==', ['get', 'name'], barangay.name], '#003A6C', ['get', 'color']]);
    highlightedFeatureId = featureId;
    // Highlight list item
    const listItems = document.querySelectorAll('#barangay-list li');
    const targetIndex = window.NAGA_DATA.barangays.findIndex(b => b.id === barangay.id);
    if (targetIndex !== -1) {
        const listItem = listItems[targetIndex];
        listItem.classList.add('list-highlight');
        listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        highlightedListItem = listItem;
    }
    // Show sidebar details
    showFloodSidebar(barangay, id, BARANGAY_COLORS[featureId] || '#808080');
    // Auto-open menu if clicking from map
    if (!fromList) {
        toggleMenu(true);
    }
}
function resetHighlights() {
    // Reset marker
    if (highlightedMarker) {
        highlightedMarker.marker.getElement().classList.remove('highlight');
        highlightedMarker.marker.getElement().style.backgroundColor = highlightedMarker.originalColor;
        highlightedMarker = null;
    }
    // Reset polygon
    if (highlightedFeatureId || map.getLayer('barangay-boundaries')) {
        map.setPaintProperty('barangay-boundaries', 'fill-opacity', 0.2);
        map.setPaintProperty('barangay-boundaries', 'fill-color', ['get', 'color']);
        map.setPaintProperty('barangay-outlines', 'line-width', 1);
        map.setPaintProperty('barangay-outlines', 'line-color', ['get', 'color']);
        highlightedFeatureId = null;
    }
    // Reset list item
    if (highlightedListItem) {
        highlightedListItem.classList.remove('list-highlight');
        highlightedListItem = null;
    }
}
function brightenColor(hex) {
    const r = Math.min(255, parseInt(hex.slice(1,3), 16) + 50).toString(16).padStart(2, '0');
    const g = Math.min(255, parseInt(hex.slice(3,5), 16) + 50).toString(16).padStart(2, '0');
    const b = Math.min(255, parseInt(hex.slice(5,7), 16) + 50).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}
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
            if (markerData) {
                selectBarangay(b, markerData.marker, i+1, b.id, true); // true = from list
            }
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
// Placeholder simulation functions
function startSimulation() { showToast('Simulation will start in future phases'); }
function pauseSimulation() { }
function resetSimulation() { }