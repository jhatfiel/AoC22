import { Puzzle } from '../../lib/puzzle.js';
import { Grid, Pair } from '../../lib/grid.js';

let points = new Array<Pair>();
let offset = 2000

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        let inf = new Set<number>();

        lines.forEach((line, ind) => {
            let p = Grid.fromKey(line);
            p.x += offset;
            p.y += offset;
            points.push(p);
        })

        // find points whose regions extend to the border, those are probably infinite...
        for (let n=0; n<offset*2; n++) {
            let x = 0;
            let y = n;
            let closestID = getClosestID({x,y});
            if (closestID !== -1) inf.add(closestID);

            x = offset*2;
            closestID = getClosestID({x,y});
            if (closestID !== -1) inf.add(closestID);

            x = n;
            y = 0;
            closestID = getClosestID({x,y});
            if (closestID !== -1) inf.add(closestID);

            y = offset*2;
            closestID = getClosestID({x,y});
            if (closestID !== -1) inf.add(closestID);
        }
        console.log(`Infinite regions: ${Array.from(inf.keys())}`)

        let biggest = 0;
        points.forEach((p, ind) => {
            if (!inf.has(ind)) {
                // find region around p that is closest to p
                let size = 1;
                let added = true;
                //console.log(`Looking at ${ind}:${JSON.stringify(p)}`)
                for (let ringSize=1; added; ringSize++) {
                    added = false;
                    //console.log(`ringSize: ${ringSize}`)
                    for (let i=0; i<2*ringSize; i++) {
                        // four sides of the ring that we are checking are found using:
                        // x+ringSize, y-ringSize+i
                        // x+ringSize-i, y+ringSize
                        // x-ringSize, y+ringSize-i
                        // x-ringSize+i, y-ringSize
                        if (getClosestID({x: p.x+ringSize, y: p.y-ringSize+i}) === ind) { /*console.log(`R.${ind} is closest to ${p.x+ringSize},${p.y-ringSize+i}`); */ size++; added = true; }
                        if (getClosestID({x: p.x+ringSize-i, y: p.y+ringSize}) === ind) { /*console.log(`B.${ind} is closest to ${p.x+ringSize-i},${p.y+ringSize}`); */ size++; added = true; }
                        if (getClosestID({x: p.x-ringSize, y: p.y+ringSize-i}) === ind) { /*console.log(`L.${ind} is closest to ${p.x-ringSize},${p.y+ringSize-i}`); */ size++; added = true; }
                        if (getClosestID({x: p.x-ringSize+i, y: p.y-ringSize}) === ind) { /*console.log(`T.${ind} is closest to ${p.x-ringSize+i},${p.y-ringSize}`); */ size++; added = true; }
                    }
                }
                //console.log(`Region: ${ind} size: ${size}`)
                if (size > biggest) {
                    biggest = size;
                    console.log(`Found larger region: ${ind} of size: ${size}`)
                }
            }
        })

    });

function getClosestID(pos: Pair) {
    let closestID = -1;
    let closestDistance=Infinity;
    points.forEach((p, ind) => {
        let distance = Math.abs(p.x-pos.x) + Math.abs(p.y-pos.y);
        if (distance === closestDistance) {
            // just reset closestID because we have multiple at this distance
            closestID = -1;
        } else if (distance < closestDistance) {
            closestDistance = distance;
            closestID = ind;
        }
    })
    return closestID;
}