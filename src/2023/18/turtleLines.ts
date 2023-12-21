import { Pair, PAIR_MOVEMENT, PairMoveBy, GridLine, GridParser, GridCorner, PairToKey } from "../../lib/gridParser.js";

export type Line = {
    dir: string; // U, D, L, R
    at: number; // U/D - col ; L/R - row
    min: number; // U/D - top ; L/R - left side
    max: number; // U/D - bottom ; L/R - right side
}

export class TurtleLines {
    pos: Pair = {x: 0, y: 0};
    lines = new Array<Line>();

    move(dir: string, len: number) {
        let movement = {...PAIR_MOVEMENT.get(dir)};
        movement.x *= len; movement.y *= len;

        let newPoint = PairMoveBy({...this.pos}, movement);
        switch (dir) {
            case 'U':
                this.lines.push({dir, at: this.pos.x, min: newPoint.y, max: this.pos.y});
                break;
            case 'D':
                this.lines.push({dir, at: this.pos.x, min: this.pos.y, max: newPoint.y});
                break;
            case 'L':
                this.lines.push({dir, at: this.pos.y, min: newPoint.x, max: this.pos.x});
                break;
            case 'R':
                this.lines.push({dir, at: this.pos.y, min: this.pos.x, max: newPoint.x});
                break;
        }
        this.pos = newPoint;
    }

    getArea(): number {
        let result = 0;
        this.lines.sort((a, b) => {
            let ax = ('LR'.indexOf(a.dir) !== -1)?a.min:a.at;
            let ay = ('LR'.indexOf(a.dir) !== -1)?a.at:a.min;
            let bx = ('LR'.indexOf(b.dir) !== -1)?b.min:b.at;
            let by = ('LR'.indexOf(b.dir) !== -1)?b.at:b.min;

            return (ax === bx)?ay - by:ax - bx;
        })

        //this.debugLines();

        let minY = this.lines.filter(line => 'LR'.indexOf(line.dir) !== -1).reduce((acc, line) => acc = Math.min(acc, line.at), Infinity);
        let maxY = this.lines.filter(line => 'LR'.indexOf(line.dir) !== -1).reduce((acc, line) => acc = Math.max(acc, line.at), -Infinity);

        //let lastProgress = 0;

        for (let y=minY; y<=maxY; y++) {
            //let progress = Math.floor(100*(y-minY)/(maxY-minY));
            let arr = this.lines.filter(line => 'UD'.indexOf(line.dir) !== -1 && line.min <= y && y <= line.max);
            //console.debug(`Lines in row: ${y}`, arr);
            let lastX = NaN;
            let lastDownPartial = false;
            for (let index = 0; index < arr.length; index++) {
                let line = arr[index];
                if (Number.isNaN(lastX)) { // don't have lastX
                    if (line.dir === 'U') {
                        lastX = line.at;
                        if (line.min === y || line.max === y) lastDownPartial = true;
                    } else {
                        throw new Error(`Can't get a D unless we have a lastX!!!`);
                    }
                } else { // we have lastX
                    if (line.dir === 'U') {
                        lastDownPartial = false;
                        continue;
                    } else { // line.dir === 'D'
                        if (line.min !== y && line.max !== y) {
                            let len = line.at - lastX + 1;
                            //console.debug(`Found section: ${len}`);
                            lastX = NaN;
                            result += len;
                        } else {
                            // special case
                            if (!lastDownPartial) {
                                lastDownPartial = true;
                                continue;
                            } else {
                                let len = line.at - lastX + 1;
                                //console.debug(`Found section: ${len}`);
                                lastX = NaN;
                                lastDownPartial = false;
                                result += len;
                            }
                        }
                    }
                }
            }
        }

        return result;
    }

    debugLines() {
        this.lines.forEach(line => {
            console.debug(line);
        })
    }
}