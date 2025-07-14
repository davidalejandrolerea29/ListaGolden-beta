import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = "https://uwzobbiapgktnxqklwhv.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3em9iYmlhcGdrdG54cWtsd2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMjE4NDgsImV4cCI6MjA2Njc5Nzg0OH0.OoBr5Aj-4PEKbKDeZE8uM8t6vHdzg4AuKoi_uz1DIm4";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});