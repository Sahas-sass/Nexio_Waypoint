const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cqkmmmrrhuwitlvwoebq.supabase.co', 'sb_publishable_lMLU6rQOIWO4XVXVaH1vyg_SvHfzEYY');

async function test() {
  const { data, error } = await supabase
    .from('trip_stops')
    .select('*, stores(id, name, address, manager_id, store_managers(id, name, phone))');
    
  if (error) {
    console.error("SUPABASE ERROR:", error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}
test();
