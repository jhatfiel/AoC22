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
let pArr = new Array<Particle>();
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
    // we are done if all particles are moving away from the origin
    // no.... that just means we can enter phase 2.
    // In this phase, we need to see who is moving away the slowest.  They will 'win'.
    //while (anyMovingTowards === true) {
    while (i < 10000) {
        let pSeen = new Map<string, number>();
        pArr.forEach((p, ind) => {
            p.move();
            const dis = p.distanceFrom(origin);
            lastDistance[ind] = dis;
            let key = makeKey(p.coord);
            if (pSeen.has(key)) pSeen.set(key, pSeen.get(key)+1);
            else pSeen.set(key, 1);
        })
        if (pSeen.size !== pArr.length) {
            pArr = pArr.filter(p => pSeen.get(makeKey(p.coord)) === 1);
            console.log(`[${i.toString().padStart(5, ' ')}]: Collision at ${Array.from(pSeen.keys()).filter(k => pSeen.get(k) > 1).join('/')}`)
        }
        i++;
    }
    console.log(`Final length: ${pArr.length}`);
}

function makeKey(t: Triple) {
    return `${t.x},${t.y},${t.z}`;
}

puzzle.run();