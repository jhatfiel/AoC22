import { Puzzle } from '../../lib/puzzle.js';
import { Grid, Pair } from '../../lib/grid.js';

let points = new Array<Pair>();

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        let maxDistance = (process.argv[2]==='sample')?32:10000;
        let centerP = {x:0, y:0};

        lines.forEach((line, ind) => {
            let p = Grid.fromKey(line);
            //p.x += offset;
            //p.y += offset;
            centerP.x += p.x;
            centerP.y += p.y;
            points.push(p);
        })

        // centerP is now the center of the points, hopefully it's within totalDistance of all points?
        centerP.x = Math.round(centerP.x/points.length);
        centerP.y = Math.round(centerP.y/points.length);

        let added = true;
        let size = 1;
        for (let ringSize=1; added; ringSize++) {
            added = false;
            console.log(`ringSize: ${ringSize}`)
            for (let i=0; i<2*ringSize; i++) {
                // four sides of the ring that we are checking are found using:
                // x+ringSize, y-ringSize+i
                // x+ringSize-i, y+ringSize
                // x-ringSize, y+ringSize-i
                // x-ringSize+i, y-ringSize
                if (getTotalDistance({x: centerP.x+ringSize, y: centerP.y-ringSize+i}) < maxDistance) { /* console.log(`R. ${centerP.x+ringSize},${centerP.y-ringSize+i}`); */ size++; added = true; }
                if (getTotalDistance({x: centerP.x+ringSize-i, y: centerP.y+ringSize}) < maxDistance) { /* console.log(`B. ${centerP.x+ringSize-i},${centerP.y+ringSize}`); */ size++; added = true; }
                if (getTotalDistance({x: centerP.x-ringSize, y: centerP.y+ringSize-i}) < maxDistance) { /* console.log(`L. ${centerP.x-ringSize},${centerP.y+ringSize-i}`); */ size++; added = true; }
                if (getTotalDistance({x: centerP.x-ringSize+i, y: centerP.y-ringSize}) < maxDistance) { /* console.log(`T. ${centerP.x-ringSize+i},${centerP.y-ringSize}`); */ size++; added = true; }
            }
        }
        console.log(`Region size: ${size}`)
    });

function getTotalDistance(from: Pair) {
    return points.reduce((acc, p) => acc + Math.abs(p.x-from.x) + Math.abs(p.y-from.y), 0);
}