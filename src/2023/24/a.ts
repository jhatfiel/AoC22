import { Puzzle } from "../../lib/puzzle.js";

type Point = {
    x: number;
    y: number;
    z: number;
    xv: number;
    yv: number;
    zv: number;
}

const puzzle = new Puzzle(process.argv[2]);

let xMin = 200000000000000;
let yMin = 200000000000000;

let xMax = 400000000000000;
let yMax = 400000000000000;

//xMin = 7; yMin = 7;
//xMax = 27; yMax = 27;

let points = new Array<Point>();

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            let arr = line.replace(/ +/g, '').split(/[@,]/).map(Number);
            points.push({x: arr[0], y: arr[1], z: arr[2], xv: arr[3], yv: arr[4], zv: arr[5]});
        });

        let cnt = 0;
        points.forEach((p1, ind) => {
            points.slice(ind).forEach(p2 => {
                let [t1, t2, cp] = getCollisionTime(p1, p2);
                if (t1 > 0 && t2 > 0 && cp.x >= xMin && cp.x <= xMax && cp.y >= yMin && cp.y <= yMax) {
                    //console.debug(`Compare ${JSON.stringify(p1)} and ${JSON.stringify(p2)}: Colission at ${cp.x}, ${cp.y}, ${time}`);
                    cnt++;
                }
            })
        })

        console.debug(`Total collisions ${cnt}`);
    });

function getCollisionTime(p1: Point, p2: Point): [number, number, Point] {
    let m1 = p1.yv/p1.xv;
    let m2 = p2.yv/p2.xv;
    let b1 = p1.y - m1*p1.x;
    let b2 = p2.y - m2*p2.x;

    let cx = (b2-b1)/(m1-m2);

    let cy = m1*cx + b1;
    let t1 = (cx-p1.x)/p1.xv;
    let t2 = (cx-p2.x)/p2.xv;
    //console.debug(`at ${t}: ${cx}, ${cy}`);

    return [t1, t2, {x: cx, y: cy, z: 0, xv: 0, yv: 0, zv: 0}];
}