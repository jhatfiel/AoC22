import { createReadStream } from "fs";
import { createInterface } from "readline";
import { AoCPuzzle } from "../../lib/AoCPuzzle";

type P = { x: number, y: number };

class C {
    constructor() { }

    setLOI(lineNum: number) { this.loi = lineNum; };

    loi=0;
    emptyRegions = new Array<Array<number>>();
    beacons = new Array<number>();

    process(line: string) {
        const arr = line.split(/[ :,=]/);
        const [sx, sy, bx, by] = [arr[3], arr[6], arr[13], arr[16]].map(Number);
        const distance = Math.abs(sx-bx) + Math.abs(sy-by);
        let width = distance - Math.abs(sy-this.loi);

        console.log(`${line} has distance to beacon of ${distance} (${width})`);
        if (by === this.loi) { console.log(`Beacon in ${this.loi}, position=${bx}`); this.beacons.push(bx); }

        if (width == 0) {
            console.log(`Distance barely touches ${this.loi}, position=${sx}`); this.emptyRegions.push([sx, sx]);
        } else if (width > 0) {
            console.log(`${this.loi} has no beacons between (${sx-width} and ${sx+width})`);
            this.emptyRegions.push([sx-width, sx+width]);
        }
    }

    joinOverlaps(arr: Array<Array<number>>) {
        console.log('BEFORE JOIN');
        this.debug();
        // join overlapping regions
        let madeMerge = false;
        do {
            madeMerge = false;
            let joinedRegions = new Array<Array<number>>();
            arr.forEach((r) => {
                console.log(`TRYING    r=${r[0]} TO ${r[1]}`);
                let needToAdd = true;
                joinedRegions.some((j) => {
                    console.log(`COMPARING r=${r[0]} TO ${r[1]} j=${j[0]} TO ${j[1]}`);
                         if (j[0] <= r[0] && r[0] <= j[1]) { j[1] = Math.max(j[1], r[1]); needToAdd = false; } // current start is contained in joined range
                    else if (j[0] <= r[1] && r[1] <= j[1]) { j[0] = Math.min(j[0], r[0]); needToAdd = false; } // current end is contained in joined range
                    else if (r[0] <= j[0] && j[0] <= r[1]) { j[0] = Math.min(j[0], r[0]); j[1] = Math.max(j[1], r[1]); needToAdd = false; } // joined start is contained in current range
                    else if (r[0] <= j[1] && j[1] <= r[1]) { j[0] = Math.min(j[0], r[0]); j[1] = Math.max(j[1], r[1]); needToAdd = false; } // joined end is contained in current range
                    if (!needToAdd) { console.log(`     JOIN r=${j[0]} TO ${j[1]}`); return true; }
                    return false;
                });
                if (needToAdd) {
                    console.log(`      NEW r=${r[0]} TO ${r[1]}`);
                    joinedRegions.push([r[0], r[1]]);
                } else {
                    madeMerge = true;
                }
            });
            arr = joinedRegions
            console.log('AFTER JOIN');
            this.debug(arr);
        } while (madeMerge);

        return arr;
    }

    cutRegions(arr: Array<Array<number>>, cuts: Array<number>) {
        console.log('BEFORE CUT');
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

        console.log('AFTER CUT');

        return results;
    }

    getResult() {
        console.log('BEACONS');
        this.debugBeacons();
        this.emptyRegions = this.joinOverlaps(this.emptyRegions);
        this.emptyRegions = this.cutRegions(this.emptyRegions, this.beacons);
        this.debug();
        let size=0;
        this.emptyRegions.forEach((r) => {
            console.log(`Counting region from ${r[0]} - ${r[1]}, size = ${1+r[1]-r[0]}`);
            size += 1+r[1]-r[0]
        });
        return size;
    }

    debug(er=this.emptyRegions) {
        er.forEach((r) => { console.log(`EMPTY: ${r[0]} - ${r[1]}`); });
    }

    debugBeacons() {
        console.log(this.beacons.join(' '));
    }
}

export class a202215 extends AoCPuzzle {
    sampleMode(): void {
    }

    _runStep(): boolean {
        let c = new C();
        if (this.inSampleMode) {
            c.setLOI(10);
        } else {
            c.setLOI(2000000);
        }
        this.lines.forEach(line => c.process(line));

        this.result = c.getResult().toString();
        return false;
    }
}