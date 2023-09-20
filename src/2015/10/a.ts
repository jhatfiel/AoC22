import { Puzzle } from "../../lib/puzzle.js";

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let iteration = 0;
    while (iteration < 51) {
        console.log(`[${iteration.toString().padStart(2, ' ')}]: [line] length is ${line.length}`);

        let newStr = '';
        let lastC = ''
        let cCnt = 0;

        for (const c of line.split('')) {
            if (lastC !== '' && c !== lastC) {
                newStr += cCnt + lastC;

                cCnt = 1;
            } else {
                cCnt++;
            }
            lastC = c;
        }

        newStr += cCnt + lastC;
        line = newStr;

        iteration++;
    }
};

p.onClose = () => {
};

p.run();