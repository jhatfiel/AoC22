import { Puzzle } from '../../lib/puzzle.js';

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        let used = new Map<string, Array<number>>();
        let claims = new Map<number, Array<string>>();
        lines.forEach((line) => {
            let [id, left, top, width, height] = line.match(/#([\d]+) @ ([\d]+),([\d]+): ([\d]+)x([\d]+)/).slice(1).map(Number);
            let claimArr = new Array<string>();
            claims.set(id, claimArr);
            for (let x=0; x<width; x++) {
                for (let y=0; y<height; y++) {
                    let key = `${left+x},${top+y}`
                    if (!used.has(key)) used.set(key, new Array<number>());
                    used.get(key).push(id);
                    claimArr.push(key);
                }
            }
        })
        console.log('squares in 2 or more claims:', Array.from(used.keys()).reduce((acc, k) => acc + ((used.get(k).length>1)?1:0), 0));
        claims.forEach((kArr, id) => {
            if (kArr.every((k) => used.get(k).length === 1)) console.log(id);
        })
    });