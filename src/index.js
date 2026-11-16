// Luridiamo - Entry Point
// Initialize the application with Supabase integration

import { Luridiamo } from './LuridiamoCore.js';

const app = new Luridiamo();

// Load the app when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await app.init();
  console.log('🌙 Luridiamo app initialized');
});