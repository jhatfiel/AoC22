import { Pair, PAIR_MOVEMENT, PairMoveBy, GridLine, GridParser, GridCorner, PairClone } from "../../lib/gridParser.js";

export class TurtleRegionator {
    firstLine: GridLine;
    pos: Pair = {x: 0, y: 0};
    lastLine: GridLine;
    corners = new Array<GridCorner>();

    move(dir: string, len: number) {
        let movement = PAIR_MOVEMENT.get(dir);
        movement.x *= len; movement.y *= len;

        let newPos = PairMoveBy(PairClone(this.pos), movement);

        let line = GridParser.MakeOrthogonalLine(this.pos, newPos);
        let corner = GridParser.MakeCorner(this.lastLine, line);

        this.corners.push(corner);

        // update tracking variables
        if (this.firstLine === undefined) this.firstLine = line;
        this.lastLine = line;
        this.pos = newPos;
    }
}