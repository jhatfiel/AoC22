import { Puzzle } from "../../lib/puzzle.js";
import { createHash } from 'crypto';

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let hex = '';
    let i = 0;
    let password = '';
    let buffer: Buffer;
    do {
        i++;
        buffer = createHash('md5').update(line+i).digest();
        //hex = createHash('md5').update(line+i).digest('hex');
        let bigInt = buffer.readInt32BE();
        //console.log(hex);
        //console.log((bigInt&0xFFFFF000).toString(16).padStart(8, '0'));
        //break;
        //if ((buffer[0] | buffer[1] | buffer[2] >> 4) === 0) { password += (buffer[2]&0x0F).toString(16); console.log(`${i.toString().padStart(8, ' ')}: ${password}`); }
        if ((bigInt & 0xFFFFF000) === 0) { password += (buffer[2]&0x0F).toString(16); console.log(`${i.toString().padStart(8, ' ')}: ${password}`); }
    } while (password.length < 8)
};

p.onClose = () => {};

p.run();