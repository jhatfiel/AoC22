import { Pair, PAIR_MOVEMENT, PairMoveBy, GridLine, GridParser, GridCorner, PairToKey } from "../../lib/gridParser.js";

export class TurtleRectagon {
    pos: Pair = {x: 0, y: 0};
    points = Array<Pair>();

    move(dir: string, len: number) {
        this.points.push(this.pos);

        let movement = {...PAIR_MOVEMENT.get(dir)};
        movement.x *= len; movement.y *= len;

        this.pos = PairMoveBy({...this.pos}, movement);
    }

    getRectagon(): Array<Pair> {
        return this.points;
    }
}