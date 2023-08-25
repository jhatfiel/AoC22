import fs from 'fs';
import readline from 'readline';

type P = { x: number, y: number };

class C {
    constructor() { }

    setLOI(lineNum: number) { this.loi = lineNum; };

    loi=0;
    emptyRegions = new Array<Array<number>>();
    beacons = new Array<number>();

    lines = new Array<string>();

    store(line: string) {
        this.lines.push(line);
    }

    processAll() {
        this.emptyRegions = new Array<Array<number>>();
        this.beacons = new Array<number>();
        this.lines.forEach((l) => this.process(l));
    }

    process(line: string) {
        const arr = line.split(/[ :,=]/);
        const [sx, sy, bx, by] = [arr[3], arr[6], arr[13], arr[16]].map(Number);
        const distance = Math.abs(sx-bx) + Math.abs(sy-by);
        let width = distance - Math.abs(sy-this.loi);

        //console.log(`${line} has distance to beacon of ${distance} (${width})`);
        if (by === this.loi) { /*console.log(`Beacon in ${this.loi}, position=${bx}`);*/ this.beacons.push(bx); }

        if (width == 0) {
            /*console.log(`Distance barely touches ${this.loi}, position=${sx}`);*/ this.emptyRegions.push([sx, sx]);
        } else if (width > 0) {
            //console.log(`${this.loi} has no beacons between (${sx-width} and ${sx+width})`);
            this.emptyRegions.push([sx-width, sx+width]);
        }
    }

    joinOverlaps(arr: Array<Array<number>>) {
        //console.log('BEFORE JOIN');
        //this.debug();
        // join overlapping regions
        let madeMerge = false;
        do {
            madeMerge = false;
            let joinedRegions = new Array<Array<number>>();
            arr.forEach((r) => {
                //console.log(`TRYING    r=${r[0]} TO ${r[1]}`);
                let needToAdd = true;
                joinedRegions.some((j) => {
                    //console.log(`COMPARING r=${r[0]} TO ${r[1]} j=${j[0]} TO ${j[1]}`);
                         if (j[0] <= r[0] && r[0] <= j[1]) { j[1] = Math.max(j[1], r[1]); needToAdd = false; } // current start is contained in joined range
                    else if (j[0] <= r[1] && r[1] <= j[1]) { j[0] = Math.min(j[0], r[0]); needToAdd = false; } // current end is contained in joined range
                    else if (r[0] <= j[0] && j[0] <= r[1]) { j[0] = Math.min(j[0], r[0]); j[1] = Math.max(j[1], r[1]); needToAdd = false; } // joined start is contained in current range
                    else if (r[0] <= j[1] && j[1] <= r[1]) { j[0] = Math.min(j[0], r[0]); j[1] = Math.max(j[1], r[1]); needToAdd = false; } // joined end is contained in current range
                    else if (r[1]+1 === j[0])              { j[0] = r[0]; needToAdd = false; } // join side by side regions
                    else if (j[1]+1 === r[0])              { j[1] = r[1]; needToAdd = false; } // join side by side regions
                    if (!needToAdd) { /*console.log(`     JOIN r=${j[0]} TO ${j[1]}`);*/ return true; }
                    return false;
                });
                if (needToAdd) {
                    //console.log(`      NEW r=${r[0]} TO ${r[1]}`);
                    joinedRegions.push([r[0], r[1]]);
                } else {
                    madeMerge = true;
                }
            });
            arr = joinedRegions
            //console.log('AFTER JOIN');
            //this.debug(arr);
        } while (madeMerge);

        return arr;
    }

    cutRegions(arr: Array<Array<number>>, cuts: Array<number>) {
        //console.log('BEFORE CUT');
        // cut regions if there is a beacon in them
        let results = new Array<Array<number>>();
        arr.forEach((r) => {
            for (const b of cuts) {
                     if (b == r[0] && b == r[1]) { break; } // skip this region, it was actually just 1 wide and it's a beacon
                else if (b == r[0]) { results.push([b+1, r[1]]); break; }
                else if (b == r[1]) { results.push([r[0], b-1]); break; }
                else if (r[0] < b && b < r[1]) { results.push([r[0], b-1]); results.push([b+1, r[1]]); break; }
            }
        });

        if (results.length == 0) results = arr;

        //console.log('AFTER CUT');

        return results;
    }

    getResult() {
        //console.log('BEACONS');
        //this.debugBeacons();
        this.emptyRegions = this.joinOverlaps(this.emptyRegions);
        // for this one, we don't want to cut the empty regions because we are ignoring all existing detected beacons
        //this.emptyRegions = this.cutRegions(this.emptyRegions, this.beacons);
        //this.debug();
        return this.emptyRegions.length;
    }

    debug(er=this.emptyRegions) {
        er.forEach((r) => { console.log(`EMPTY: ${r[0]} - ${r[1]}`); });
    }

    debugBeacons() {
        console.log(this.beacons.join(' '));
    }
}

let c = new C();

let fn = process.argv[2];
//c.setLOI(Number(process.argv[3]));
const rl = readline.createInterface({ input: fs.createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.store(line);
})

rl.on('close', () => {
    for (let i=0; i<Number(process.argv[3]); i++) {
        c.setLOI(i);
        c.processAll();
        let size = c.getResult();
        console.log(`Trying ${i}: ${c.getResult()} (${c.emptyRegions.join('/')})`);
        process.stdout.moveCursor(0, -1);
        if (size > 1) {
            console.log(`Found ${i}: ${c.getResult()} (${c.emptyRegions.join('/')})`);
            console.log((c.emptyRegions[0][1]+1)*4000000+i);
        }
    }
});