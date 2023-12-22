import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

type Point = {
    x: number;
    y: number;
    z: number;
}

class Brick {
    constructor(public name: string, p1: Point, p2: Point) {
        let arr = [p1, p2];
        arr.sort(sortPoint);
        this.pMin = arr[0];
        this.pMax = arr[1];
    }
    pMin: Point;
    pMax: Point;
    restingOn = new Array<Brick>();
    supporting = new Array<Brick>();
    toString(): string {
        return `${this.name}: ${JSON.stringify(this.pMin)} - ${JSON.stringify(this.pMax)} restingOn: ${this.restingOn.map(b => b.name)}`;
    }
}

function generatePoints(pMin: Point, pMax: Point): Array<Point> {
    let result = new Array<Point>();
    if (pMin.x !== pMax.x) for (let x=pMin.x; x<=pMax.x; x++) result.push({x, y: pMin.y, z: pMin.z});
    if (pMin.y !== pMax.y) for (let y=pMin.y; y<=pMax.y; y++) result.push({x: pMin.x, y, z: pMin.z});
    if (pMin.z !== pMax.z) for (let z=pMin.z; z<=pMax.z; z++) result.push({x: pMin.x, y: pMin.y, z});
    return result;
}

function lineBelowPoint(pMin: Point, pMax: Point, p: Point): boolean {
    return generatePoints(pMin, pMax).some(underP => underP.x === p.x && underP.y === p.y && underP.z === p.z-1);
}

let ground = new Brick(`GROUND`, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0});

let bricks = new Array<Brick>();

function sortPoint(a: Point, b: Point) { return (a.z===b.z)?((a.y===b.y)?a.x-b.x:a.y-b.y):a.z-b.z; }
function sortBrick(a: Brick, b: Brick) { return sortPoint(a.pMin, b.pMin); }

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach((line, index) => {
            let [x1, y1, z1, x2, y2, z2] = line.split(/[,\~]/g).map(Number);
            bricks.push(new Brick(`Brick #${index}`, {x: x1, y: y1, z: z1}, {x: x2, y: y2, z: z2}));
        });
        
        bricks.sort(sortBrick);

        //debugBricks();

        bricks.forEach((b, brickIndex) => {
            while (b.restingOn.length === 0 && b.pMin.z > 1) {
                //console.debug('Falling: ', b.toString());
                // see if there's anything under us
                let under = bricks.slice(0, brickIndex).filter(u => {
                    return generatePoints(b.pMin, b.pMax).some(p => lineBelowPoint(u.pMin, u.pMax, p));
                });
                //console.debug(`Bricks under this one: `, under.map(u => u.name));
                if (under.length) {
                    under.forEach(u => { b.restingOn.push(u); u.supporting.push(b); });
                } else {
                    b.pMin.z--;
                    b.pMax.z--;
                }
            }
            if (b.pMin.z === 1) { b.restingOn.push(ground); ground.supporting.push(b); }
        })

        //debugBricks();

        let canRemove = bricks.filter(b =>
            b.supporting.length === 0 || b.supporting.every(supportedBrick => supportedBrick.restingOn.length > 1)
        );
        console.log(`Can remove: ${canRemove.length}`);
        // 445 is too high
    });

function debugBricks() {
    bricks.forEach((b, brickIndex) => {
        console.debug(b.toString());
    });
}