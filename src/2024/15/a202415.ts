import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { GridParser, Pair, PairMove, PairToKey } from '../../lib/gridParser.js';

type MovementPossible = {
    [key in 'U' | 'R' | 'D' | 'L']: boolean;
};

interface Box {x: number, y: number, canMove: MovementPossible};

export class a202415 extends AoCPuzzle {
    gp: GridParser;
    moves: string;
    pos: Pair;
    boxes: Box[];
    walls: Pair[];
    sampleMode(): void { };

    _loadData(lines: string[]) {
        let split = lines.indexOf('');
        this.gp = new GridParser(lines.slice(0, split), [/@/g, /O/g, /#/g]);
        this.moves = lines.slice(split+1).join('');

        //this.log(this.gp.width, this.gp.height)
        //this.log(this.moves);

        this.pos = this.gp.matches.filter(m=>m.typeIndex===0)[0];
        this.boxes = this.gp.matches.filter(m=>m.typeIndex===1).map(m=>({x:m.x, y:m.y, canMove: {U: true, R: true, D: true, L: true}}));
        this.walls = this.gp.matches.filter(m=>m.typeIndex===2);
        // we know walls are at row/col 0 and row/col gp.height,gp.width;
    }

    isWall(p: Pair) { return p.x === 0 || p.y === 0 || p.x === this.gp.width-1 || p.y === this.gp.height-1 || this.walls.some(w=>w.x === p.x && w.y === p.y); }
    getBox(p: Pair): Box { return this.boxes.find(b=>b.x === p.x && b.y === p.y); }
    fixBoxes() {}
    debug() {
        console.log('#'.repeat(this.gp.width));
        for (let y=1; y<this.gp.height; y++) {
            let line = ['#', ...'.'.repeat(this.gp.width-2).split(''), '#'];
            this.boxes.filter(b=>b.y===y).forEach(b=>line[b.x]='O');
            this.walls.filter(w=>w.y===y).forEach(w=>line[w.x]='#');
            if (this.pos.y === y) line[this.pos.x] = '@';
            console.log(line.join(''));
        }
        console.log('#'.repeat(this.gp.width));
    }

    /**
     * Return the list of boxes to move.  Empty array means just robot moves.  Undefined means we can't move that way.
     * @param p current position
     * @param dir direction to move
     * @returns list of boxes that need to be moved - or undefined if we are looking at a wall (or a list of boxes up against a wall)
     */
    getBoxesToMove(p: Pair, dir: string): Box[] {
        let results: Box[] = [];
        let newPos = PairMove({...p}, dir);
        let box: Box;
        while (!this.isWall(newPos) && (box=this.getBox(newPos))) {
            results.push(box);
            newPos = PairMove({...newPos}, dir);
        }

        if (this.isWall(newPos)) {
            //results.forEach(b => b.canMove[dir] = false);
            return undefined;
        }

        return results;
    }

    _runStep(): boolean {
        let moreToDo = this.stepNumber < this.moves.length;
        let key = PairToKey(this.pos);
        let dir = this.moves[this.stepNumber-1];
        let dirStr = 'URDL'['^>v<'.indexOf(dir)];
        let boxesToMove = this.getBoxesToMove(this.pos, dirStr);
        //this.log(`[${this.stepNumber.toString().padStart(3)}]: ${key} ${dir}(${dirStr}) ${boxesToMove===undefined?'<EMPTY>':boxesToMove.map(PairToKey).join('/')}`);
        //this.debug();
        if (boxesToMove !== undefined) {
            boxesToMove.forEach(b=>{PairMove(b, dirStr); 'URDL'.split('').forEach(d=>b.canMove[d] = true)});
            PairMove(this.pos, dirStr);
        }

        if (!moreToDo) {
            //this.log(`FINAL:`);
            //this.debug();
            this.result = this.boxes.map(b=>b.x + 100*b.y).reduce((sum, b) => sum+b,0).toString();
        }
        return moreToDo;
    }
}