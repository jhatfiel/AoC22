import fs from 'fs';
import readline from 'readline';

class PentaBinary {
    constructor(s: string) {
        const arr = s.split('');
        let place = 1;
        arr.reverse().forEach((c, i) => {
            let n = Number(c);
            if (c === '-') n = -1;
            if (c === '=') n = -2;
            this.value += n*place;
            place *= 5;
        })
    }

    toString() {
        let arr = this.value.toString(5).split('').reverse();
        for (let i = 0; i<arr.length; i++) {
            while (Number(arr[i]) > 2) {
                arr[i] = (Number(arr[i])-5).toString();
                arr[i+1] = (Number(arr[i+1]??0)+1).toString();
            }
            if (arr[i] === '-1') arr[i] = '-'
            if (arr[i] === '-2') arr[i] = '='

        }
        let result = arr.reverse().join('');

        return result;
    }

    value = 0;
}

class C {
    sum = 0;
    process(line: string) {
        const pb = new PentaBinary(line);
        console.log(`${line.padStart(10, ' ')} = ${pb.value.toString().padStart(8, ' ')} = ${pb.toString().padStart(10, ' ')}`);
        this.sum += pb.value;
    }

    getResult() {
        const pb = new PentaBinary('');
        pb.value = this.sum;
        return pb.toString();
    }
}

let c = new C();

let fn = process.argv[2];
const rl = readline.createInterface({ input: fs.createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log(`Result: ${c.getResult()}`);
});