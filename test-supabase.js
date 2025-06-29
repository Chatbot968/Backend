import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase
    .from('config_client')
    .select('*');
  console.log('DATA:', data);
  console.log('ERROR:', error);
})(); 