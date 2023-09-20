import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    console.log(line);
    let computedLength = 0;
    for (let i=0; i<line.length; i++) {
        //console.log(`Current computed length is: ${computedLength}, Looking at character: ${i} [${line[i]}]`);
        if (line[i] === '(') {
            // start marker
            let xInd = line.indexOf('x', i+1);
            let pInd = line.indexOf(')', xInd);
            let len = Number(line.slice(i+1, xInd));
            let reps = Number(line.slice(xInd+1, pInd));
            //console.log(`Found marker at ${i}, ${xInd}, ${pInd}, len=${len}, reps=${reps}`);
            i = pInd+len;
            computedLength += len*reps;
        } else {
            computedLength++;
        }
    }
    console.log(`Computed length: ${computedLength}`);
};

p.onClose = () => {
};

p.run();