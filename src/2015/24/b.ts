import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);
let totalWeight = 0;
let weights = new Array<number>();

let minGroup1 = Infinity;
let bestGroup1 = new Set<number>();
let bestQE = Infinity;

p.onLine = (line) => {
    const weight = Number(line);
    totalWeight += weight;
    weights.push(weight);
};

p.onClose = () => {
    console.log(`Weights: ${weights.join(',')}`);
    const partial = totalWeight/4;
    console.assert(partial === Math.floor(partial), `Weight [${totalWeight}] should be evenly divisible by 4`);
    weights.reverse(); // best to work with largest weights first

    console.log(`Trying to make first group of ${partial}`);

    let group1Choices = makeSum(partial, weights);

    group1Choices.forEach((group1Mask) => {
        let group1 = p.toSetN(weights, group1Mask);
        if (group1.size <= minGroup1) {
            console.log(`Trying to make second group of ${partial} based on ${Array.from(group1).join(' ').padEnd(30)}`);
            let group2Choices = makeSum(partial, weights.filter((w) => !group1.has(w)));
            group2Choices.forEach((group2Mask) => {
                if (!bestGroup1.has(group1Mask)) { // don't go reprocessing everything if we already know this group1 works!
                let group2 = p.toSetN(weights, group2Mask);
                //console.log(`Trying to make partial group of ${partial} based on ${group1.join(' ').padEnd(30)} / ${group2.join(' ').padEnd(30)}`);
                let group3Choices = makeSum(partial, weights.filter((w) => !group1.has(w) && !group2.has(w)));
                group3Choices.forEach((group3Mask) => {
                    if (!bestGroup1.has(group1Mask)) { // don't go reprocessing everything if we already know this group1 works!
                    let group3 = p.toSetN(weights, group3Mask);
                    let group4Choices = makeSum(partial, weights.filter((w) => !group1.has(w) && !group2.has(w) && !group3.has(w)));
                    group4Choices.forEach((group4Mask) => {
                        if (!bestGroup1.has(group1Mask)) { // don't go reprocessing everything if we already know this group1 works!
                        if (group1.size < minGroup1) {
                            minGroup1 = group1.size;
                            console.log(`Found better minGroup of ${minGroup1}`);
                            bestGroup1 = new Set<number>();
                        }

                        if (group1.size === minGroup1) {
                            bestGroup1.add(group1Mask);
                        }
                        }
                    })
                    }
                })    
                }
            })
        }
    })

    bestGroup1.forEach((g1Mask) => {
        let g1 = p.toSetN(weights, g1Mask);
        const qe = Array.from(g1).reduce((acc, n) => acc*n, 1)
        console.log(`${Array.from(g1).join(' ').padEnd(30)}: ${qe}`);
        if (qe < bestQE) {
            bestQE = qe;
        }
    })

    console.log(`Best QE score is ${bestQE}`);

};

const cache = new Map<number, Map<number, Array<number>>>();
function makeSum(sum: number, arr: Array<number>): Array<number> {
    const mask = p.toMaskN(weights, new Set(arr));
    let cacheSum = cache.get(sum);
    if (!cacheSum) {
        cacheSum = new Map<number, Array<number>>();
        cache.set(sum, cacheSum);
    }
    let cacheMask = cacheSum.get(mask);
    if (!cacheMask) {
        cacheMask = new Array<number>();
        if (arr.reduce((acc, w) => acc+w, 0) >= sum) {
            arr.filter((w) => w <= sum).forEach((w, ind, arr) => {
                let remainSum = sum-w;
                if (remainSum === 0) cacheMask!.push(p.toMaskN(weights, new Set([w])));
                else makeSum(sum-w, arr.slice(ind+1)).forEach((setMask) => cacheMask?.push(p.maskOrN(weights, setMask, w)));
            })
        }
        cacheSum.set(mask, cacheMask);
    }

    return cacheMask;
}

p.run();