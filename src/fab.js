// Floating Action Button for adding a new place
export class LuridiamoFAB {
  constructor(map, detail) {
    this.map = map;
    this.detail = detail;
    this.fab = document.getElementById('fab');
  }

  init() {
    if (this.fab) {
      this.fab.addEventListener('click', () => {
        // Open the add place modal
        const addModal = document.getElementById('add-modal');
        const addContent = document.getElementById('add-modal-content');

        if (addModal && addContent) {
          addContent.innerHTML = `
            <button class="modal-close" onclick="app.addModal.close()">✕</button>
            <h2>Aggiungi un Lurido</h2>
            <form id="add-place-form" class="add-form">
              <div class="form-group">
                <label>Nome del baracchino</label>
                <input type="text" id="place-name" placeholder="Es. Il Re della Salamella" required>
              </div>
              <div class="form-group">
                <label>Indirizzo / Zona</label>
                <input type="text" id="place-address" placeholder="Es. Piazzale Lotto, Milano" required>
              </div>
              <div class="form-group">
                <label>Orari di apertura</label>
                <input type="text" id="place-hours" placeholder="Es. 20:00 - 05:00" required>
              </div>
              <div class="form-group">
                <label>Specialità</label>
                <input type="text" id="place-specialties" placeholder="Es. Salamella completa, Porchetta" required>
              </div>
              <div class="form-group">
                <label>Posizione sulla mappa</label>
                <p class="hint">Usa la geolocalizzazione GPS o seleziona sulla mappa</p>
                <button type="button" class="use-location-btn" id="use-location">
                  📍 Usa posizione attuale
                </button>
              </div>
              <button type="submit" class="submit-btn">Aggiungi Lurido</button>
            </form>
          `;
          addModal.classList.add('active');
        }
      });
    }
  }
}

export default LuridiamoFAB;
