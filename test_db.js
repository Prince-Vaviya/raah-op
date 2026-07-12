const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gniafmgpyegttogztxrz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduaWFmbWdweWVndHRvZ3p0eHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NzIwNzksImV4cCI6MjA5OTM0ODA3OX0.yW27tr8ZIkVjvUbZWRj3FMTQt7hjiwQI4Nj8q3u-XJ0';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data: route } = await supabase.from('routes').select('*').limit(1);
  console.log('Route:', JSON.stringify(route, null, 2));
}

test();
