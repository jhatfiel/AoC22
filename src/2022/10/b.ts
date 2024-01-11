import { createReadStream } from "fs";
import { createInterface } from "readline";

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
    var column = (cycle-1)%40;
    if (Math.abs(column-X) <= 1) process.stdout.write('█');
    else                         process.stdout.write('.');

    if (column == 39) process.stdout.write('\n');
};

var fn = process.argv[2];
const rl = createInterface({ input: createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    console.log(`Result: ${result}`);
});
