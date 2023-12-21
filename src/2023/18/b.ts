import { GridParser, Pair, PairToKey } from "../../lib/gridParser.js";
import { Puzzle } from "../../lib/puzzle.js";
import { RectagonToRectangles, generateGraph } from "./rectagonToRectangles.js";
import { TurtleRectagon } from "./turtleRectagon.js";

const puzzle = new Puzzle(process.argv[2]);

let tr = new TurtleRectagon();

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            let arr = line.split(' ');
            let color = arr[2].replace(/[()#]/g, '');
            let dirIndex = Number(color.substring(5));
            let dir = 'RDLU'.substring(dirIndex, dirIndex+1);
            let len = parseInt(color.substring(0, 5), 16);

            //console.debug(`${color} ${dir} ${len}`);
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

        // 122103870175946 is too high
        console.log(`Total Area: ${totalArea}`);
    });