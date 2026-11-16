// Detail modal for place information
export class LuridiamoDetail {
  constructor(map) {
    this.map = map;
    this.place = null;
    this.modal = document.getElementById('detail-modal');
    this.modalContent = document.getElementById('detail-modal-content');
  }

  open(place) {
    this.place = place;
    this.render();
    this.modal.classList.add('active');
  }

  close() {
    this.modal.classList.remove('active');
    this.place = null;
  }

  render() {
    if (!this.place) return;

    const stars = '★'.repeat(Math.floor(this.place.rating)) + '☆'.repeat(5 - Math.floor(this.place.rating));
    const openStatus = this.place.isActive ? 'Aperto Ora' : 'Chiuso';
    const statusColor = this.place.isActive ? '#4CAF50' : '#757575';

    this.modalContent.innerHTML = `
      <button class="modal-close" onclick="app.detail.close()">✕</button>

      <img src="${this.place.imageUrl}" alt="${this.place.name}" class="modal-image">

      <h2>${this.place.name}</h2>
      <p class="meta">${this.place.address}</p>

      <div class="status-row">
        <span class="status-indicator" style="color:${statusColor}">●</span>
        <span class="status-text">${openStatus}</span>
        <span class="hours">• ${this.place.openingHours}</span>
      </div>

      <div class="specialties">
        <h3>Specialità:</h3>
        <ul>
          ${this.place.specialties.map(s => `<li>• ${s}</li>`).join('')}
        </ul>
      </div>

      <div class="rating">
        <span class="stars">${stars}</span>
        <span class="rating-text">${this.place.rating}/5</span>
      </div>

      <div class="reviews">
        <h3>Recensioni:</h3>
        ${this.place.reviews.map(r => `
          <div class="review">
            <div class="review-header">
              <span class="review-rating">${'★'.repeat(r.rating)}</span>
              <span class="review-user">Utente</span>
            </div>
            <p class="review-comment">${r.comment}</p>
          </div>
        `).join('')}
      </div>

      <div class="actions">
        <button class="action-btn primary" onclick="app.detail.openDirections()">
          🧭 Portami qui
        </button>
        <button class="action-btn secondary" onclick="app.detail.close()">
          Chiudi
        </button>
      </div>
    `;
  }

  openDirections() {
    if (!this.place) return;
    const lat = this.place.lat;
    const lng = this.place.lng;
    const name = encodeURIComponent(this.place.name);

    // Open Google Maps or Apple Maps
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination=${name}`;
    const appleMapsUrl = `https://maps.apple.com/?q=${name}&ll=${lat},${lng}`;

    // Open Google Maps by default
    window.open(googleMapsUrl, '_blank');
  }
}

export default LuridiamoDetail;
