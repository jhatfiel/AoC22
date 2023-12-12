import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
const brokenRE = /(#+)/g;

await puzzle.run()
    .then((lines: Array<string>) => {
        let totalPossibleCount = 0;
        lines.forEach(line => {
            let arr = line.split(' ');
            let criteria = arr[0];
            criteria = criteria + '?' + criteria + '?' + criteria + '?' + criteria + '?' + criteria
            let dArr = arr[1].split(',').map(Number);
            dArr.push(...[...dArr, ...dArr, ...dArr, ...dArr]);
            console.debug(`criteria: ${criteria}, dArr=${dArr}`)
            let possibleCount = permute(criteria, dArr);
            console.debug(`Possible Count: ${possibleCount}`);
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
    //console.debug(`Calling permute ${criteria}`);
    let result = 0;
    // try '.' and '#' for the first '?' character
    let firstUnknown = criteria.indexOf('?');
    // start by seeing if this permutation is even possible
    if (firstUnknown === -1) {
        // no unknowns, just return 1 if this arrangement could work
        let bcArr = getBrokenCounts(criteria);
        //console.debug(`thisDArr: ${thisDArr}`);
        if (dArr.length === bcArr.length && dArr.every((d, ind) => d === bcArr[ind])) {
            //console.debug(`Found potential match!: ${criteria}!!`)
            result = 1;
        }
    } else {
        let criteriaTrimmed = criteria.substring(0, firstUnknown);
        let trimmedBCArr = getBrokenCounts(criteriaTrimmed);
        // if we have already encountered a bad pattern, return
        if (trimmedBCArr.some((count, index) => (index !== trimmedBCArr.length-1 && count !== dArr[index]) || (count > dArr[index]))) {
            //console.debug(`BAD PATH!!! ${criteriaTrimmed}, ${trimmedBCArr}, ${dArr}`)
            return result;
        }

        // if there aren't enough characters left to finish out the dArr, return
        let neededCharacters = dArr.slice(trimmedBCArr.length).reduce((acc, count) => acc += count+1, -1);
        if (criteria.length - firstUnknown < neededCharacters) {
            //console.debug(`Too short!!! ${criteriaTrimmed}, ${trimmedBCArr}, ${dArr}`)
            return result;
        }

        let criteriaGood = criteria.substring(0, firstUnknown) + '.' + criteria.substring(firstUnknown+1);
        let criteriaDamaged = criteria.substring(0, firstUnknown) + '#' + criteria.substring(firstUnknown+1);
        result = permute(criteriaGood, dArr) + permute(criteriaDamaged, dArr);
    }
    return result;
}