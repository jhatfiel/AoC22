import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

type Point = {
    x: number;
    y: number;
    z: number;
}

class Brick {
    constructor(public name: string, p1: Point, p2: Point) {
        if (sortPoint(p1, p2) < 0) {this.pMin = p1; this.pMax = p2;}
        else                       {this.pMin = p2; this.pMax = p1;}
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
    if      (pMin.x !== pMax.x) for (let x=pMin.x; x<=pMax.x; x++) result.push({x, y: pMin.y, z: pMin.z});
    else if (pMin.y !== pMax.y) for (let y=pMin.y; y<=pMax.y; y++) result.push({x: pMin.x, y, z: pMin.z});
    else                        for (let z=pMin.z; z<=pMax.z; z++) result.push({x: pMin.x, y: pMin.y, z});
    return result;
}

function lineBelowPoint(pMin: Point, pMax: Point, p: Point): boolean {
    return generatePoints(pMin, pMax).some(underP => underP.x === p.x && underP.y === p.y && underP.z === p.z-1);
}

let ground = new Brick(`GROUND`, {x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}); // special case, we'll just ignore the fact that ground is a 1x1x1 cube at 0,0. Hush, you!

let bricks = new Array<Brick>();
let lowestClearHeight: Array<Array<number>>;
let topBrick: Array<Array<string>>; // really only used for debugging
let maxX = 0;
let maxY = 0;

function sortPoint(a: Point, b: Point) { return (a.z===b.z)?((a.y===b.y)?a.x-b.x:a.y-b.y):a.z-b.z; }
function sortBrick(a: Brick, b: Brick) { return sortPoint(a.pMin, b.pMin); }

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach((line, index) => {
            let [x1, y1, z1, x2, y2, z2] = line.split(/[,\~]/g).map(Number);
            let name = index.toString();
            if (lines.length === 7) name = 'ABCDEFG'.charAt(index);
            bricks.push(new Brick(name, {x: x1, y: y1, z: z1}, {x: x2, y: y2, z: z2}));
            maxX = Math.max(maxX, x1);
            maxX = Math.max(maxX, x2);
            maxY = Math.max(maxY, y1);
            maxY = Math.max(maxY, y2);
        });

        lowestClearHeight = Array.from({length: maxX+1}, _ => Array.from({length: maxY+1}, v => 1));
        topBrick = Array.from({length: maxX+1}, _ => Array.from({length: maxY+1}, v => ''));
        
        bricks.sort(sortBrick);

        //debugBricks();

        bricks.forEach(b => {
            //console.debug('Falling: ', b.toString());
            // get the lowest clear point for each block in this brick, we can drop to the maximum of those heights
            let lowestSafeDropZ = generatePoints(b.pMin, b.pMax).map(p => lowestClearHeight[p.x][p.y]).reduce((acc, z) => acc = Math.max(acc, z), 0);
            //console.debug(`lowestSafeDropZ = ${lowestSafeDropZ}`);
            let dropAmount = b.pMin.z - lowestSafeDropZ;
            b.pMin.z -= dropAmount;
            b.pMax.z -= dropAmount;
            // update the lowest clear heights for each point in this shape
            generatePoints(b.pMin, b.pMax).forEach(p => {
                lowestClearHeight[p.x][p.y] = p.z+1;
                topBrick[p.x][p.y] = b.name;
            });
            //debugLowestClearHeight();

            // update the supporting/restingOn properties
            // this could use the topBrick array to find out what brick is currently in the z-1 position but ... meh.
            let under = bricks.filter(u => u !== b).filter(u => {
                return generatePoints(b.pMin, b.pMax).some(p => lineBelowPoint(u.pMin, u.pMax, p));
            });

            //sanityCheck(); 
            //console.debug(`Bricks under this one: `, under.map(u => u.name));
            if (under.length) {
                //console.debug(`[${b.pMin.z.toString().padStart(3, ' ')}] ${b.name} hit ${under.map(u => u.name)}`)
                under.forEach(u => { b.restingOn.push(u); u.supporting.push(b); });
            } else if (b.pMin.z === 1) {
                //console.debug(`${b.name} hit ground`);
                b.restingOn.push(ground); ground.supporting.push(b);
            } else {
                // good sanity checking pays off - I actually had a 1x1x1 brick here that was stopping but had nobody under it because of a generatePoints bug
                throw new Error(`Nothing under and we didn't hit ground?? ${b.toString()}`);
            }

        })

        //bricks.sort(sortBrick);
        //debugBricks();
        //debugLowestClearHeight();

        let canRemove = bricks.filter(b =>
            b.supporting.length === 0 || b.supporting.every(supportedBrick => supportedBrick.restingOn.length > 1)
        );
        console.log(`Can remove: ${canRemove.length} [${canRemove.map(b => b.name)}]`);

        let totalFall = 0;
        bricks.forEach(tryRemove => {
            //console.debug(`Removing brick ${tryRemove.name} ...`);
            let fallers = new Set<Brick>();
            let toProcess = new Array<Brick>();
            toProcess.push(tryRemove);
            while (toProcess.length) {
                let processingBrick = toProcess.pop();
                fallers.add(processingBrick);
                bricks.filter(testBrick => !fallers.has(testBrick)) // skip anything that is already falling
                      .filter(testBrick => testBrick.restingOn.every(supportingBrick => fallers.has(supportingBrick))) // if all of the supporters are falling...
                      .filter(newFaller => toProcess.indexOf(newFaller) === -1)
                      .forEach(newFaller => toProcess.push(newFaller)); // ...this brick is a new faller, add it to the process list
                //console.debug('fallers: ', fallers.map(b => b.name));
                //console.debug('toProcess: ', toProcess.map(b => b.name));
            }
            // If we remove this brick, every brick above it that is supported by ONLY this brick will fall, triggering the ones above them, etc
            //console.debug(`Removing brick ${tryRemove.name} would cause ${fallers.map(b => b.name)} to fall`);
            console.debug(`Removing brick ${tryRemove.name} would cause ${fallers.size-1} to fall`);
            totalFall += fallers.size-1;
        })
        console.log(`Total falling bricks: ${totalFall}`);
    });

function sanityCheck() {
    return;
    // sanity checking to make sure no bricks occupy the same point
    bricks.forEach(b1 => {
        bricks.filter(b2 => b1 !== b2).forEach(b2 => {
            let b1Points = generatePoints(b1.pMin, b1.pMax);
            let b2Points = generatePoints(b2.pMin, b2.pMax);
            b1Points.forEach(p1 => {
                b2Points.forEach(p2 => {
                    if (p1.x === p2.x && p1.y === p2.y && p1.z === p2.z) {
                        throw new Error(`Time-space anomoly detected, blocks have phase shifted! ${b1.toString()} & ${b2.toString()}`);
                    }
                })
            })
        })
    })
}

function debugBricks() {
    bricks.forEach((b, brickIndex) => {
        console.debug(b.toString());
    });
}

function debugLowestClearHeight() {
    console.debug(`Lowest clear height:`);
    for (let y=0; y<=maxY; y++) {
        let str = '';
        for (let x=0; x<=maxX; x++) {
            str += lowestClearHeight[x][y].toString().padStart(3, ' ') + `[${topBrick[x][y].padStart(4, ' ').substring(0, 4)}]`;
        }
        console.debug(str);
    }

} 