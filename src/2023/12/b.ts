import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
const brokenRE = /(#+)/g;

await puzzle.run()
    .then((lines: Array<string>) => {
        let totalPossibleCount = 0;
        lines.forEach(line => {
            let arr = line.split(' ');
            let criteria = arr[0] + '?' + arr[0] + '?' + arr[0] + '?' + arr[0] + '?' + arr[0];
            let dArr = (arr[1] + ',' + arr[1] + ',' + arr[1] + ',' + arr[1] + ',' + arr[1]).split(',').map(Number);
            //let dArr = (arr[1]).split(',').map(Number);
            console.debug(`criteria: ${criteria}, dArr=${dArr}`)
            let possibleCount = permute(criteria, dArr);
            console.debug(`Possible Arrangements: ${possibleCount}`);
            totalPossibleCount += possibleCount;
        });
        console.log(`Total possible arrangements: ${totalPossibleCount}`);
    });

function getBrokenCounts(criteria: string): Array<number> {
    let result = new Array<number>();
    let matches = criteria.matchAll(brokenRE);
    for (const match of matches) {
        result.push(match[0].length);
    }
    return result;
}

function permute(criteria: string, dArr: Array<number>): number {
    let result = 0;
    let trials = new Array<string>();
    let good = new Array<string>();
    trials.push(criteria);
    //console.debug(`Trials remaining: ${trials.length}`);
    console.debug(`-- Found so far: ${result}`);

    while (trials.length) {
        let t = trials.pop();
        //if (process.stdout.isTTY) { process.stdout.moveCursor(0, -1); process.stdout.clearLine(0); }
        //console.debug(`Trials remaining: ${trials.length}`);
        let firstUnknown = t.indexOf('?');
        if (firstUnknown === -1) {
            // no unknowns, just return 1 if this arrangement could work
            let bcArr = getBrokenCounts(t);
            //console.debug(`thisDArr: ${thisDArr}`);
            if (dArr.length === bcArr.length && dArr.every((d, ind) => d === bcArr[ind])) {
                //console.debug(`Found potential match!: ${t}!!`)
                result++;
                //good.push(t);
                if (result%10000 === 0) {
                    if (process.stdout.isTTY) { process.stdout.moveCursor(0, -1); process.stdout.clearLine(0); }
                    console.debug(`-- Found so far: ${result} (list size: ${trials.length})`);
                }
            }
        } else {
            // start by seeing if this permutation is even possible
            let criteriaTrimmed = t.substring(0, firstUnknown);
            let trimmedBCArr = getBrokenCounts(criteriaTrimmed);
            // if we have already encountered a bad pattern, return
            // if there aren't enough characters left to finish out the dArr, return
            let neededCharacters = dArr.slice(trimmedBCArr.length).reduce((acc, count) => acc += count+1, -1);
            //console.debug(`${t}: Is remaining dArr too big to fit? ${t.substring(firstUnknown)}, ${dArr.slice(trimmedBCArr.length)}: ${t.length - firstUnknown < neededCharacters}`)
            if (trimmedBCArr.some((count, index) => (index !== trimmedBCArr.length-1 && count !== dArr[index]) || (count > dArr[index]))) {
                //console.debug(`BAD PATH!!! ${criteriaTrimmed}, ${trimmedBCArr}, ${dArr}`)
            } else if (t.length - firstUnknown < neededCharacters) {
                //console.debug(`Remaining dArr is big to fit: ${t.substring(firstUnknown)}, ${dArr.slice(trimmedBCArr.length)}`)
            } else {
                // try '.' and '#' for the first '?' character
                let criteriaGood = t.substring(0, firstUnknown) + '.' + t.substring(firstUnknown+1);
                let criteriaDamaged = t.substring(0, firstUnknown) + '#' + t.substring(firstUnknown+1);
                trials.push(criteriaGood);
                trials.push(criteriaDamaged);
            }
        }
    }

    return result;
}