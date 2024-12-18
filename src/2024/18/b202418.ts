import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import { Pair, PairToKey } from '../../lib/gridParser.js';

export class b202418 extends AoCPuzzle {
    walls: Pair[] = [];
    wallSet = new Set<string>();
    pos = {x: 0, y: 0};
    width = 71;
    height = 71;
    after = 1024;

    sampleMode(): void {
        this.width = 7;
        this.height = 7;
        this.after = 12;
    };

    valid(p: Pair): boolean {
        return p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
    }

    _loadData(lines: string[]) {
        this.walls = lines.map(line => line.split(',')).map(arr => arr.map(Number)).map(arr => ({x: arr[0], y: arr[1]}));
    }

    getSolutionStepsAt(): number {
        let startKey = PairToKey({x: 0, y: 0});
        let endKey = PairToKey({x: this.width-1, y: this.height-1});

        let stepNum = 0;
        let frontier: string[] = [startKey];
        let visited = new Set<string>();
        while (frontier.length && !visited.has(endKey)) {
            let newFrontier = new Set<string>();
            for (let n of frontier) {
                let [curX, curY] = n.split(',').map(Number);
                if (visited.has(n)) continue;
                visited.add(n);
                [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx,dy]) => {
                    let x = curX + dx;
                    let y = curY + dy;
                    let key = PairToKey({x,y});
                    if (this.valid({x,y}) && !this.wallSet.has(key)) {
                        newFrontier.add(PairToKey({x,y}));
                    }
                });
            }

            stepNum++;
            frontier = [...newFrontier.keys()];
        }

        return visited.has(endKey)?stepNum:-1;
    }

    _runStep(): boolean {
        let moreToDo = false;

        let logSize = Math.trunc(Math.log2(this.walls.length));
        let half = 2**logSize;
        let end = half;
        this.log({logSize, half, end});

        this.wallSet = new Set<string>(this.walls.slice(0, end).map(PairToKey));
        let stepCount = this.getSolutionStepsAt();

        logSize--;
        half = 2**logSize;
        end += half;
        this.log({logSize, half, end});
        this.wallSet = new Set<string>(this.walls.slice(0, end).map(PairToKey));
        stepCount = this.getSolutionStepsAt();

        logSize--;
        half = 2**logSize;
        end -= half;
        this.log({logSize, half, end});
        this.wallSet = new Set<string>(this.walls.slice(0, end).map(PairToKey));
        stepCount = this.getSolutionStepsAt();

        logSize--;
        half = 2**logSize;
        end += half;
        this.log({logSize, half, end});
        this.wallSet = new Set<string>(this.walls.slice(0, end).map(PairToKey));
        stepCount = this.getSolutionStepsAt();

        logSize--;
        half = 2**logSize;
        end += half;
        this.log({logSize, half, end});
        this.wallSet = new Set<string>(this.walls.slice(0, end).map(PairToKey));
        stepCount = this.getSolutionStepsAt();

        logSize--;
        half = 2**logSize;
        end += half;
        this.log({logSize, half, end});
        this.wallSet = new Set<string>(this.walls.slice(0, end).map(PairToKey));
        stepCount = this.getSolutionStepsAt();

        logSize--;
        half = 2**logSize;
        end += half;
        this.log({logSize, half, end});
        this.wallSet = new Set<string>(this.walls.slice(0, end).map(PairToKey));
        stepCount = this.getSolutionStepsAt();

        logSize--;
        half = 2**logSize;
        end += half;
        this.log({logSize, half, end});
        this.wallSet = new Set<string>(this.walls.slice(0, end).map(PairToKey));
        stepCount = this.getSolutionStepsAt();

        logSize--;
        half = 2**logSize;
        end -= half;
        this.log({logSize, half, end});
        this.wallSet = new Set<string>(this.walls.slice(0, end).map(PairToKey));
        stepCount = this.getSolutionStepsAt();

        logSize--;
        half = 2**logSize;
        end -= half;
        this.log({logSize, half, end});
        this.wallSet = new Set<string>(this.walls.slice(0, end).map(PairToKey));
        stepCount = this.getSolutionStepsAt();

        logSize--;
        half = 2**logSize;
        end -= half;
        this.log({logSize, half, end});
        this.wallSet = new Set<string>(this.walls.slice(0, end).map(PairToKey));
        stepCount = this.getSolutionStepsAt();

        logSize--;
        half = 2**logSize;
        end += half;
        this.log({logSize, half, end});
        this.wallSet = new Set<string>(this.walls.slice(0, end).map(PairToKey));
        stepCount = this.getSolutionStepsAt();

        this.wallSet = new Set<string>(this.walls.slice(0, 3042).map(PairToKey));
        stepCount = this.getSolutionStepsAt();
        this.log(stepCount);
        this.wallSet = new Set<string>(this.walls.slice(0, 3043).map(PairToKey));
        stepCount = this.getSolutionStepsAt();
        this.log(stepCount);

        if (!moreToDo) {
            this.result = PairToKey(this.walls[3042]);
        }
        return moreToDo;
    }
}