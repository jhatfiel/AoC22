import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);
const DUP = 5;
var arrangementsFor = new Map<string, number>();

await puzzle.run()
    .then((lines: Array<string>) => {
        let totalPossibleCount = 0;
        lines.forEach(line => {
            let arr = line.split(' ');
            let criteria = arr[0];
            let damagedArrayStr = arr[1];
            // duplicate the input 5 times
            for (let i=1; i < DUP; i++) {
                criteria += '?' + arr[0];
                damagedArrayStr += ',' + arr[1];
            }
            let damagedArray = damagedArrayStr.split(',').map(Number);
            console.debug(`criteria: ${criteria}, damagedArray=${damagedArray}`)
            let startTime = performance.now();
            let possibleCount = possibleArrangements(criteria, damagedArray);
            let endTime = performance.now();
            console.debug(`Possible Arrangements: ${possibleCount} (computed in ${Math.floor((endTime - startTime)/10)/100} seconds)`);
            totalPossibleCount += possibleCount;
        });
        console.log(`Total possible arrangements: ${totalPossibleCount}`);
        console.log(`Total memorized arrangements: ${arrangementsFor.size}`);
    });

function possibleArrangements(criteria: string, damagedArray: Array<number>): number {
    let key = criteria + '_' + damagedArray.join(','); // memoization - remember previous times we've asked for this exact solution so we don't recompute it
    if (arrangementsFor.has(key)) return arrangementsFor.get(key);

    if (damagedArray.length === 0) {
        // no more damaged entries, so everything left better be just ? or .
        return criteria.split('').every(c => c === '?' || c === '.')?1:0;
    } else {
        let result = 0;
        let p1Pattern = ''.padStart(damagedArray[0], '#'); // part 1 pattern: a string of damaged characters (###[...]#) with length equal to first damagedArray entry
        let remainingDamagedArray = damagedArray.slice(1); // part 2 will need to match the rest of the damaged array
        if (remainingDamagedArray.length > 0) p1Pattern += '.'; // if we have more damagedArray entries, the part1 string HAS to end with a period
        // we need to make sure there are at least enough characters left in part2 to fulfill the optimistic matching of the remainingDamagedArray
        let p2TotalNeeded = remainingDamagedArray.reduce((acc, d) => acc += d, 0) + remainingDamagedArray.length-1;
        // find the index of the first damaged character. Part1 has to contain this character.
        let firstDamagedIndex = criteria.indexOf('#');
        if (firstDamagedIndex === -1) firstDamagedIndex = criteria.length;
        for (let n=0; n <= criteria.length - p2TotalNeeded - p1Pattern.length && n <= firstDamagedIndex; n++) {
            // split the criteria into part1 & part2
            let p1 = criteria.substring(n, n+p1Pattern.length);
            let p2 = criteria.substring(   n+p1Pattern.length);
            // if p1 can match the pattern above, we know that all possible arrangements for part2 will work with this one, so include them
            if (canMatch(p1, p1Pattern)) result += possibleArrangements(p2, remainingDamagedArray);
        }
        // memoize the result so we don't recompute it
        arrangementsFor.set(key, result);
        return result;
    }
}

function canMatch(s: string, pattern: string): boolean {
    // a string (s) matches a pattern if each character matches or the string has a ? at that location
    return pattern.split('').every((c, index) => s[index] === c || s[index] === '?');
}