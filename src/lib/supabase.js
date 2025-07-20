import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://unkrbrwjvhhlgcobnfiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVua3JicndqdmhobGdjb2JuZml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MjUyNjksImV4cCI6MjA2ODUwMTI2OX0.0GMCk5mKa1H_qRzJzqJWKr4J9MBI0mOvSXgRzJchV4k';

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export default supabase;