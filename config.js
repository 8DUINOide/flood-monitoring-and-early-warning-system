// config.js - Load environment variables
const CONFIG = {
    MAPBOX_TOKEN: 'pk.eyJ1IjoiYWxmcmFuY2lzYnA0IiwiYSI6ImNtajloOW4zYzBjYTAzZHNiaHVuc2V1dWUifQ.m_UdZu36KHAKXu8-3TXElQ',
    DTM_TILE_URL: 'https://earthengine.googleapis.com/v1/projects/floodmonitor-482303/maps/74a756330b2519764939472db2bafee4-8702c3a7e9b58830bd6966bacbb7a6d1/tiles/{z}/{x}/{y}',
    SLOPE_TILE_URL: 'https://earthengine.googleapis.com/v1/projects/floodmonitor-482303/maps/e11f538e813eea5a699de452b6e14c9f-66c130c66ea79094a56a11ed01e278aa/tiles/{z}/{x}/{y}'
};

window.CONFIG = CONFIG;