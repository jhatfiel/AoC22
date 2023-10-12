import { Puzzle } from '../../lib/puzzle.js';

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach((line) => {
            let checksum = 0;
            let arr = line.split(' ').map(Number);
            let childCount = Array<number>();
            let metaCount = Array<number>();
            for (let i=0; i<arr.length; i++) {
                let cc = arr[i];
                i++;
                let mc = arr[i];
                childCount.push(cc);
                metaCount.push(mc);

                while (childCount[childCount.length-1] === 0) {
                    // consume metadata
                    childCount.pop();
                    console.log(`Depth: ${childCount.length} Finished with children, time to get data`);
                    let mc = metaCount.pop();
                    for (let j=0; j<mc; i++, j++) {
                        let data = arr[i+1];
                        console.log(`Depth: ${childCount.length} Data: ${data}`);
                        checksum += data;
                    }
                    childCount[childCount.length-1]--;
                }
            }
            console.log(`Final checksum: ${checksum}`)
        })
    });