import { Puzzle } from "../../lib/puzzle.js";

type mapRange = {
    from: number;
    to: number;
    length: number;
}

const puzzle = new Puzzle(process.argv[2]);
let sArray: Array<number>;
let maps = Array.from({length: 7}, () => new Array<mapRange>());

await puzzle.run()
    .then((lines: Array<string>) => {
        sArray = lines[0].split(':')[1].trim().split(' ').map(Number);
        console.debug(sArray);

        let mapNum = 0;
        lines.slice(2).forEach(line => {
            if (line === '') mapNum++;
            else if (!line.endsWith('map:')) {
                // process mapping numbers
                let arr = line.split(' ').map(Number);
                maps[mapNum].push({from: arr[1], to: arr[0], length: arr[2]})
            }
        });

        let lowestLocation = Infinity;
        sArray.forEach(sNum => {
            // map through each mapping
            console.debug(`Working with seed ${sNum}`)
            maps.forEach((mArr, mNum) => {
                let newNum = sNum;
                mArr.forEach(mapping => {
                    if (sNum >= mapping.from && sNum < mapping.from+mapping.length) {
                        newNum = mapping.to + sNum-mapping.from;
                        console.debug(`[${mNum}] Found mapping: ${JSON.stringify(mapping)} Translating ${sNum} to ${newNum}`)
                    }
                })
                sNum = newNum;
            })
            if (sNum < lowestLocation) {
                lowestLocation = sNum;
                console.log(`New lowest: ${sNum}`)
            }
        })
        console.log(`Final lowest: ${lowestLocation}`)
    });
