import fs from 'fs';
import readline from 'readline';

class C {
    constructor() { };

    X = 1;
    cycle = 0;

    process(line: string) {
        if (line === 'noop') this.tick();
        else {
            // addx ###
            var [cmd, arg] = line.split(' ');
            var v = Number(arg);
            this.tick(); 
            this.tick(); 
            this.X += v;
        }
    }

    tick() {
        this.cycle++;
        this.onTick(this.cycle, this.X);
    }

    onTick(cycle: number, X: number) {
        console.log(`CPU(${cycle}) X=${X}`);
    }

    getResult() {
        return 0;
    }

    debug() {
    }
}

var c = new C();
var result = 0;

c.onTick = (cycle: number, X: number) => {
    if ((cycle-20)%40 == 0) {
        console.log(`CPU(${cycle}) X=${X}`);
        result += cycle*X;
    }
};

var fn = process.argv[2];
const rl = readline.createInterface({ input: fs.createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log(`Result: ${result}`);
});
