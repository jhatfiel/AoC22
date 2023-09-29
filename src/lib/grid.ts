export type Pair = {x: number, y: number};
export class Grid {
    constructor(private max: Pair) {
        this.grid = Array.from({length: max.y+1}, () => new Array<boolean>(max.x+1).fill(false))

    }

    grid: Array<Array<boolean>>;

    toKey(p: Pair) { return `${p.x},${p.y}`; }
    fromKey(k: string) { let arr=k.split(',').map(Number); return {x: arr[0], y: arr[1]}; }
    isWall(p: Pair) { return this.grid[p.y][p.x]; }
    getWalls() { return this.grid.map((row, y) => row.map((b, x) => b?{x,y}:null)).flat().filter((p) => p); }
    isInGrid(p: Pair, offset: Pair) { return p.x+offset.x>=0 && p.x+offset.x<=this.max.x && p.y+offset.y>=0 && p.y+offset.y<=this.max.y; }
    /**
     *  Returns neighbors of `node` that are empty (or that are walls if `wall === true`)
     *
     *  @param node `"x,y"` representation of coordinate in grid
     *  @param wall true if you only want the walls (default to false)
     */
    getNeighbors(node: string, wall=false): Set<string> {
        let result = new Set<string>();
        let pair = this.fromKey(node);
        this.orthogonalP(pair).forEach((p) => {
            if (wall===this.isWall(p)) result.add(this.toKey(p));
        })
        return result;
    }
    orthogonalP(p: Pair): Array<Pair> {
        return [...[   0  ].map((x) => ({x, y:-1})),
                ...[-1,  1].map((x) => ({x, y: 0})),
                ...[   0  ].map((x) => ({x, y: 1}))].filter((t) => this.isInGrid(p, t)).map((t) => ({x:p.x+t.x,y:p.y+t.y}));
    }

    aroundP(p: Pair): Array<Pair> {
        return [...[-1,0,1].map((x) => ({x, y:-1})),
                ...[-1,  1].map((x) => ({x, y: 0})),
                ...[-1,0,1].map((x) => ({x, y: 1}))].filter((t) => this.isInGrid(p, t)).map((t) => ({x:p.x+t.x,y:p.y+t.y}));
    }

    debug() {
        for (let y=0; y<8; y++) {
            let line = '';
            for (let x=0; x<8; x++) {
                line += this.isWall({x,y})?'#':'.'
            }
            console.log(line);
        }
    }

}