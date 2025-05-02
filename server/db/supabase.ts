import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Function to create and export Supabase client
function setupSupabase() {
  // Get Supabase credentials from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xbsocbjsmrnkwntmfere.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhic29jYmpzbXJua3dudG1mZXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODgyMTgsImV4cCI6MjA1OTI2NDIxOH0.H__Dla0lmkv8RKsR2jUzPUQX12QM5phsLhC1vWEQEmc';
  let client: any = null;
  
  // Force in-memory storage for Netlify deployment
  if (process.env.NODE_ENV === 'production') {
    console.log('[supabase] Production environment detected. Using in-memory storage.');
    process.env.USE_SUPABASE = 'false';
    return createDummyClient();
  }
  
  // Check if Supabase credentials are available
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please check your environment variables.');
    process.env.USE_SUPABASE = 'false';
    return createDummyClient();
  }

  // Validate URL format - warn but don't exit if invalid
  if (!supabaseUrl.startsWith('https://')) {
    console.warn('Invalid Supabase URL format. URL must start with https://');
    console.warn('Current value:', supabaseUrl);
    console.warn('Continuing with in-memory storage...');
    // Set environment variable to use in-memory storage instead
    process.env.USE_SUPABASE = 'false';
    return createDummyClient();
  }

  try {
    // Create Supabase client
    client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    });
    return client;
  } catch (error) {
    console.error('[supabase] Error creating Supabase client:', error);
    process.env.USE_SUPABASE = 'false';
    return createDummyClient();
  }
}

// Create a dummy client that will fail gracefully
function createDummyClient() {
  console.log('[storage] Using in-memory storage for development');
  return {
    from: () => ({ 
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: {}, error: null }),
      update: () => Promise.resolve({ data: {}, error: null }),
      delete: () => Promise.resolve({ data: {}, error: null })
    })
  };
}

// Create client
export const supabase = setupSupabase();

// Function to initialize Supabase
export async function initSupabase() {
  try {
    // If we're using in-memory storage, return false but don't throw error
    if (process.env.USE_SUPABASE === 'false') {
      console.log('[supabase] Using in-memory storage instead of Supabase');
      return false;
    }
    
    // Test the connection with a simple query that should work
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('[supabase] Connected to Supabase successfully');
    return true;
  } catch (error) {
    console.error('[supabase] Error connecting to Supabase:', {
      message: error.message,
      details: error.stack,
      hint: ''
    });
    
    // Set flag to use in-memory storage
    process.env.USE_SUPABASE = 'false';
    console.log('[storage] Using in-memory storage for development');
    return false;
  }
}