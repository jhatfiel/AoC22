import { PairToKey } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";
import { RectagonToRectangles, generateGraph } from "./rectagonToRectangles.js";
import { TurtleRectagon } from "./turtleRectagon.js";

const puzzle = new Puzzle(process.argv[2]);

let tr = new TurtleRectagon();

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            let arr = line.split(' ');
            let dir = arr[0];
            let len = Number(arr[1]);

            //console.debug(`${dir} ${len} ${color}`)
            tr.move(dir, len);
        });

        let rectagon = tr.getRectagon();
        generateGraph(rectagon);

        let rectangles = RectagonToRectangles(rectagon);

        let totalArea = 0;
        rectangles.forEach(r => {
            let area = (r.BR.x - r.TL.x + 1) * (r.BR.y - r.TL.y + 1);
            console.debug(`Rectangle: ${PairToKey(r.TL)} / ${PairToKey(r.BR)} = ${area}`);
            totalArea += area;
        })


        console.log(`Total Area: ${totalArea}`);

    });
