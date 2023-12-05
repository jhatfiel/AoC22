import { Puzzle } from "../../lib/puzzle.js";

type mapRange = {
    from: number;
    to: number;
    length: number;
}

type sRange = {
    from: number;
    length: number;
}

const puzzle = new Puzzle(process.argv[2]);
let sArray = new Array<sRange>;
let maps = Array.from({length: 7}, () => new Array<mapRange>());

await puzzle.run()
    .then((lines: Array<string>) => {
        let sourceArr = lines[0].split(':')[1].trim().split(' ').map(Number);
        for (let i=0; i<sourceArr.length/2; i++) {
            sArray.push({from: sourceArr[i*2], length: sourceArr[i*2+1]})
        }
        console.debug(sArray.map(sa => JSON.stringify(sa)));
        console.debug(sArray[0])

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
        sArray.forEach(sRange => {
            console.debug(`Processing range starting at ${sRange.from}`)
            let i=0;
            while (i < sRange.length) {
                let sNum = sRange.from + i
                // map through each mapping
                //console.debug(`Working with seed ${sNum}`)
                maps.forEach((mArr, mNum) => {
                    let newNum = sNum;
                    mArr.forEach(mapping => {
                        if (sNum >= mapping.from && sNum < mapping.from+mapping.length) {
                            newNum = mapping.to + sNum-mapping.from;
                            //console.debug(`[${mNum}] Found mapping: ${JSON.stringify(mapping)} Translating ${sNum} to ${newNum}`)
                        }
                    })
                    sNum = newNum;
                })
                if (sNum < lowestLocation) {
                    lowestLocation = sNum;
                    console.log(`New lowest: ${sNum}`)
                }

                i++;
            }
        })
        console.log(`Final lowest: ${lowestLocation}`)
    });
