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
        this.log(`Step: ${this.stepNumber} - ${this.fallToCheck.length} falling streams to process, ${this.typeLines.filter(line => line.type !== LineType.CLAY).length} lines of interest`);
        let moreToDo = false;
        let newFallToCheck: Line[] = [];

        this.fallToCheck.forEach(fall => {
            if (fall.y2 < fall.y1) return;
            //this.log(`Checking fall at (${fall.x1}, ${fall.y1} down to ${fall.y2})`);
            let hit = this.typeLines.filter(l => l.y1 >= fall.y1).find(l => l.x1 <= fall.x1 && fall.x1 <= l.x2);

            //this.log(`hit?.y1 = ${hit?.y1}`);
            if (hit === undefined) {
                // this falling water doesn't hit anything, so cap it at the end and get rid of it, it never needs to be considered again
                fall.y2 = this.yMax;
                this.typeLines.push(fall);
                return;
            }
            
            if (hit.type === LineType.CLAY || hit.type === LineType.RESTING) {
                // if we hit clay or resting water, we have more to process
                moreToDo = true;
                newFallToCheck.push(fall);

                //this.log(`Found ${LineType[hit.type]}: ${JSON.stringify(hit)}`);
                // update this fall line to end 2 above this barrier
                fall.y2 = hit.y1-2;
                // spread out right & left (y2 = NaN means it's a drop)
                let left = this.findClayRestingOrDrop(fall.x1, hit.y1-1, -1);
                let right = this.findClayRestingOrDrop(fall.x1, hit.y1-1, 1);
                /*
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
                */

                if (left.type === LineType.CLAY && right.type === LineType.CLAY) {
                    // - if 2 walls, create new rLine above the hLine, update fall line to stop above the sLine
                    // remove flowing lines that this resting line covers
                    let newLine = {type: LineType.RESTING, x1: left.x2+1, x2: right.x1-1, y1: hit.y1-1, y2: hit.y1-1};
                    this.typeLines = this.typeLines.filter(line => !(line.type === LineType.FLOWING && line.y1 === line.y2 && line.y1 === newLine.y1 && line.x1 <= newLine.x2 && line.x2 >= newLine.x1));
                    //this.log(`Adding flat resting line: ${JSON.stringify(newLine)}`);
                    [...this.fallToCheck, ...newFallToCheck].filter(line => line.y1 <= newLine.y1 && newLine.y1 <= line.y2 && newLine.x1 <= line.x1 && line.x1 <= newLine.x2).forEach(line => {
                        line.y2 = newLine.y1-1;
                        //this.log(`Trimming back ${JSON.stringify(line)}`);
                    })
                    this.typeLines.push(newLine);
                    this.typeLines.sort(this.sortLines);
                } else {
                    // - if 1 or no walls, this fall is done for now.  Create resting line from first to last x with support. Create 1 or 2 new fall lines.
                    let x1 = left.x2+1;
                    let x2 = right.x1-1;

                    if (left.type === undefined) {
                        // make sure the top of this new flow line isn't contained in an existing one
                        let newLine = {type: LineType.FLOWING, x1: left.x1, x2: left.x1, y1: hit.y1-1, y2: hit.y1-1}
                        if (![...this.fallToCheck, ...newFallToCheck].some(line => line.x1 === newLine.x1 && line.y1 <= newLine.y1 && newLine.y1 <= line.y2)) {
                            //this.log(`Adding new LEFT fall line: ${JSON.stringify(newLine)}`)
                            newFallToCheck.push(newLine);
                        }
                    }
                    if (right.type === undefined) {
                        let newLine = {type:LineType.FLOWING, x1: right.x1, x2: right.x1, y1: hit.y1-1, y2: hit.y1-1};
                        if (![...this.fallToCheck, ...newFallToCheck].some(line => line.x1 === newLine.x1 && line.y1 <= newLine.y1 && newLine.y1 <= line.y2)) {
                            //this.log(`Adding new RIGHT fall line: ${JSON.stringify(newLine)}`)
                            newFallToCheck.push(newLine);
                        }
                    }
                    let newLine = {type: LineType.FLOWING, x1, x2, y1: hit.y1-1, y2: hit.y1-1};
                    this.typeLines = this.typeLines.filter(line => !(line.type === LineType.FLOWING && line.y1 === line.y2 && line.y1 === newLine.y1 && line.x1 <= newLine.x2 && line.x2 >= newLine.x1));
                    //this.log(`Adding flat flowing line: ${JSON.stringify(newLine)}`);
                    [...this.fallToCheck, ...newFallToCheck].filter(line => line.y1 <= newLine.y1 && newLine.y1 <= line.y2 && newLine.x1 <= line.x1 && line.x1 <= newLine.x2).forEach(line => {
                        line.y2 = newLine.y1-1;
                        //this.log(`Trimming back ${JSON.stringify(line)}`);
                    })
                    this.typeLines.push(newLine);
                    this.typeLines.sort(this.sortLines);
                }
            } else if (hit.type === LineType.FLOWING) {
                // this might hit solid water in the future, keep it around
                fall.y2 = hit.y2-1;
                newFallToCheck.push(fall);
            }
        });

        // remove any newFallToCheck lines that may have been missed (their top is in a resting water line)
        this.fallToCheck = []
        newFallToCheck.forEach(line => {
            //this.log(`Checking for falid newFallToCheck ${JSON.stringify(line)}`);
            let lineAtEnd = this.getLine(line.x1, line.y2);
            while (lineAtEnd && lineAtEnd.type === LineType.RESTING && line.y1 <= line.y2) {
                line.y2--;
                lineAtEnd = this.getLine(line.x1, line.y2);
            }
            if (line.y1 <= line.y2) this.fallToCheck.push(line); // this.log(`Keeping ${JSON.stringify(line)}`); }
        });

        // check for conflicts
        /*
        this.fallToCheck.forEach((line, ind) => {
            [...this.fallToCheck.slice(0, ind), ...this.fallToCheck.slice(ind+1)].forEach(conflict => {
                for (let x=line.x1; x<=line.x2; x++) {
                    for (let y=line.y1; y<=line.y2; y++) {
                        if (conflict.x1 <= x && x <= conflict.x2 && conflict.y1 <= y && y <= conflict.y2) {
                            // uh-oh!!!
                            this.log(`line: ${JSON.stringify(line)}, conflict: ${JSON.stringify(conflict)}`);
                            throw new Error(`Found conflict!`);
                        }
                    }
                }
            })
            this.typeLines.forEach(conflict => {
                for (let x=line.x1; x<=line.x2; x++) {
                    for (let y=line.y1; y<=line.y2; y++) {
                        if (conflict.x1 <= x && x <= conflict.x2 && conflict.y1 <= y && y <= conflict.y2) {
                            // uh-oh!!!
                            this.log(`line: ${JSON.stringify(line)}, typeLine conflict: ${JSON.stringify(conflict)}`);
                            throw new Error(`Found conflict!`);
                        }
                    }
                }
            })
        })

        this.typeLines.forEach((line, ind) => {
            if (line.type === LineType.CLAY) return;
            [...this.typeLines.slice(0, ind), ...this.typeLines.slice(ind+1)].forEach(conflict => {
                for (let x=line.x1; x<=line.x2; x++) {
                    for (let y=line.y1; y<=line.y2; y++) {
                        if (conflict.x1 <= x && x <= conflict.x2 && conflict.y1 <= y && y <= conflict.y2) {
                            // uh-oh!!!
                            this.log(`typeLine: ${JSON.stringify(line)}, conflict typeLine: ${JSON.stringify(conflict)}`);
                            throw new Error(`Found conflict!`);
                        }
                    }
                }
            })
        })
        */

        //moreToDo = this.fallToCheck.length > 0;
        if (!moreToDo) {
            // part 1
            this.result = [...this.fallToCheck, ...this.typeLines.filter(line => line.type === LineType.FLOWING || line.type === LineType.RESTING)].reduce((acc, line) => {
                let x1 = line.x1;
                let x2 = line.x2;
                let y1 = Math.max(this.yMin, line.y1);
                let y2 = line.y2;
                //this.log(`Counting line: ${JSON.stringify(line)} = (${x1},${y1})-(${x2},${y2}) = ${(x2-x1+1)*(y2-y1+1)}`)

                return acc + (x2-x1+1)*(y2-y1+1);
            }, 0).toString();
            this.log(`Part 1: ${this.result}`);
            // part 2
            this.result = this.typeLines.filter(line => line.type === LineType.RESTING).reduce((acc, line) => {
                let x1 = line.x1;
                let x2 = line.x2;
                let y1 = Math.max(this.yMin, line.y1);
                let y2 = line.y2;
                //this.log(`Counting line: ${JSON.stringify(line)} = (${x1},${y1})-(${x2},${y2}) = ${(x2-x1+1)*(y2-y1+1)}`)

                return acc + (x2-x1+1)*(y2-y1+1);
            }, 0).toString();
        }
        // 33437 too high (833 steps)
        // 33326 too high (838 steps)
        // 33242 (842 steps)
        // PART 2
        // 27256
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