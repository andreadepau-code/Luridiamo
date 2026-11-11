// Map initialization and marker management
export class LuridiamoMap {
  constructor() {
    this.map = null;
    this.markers = [];
    this.places = [];
  }

  init() {
    // Create the map centered on Milan
    this.map = L.map('map', {
      center: [45.4662, 9.1900],
      zoom: 14,
      zoomControl: true,
      attributionControl: true
    });

    // Add OpenStreetMap tile layer with dark style (CartoDB dark matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19
    }).addTo(this.map);

    return this.map;
  }

  addPlaceMarkers(places, onPlaceClick) {
    this.places = places;
    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    places.forEach(place => {
      const markerColor = place.isActive ? '#4CAF50' : '#757575'; // Green for open, Gray for closed
      const marker = L.marker([place.lat, place.lng])
        .addTo(this.map)
        .bindPopup(`<b>${place.name}</b><br>${place.address}<br><br>Stato: ${place.isActive ? '🟢 Aperto' : '🔴 Chiuso'}`);

      marker.on('click', () => {
        if (onPlaceClick) onPlaceClick(place);
      });

      this.markers.push(marker);
    });
  }

  centerOn(place) {
    if (this.map && place) {
      this.map.setView([place.lat, place.lng], 16);
    }
  }
}

export default LuridiamoMap;
