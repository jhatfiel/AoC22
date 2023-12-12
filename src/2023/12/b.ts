import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

await puzzle.run()
    .then((lines: Array<string>) => {
        let totalPossibleCount = 0;
        lines.forEach(line => {
            let arr = line.split(' ');
            let criteria = arr[0] + '?' + arr[0] + '?' + arr[0] + '?' + arr[0] + '?' + arr[0];
            let dArr = (arr[1] + ',' + arr[1] + ',' + arr[1] + ',' + arr[1] + ',' + arr[1]).split(',').map(Number);
            //criteria = arr[0] + '?' + arr[0] + '?' + arr[0] + '?' + arr[0];
            //dArr = (arr[1] + ',' + arr[1] + ',' + arr[1] + ',' + arr[1]).split(',').map(Number);
            console.debug(`criteria: ${criteria}, dArr=${dArr}`)
            let startTime = performance.now();
            let possibleCount = permute(criteria, dArr);
            let endTime = performance.now();
            console.debug(`Possible Arrangements: ${possibleCount} (computed in ${Math.floor((endTime - startTime)/10)/100} seconds)`);
            totalPossibleCount += possibleCount;
        });
        console.log(`Total possible arrangements: ${totalPossibleCount}`);
    });

function getNumUnknown(criteria: string): number {
    return criteria.split('').filter(c => c === '?').length;
}

function getNumDamaged(criteria: string): number {
    return criteria.split('').filter(c => c === '#').length;
}

function getNumPermutations(criteria: string): number {
    return Math.pow(2, getNumUnknown(criteria));
}

function getDamagedCounts(criteria: string): Array<number> {
    let result = new Array<number>();
    let len = 0;
    for (let i=0; i<criteria.length; i++) {
        if (criteria.charAt(i) !== '#') { if (len > 0) result.push(len); len = 0;
        } else {
            len++;
        }
    }
    if (len > 0) result.push(len);
    return result;
}

function shouldPrune(criteria: string, dArr: Array<number>): boolean {
    let firstUnknown = criteria.indexOf('?');
    if (firstUnknown !== -1) {
        // start by seeing if this permutation is even possible
        let criteriaTrimmed = criteria.substring(0, firstUnknown);
        let trimmedCArr = getDamagedCounts(criteriaTrimmed);
        // if we have already encountered a bad pattern, return
        //console.debug(`${t}: Is remaining dArr too big to fit? ${t.substring(firstUnknown)}, ${dArr.slice(trimmedCArr.length)}: ${t.length - firstUnknown < neededCharacters}`)
        if (trimmedCArr.some((count, index) => (index !== trimmedCArr.length-1 && count !== dArr[index]) || (count > dArr[index]))) {
            //console.debug(`BAD PATH!!! ${criteriaTrimmed}, ${trimmedBCArr}, ${dArr}`)
            return true;
        } else {
            // if there aren't enough characters left to finish out the dArr, return
            let dArrRemaining = dArr.slice(trimmedCArr.length);
            let neededCharacters = dArrRemaining.reduce((acc, count) => acc += count+1, -1);
            if (criteria.length - firstUnknown < neededCharacters) {
                //console.debug(`Remaining dArr is big to fit: ${t.substring(firstUnknown)}, ${dArr.slice(trimmedBCArr.length)}`)
                return true;
            } else {
                // can we check to see if there are enough possible places for a '#' left to match how many damaged springs we need
                let dNeeded = dArrRemaining.reduce((acc, n) => acc += n, 0);
                let cRemaining = criteria.substring(firstUnknown);
                let uOrDRemaining = getNumUnknown(cRemaining) + getNumDamaged(cRemaining);
                if (dNeeded > uOrDRemaining) { 
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
    return true;
}

function reportProgress(tried: number, numPermutations: number, result: number, percentDone: number, forcePrint = false) {
    let pd = forcePrint?percentDone:Math.floor(100*tried/numPermutations);
    if (forcePrint || pd !== percentDone) {
        percentDone = pd;
        if (process.stdout.isTTY) { process.stdout.moveCursor(0, -1); process.stdout.clearLine(0); }
        console.debug(`------------------- ${percentDone.toString().padStart(3, ' ')}%: ${tried.toString().padStart(numPermutations.toString().length)}: Found so far: ${result}`);
    }
    return percentDone;
}

function permute(criteria: string, dArr: Array<number>): number {
    let result = 0;
    let trials = new Array<string>();
    let good = new Array<string>();
    trials.push(criteria);
    //console.debug(`Trials remaining: ${trials.length}`);
    //let numPermutations = getNumPermutations(criteria);
    //console.debug(`-- Permutations to check: ${numPermutations.toString()}`);
    //console.debug(`-------------------   0%: ${'0'.padStart(numPermutations.toString().length)}`);
    let tried = 0;
    let percentDone = 0;

    while (trials.length) {
        let t = trials.pop();
        let tDArr = getDamagedCounts(t);
        //percentDone = reportProgress(tried, numPermutations, result, percentDone);
        //console.debug(`Damaged Counts for ${t} is ${tDArr}`)
        // if we have the same number of damaged counts and all the lengths match up, we are done, regardless of whether there are more unknowns
        if (dArr.length === tDArr.length && dArr.every((d, ind) => d === tDArr[ind])) {
            result++;
            //tried += getNumPermutations(t);
            //percentDone = reportProgress(tried, numPermutations, result, percentDone);
            //console.debug(`Found solution that skipped: `, getNumPermutations(t));
            //console.debug(`${percentDone.toString().padStart(3, ' ')}% done: Tried: ${tried.toString().padStart(20, ' ')}/${numPermutations.toString().padEnd(20, ' ')}: Found so far: ${result}`);
            //if (result%10000 === 0) {
                //if (process.stdout.isTTY) { process.stdout.moveCursor(0, -1); process.stdout.clearLine(0); }
                //console.debug(`-- Found so far: ${result} (list size: ${trials.length})`);
            //}
        } else {
            if (shouldPrune(t, dArr)) {
                // ignore all branches under this one
                //tried += getNumPermutations(t);
                //percentDone = reportProgress(tried, numPermutations, result, percentDone);
                //console.debug(`Ignoring: `, getNumPermutations(t));
                //console.debug(`${percentDone.toString().padStart(3, ' ')}% done: Tried: ${tried.toString().padStart(20, ' ')}/${numPermutations.toString().padEnd(20, ' ')}: Found so far: ${result}`);
            } else {
                // try '.' and '#' for the first '?' character
                let firstUnknown = t.indexOf('?');
                let criteriaGood = t.substring(0, firstUnknown) + '.' + t.substring(firstUnknown+1);
                let criteriaDamaged = t.substring(0, firstUnknown) + '#' + t.substring(firstUnknown+1);
                trials.push(criteriaGood);
                trials.push(criteriaDamaged);
            }
        }
    }

    return result;
}