import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hgqndkfkuitafuzawuxl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncW5ka2ZrdWl0YWZ1emF3dXhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkzNDg5MiwiZXhwIjoyMDYzNTEwODkyfQ.BexhC9LB-7Aea67mUPQI1OMVIZonH7-Z5EOOzq7GHDY';

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('Testing Supabase connection...');
  
  // Lister toutes les tables
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');
    
  console.log('TABLES:', tables);
  console.log('TABLES ERROR:', tablesError);
  
  // Tester avec différents noms de table possibles
  const possibleNames = ['Config_client', 'config_client', 'client_config', 'Client_config'];
  
  for (const tableName of possibleNames) {
    console.log(`\nTesting table: ${tableName}`);
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    console.log(`DATA for ${tableName}:`, data);
    console.log(`ERROR for ${tableName}:`, error);
  }
})(); 