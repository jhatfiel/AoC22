import { Puzzle } from "../../lib/puzzle.js";

class Triple {
    constructor(public x: number, public y: number, public z: number) {}
    add(t: Triple) {
        this.x += t.x;
        this.y += t.y;
        this.z += t.z;
    }

    debugStr(): string {
        return `<${this.x}, ${this.y}, ${this.z}>`;
    }
}
class Particle {
    constructor(public coord: Triple, public velo: Triple, public accel: Triple) {}
    move() {
        this.velo.add(this.accel);
        this.coord.add(this.velo);
    }

    distanceFrom(p: Triple): number {
        return Math.abs(p.x-this.coord.x) + Math.abs(p.y-this.coord.y) + Math.abs(p.z-this.coord.z);
    }

    debugStr() {
        return `p=${this.coord.debugStr()}, v=${this.velo.debugStr()}, a=${this.accel.debugStr()}`;
    }
}

const puzzle = new Puzzle(process.argv[2]);
const pArr = new Array<Particle|undefined>();
const origin = new Triple(0, 0, 0);

puzzle.onLine = (line) => {
    //p=<3,0,0>, v=<2,0,0>, a=<-1,0,0>
    let tArr = new Array<Triple>();
    const matches = line.matchAll(/<([0-9-]+),([0-9-]+),([0-9-]+)>/g);
    for (const match of matches) {
        tArr.push(new Triple(Number(match[1]), Number(match[2]), Number(match[3])));
    }
    if (tArr.length !== 3) throw new Error(`Couldn't find points: ${tArr.map(t => t.debugStr()).join('/')}`)

    pArr.push(new Particle(tArr[0], tArr[1], tArr[2]));
}

puzzle.onClose = () => {
    let lastDistance = new Array<number>(pArr.length).fill(Infinity);
    let i=0;
    let anyMovingTowards = true;
    let slowest = 0;
    let lowestCD = Infinity;
    let movingAwayCount = 0;
    // we are done if all particles are moving away from the origin
    // no.... that just means we can enter phase 2.
    // In this phase, we need to see who is moving away the slowest.  They will 'win'.
    //while (anyMovingTowards === true) {
    while (movingAwayCount < 1000) {
        anyMovingTowards = false;
        lowestCD = Infinity;
        //console.log(`[${i.toString().padStart(5, ' ')}]: `)
        let pSeen = new Map<string, number>();
        pArr.forEach((p, ind) => {
            p.move();
            const dis = p.distanceFrom(origin);
            let cd = dis - lastDistance[ind];
            //console.log(`  [${ind.toString().padStart(3, ' ')}]/[${dis.toString().padStart(5, ' ')}], cd=[${cd}] ${p.debugStr()}`)
            if (cd <= 0) {
                //console.log(`  ${ind.toString().padStart(3, ' ')}[${dis.toString().padStart(5, ' ')}] is still moving towards origin`)
                anyMovingTowards = true;
            }
            if (cd <= lowestCD) {
                lowestCD = cd;
                slowest = ind;
            }
            lastDistance[ind] = dis;
        })
        if (!anyMovingTowards) {
            movingAwayCount++
            console.log(`[${i.toString().padStart(5, ' ')}]: Every point is moving away, ${lowestCD}/${slowest}`);
        }
        i++;
    }
    console.log(`Lowest CD: ${slowest}, CD: ${lowestCD}`);
}

puzzle.run();