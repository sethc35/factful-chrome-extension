import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ybxboifzbpuhrqbbcneb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieGJvaWZ6YnB1aHJxYmJjbmViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzg2MDcsImV4cCI6MjA1MzY1NDYwN30.lHe47LNU5OwQ_n_lAWCaCtTNJ5EUW4Rqh3-zxg3TTAQ';
    
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);