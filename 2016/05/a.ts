import { Puzzle } from "../../lib/puzzle";
import { createHash } from 'crypto';

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let hex = '';
    let i = 0;
    let password = '';
    do {
        i++;
        hex = createHash('md5').update(line+i).digest('hex');
        if (hex.startsWith('00000')) { password += hex.slice(5, 6); console.log(`${i.toString().padStart(8, ' ')}: ${password}`); }
    } while (password.length < 8)
};

p.onClose = () => {};

p.run();