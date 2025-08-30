import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odvhjsbthdqbzqopacgo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kdmhqc2J0aGRxYnpxb3BhY2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MjQxMDksImV4cCI6MjA3MjEwMDEwOX0.4XYDdFI5_V4Drei3JqogaSIwwUgpSWnlK1ll200r5Sk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
