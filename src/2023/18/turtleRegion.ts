import { Pair } from "../../lib/gridParser.js";

export class TurtleRegion<T = number> {
    constructor () { this.pos = {x: 0, y: 0}; }
    pos: Pair;
    path = new Map<string, T>();
    rSide = new Map<string, T>();
    lSide = new Map<string, T>();

    move(dir: string, len: number, value: T) {
    }

    getRegion(): Map<string, T> {
        let result = new Map<string, T>();
        return result;
    }
}