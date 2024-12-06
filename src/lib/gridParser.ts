/**
 * Parses an array of lines and finds where the tokens (represented by the typesArr) are located
 */

import { Dijkstra } from "./dijkstra.js";

export enum Direction { RIGHT, UP, LEFT, DOWN };

export type GridParserMatch = {
    typeIndex: number;
    value: string;
    y: number;
    x: number;
    xEnd: number;
}

export type Pair = {x: number, y: number};
export type GridLine = {TL: Pair, BR: Pair};
export type GridCorner = {corner: Pair, h: Pair, v: Pair};

export const PAIR_MOVEMENT = new Map<string, Pair>()
PAIR_MOVEMENT.set('U', {x:  0, y: -1});
PAIR_MOVEMENT.set('R', {x:  1, y:  0});
PAIR_MOVEMENT.set('D', {x:  0, y:  1});
PAIR_MOVEMENT.set('L', {x: -1, y:  0});
export const PAIR_RIGHT = new Map<string, string>()
PAIR_RIGHT.set('U', 'R');
PAIR_RIGHT.set('R', 'D');
PAIR_RIGHT.set('D', 'L');
PAIR_RIGHT.set('L', 'U');
export const PAIR_LEFT = new Map<string, string>()
PAIR_LEFT.set('U', 'L');
PAIR_LEFT.set('R', 'U');
PAIR_LEFT.set('D', 'R');
PAIR_LEFT.set('L', 'D');
export function PairToKey(p: Pair): string { return `${p.x},${p.y}`; }
export function PairFromKey(s: string): Pair { const [x, y]=s.split(',').map(Number); return {x, y}; }
export function PairMove(p: Pair, dir: string): Pair {
    const pm = PAIR_MOVEMENT.get(dir);
    if (!pm) throw new Error(`Invalid direction specified for PairMove ${dir}`);
    return PairMoveBy(p, pm);
}

export function PairMoveBy(p: Pair, move: Pair): Pair {
    p.x += move.x; p.y += move.y;
    return p;
}

export class GridParser {
    constructor(public lines: Array<string>, typeArr: Array<RegExp>) {
        lines.forEach((line, y) => {
            // process each line and find where matches are
            this.grid.push(line.split(''));
            typeArr.forEach((re, typeIndex) => {
                let matches = line.matchAll(re);
                for (const match of matches) {
                    this.matches.push({typeIndex, value: match[0], y, x: match.index, xEnd: match.index + match[0].length-1});
                }
            })
            this.width = Math.max(this.width, line.length);
        });
        this.height = lines.length;
        this.TL = {x: 0,            y: 0};
        this.TR = {x: this.width-1, y: 0};
        this.BL = {x: 0,            y: this.height-1};
        this.BR = {x: this.width-1, y: this.height-1};
    }
    public grid = new Array<Array<string>>(); // do we need to keep track of this??
    // each RegExp in the typeArr generates a match that can be accessed here
    public matches = new Array<GridParserMatch>();
    public height = 0;
    public width = 0;
    public TL: Pair;
    public TR: Pair;
    public BL: Pair;
    public BR: Pair;

    static MakeOrthogonalLine(p1: Pair, p2: Pair): GridLine {
        if (p1.x < p2.x || p1.y < p2.y) return { TL: p1, BR: p2 };
        else                            return { TL: p2, BR: p1 };
    }

    static MakeCorner(l1: GridLine, l2: GridLine): GridCorner {
        // find which point is shared
        let corner: Pair;
        let h: Pair;
        let v: Pair;

        let hLine = (l1.TL.y === l1.BR.y)?l1:l2;
        let vLine = (l1.TL.x === l1.BR.x)?l1:l2;

        if (GridParser.PairEqual(hLine.BR, vLine.BR)) {
            /**
             *   |
             * --+
             */
            corner = {...hLine.BR};
            h = hLine.TL;
            v = vLine.TL;
        } else if (GridParser.PairEqual(hLine.BR, vLine.TL)) {
            /**
             * --+
             *   |
             */
            corner = {...hLine.BR};
            h = hLine.TL;
            v = vLine.BR;
        } else if (GridParser.PairEqual(hLine.TL, vLine.BR)) {
            /**
             * | 
             * +--
             */
            corner = {...hLine.TL};
            h = hLine.BR;
            v = vLine.TL;
        } else if (GridParser.PairEqual(hLine.TL, vLine.TL)) {
            /**
             * +--
             * | 
             */
            corner = {...hLine.TL};
            h = hLine.BR;
            v = vLine.BR;
        }

        return {corner, h, v};
    }

    static PairEqual(a: Pair, b: Pair): boolean {
        return a.x === b.x && a.y === b.y
    }

    getMatchNeighbors(gpm: GridParserMatch, typeIndex: number|undefined): Array<GridParserMatch> {
        let rowFirst = Math.max(0, gpm.y-1);
        let rowLast = Math.min(this.grid.length-1, gpm.y+1);
        let colFirst = Math.max(0, gpm.x-1);
        let colLast = Math.min(this.grid[0].length-1, gpm.xEnd+1);

        return this.matches.filter(m => typeIndex === undefined || m.typeIndex === typeIndex)
                           .filter(m => m.y >= rowFirst && m.y <= rowLast)
                           .filter(m => (m.x    >= colFirst && m.x    <= colLast) || 
                                        (m.xEnd >= colFirst && m.xEnd <= colLast));
    }

    gridOrthogonalP(p: Pair): Array<[Pair, Direction]> {
        let result = new Array<[Pair, Direction]>();
        if (p.x > 0)           result.push([{x: p.x-1, y: p.y}, Direction.LEFT]);
        if (p.y > 0)           result.push([{x: p.x, y: p.y-1}, Direction.UP]);
        if (p.y+1 < this.height) result.push([{x: p.x, y: p.y+1}, Direction.DOWN]);
        if (p.x+1 < this.width)  result.push([{x: p.x+1, y: p.y}, Direction.RIGHT]);
        return result;
    }

    gridAdjacent(p: Pair): Array<Pair> {
        return [
         {x: p.x-1, y: p.y-1}, {x: p.x, y: p.y-1}, {x: p.x+1, y: p.y-1},
         {x: p.x-1, y: p.y  },                     {x: p.x+1, y: p.y  },
         {x: p.x-1, y: p.y+1}, {x: p.x, y: p.y+1}, {x: p.x+1, y: p.y+1},
        ].filter(pot => pot.x >= 0 && pot.x < this.width && pot.y >= 0 && pot.y < this.height);
    }

    gridAdjacentCells(p: Pair): Array<[Pair, string]> {
        return this.gridAdjacent(p).map(cell => [cell, this.grid[cell.y][cell.x]]);
    }

    toKey(p: Pair): string { return `${p.x},${p.y}`; }

    getShortestPath(TL: Pair, BR: Pair) {
        let dij = new Dijkstra(this.getNeighbors.bind(this));
        for (let x=0; x<this.width; x++) {
            for (let y=0; y<this.height; y++) {
                dij.addNode(this.toKey({x, y}));
            }
        }
        return dij.getShortestPath(this.toKey(TL), this.toKey(BR));
    }

    getNeighbors(node: string): Map<string, number> {
        let result = new Map<string, number>();
        let [x, y] = node.split(',').map(Number);
        this.gridOrthogonalP({x,y}).forEach(([p, d]) => {
            result.set(`${p.x},${p.y}`, Number(this.grid[y][x]));
        })
        return result;
    }

    valid(p: Pair): boolean {
        return p.x >= 0 && p.y >= 0 && p.x < this.width && p.y < this.height;
    }

    debugGrid() {
        this.grid.forEach(row => {
            console.debug(row.join(''))
        })
    }

    public static FLOAT = new RegExp(/[0-9]+\.[0-9]*/g);
    public static NUMBER = new RegExp(/[0-9]/g);
    public static NUMBERS = new RegExp(/[0-9]+/g);
    public static LETTER = new RegExp(/[a-zA-Z]/g);
    public static LETTERS = new RegExp(/[a-zA-Z]+/g);
    public static ALPHANUM = new RegExp(/[0-9a-zA-Z]/g);
    public static ALPHANUMS = new RegExp(/[0-9a-zA-Z]+/g);
}