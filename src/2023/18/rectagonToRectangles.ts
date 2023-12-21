import { GridParser, Pair, PairToKey } from "../../lib/gridParser.js";

export type Rectangle = {TL: Pair, BR: Pair};

export function RectagonToRectangles(rectagon: Array<Pair>): Array<Rectangle> {
    let result = new Array<Rectangle>();

    let count = 0;
    while (rectagon.length && count < 10) {
        count++;
        console.debug(`Count: ${count}`);
        let minY = rectagon.reduce((my, p) => my = Math.min(my, p.y), Infinity);
        let minX = rectagon.filter(p => p.y === minY).reduce((mx, p) => mx = Math.min(mx, p.x), Infinity);
        let TL = rectagon.filter(p => p.x === minX && p.y === minY)[0] // get actual reference to point so we can change it if necessary

        // TL is the top left corner of the first rectangle we are chopping off
        // the next point with Y=minY and X>minX is the end of the right side, R
        // the next point with X=minX and Y>minY is the end of the bottom side, B
        //                      5 (not possible)
        // 
        //      +---------------R
        //      |               |
        //      |               2---
        //      |      4---      
        //      |      |         
        //      |      |         
        //      |               |
        //      |               |
        //      B  -3         --1
        //          |
        //          |
        // 
        // 1,2,3,4 represent potential top-most left-most points.
        // 1 even with R column and B row.  Happy path - just consume this rectangle
        // 2 on the R column - consume + over to R and down to 2.  Update +B line to start at +x,2y. Remove point R.  Remove point 2.  Whatever used to go to 2 now goes over to +x
        // 3 on the B row    - consume + over to 3 and down to B.  Update +R line to start at 3x,+y. Remove point B.  Remove point 3.  Whatever used to go to 3 now goes up to +y.
        // 4 - consume + over to R and down to 4.  Update +y to 4y+1, Ry to 4y+1, and any other points between +x and Rx that are at 4y should move to 4y+1
        // 5 is impossible because that's a higher y than + is, so we would have started up there
        
        let Rx = rectagon.filter(p => p.y === minY && p.x > minX).reduce((rx, p) => rx = Math.min(rx, p.x), Infinity);
        let By = rectagon.filter(p => p.x === minX && p.y > minY).reduce((by, p) => by = Math.min(by, p.y), Infinity);
        let TR = rectagon.filter(p => p.y === minY && p.x === Rx)[0];
        let BL = rectagon.filter(p => p.x === minX && p.y === By)[0];

        console.debug(`minX: ${minX}, minY: ${minY}, Rx=${Rx}, By=${By}`);

        let nextPoint = rectagon.filter(p => !GridParser.PairEqual(TL, p) && !GridParser.PairEqual(TR, p) && !GridParser.PairEqual(BL, p) && p.x > TL.x && p.x <= TR.x)
                                .sort((a, b) => (a.y !== b.y)?a.y-b.y:a.x-b.x)[0];

        let rect: Rectangle = {TL: {...TL}, BR: undefined}; // copy TL off for this rectangle, it might change

        if        (nextPoint.x === TR.x && nextPoint.y === BL.y) {
            // case 1 - optimal case, complete rectangle
            console.debug(`Case 1, nextPoint: ${PairToKey(nextPoint)}`);
            rect.BR = nextPoint;
            result.push(rect);
            // cleanup the points - remove TL, TR, BL, nextPoint
            rectagon = rectagon.filter(p => !GridParser.PairEqual(TL, p) && !GridParser.PairEqual(TR, p) && !GridParser.PairEqual(BL, p) && !GridParser.PairEqual(nextPoint, p));
        } else if (nextPoint.x === TR.x) {
            // case 2
            console.debug(`Case 2, nextPoint: ${PairToKey(nextPoint)}`);
            rect.BR = {x: Rx, y: nextPoint.y-1};
            result.push(rect);

            rectagon = rectagon.filter(p => !GridParser.PairEqual(TR, p) && !GridParser.PairEqual(nextPoint, p));

            TL.y = nextPoint.y;
        } else if (nextPoint.y === BL.y && nextPoint.x > BL.x) {
            // case 3
            if (rectagon.filter(p => p.y === BL.y && p.x < BL.x).length % 2 === 0) {
                console.debug(`Case 3a, nextPoint: ${PairToKey(nextPoint)} (even number of points to the left, BL has to be a bottom left of a box)`);
                rect.BR = {x: nextPoint.x-1, y: By};
                result.push(rect);
    
                rectagon = rectagon.filter(p => !GridParser.PairEqual(BL, p) && !GridParser.PairEqual(nextPoint, p));
    
                TL.x = nextPoint.x;
            } else {
                console.debug(`Case 3b, nextPoint: ${PairToKey(nextPoint)} (odd number of points to the left, entire box can be consumed)`);

                rect.BR = {x: Rx, y: By};
                result.push(rect);
                let BR = rectagon.filter(p => GridParser.PairEqual(rect.BR, p))[0];

                console.debug(`Filtering from ${rectagon.length}`);
                rectagon = rectagon.filter(p => !GridParser.PairEqual(TL, p) && !GridParser.PairEqual(TR, p));
                console.debug(`.... to ${rectagon.length}`);
                BL.x--;
                nextPoint.y++;
                BR.x = BL.x;
                BR.y = nextPoint.y;
            }
        } else if (nextPoint.x < TR.x && nextPoint.y < BL.y) {
            // 4 - consume + over to R and down to 4.  Update +y to 4y+1, Ry to 4y+1, and any other points between +x and Rx that are at 4y should move to 4y+1
            console.debug(`Case 4, nextPoint: ${PairToKey(nextPoint)}`);
            rect.BR = {x: Rx, y: nextPoint.y};
            result.push(rect);


            if (rectagon.filter(p => p.y === nextPoint.y && p.x === TR.x).length) {
                rectagon = rectagon.filter(p => !GridParser.PairEqual(TR, p) && !GridParser.PairEqual({x: TR.x, y: nextPoint.y}, p));
            }

            TL.y = nextPoint.y+1;
            TR.y = nextPoint.y+1;
            rectagon.filter(p => p.y === nextPoint.y && p.x > TL.x && p.x <= TR.x).forEach(p => p.y++);
        } else {
            // no points in the region, we just need to consume this region
            console.debug(`Case ELSE, nextPoint: ${PairToKey(nextPoint)}`);

            rect.BR = {x: Rx, y: By-1};
            result.push(rect);

            rectagon = rectagon.filter(p => !GridParser.PairEqual(TL, p) && !GridParser.PairEqual(TR, p));
            BL.x = Rx;
        }

        generateGraph(rectagon);
    }
    return result;
}

export function generateGraph(rectagon: Array<Pair>) {
    /**
     * Generate input for https://www.graphreader.com/plotter
     */
    let link = 'https://www.graphreader.com/plotter';
    console.debug(`Generating input for ${link}`);
    if (rectagon.length) {
        let xStr = '';
        let yStr = '';
        rectagon.forEach(p => {
            xStr += `${p.x},`;
            yStr += `${-p.y},`;
        })
        console.debug(`{"x":[${xStr}${rectagon[0].x}],"y":[${yStr}${-rectagon[0].y}]}`);
    } else {
        console.debug(`No points to show!`)
    }
}