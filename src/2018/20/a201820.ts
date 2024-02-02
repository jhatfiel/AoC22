import { AoCPuzzle } from '../../lib/AoCPuzzle';

export class a201820 extends AoCPuzzle {
    line: string;
    pieces: string[] = [];
    roomPaths = new Set<string>();
    path = '';
    minLength = 1000;
    reverseDirections = ['NS', 'SN', 'EW', 'WE'];

    sampleMode(): void {
        this.minLength = 10;
    };

    _loadData(lines: string[]) {
        this.line = this.lines[0];
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber !== this.line.length;
        let c = this.line.charAt(this.stepNumber);
        switch (c) {
            case '^': // ignore
                break;
            case '|': // clear off the current choices
                this.path = '';
                break;
            case '$': // end of string... special processing?
                break;
            case '(':
                this.pieces.push(this.path);
                this.path = '';
                break;
            case ')':
                this.path = this.pieces.pop();
                break;
            default:
                // add character to current piece
                // if we have reversed direction (NS/SN/EW/WE) just undo the previous character because it's the same square we've been to before
                this.path = this.removeReverses(this.path+c);
                break;
        }
        let path = this.removeReverses(this.buildPath());
        this.roomPaths.add(path);
        //this.log(`${this.stepNumber.toString().padStart(5, ' ')}: [${c}] ${path} ${this.roomPaths.size} (pieces=${this.pieces.join(' / ')})`);
        if (!moreToDo) {
            let longestPathLength = Array.from(this.roomPaths.keys()).map(p => p.length).reduce((acc, l) => acc = Math.max(acc, l), 0).toString();
            let longestPath = '';
            this.roomPaths.forEach(p => {
                if (p.length > longestPath.length) longestPath = p;
            })
            this.log(`Part 1: ${longestPathLength}`);
        }
        this.result = Array.from(this.roomPaths.keys()).filter(p => p.length>=this.minLength).length.toString();
        return moreToDo;
    }

    removeReverses(path: string): string {
        while (this.reverseDirections.some(p => path.indexOf(p) !== -1)) this.reverseDirections.forEach(r => path = path.replace(r, ''));
        return path;
    }

    buildPath(): string {
        return this.pieces.join('') + this.path;
    }
}