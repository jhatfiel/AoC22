export type Pair = {x: number, y: number};
export class Grid {
    constructor(private max: Pair) {
        this.grid = Array.from({length: max.y+1}, () => new Array<boolean>(max.x+1).fill(false))
    }

    grid: Array<Array<boolean>>;

    toKey(p: Pair) { return `${p.x},${p.y}`; }
    fromKey(k: string) { let arr=k.split(',').map(Number); return {x: arr[0], y: arr[1]}; }
    isOn(p: Pair) { return this.grid[p.y][p.x]; }
    getOn() { return this.grid.map((row, y) => row.map((b, x) => b?{x,y}:null)).flat().filter((p) => p); }
    isInGrid(p: Pair, offset: Pair) { return p.x+offset.x>=0 && p.x+offset.x<=this.max.x && p.y+offset.y>=0 && p.y+offset.y<=this.max.y; }
    /**
     *  Returns neighbors of `node` that are off (or that are on if `on === true`)
     *
     *  @param node `"x,y"` representation of coordinate in grid
     *  @param on true if you only want the neighbors that are on (default to false)
     */
    getNeighbors(node: string, on=false): Set<string> {
        let result = new Set<string>();
        let pair = this.fromKey(node);
        this.orthogonalP(pair).forEach((p) => {
            if (on===this.isOn(p)) result.add(this.toKey(p));
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

    debug(max: Pair = {x: 8, y: 8}) {
        for (let y=0; y<Math.min(this.grid.length, max.y); y++) {
            let line = '';
            for (let x=0; x<Math.min(this.grid[0].length, max.x); x++) {
                line += this.isOn({x,y})?'#':'.'
            }
            console.log(line);
        }
    }
}