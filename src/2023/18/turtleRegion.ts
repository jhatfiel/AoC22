import { Pair, PAIR_MOVEMENT, PAIR_LEFT, PAIR_RIGHT, PairFromKey, PairMove, PairMoveBy, PairToKey } from "../../lib/gridParser.js";

export class TurtleRegion<T = number> {
    constructor () { }
    lastDir = 'R';
    TL: Pair = {x: 0, y: 0};
    BR: Pair = {x: 0, y: 0};
    pos: Pair = {x: 0, y: 0};
    path = new Map<string, T>();
    rSide = new Map<string, T>();
    lSide = new Map<string, T>();
    rTurns = 0;
    lTurns = 0;

    move(dir: string, len: number, value: T) {
        if (PAIR_RIGHT.get(this.lastDir) === dir) this.rTurns++;
        if (PAIR_LEFT.get(this.lastDir) === dir) this.lTurns++;

        let rp = {x: this.pos.x, y: this.pos.y}; PairMove(rp, PAIR_RIGHT.get(dir));
        let lp = {x: this.pos.x, y: this.pos.y}; PairMove(lp, PAIR_LEFT.get(dir));
        this.rSide.set(PairToKey(rp), value);
        this.lSide.set(PairToKey(lp), value);

        for (let i=0; i<len; i++) {
            this.path.set(PairToKey(this.pos), value);
            PairMove(this.pos, dir);

            let rp = {x: this.pos.x, y: this.pos.y}; PairMove(rp, PAIR_RIGHT.get(dir));
            let lp = {x: this.pos.x, y: this.pos.y}; PairMove(lp, PAIR_LEFT.get(dir));
            this.rSide.set(PairToKey(rp), value);
            this.lSide.set(PairToKey(lp), value);

            // adjust bounds
            this.TL.x = Math.min(this.TL.x, this.pos.x);
            this.TL.y = Math.min(this.TL.y, this.pos.y);
            this.BR.x = Math.max(this.BR.x, this.pos.x);
            this.BR.x = Math.max(this.BR.y, this.pos.y);
        }
    }

    getRegion(): Map<string, T> {
        let result = new Map<string, T>();
        return result;
    }

    normalize(newTL={x:0,y:0}) {
        // remove anything from rSide/lSide if it's a path
        this.path.forEach((v, k) => {
            this.lSide.delete(k);
            this.rSide.delete(k);
        })
        // move TL to 0,0 so there are no negative coordinates
        let delta = {x: 0, y: 0};
        if (this.TL.x < newTL.x) delta.x = newTL.x - this.TL.x;
        if (this.TL.y < newTL.y) delta.y = newTL.y - this.TL.y;

        if (delta.x || delta.y) {
            // correct the coordinates
            PairMoveBy(this.TL, delta);
            PairMoveBy(this.BR, delta);
            let newPath = new Map<string, T>();
            let newRSide = new Map<string, T>();
            let newLSide = new Map<string, T>();
            this.path.forEach((v, k) => {
                let p = PairFromKey(k);
                PairMoveBy(p, delta);
                newPath.set(PairToKey(p), this.path.get(k));
            });
            this.path = newPath;
            this.rSide.forEach((v, k) => {
                let p = PairFromKey(k);
                PairMoveBy(p, delta);
                newRSide.set(PairToKey(p), this.rSide.get(k));
            });
            this.rSide = newRSide;
            this.lSide.forEach((v, k) => {
                let p = PairFromKey(k);
                PairMoveBy(p, delta);
                newLSide.set(PairToKey(p), this.lSide.get(k));
            });
            this.lSide = newLSide;

        }
    }

    fill() {

    }
}