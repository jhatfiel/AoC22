import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
const brokenRE = /(#+)/g;

await puzzle.run()
    .then((lines: Array<string>) => {
        let totalPossibleCount = 0;
        lines.forEach(line => {
            let arr = line.split(' ');
            let criteria = arr[0];
            let dArr = arr[1].split(',').map(Number);
            //console.debug(`criteria: ${criteria}, dArr=${dArr}`)
            let possibleCount = permute(criteria, dArr);
            //console.debug(`Possible Count: ${possibleCount}`);
            totalPossibleCount += possibleCount;
        });
        console.log(`Total possible arrangements: ${totalPossibleCount}`);
    });

function permute(criteria: string, dArr: Array<number>): number {
    //console.debug(`Calling permute ${criteria}`);
    let result = 0;
    // try '.' and '#' for the first '?' character
    let firstUnknown = criteria.indexOf('?');
    if (firstUnknown === -1) {
        // no unknowns, just return 1 if this arrangement could work
        let matches = criteria.matchAll(brokenRE);
        let thisDArr = new Array<number>();
        for (const match of matches) {
            thisDArr.push(match[0].length);
        }
        //console.debug(`thisDArr: ${thisDArr}`);
        if (dArr.length === thisDArr.length && dArr.every((d, ind) => d === thisDArr[ind])) {
            //console.debug(`Found potential match!: ${criteria}!!`)
            result = 1;
        }
    } else {
        let criteriaGood = criteria.substring(0, firstUnknown) + '.' + criteria.substring(firstUnknown+1);
        let criteriaDamaged = criteria.substring(0, firstUnknown) + '#' + criteria.substring(firstUnknown+1);
        result = permute(criteriaGood, dArr) + permute(criteriaDamaged, dArr);
    }
    return result;
}