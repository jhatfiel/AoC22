import { Pair } from './../../lib/gridParser';
import { AoCPuzzle } from '../../lib/AoCPuzzle';

export enum LineType {
    CLAY,
    RESTING,
    FLOWING
}

export type Line = {
    type: LineType;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
}

export class a201817 extends AoCPuzzle {
    typeLines: Line[] = [];
    xMin = 500;
    xMax = 500;
    yMin = Infinity;
    yMax = 0;
    fallToCheck: Line[] = [];
    waterCount = 0;

    sampleMode(): void { };

    _loadData(lines: string[]) { 
        this.typeLines = [];
        lines.forEach(line => {
            let arr = line.split(/[=, \.]/);
            if (arr[0] === 'x') {
                this.typeLines.push({type: LineType.CLAY, x1: Number(arr[1]), x2: Number(arr[1]), y1: Number(arr[4]), y2: Number(arr[6])})
            } else {
                this.typeLines.push({type: LineType.CLAY, x1: Number(arr[4]), x2: Number(arr[6]), y1: Number(arr[1]), y2: Number(arr[1])})
            }
        });
        this.typeLines.forEach(line => {
            this.xMin = Math.min(this.xMin, line.x1);
            this.xMax = Math.max(this.xMax, line.x2);
            this.yMin = Math.min(this.yMin, line.y1);
            this.yMax = Math.max(this.yMax, line.y2);
        });
        this.typeLines.sort(this.sortLines);

        this.log(`x range: ${this.xMin}-${this.xMax}`);
        this.log(`y range: ${this.yMin}-${this.yMax}`);
        this.fallToCheck.push({type: LineType.FLOWING, x1: 500, x2: 500, y1: 0, y2: 0});
    }

    sortLines(a: Line, b: Line): number { return (a.y1 === b.y1) ? a.x1-b.x1 : a.y1 - b.y1; }

    _runStep(): boolean {
        let moreToDo = false;
        let newFallToCheck: Line[] = [];

        this.fallToCheck.forEach(fall => {
            this.log(`Checking fall at (${fall.x1}, ${fall.y2})`);
            let hit = this.typeLines.filter(l => l.y1 >= fall.y1).find(l => l.x1 <= fall.x1 && fall.x1 <= l.x2);

            this.log(`hit?.y1 = ${hit?.y1}`);
            if (hit === undefined) {
                fall.y2 = this.yMax;
                this.typeLines.push(fall);
                return;
            }
            
            if (hit.type === LineType.CLAY || hit.type === LineType.RESTING) {
                this.log(`Found ${LineType[hit.type]}: ${JSON.stringify(hit)}`);
                // update this fall line to end 2 above this barrier
                fall.y2 = hit.y1-2;
                // spread out right & left (y2 = NaN means it's a drop)
                let left = this.findClayRestingOrDrop(fall.x1, hit.y1-1, -1);
                let right = this.findClayRestingOrDrop(fall.x1, hit.y1-1, 1);
                if (left.type === LineType.CLAY) {
                    this.log(`Found left wall at ${JSON.stringify(left)}`);
                } else {
                    this.log(`Found left drop at ${JSON.stringify(left)}`);
                }
                if (right.type === LineType.CLAY) {
                    this.log(`Found right wall at ${JSON.stringify(right)}`);
                } else {
                    this.log(`Found right drop at ${JSON.stringify(right)}`);
                }

                if (left.type === LineType.CLAY && right.type === LineType.CLAY) {
                    // - if 2 walls, create new rLine above the hLine, update fall line to stop above the sLine
                    this.typeLines.push({type: LineType.RESTING, x1: left.x1+1, x2: right.x2-1, y1: hit.y1-1, y2: hit.y1-1});
                    this.typeLines.sort(this.sortLines);
                    newFallToCheck.push(fall);
                } else {
                    // - if 1 or no walls, this fall is DONE.  Find first and last x with support, create uLine to represent.  Create 1 or 2 new fall lines.
                    let x1 = left.x1+1;
                    let x2 = right.x2-1;

                    this.typeLines.push(fall);
                    this.typeLines.sort(this.sortLines);
                    if (Number.isNaN(left.y2)) {
                        newFallToCheck.push({type: LineType.FLOWING, x1: left.x1, x2: left.x1, y1: hit.y1-1, y2: hit.y1-1});
                    }
                    if (Number.isNaN(right.y2)) {
                        newFallToCheck.push({type:LineType.FLOWING, x1: right.x1, x2: right.x1, y1: hit.y1-1, y2: hit.y1-1});
                    }
                    this.typeLines.push({type: LineType.FLOWING, x1, x2, y1: hit.y1-1, y2: hit.y1-1});
                    this.typeLines.sort(this.sortLines);
                }
            }
        });

        this.fallToCheck = newFallToCheck;
        moreToDo = this.fallToCheck.length > 0;
        this.result = this.typeLines.filter(line => line.type === LineType.FLOWING || line.type === LineType.RESTING).reduce((acc, line) => {
            this.log(`Counting line: ${JSON.stringify(line)}`)
            let x1 = line.x1;
            let x2 = line.x2;
            let y1 = Math.max(this.yMin, line.y1);
            let y2 = Math.max(this.yMin, line.y2);

            return acc + (x2-x1+1)*(y2-y1+1);
        }, 0).toString();
        return moreToDo;
    }

    isClay(x: number, y: number): boolean {
        return this.typeLines.filter(line => line.type === LineType.CLAY).some(line => line.x1 <= x && x <= line.x2 && line.y1 <= y && y <= line.y2);
    }

    isResting(x: number, y: number): boolean {
        return this.typeLines.filter(line => line.type === LineType.RESTING).some(line => line.x1 <= x && x <= line.x2 && line.y1 <= y && y <= line.y2);
    }

    getLine(x: number, y: number): Line {
        return this.typeLines.find(line => line.x1 <= x && x <= line.x2 && line.y1 <= y && y <= line.y2);
    }

    findClayRestingOrDrop(x: number, y: number, dir: number): Line {
        let resultLine = {type: undefined, x1: NaN, x2: NaN, y1: y, y2: NaN};
        while ((this.isClay(x, y+1) || this.isResting(x, y+1)) && !this.isClay(x, y)) x += dir;
        if (this.isClay(x, y)) resultLine = this.getLine(x, y);
        else {
            resultLine.x1 = x;
            resultLine.x2 = x;
        }
        return resultLine;
    }
}