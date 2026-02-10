declare module 'seedrandom' {
  function seedrandom(seed: string | number): () => number
  namespace seedrandom {
    interface PRNG {
      (): number
    }
  }
  export = seedrandom
}
