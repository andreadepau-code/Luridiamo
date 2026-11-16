// Bottom navigation bar for mobile
export class LuridiamoBottomNav {
  constructor(map, mapContainer) {
    this.map = map;
    this.navItems = [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'search', label: 'Ricerca', icon: '🔍' },
      { id: 'map', label: 'Mappa', icon: '🗺️' },
      { id: 'profile', label: 'Profilo', icon: '👤' }
    ];
    this.currentTab = 'home';
    this.init();
  }

  init() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;

    nav.innerHTML = this.navItems.map(item => `
      <button class="nav-item ${this.currentTab === item.id ? 'active' : ''}" data-tab="${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
      </button>
    `).join('');

    nav.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    this.init();

    // Handle tab switching logic here
    if (tabId === 'search') {
      // Show search focus
      const searchInput = document.getElementById('search-input');
      if (searchInput) searchInput.focus();
    }
  }
}

export default LuridiamoBottomNav;
