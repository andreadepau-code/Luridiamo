// Supabase client for Luridiamo
// Install: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch all active places
export async function fetchPlaces() {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('is_active', true)
    .order('rating', { ascending: false });

  if (error) throw error;
  return data;
}

// Fetch reviews for a place
export async function fetchReviews(placeId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Add a new place (crowdsourced)
export async function addPlace(place) {
  const { data, error } = await supabase
    .from('places')
    .insert([{
      name: place.name,
      latitude: place.lat,
      longitude: place.lng,
      address: place.address,
      opening_hours: place.openingHours,
      closing_hours: place.closingHours,
      image_url: place.imageUrl,
      is_active: true
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Add a review
export async function addReview(review) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      place_id: review.placeId,
      rating: review.rating,
      comment: review.comment,
      user_name: review.userName
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Submit a user report (crowdsourced)
export async function submitReport(report) {
  const { data, error } = await supabase
    .from('user_reports')
    .insert([{
      name: report.name,
      latitude: report.lat,
      longitude: report.lng,
      address: report.address,
      opening_hours: report.openingHours,
      specialties: report.specialties,
      image_url: report.imageUrl,
      reported_by: report.userName
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}