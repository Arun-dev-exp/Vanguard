/**
 * Seed script — inserts demo fixtures into Supabase.
 * Run with:  npm run seed
 */
const { getSupabase } = require('./supabase');
const { DEMO_ENTITIES } = require('../utils/demoFixtures');

async function seed() {
  console.log('🌱 Seeding demo fixtures...\n');

  const supabase = getSupabase();

  for (const entity of DEMO_ENTITIES) {
    const { data, error } = await supabase
      .from('entity_risks')
      .upsert(entity, { onConflict: 'entity_value' })
      .select();

    if (error) {
      console.error(`❌ Failed to seed ${entity.entity_value}:`, error.message);
    } else {
      console.log(`   ✅ ${entity.entity_value} → risk_score: ${entity.risk_score}, status: ${entity.status}`);
    }
  }

  console.log('\n🎉 Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('💥 Seed failed:', err);
  process.exit(1);
});
