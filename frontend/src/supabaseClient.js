import { createClient } from '@supabase/supabase-js';

// Këtu kodi lexon në prapaskenë çelësat që ruajtëm tek .env
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Kjo e ndërton lidhjen dhe exporton fjalën 'supabase' për ta përdorur në skedarë të tjerë
export const supabase = createClient(supabaseUrl, supabaseAnonKey);