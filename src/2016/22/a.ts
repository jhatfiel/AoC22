// root@ebhq-gridcenter# df -h
// Filesystem              Size  Used  Avail  Use%
// /dev/grid/node-x0-y0     85T   72T    13T   84%

import { Puzzle } from "../../lib/puzzle.js";
type Pair = {x:number, y:number};
type Node = {name: Pair, size: number, used: number};

// it will be a grid in part 2
let grid = new Array<Node>(); // </Node>new Array<Array<Node>>();

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let arr = line.split(/ +/);
    //console.log(arr);
    let fnArr = arr[0].split('-');
    let x = Number(fnArr[1].slice(1));
    let y = Number(fnArr[2].slice(1));
    /*
    if (y===0) {
        grid.push(new Array<Node>());
    }
    */
    //grid[grid.length-1].push({size: Number(arr[1].replace('T', '')), used: Number(arr[2].replace('T', ''))});
    grid.push({name: {x,y}, size: Number(arr[1].replace('T', '')), used: Number(arr[2].replace('T', ''))});
};

p.onClose = () => {
    let totalPairs = 0;
    grid.forEach((n, ind, arr) => {
        let pCnt = arr.reduce((acc, c, cInd) => acc + ((cInd!==ind && n.used > 0 && n.used < c.size-c.used)?1:0), 0);
        console.log(`pairs for ${JSON.stringify(n.name)}: ${pCnt}`)
        totalPairs += pCnt;
    })
    console.log(`Total viable pairs ${totalPairs}`);

};

p.run();