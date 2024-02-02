import { AoCPuzzle } from '../../lib/AoCPuzzle';

export class a201820 extends AoCPuzzle {
    line: string;
    pieces: string[] = [];
    roomPositions = new Array<{x: number, y: number}>();
    position: {x: number, y: number};
    //roomPaths = new Set<string>();
    minLength = 1000;
    longestPath = 0;
    numLonger = 0;
    path = '';
    reverseDirections = ['NS', 'SN', 'EW', 'WE'];
    reverseRE = /(NS)|(SN)|(EW)|(WE)/g;
    dirMove = new Map<string, {x: number, y: number}>();

    sampleMode(): void {
        this.minLength = 10;
    };

    _loadData(lines: string[]) {
        this.line = this.lines[0];
        this.position = {x:0, y:0};
        this.dirMove.set('N', {x:  0, y: -1});
        this.dirMove.set('S', {x:  0, y:  1});
        this.dirMove.set('E', {x:  1, y:  0});
        this.dirMove.set('W', {x: -1, y:  0});
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.line.length-1;
        let c = this.line.charAt(this.stepNumber);
        switch (c) {
            case '^': // ignore
                break;
            case '|': // clear off the current choices
                this.position = {...this.roomPositions[this.roomPositions.length-1]};
                this.path = '';
                break;
            case '$': // end of string... special processing?
                break;
            case '(':
                this.roomPositions.push({...this.position});
                this.pieces.push(this.path);
                this.path = '';
                break;
            case ')':
                this.path = this.pieces.pop();
                this.position = this.roomPositions.pop();
                break;
            default:
                // add character to current piece
                // if we have reversed direction (NS/SN/EW/WE) just undo the previous character because it's the same square we've been to before
                this.path += c;
                let path = this.buildPath();
                if (this.reverseDirections.every(r => path.indexOf(r) === -1)) {
                    // only process paths that don't have any reverse directions
                    //if (this.roomPaths.has(path)) { this.log(`dup ${path}`) }
                    //this.roomPaths.add(path);
                    if (path.length > this.longestPath) this.longestPath = path.length;
                    if (path.length >= this.minLength) this.numLonger++;
                }
                let dirMove = this.dirMove.get(c);
                this.position.x += dirMove.x;
                this.position.y += dirMove.y;
                break;
        }
        //let path = this.removeReverses(this.buildPath());
        //this.roomPaths.add(path);
        //this.log(`${this.stepNumber.toString().padStart(5, ' ')}: [${c}] ${this.roomPaths.size} (pieces=${this.pieces.join(' / ')})`);
        if (!moreToDo) {
            //let longestPathLength = Array.from(this.roomPaths.keys()).map(p => p.length).reduce((acc, l) => acc = Math.max(acc, l), 0).toString();
            //let longestPath = '';
            //this.roomPaths.forEach(p => {
                //if (p.length > longestPath.length) longestPath = p;
            //})
            this.log(`Part 1: ${this.longestPath}`);
        }
        //this.result = Array.from(this.roomPaths.keys()).filter(p => p.length>=this.minLength).length.toString();
        this.result = this.numLonger.toString();
        return moreToDo;
    }

    removeReverses(path: string): string {
        return path.replaceAll(this.reverseRE, '');
    }

    buildPath(): string {
        return this.pieces.join('') + this.path;
    }

    getPathLength(): number {
        return [...this.pieces.map(p => p.length), this.path.length].reduce((acc, l) => acc+=l, 0);
    }
}