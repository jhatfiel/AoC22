import { Puzzle } from "../../lib/puzzle";
import { createHash } from 'crypto';

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    let hex = '';
    let i = 0;
    let password = '________';
    let lastIndex = 0;
    console.log();
    do {
        i++;
        hex = createHash('md5').update(line+i).digest('hex');
        if (hex.startsWith('00000') && Number(hex.slice(5, 6)) < 8) {
            lastIndex = Number(hex.slice(5,6));
            
            if (password[lastIndex] === '_') {
                password = password.slice(0, lastIndex) + hex.slice(6, 7) + password.slice(lastIndex+1);
                console.log(`${password}: ${i.toString().padStart(8, ' ')} found position ${lastIndex}!      `);
            }
        }
        if (i % 1000 === 0) {
            let cinematic = password;
            while (cinematic.indexOf('_') > -1) 
                cinematic = cinematic.replace('_', '0123456789abcdef'.charAt(Math.random()*16));
            let message = '... searching!';
            let counts = p.countOccurrences(password.split(''));
            switch (counts.get('_')) {
                case 0: message = ' CRACKED!'; break;
                case 1: message = ' ALMOST THERE!!!'; break;
                case 2: message = ' Wait, that\'s just me'; break;
                case 3: message = ' I can smell the goal!'; break;
                case 4: message = ' Half-way there!'; break;
                case 5: message = ` Ok, found another at position ${lastIndex}`; break;
                case 6: message = ' Maybe you should go get a coffee?'; break;
                case 7: message = ' Wow! We found one!'; break;
                case 8: message = ' Initializing...'; break;
                default:
                    break;
            }
            console.log(`${cinematic}: ${message}`);
            process.stdout.moveCursor(0, -1);
        }
    } while (password.indexOf('_') > -1);
};

p.onClose = () => {};

p.run();