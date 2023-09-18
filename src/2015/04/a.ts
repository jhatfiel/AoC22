import { Puzzle } from "../../lib/puzzle";
import { createHash } from 'crypto';

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let i=-1;
    let hex = '';
    console.log();
    do {
        i++;
        hex = createHash('md5').update(line+i).digest('hex');
        process.stdout.moveCursor(0, -1);
        process.stdout.write(`${line} ${i.toString().padStart(8, ' ')}: ${hex}\n`);
    } while (!hex.startsWith('00000'));
    console.log(`${line} ${i}`);
};

p.onClose = () => {};

p.run();