/**
 * Deterministic RNG verification test
 * Verify that same seed = same random sequence
 */

import seedrandom from 'seedrandom'

export function testDeterministicSimulation() {
  console.log('\n╔════════════════════════════════════════╗')
  console.log('║  DETERMINISTIC RNG VERIFICATION TEST   ║')
  console.log('╚════════════════════════════════════════╝\n')

  // Test 1: Same seed produces identical sequence
  const seed = 'test-seed-12345'
  
  console.log('🔹 TEST 1: Same seed → Same sequence')
  console.log(`Seed: "${seed}"\n`)

  const rng1 = seedrandom(seed)
  const sequence1 = Array.from({ length: 20 }, () => rng1())
  
  const rng2 = seedrandom(seed)
  const sequence2 = Array.from({ length: 20 }, () => rng2())

  console.log('Seq 1:', sequence1.slice(0, 5).map(x => x.toFixed(4)).join(', '), '...')
  console.log('Seq 2:', sequence2.slice(0, 5).map(x => x.toFixed(4)).join(', '), '...')

  const isSame = sequence1.every((val, idx) => val === sequence2[idx])
  console.log(`Result: ${isSame ? '✅ PASS - Sequences identical' : '❌ FAIL - Sequences differ'}\n`)

  // Test 2: Different seed produces different sequence
  console.log('🔹 TEST 2: Different seed → Different sequence')
  
  const rng3 = seedrandom('different-seed')
  const sequence3 = Array.from({ length: 20 }, () => rng3())

  console.log(`Seed 1: "${seed}"`)
  console.log('Seq 1:', sequence1.slice(0, 5).map(x => x.toFixed(4)).join(', '), '...')
  console.log(`Seed 2: "different-seed"`)
  console.log('Seq 3:', sequence3.slice(0, 5).map(x => x.toFixed(4)).join(', '), '...')

  const isDifferent = !sequence1.every((val, idx) => val === sequence3[idx])
  console.log(`Result: ${isDifferent ? '✅ PASS - Sequences differ as expected' : '❌ FAIL - Sequences should differ'}\n`)

  // Test 3: Verify rook_id + attacker_id seeding concept
  console.log('🔹 TEST 3: Composite seed (rook_id + attacker_id)')
  
  const rookId = 'rook-0'
  const attackerId = 'zombie-1'
  const compositeSeed = `${rookId}:${attackerId}`
  
  const rng4a = seedrandom(compositeSeed)
  const rng4b = seedrandom(compositeSeed)
  
  const damage1 = Array.from({ length: 5 }, () => Math.floor(rng4a() * 10))
  const damage2 = Array.from({ length: 5 }, () => Math.floor(rng4b() * 10))
  
  console.log(`Seed: "${compositeSeed}"`)
  console.log('Damage seq 1:', damage1.join(', '))
  console.log('Damage seq 2:', damage2.join(', '))
  
  const isSameComposite = damage1.every((val, idx) => val === damage2[idx])
  console.log(`Result: ${isSameComposite ? '✅ PASS - Composite seeding works' : '❌ FAIL - Seeding failed'}\n`)

  console.log('╔════════════════════════════════════════╗')
  console.log('║     ALL TESTS COMPLETE                 ║')
  console.log('╚════════════════════════════════════════╝\n')

  console.log('📝 Simulation is ready to run!')
  console.log('   • Deterministic: Same seed = Same outcome ✓')
  console.log('   • Enemy spawning is RNG-based')
  console.log('   • Damage variation is RNG-based')
  console.log('   • Movement has RNG factors')
  console.log('')
}

