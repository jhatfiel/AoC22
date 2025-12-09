import { AoCPuzzle } from '../../lib/AoCPuzzle.js';
import sharp from 'sharp';

export class b202509 extends AoCPuzzle {
    grid: boolean[][] = Array.from({length:100000}, () => []);
    corners: {x: number, y: number}[];
    sampleMode(): void { };

    _loadData(lines: string[]) {
        let max = 1277412579; // 1277412579 is too low
                              // 1624057680
                              // 4749562832 is too high
        let SCALE=5;
        let count=0;
        this.corners = lines.map(l=>l.split(',').map(Number)).map(arr => ({x: arr[0], y: arr[1]}));
        const hwArr: {y: number, minx: number, maxx: number}[] = []; 
        const vwArr: {x: number, miny: number, maxy: number}[] = []; 
        // compute orientation
        // http://www.faqs.org/faqs/graphics/algorithms-faq/
        // find lowest vertex (y, then x)
        // if the cross product of the edge before and after is positive, it's CCW.
        // let lowest = 0;
        // let lc = this.corners[lowest];
        let width=0, height=0;
        let points = '';
        for (let i=0; i<this.corners.length; i++) {
            const c = this.corners[i];
            if (c.x>width) width=c.x;
            if (c.y>height) height=c.y;
            // if (c.x>lc.y || (c.y===lc.y && c.x<lc.x)) {
            //     lowest = i;
            //     lc = c;
            // }
            points += `${c.x*SCALE},${c.y*SCALE} `
            const n=(i<this.corners.length-1)?i+1:0;
            const nc = this.corners[n];
            if (c.x === nc.x) {
                // vertical wall
                vwArr.push({x: c.x, miny: Math.min(c.y, nc.y), maxy: Math.max(c.y, nc.y)});
            } else {
                // horizontal wall
                hwArr.push({y: c.y, minx: Math.min(c.x, nc.x), maxx: Math.max(c.x, nc.x)});
            }
        }
        points += `${this.corners[0].x*SCALE},${this.corners[0].y*SCALE}`;
        
        // const lowestBefore = (lowest===0) ? this.corners.length-1 : lowest-1;
        // const lowestAfter = (lowest===this.corners.length-1) ? 0 : lowest+1;
        // const v1 = [this.corners[lowest].x-this.corners[lowestBefore].x, this.corners[lowest].y-this.corners[lowestBefore].y];
        // const v2 = [this.corners[lowestAfter].x-this.corners[lowest].x, this.corners[lowestAfter].y-this.corners[lowest].y];
        // const cross = v1[0]*v2[1] - v1[1]*v2[0];
        // const CCW = (cross>0);
        width++;
        height++;
        
        let bestContent = '';
        const contentHeader = `<svg xmlns="http://www.w3.org/2000/svg" width="${width*SCALE}" height="${height*SCALE}">
            <rect width="100%" height="100%" fill="#1e88e5"/>
            <polygon points="${points}" fill="#999999" stroke="#ffffff" stroke-width="${SCALE}"/>
            `;
        const contentFooter = `</svg>`;
        for (let i=0; i<this.corners.length; i++) {
            // only consider corners that open down and right
            const ic = this.corners[i];
            const p = (i>0)?i-1:this.corners.length-1;
            const pc = this.corners[p];
            const n = (i<this.corners.length-1)?i+1:0;
            const nc = this.corners[n];
            // if (nc.y !== ic.y || pc.x !== ic.x) continue;
            // if (nc.x < ic.x) continue;
            // if (pc.y < ic.y) continue;

            for (let j=0; j<this.corners.length; j++) {
                if (i === j) continue;
                const jc = this.corners[j];
                // if (ic.y <= 48596 && jc.y >= 50174) continue;
                // has to be down and right of ic
                if (jc.x < ic.x) continue;
                const c1 = {x: ic.x, y: Math.min(ic.y, jc.y)};
                const c2 = {x: jc.x, y: Math.max(ic.y, jc.y)};
                const a=(c2.x-c1.x + 1)*(c2.y-c1.y + 1);
                if (a < max) continue;

                let valid = true;
                // let content = '';
                // if (c1.x === c2.x) {
                //     content = `
                //         <line x1="${c1.x*SCALE}" y1="${c1.y*SCALE}" x2="${c2.x*SCALE}" y2="${c2.y*SCALE}" stroke="#3333ff" stroke-width="1"/>
                //     `
                // } else if (c1.y === c2.y) {
                //     content = `
                //         <line x1="${c1.x*SCALE}" y1="${c1.y*SCALE}" x2="${c2.x*SCALE}" y2="${c2.y*SCALE}" stroke="#3333ff" stroke-width="1"/>
                //     `
                // } else {
                //     content = `
                //         <rect x="${c1.x*SCALE}" y="${c1.y*SCALE}" width="${SCALE*(c2.x-c1.x)}" height="${SCALE*(c2.y-c1.y)}" stroke="#3333ff" stroke-width="3"/>
                //     `
                // }
                //if (count < 10) console.log(`For rectangle: min(${c1.x},${c1.y}) max(${c2.x},${c2.y})`);
                for (const hw of hwArr.filter(hw => c1.y < hw.y && hw.y < c2.y)) {
                    if (!valid) break;
                    //if (count < 10) console.log(` Checking horizontal wall at y=${hw.y} from x=${hw.minx} to x=${hw.maxx}`);
                    // if the wall is all left or all right of box, it's ok.  Otherwise, the box is cut
                    // let color = "#00ff00";
                    if (((hw.minx <= c1.x && hw.maxx <= c1.x) || (hw.minx >= c2.x && hw.maxx >= c2.x)) === false) {
                        //if (count < 10) console.log(`  CUT`);
                        // color = "#ff3333";
                        valid = false;
                    }
                    // content += `
                    //     <line x1="${hw.minx*SCALE}" y1="${hw.y*SCALE}" x2="${hw.maxx*SCALE}" y2="${hw.y*SCALE}" stroke="${color}" stroke-width="1000"/>
                    // `;
                }
                for (const vw of vwArr.filter(vw => c1.x < vw.x && vw.x < c2.x)) {
                    if (!valid) break;
                    //if (count < 10) console.log(` Checking vertc1 wall at x=${vw.x} from y=${vw.miny} to y=${vw.maxy}`);
                    // if the wall is all above or all below of box, it's ok.  Otherwise, the box is cut
                    // let color = "#00ff00";
                    if (((vw.miny <= c1.y && vw.maxy <= c1.y) || (vw.miny >= c2.y && vw.maxy >= c2.y)) === false) {
                        //if (count < 10) console.log(`  CUT`);
                        // color = "#ff3333";
                        valid = false;
                    }
                    // content += `
                    //     <line x1="${vw.x*SCALE}" y1="${vw.miny*SCALE}" x2="${vw.x*SCALE}" y2="${vw.maxy*SCALE}" stroke="${color}" stroke-width="1000"/>
                    // `;
                }
                // if (Math.random() < 0.001 || a === max) {
                //     count++;
                //     content += `
                //         <circle cx="${c1.x*SCALE}" cy="${c1.y*SCALE}" r="${100}" fill="#00ff00"/>
                //         <circle cx="${c2.x*SCALE}" cy="${c2.y*SCALE}" r="${100}" fill="#ff0000"/>
                //     `;
                //     const fn = `src/2025/09/b202509_${i.toString().padStart(4, '0')}_${j.toString().padStart(4, '0')}.png`; 
                //     sharp(Buffer.from(contentHeader+content+contentFooter), {limitInputPixels: 1000000000000})
                //         .resize({width: 3000, height: 3000})
                //         .toFile(fn);
                // }
                if (valid) {
                    console.log(`Found valid rectangle: min(${c1.x},${c1.y}) max(${c2.x},${c2.y}) area=${a}`);
                    bestContent = `<rect x="${c1.x*SCALE}" y="${c1.y*SCALE}" width="${SCALE*(c2.x-c1.x)}" height="${SCALE*(c2.y-c1.y)}" stroke="#3333ff" stroke-width="3"/>`
                    max = a;
                }
            }
        }
        const fn = `src/2025/09/b202509.png`; 
        sharp(Buffer.from(contentHeader+bestContent+contentFooter), {limitInputPixels: 1000000000000})
            .resize({width: 3000, height: 3000})
            .toFile(fn);
        this.result = max.toString();
    }

    _runStep(): boolean {
        let moreToDo = false;
        return moreToDo;
    }
}