import { createReadStream, readFileSync, readSync, writeFileSync } from 'fs';
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

    // https://math.stackexchange.com/questions/2218763/how-to-find-lcm-of-two-numbers-when-one-starts-with-an-offset
    static first_alignment(a_period: number, b_period: number, b_offset: number): number {
        let cpr = Puzzle.combine_phased_rotations(a_period, 0, b_period, ((-b_offset % b_period)+b_period)%b_period)
        return ((-cpr.combined_phase % cpr.combined_period)+cpr.combined_period)%cpr.combined_period;
    }

    static combine_phased_rotations(a_period: number, a_phase: number, b_period: number, b_phase: number) {
        let egcd = Puzzle.extended_gcd(a_period, b_period);
        let phase_diff = a_phase - b_phase;
        // divmod(phase_difference, gcd)
        let pd_mult = Math.floor(phase_diff/egcd.gcd);
        let pd_rem = ((phase_diff % egcd.gcd)+egcd.gcd)%egcd.gcd;
        if (pd_rem) throw new Error(`Rotations (${a_period}/${a_phase}) and (${b_period}/${b_phase}) never synchronize`);
        let combined_period = Math.floor(a_period / egcd.gcd) * b_period;
        let combined_phase = (((a_phase - egcd.s * pd_mult * a_period) % combined_period)+combined_period)%combined_period;
        return {combined_period, combined_phase};
    }

    static extended_gcd(x: number, y: number): {gcd: number, s: number, t: number} {
        let old_r = x, r = y;
        let old_s = 1, s = 0;
        let old_t = 0, t = 1;

        while (r) {
            // divmod(old_r, r)
            let quot = Math.floor(old_r/r);
            let rem = old_r%r;
            old_r = r; r = rem;
            let t_old_s = old_s;
            old_s = s; s = t_old_s - quot * s;
            let t_old_t = old_t;
            old_t = t; t = t_old_t - quot * t;
        }

        return {gcd: old_r, s: old_s, t: old_t};
    }

    static gcd(x: number, y: number): number {
        return (y === 0)?x:Puzzle.gcd(y, x%y);
    }

    static lcm(x: number, y: number): number {
        return x*(y/Puzzle.gcd(x, y));
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

    waitFor(milliseconds: number) {
        if (milliseconds) { let waitTill = new Date(new Date().getTime() + milliseconds); while (waitTill > new Date()); }
    }

    waitForEnter() {
        if (process.stdout.moveCursor) {
            let buffer = Buffer.alloc(1);
            let done = false;
            while (!done) {
                try {
                    readSync(0, buffer, 0, 1, undefined)
                    done = true;
                } catch (error) {
                }
            }
        }
    }

    cache(obj: any, fn: string) {
        writeFileSync(fn, JSON.stringify(obj), 'utf-8');
    }

    restore(fn): any {
        return JSON.parse(readFileSync(fn).toString());
    }
}