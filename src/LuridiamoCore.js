import { LuridiamoMap } from './map.js';
import { LuridiamoDetail } from './detail.js';
import { LuridiamoFAB } from './fab.js';
import { LuridiamoBottomNav } from './bottomNav.js';

export class Luridiamo {
  constructor() {
    this.map = null;
    this.detail = null;
    this.fab = null;
    this.bottomNav = null;
    this.places = [];
    this.reviews = [];
    this.currentPlace = null;
    this.addModal = null;
  }

  async init() {
    // Load mock data
    await this.loadMockData();

    // Initialize the map
    this.map = new LuridiamoMap();
    this.map.init();

    // Add markers to the map
    this.map.addPlaceMarkers(this.places, (place) => {
      this.openDetail(place);
    });

    // Initialize the detail view
    this.detail = new LuridiamoDetail(this.map);

    // Initialize the FAB
    this.fab = new LuridiamoFAB(this.map, this.detail);
    this.fab.init();

    // Initialize the bottom navigation
    this.bottomNav = new LuridiamoBottomNav(this.map, this.map);

    // Set up search and filter events
    this.setupEvents();

    // Make app globally accessible for inline event handlers
    window.app = this;

    // Setup add modal close handler
    this.setupAddModal();
  }

  async loadMockData() {
    // Mock data for famous Milan night snack bars
    const mockPlaces = [
      {
        id: 1,
        name: 'Il Re della Salamella',
        lat: 45.4662,
        lng: 9.1900,
        address: 'Piazzale Lotto, Milano',
        imageUrl: 'https://picsum.photos/seed/luridiamo1/200/150',
        isActive: true,
        openingHours: '20:00 - 05:00',
        closingHours: '20:00 - 05:00',
        specialties: ['Salamella completa', 'Porchetta', 'Cotoletta'],
        rating: 4.8,
        reviews: [
          { id: 1, rating: 5, comment: 'La salamella è incredibile!' },
          { id: 2, rating: 4, comment: 'Ottimo panino, ma la fila è lunga' }
        ]
      },
      {
        id: 2,
        name: 'Paninaro San Siro',
        lat: 45.4700,
        lng: 9.1905,
        address: 'Via San Siro, Milano',
        imageUrl: 'https://picsum.photos/seed/luridiamo2/200/150',
        isActive: true,
        openingHours: '21:00 - 04:00',
        closingHours: '21:00 - 04:00',
        specialties: ['Piadina milanese', 'Salame di San Giorgio'],
        rating: 4.7,
        reviews: [
          { id: 1, rating: 5, comment: 'La piadina è perfetta' },
          { id: 2, rating: 4, comment: 'Servizio un po’ lento' }
        ]
      },
      {
        id: 3,
        name: 'Baracchino Navigli',
        lat: 45.4705,
        lng: 9.1950,
        address: 'Zona Navigli, Milano',
        imageUrl: 'https://picsum.photos/seed/luridiamo3/200/150',
        isActive: true,
        openingHours: '22:00 - 06:00',
        closingHours: '22:00 - 06:00',
        specialties: ['Cotoletta milanese', 'Salame di San Giorgio'],
        rating: 4.6,
        reviews: [
          { id: 1, rating: 5, comment: 'La cotoletta è la migliore!' },
          { id: 2, rating: 4, comment: 'Ottimo ambiente notturno' }
        ]
      },
      {
        id: 4,
        name: 'Luridino San Beato',
        lat: 45.4650,
        lng: 9.1850,
        address: 'Via San Beato, Milano',
        imageUrl: 'https://picsum.photos/seed/luridiamo4/200/150',
        isActive: true,
        openingHours: '20:30 - 05:30',
        closingHours: '20:30 - 05:30',
        specialties: ['Salame di San Giorgio', 'Piadina con prosciutto'],
        rating: 4.5,
        reviews: [
          { id: 1, rating: 4, comment: 'Buono ma un po’ affollato' }
        ]
      }
    ];

    this.places = mockPlaces;
  }

  openDetail(place) {
    this.currentPlace = place;
    this.detail.open(place);
  }

  setupEvents() {
    // Search bar toggle
    const searchBtn = document.getElementById('search-btn');
    const searchBar = document.getElementById('search-bar');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');

    if (searchBtn && searchBar) {
      searchBtn.addEventListener('click', () => {
        searchBar.classList.remove('hidden');
        searchInput.focus();
      });
    }

    if (searchClose && searchBar) {
      searchClose.addEventListener('click', () => {
        searchBar.classList.add('hidden');
      });
    }

    // Filter chips
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const filter = chip.getAttribute('data-filter');
        this.applyFilter(filter);
      });
    });

    // Search input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        this.filterPlaces(query);
      });
    }
  }

  applyFilter(filterType) {
    let filtered = [...this.places];

    switch(filterType) {
      case 'open':
        filtered = this.places.filter(p => p.isActive);
        break;
      case 'salamella':
        filtered = this.places.filter(p => p.specialties.some(s => s.toLowerCase().includes('salamella')));
        break;
      case 'late':
        filtered = this.places.filter(p => {
          const hours = p.openingHours.toLowerCase();
          return hours.includes('3:00') || hours.includes('4:00') || hours.includes('5:00') || hours.includes('6:00');
        });
        break;
      case 'top':
        filtered = this.places.sort((a, b) => b.rating - a.rating).slice(0, 3);
        break;
    }

    this.map.addPlaceMarkers(filtered, (place) => {
      this.openDetail(place);
    });
  }

  filterPlaces(query) {
    if (!query) {
      this.map.addPlaceMarkers(this.places, (place) => {
        this.openDetail(place);
      });
      return;
    }

    const filtered = this.places.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query) ||
      p.specialties.some(s => s.toLowerCase().includes(query))
    );

    this.map.addPlaceMarkers(filtered, (place) => {
      this.openDetail(place);
    });
  }

  setupAddModal() {
    const addModal = document.getElementById('add-modal');
    const addContent = document.getElementById('add-modal-content');

    this.addModal = {
      close: () => {
        if (addModal) addModal.classList.remove('active');
      }
    };

    // Handle form submission
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'add-place-form') {
        e.preventDefault();
        this.handleAddPlace(e.target);
      }
    });

    // Use location button
    document.addEventListener('click', (e) => {
      if (e.target.id === 'use-location') {
        this.useCurrentLocation();
      }
    });
  }

  handleAddPlace(form) {
    const name = form.querySelector('#place-name').value;
    const address = form.querySelector('#place-address').value;
    const hours = form.querySelector('#place-hours').value;
    const specialties = form.querySelector('#place-specialties').value.split(',').map(s => s.trim());

    // Default to Milan center coordinates
    const newPlace = {
      id: Date.now(),
      name,
      lat: 45.4662,
      lng: 9.1900,
      address,
      openingHours: hours,
      closingHours: hours,
      specialties,
      imageUrl: 'https://picsum.photos/seed/new/200/150',
      isActive: true,
      rating: 0,
      reviews: []
    };

    this.places.push(newPlace);
    this.map.addPlaceMarkers(this.places, (place) => {
      this.openDetail(place);
    });

    // Close modal
    const addModal = document.getElementById('add-modal');
    if (addModal) addModal.classList.remove('active');

    alert(`Lurido "${name}" aggiunto con successo!`);
  }

  useCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const addressInput = document.getElementById('place-address');
          if (addressInput) {
            addressInput.value = `Posizione attuale (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          }
          // Center map on user location
          if (this.map.map) {
            this.map.map.setView([lat, lng], 16);
          }
        },
        (error) => {
          alert('Impossibile ottenere la posizione. Inserisci manualmente l\'indirizzo.');
        }
      );
    } else {
      alert('Geolocalizzazione non supportata da questo browser.');
    }
  }
}

export default Luridiamo;
