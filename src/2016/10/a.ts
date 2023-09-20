import { Puzzle } from "../../lib/puzzle.js";

class Bot {
    constructor(public name: number, public botLookup: (n:number)=>Bot, public debug=false) {}

    values = new Array<number>();

    lowTo?: number;
    highTo?: number;

    say(message: string) {
        if (this.debug) console.log(`[${this.name.toString().padStart(3, ' ')}] ${message}`);
    }

    setTo(low: number, high: number) {
        this.say(`Set low: ${low}, high: ${high}`);
        this.lowTo = low;
        this.highTo = high;
        this.giveAll();
    }

    receive(value: number) {
        this.values.push(value);
        this.say(`Got value: values now ${this.values.join(',')}`);
        this.giveAll();
    }

    giveAll() {
        if (this.values.length === 2 && this.lowTo !== undefined && this.highTo !== undefined) {
            this.values.sort((a,b)=>a-b);
            this.say(`Sending values: ${this.values[0]} => ${this.lowTo} ${this.values[1]} => ${this.highTo}`);
            this.botLookup(this.highTo).receive(this.values.pop());
            this.botLookup(this.lowTo).receive(this.values.pop());
        }
    }
}

const bots = Array.from({length: 2000}, (b, ind: number) => new Bot(ind, (n) => bots[n], true));

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    console.log(line);
    const arr = line.split(' ');
    if (arr[0] == 'value') {
        const v = Number(arr[1]);
        const n = Number(arr[5]);
        bots[n].receive(v);
    } else {
        const n = Number(arr[1]);
        let l = Number(arr[6]);
        if (arr[5] === 'output') l += 1000;
        let h = Number(arr[11]);
        if (arr[10] === 'output') h += 1000;
        bots[n].setTo(l, h);
    }
};

p.onClose = () => {
    console.log(bots[1000].values);
    console.log(bots[1001].values);
    console.log(bots[1002].values);

    console.log(`Result: ${bots[1000].values[0]*bots[1001].values[0]*bots[1002].values[0]}`);
    // 3922 is too low
};

p.run();