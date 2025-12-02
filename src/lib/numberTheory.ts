import LargeSet from "large-set";
import { BooleanArray } from "./BooleanArray.js";

let _NUMBERS_PRIME_cache: number[] = [2];
let _NUMBERS_PRIME_lookup = new LargeSet<number>();
let _NUMBERS_PRIME_lastChecked = 2;

/**
 * Generate all prime numbers <= max;
 * @param max Maximum prime number that will be generated.  The generator is invalid above that number (it will not generate any prime above max)
 */
export function* PrimeGeneratorMax(max: number): Generator<number> {
    // initialize to false - index into array is n = 2(i+1)+1 (so index 0 is 3, index 1 is 5, etc, and we only need n/2 length)
    // reverse is: i = (n-1)/2 - 1;
    let length = Math.floor((max-1)/2);
    console.log(`PrimeGeneratorMax: allocate oddPrimes array ${length}`);
    //let oddPrimes = Array.from({length}, _ => true);
    let oddPrimes = new BooleanArray(length, true);
    console.log(`PrimeGeneratorMax: allocate done`);
    let crossover = Math.ceil((Math.sqrt(max) - 1)/2) - 1;
    //console.log(`Setting up, max=${n}, length=${length}, crossover=${crossover}`);
    _NUMBERS_PRIME_cache = [2];
    _NUMBERS_PRIME_lookup.add(2);
    _NUMBERS_PRIME_lastChecked=2;
    yield 2;
    for (let i=0; i<crossover; i++) {
        //console.log(`${i}: ${oddPrimes.map(b => b?1:0).join(' ')}`);
        if (oddPrimes.get(i)) {
        //if (oddPrimes[i]) {
            let p = 2*(i+1)+1;
            _NUMBERS_PRIME_cache.push(p);
            _NUMBERS_PRIME_lookup.add(p);
            _NUMBERS_PRIME_lastChecked=p;
            yield p;
            // mark everything above p^2 as false
            for (let j=(p*p - 1)/2 - 1; j < length; j += p) {
                oddPrimes.set(j, false);
                //oddPrimes[j] = false;
            }
        }
    }

    //console.log(`Crossover: ${crossover}, length=${length}`);
    for (let i=crossover; i < length; i++) {
        //console.log(`${i}: ${oddPrimes.map(b => b?1:0).join(' ')}`);
        //if (i % 10000000 === 0) console.log(`After crossover, index: ${i}`);
        if (oddPrimes.get(i)) {
        //if (oddPrimes[i]) {
            let p = 2*(i+1)+1;
            //if (i > 155124118) console.log(`After crossover, found prime ${i} = ${p} ${_NUMBERS_PRIME_cache.length}`);
            _NUMBERS_PRIME_cache.push(p);
            //if (i > 155124118) console.log(`After crossover, found prime ${i} = ${p} ${_NUMBERS_PRIME_lookup.size}`);
            _NUMBERS_PRIME_lookup.add(p);
            //if (i > 155124118) console.log(`After crossover, found prime ${i} = ${p}`);
            _NUMBERS_PRIME_lastChecked=p;
            yield p;
        }
    }
    console.log(`PrimeGeneratorMax: done`);
}

/**
 * Simple, dumb prime number generator.  DO NOT USE if you expect to get primes over a few hundred thousand because it's too slow.
 * 
 * Use PrimeGeneratorMax instead
 */
export function* PrimeGenerator(): Generator<number> {
    for (let p of _NUMBERS_PRIME_cache) {
        yield p;
    }
    if (_NUMBERS_PRIME_lastChecked%2 === 0) _NUMBERS_PRIME_lastChecked++;
    while (true) {
        if (_NUMBERS_PRIME_cache.every(n => _NUMBERS_PRIME_lastChecked % n !== 0)) {
            _NUMBERS_PRIME_cache.push(_NUMBERS_PRIME_lastChecked);
            _NUMBERS_PRIME_lookup.add(_NUMBERS_PRIME_lastChecked);
            //console.log(`Found prime: ${_NUMBERS_PRIME_lastChecked}`);
            yield _NUMBERS_PRIME_lastChecked;
        }
        _NUMBERS_PRIME_lastChecked+=2;
    }
}

let Primes = PrimeGenerator();

/**
 * Return the prime factorization of n 
 * @param n Number to factor
 * @returns 
 * Mapping of prime factors to their power
 */
let _NUMBERS_PRIME_factors = new Map<number, Map<number, number>>();
export function PrimeFactors(n: number): Map<number, number> {
    let result = _NUMBERS_PRIME_factors.get(n);
    if (result !== undefined) return result;
    result = new Map<number, number>();
    if (n === 0) return result;
    let sqr_n = Math.sqrt(n);
    //console.log(`PrimeFactors(${n}) ${_NUMBERS_PRIME_lastChecked}`);
    while (_NUMBERS_PRIME_lastChecked <= sqr_n) {
        Primes.next();
    }
    //console.log(`Finding factors (cache=${_NUMBERS_PRIME_cache})`);
    _NUMBERS_PRIME_cache.filter(p => n%p === 0).forEach(p => {
        //console.log(`Finding factors ${n}`);
        let cnt = 0;
        while (n % p === 0) {
            cnt++;
            n /= p;
        }
        result.set(p, cnt);
    })
    if (n !== 1) result.set(n, 1);
    _NUMBERS_PRIME_factors.set(n, result);
    return result;
}

export function Factors(n: number): number[] {
    let result: number[] = [];
    let pf = PrimeFactors(n);
    let entries = Array.from(pf.entries());
    function buildFactors(idx: number, current: number) {
        if (idx >= entries.length) {
            result.push(current);
            return;
        }
        let [prime, power] = entries[idx];
        for (let p=0; p<=power; p++) {
            buildFactors(idx+1, current * Math.pow(prime, p));
        }
    }
    buildFactors(0, 1);
    result.sort((a,b) => a-b);
    return result;
}

export function IsPrime(n: number): boolean {
    if (_NUMBERS_PRIME_lastChecked >= n) return _NUMBERS_PRIME_lookup.has(n);

    while (_NUMBERS_PRIME_lastChecked < Math.sqrt(n)) {
        Primes.next();
    }
    return _NUMBERS_PRIME_cache.every(p => n % p !== 0);
}