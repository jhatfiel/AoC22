import { createReadStream } from 'fs';
import { createInterface } from 'readline';

export class Puzzle {
    constructor(private fn="_UNUSED_") { }

    async run() {
        const rl = createInterface({ input: createReadStream(this.fn), crlfDelay: Infinity, terminal: false});
        return new Promise((resolve, reject) => {
            rl.on('line', line => { this.lines.push(line); this.onLine(line) } ); 
            rl.on('close', () => { resolve(this.lines); this.onClose(); });
        })
    }

    lines = new Array<string>();

    onLine(line: string) { }
    onClose() { }
    
    toMask(arr: Array<string>, set: Set<string>): number {
        return arr.map((n, i) => set.has(n)?1<<i:0).reduce((p, v) => p | v, 0);
    }

    toSet(arr: Array<string>, mask: number): Set<string> {
        return new Set(arr.filter((v, ind) => 1<<ind & mask));
    }

    maskOr(arr: Array<string>, mask: number, el: string): number {
        return mask | (1<<arr.indexOf(el));
    }

    toMaskN(arr: Array<number>, set: Set<number>): number {
        return arr.map((n, i) => set.has(n)?1<<i:0).reduce((p, v) => p | v, 0);
    }

    toSetN(arr: Array<number>, mask: number): Set<number> {
        return new Set(arr.filter((v, ind) => 1<<ind & mask));
    }
    
    maskOrN(arr: Array<number>, mask: number, el: number): number {
        return mask | (1<<arr.indexOf(el));
    }

    countOccurrences(arr: Array<any>): Map<string, number> {
        return new Map(Object.entries(arr.reduceRight((acc, cur) => { acc[cur]?++acc[cur]:acc[cur]=1; return acc; }, {})));
    }
    
    gridOrthogonalP(p: {x:number, y:number}, max={x:Infinity, y:Infinity}): Array<{x: number, y: number}> {
        let result = new Array<{x: number, y: number}>();
        if (p.x > 0)     result.push({x: p.x-1, y: p.y});

        if (p.y > 0)     result.push({x: p.x, y: p.y-1});
        if (p.y < max.y) result.push({x: p.x, y: p.y+1});

        if (p.x < max.x) result.push({x: p.x+1, y: p.y});
        return result;
    }

    gridAroundP(p: {x: number, y: number}, max={x:Infinity, y:Infinity}): Array<{x: number, y: number}> {
        let result = new Array<{x: number, y: number}>();
        if (p.x > 0 && p.y > 0)         result.push({x: p.x-1, y: p.y-1});
        if (p.x > 0)                    result.push({x: p.x-1, y: p.y});
        if (p.x > 0 && p.y < max.y)     result.push({x: p.x-1, y: p.y+1});

        if (p.y > 0)                    result.push({x: p.x, y: p.y-1});
        if (p.y < max.y)                result.push({x: p.x, y: p.y+1});

        if (p.x < max.x && p.y > 0)     result.push({x: p.x+1, y: p.y-1});
        if (p.x < max.x)                result.push({x: p.x+1, y: p.y});
        if (p.x < max.x && p.y < max.y) result.push({x: p.x+1, y: p.y+1});
        return result;
    }

    gridAround(row: number, col: number, maxRow: number, maxCol: number): Array<{row: number, col: number}> {
        let result = new Array<{row: number, col: number}>();
        if (row > 0 && col > 0)           result.push({row: row-1, col: col-1});
        if (row > 0)                      result.push({row: row-1, col: col});
        if (row > 0 && col < maxCol)      result.push({row: row-1, col: col+1});

        if (col > 0)                      result.push({row: row, col: col-1});
        if (col < maxCol)                 result.push({row: row, col: col+1});

        if (row < maxRow && col > 0)      result.push({row: row+1, col: col-1});
        if (row < maxRow)                 result.push({row: row+1, col: col});
        if (row < maxRow && col < maxCol) result.push({row: row+1, col: col+1});
        return result;
    }

    gridOrthogonal(row: number, col: number, maxRow: number, maxCol: number): Array<{row: number, col: number}> {
        let result = new Array<{row: number, col: number}>();
        if (row > 0)                      result.push({row: row-1, col: col});

        if (col > 0)                      result.push({row: row, col: col-1});
        if (col < maxCol)                 result.push({row: row, col: col+1});

        if (row < maxRow)                 result.push({row: row+1, col: col});
        return result;
    }

    permute(arr = Array<string>()): Array<string> {
        if (arr.length < 2) return [...arr];
        // take each element and return the permutation of the remaining elements
        let result = new Array<string>();
        arr.forEach((e, ind) => {
            let arrCopy = [...arr];
            arrCopy.splice(ind, 1);
            this.permute(arrCopy).forEach((p) => result.push(e+p));
        });
        return result;
    }

    /**
     *  Returns the position of an oscilating entity along positions `0 ... max` (inclusive) after 
     *  optional `delay` ticks have passed, assuming starting position `start` and starting `direction` of travel
     *
     *  @param max (0-based) The number of the maximum position (so total number of positions is max+1)
     *  @param delay the position reported is after number of `ticks` have passed (Default: 0)
     *  @param start the position the entity is currently is (Default: 0)
     *  @param direction is the position increasing (1) or decreasing (-1) (Default: 1)

     *  @remarks
     *  This equation is based on triangle wave function; the x axis is ticks since start; the y axis is the position of the item you are watching
     *  the amplitude is the max that is passed in (and the period is just 4*amplitude)
     *  https://en.wikipedia.org/wiki/Triangle_wave
     */
    positionAfter(max: number, delay=0, start=0, direction=1): number {
        // set delay based on start & direction
        if (start === 0) direction = 1;
        if (direction === -1) delay = delay + (max-start) + max;
        else delay = delay + start;
        let period = max * 4;
        return Math.abs(Math.abs((((delay-max)%period)+period)%period - period/2) - max);
    }
}