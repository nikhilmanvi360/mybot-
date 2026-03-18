import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Ensure these are present so we don't crash mysteriously
if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase URL or Anon Key is missing from .env.local');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');
