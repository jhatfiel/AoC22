import { Puzzle } from "../../lib/puzzle";

const p = new Puzzle(process.argv[2]);

let wires = new Map<string, Wire>();

p.onLine = (line) => {
    console.log(line);
    let arr = line.split(/ [->]+ /);
    let name = arr[1];
    let oparr = arr[0].split(' ');
    let w: Wire;
    if      (oparr[0] === 'NOT')    { w = new NotWire(name, oparr[1]); }
    else if (oparr[1] === 'AND')    { w = new AndWire(name, oparr[0], oparr[2]); }
    else if (oparr[1] === 'OR')     { w = new OrWire(name, oparr[0], oparr[2]); }
    else if (oparr[1] === 'LSHIFT') { w = new LSWire(name, oparr[0], Number(oparr[2])); }
    else if (oparr[1] === 'RSHIFT') { w = new RSWire(name, oparr[0], Number(oparr[2])); }
    else                            { 
        let n = Number(oparr[0]);
        if (Number.isNaN(n)) w = new WireRef(name, oparr[0]);
        else                 w = new Wire(name, n);
    }

    wires.set(name, w);
};

p.onClose = () => {
    console.log();
    Array.from(wires.keys()).sort().forEach((n) => {
        console.log(`Wire ${n}: ${getOrCreateWire(n).getValue()}`);
    });
};

p.run();

function getOrCreateWire(name: string) {
    let w = wires.get(name);
    if (w === undefined) {
        w = new Wire(name, Number(name));
        wires.set(name, w);
    }
    return w;
}

class Wire {
    constructor(public name: string, public value?: number) {}
    getValue() { if (this.value === undefined) { throw new Error(`Undefined value for ${this.name}`); } return this.value; }
}

class WireRef extends Wire {
    constructor(public name: string, public op1: string) { super(name); }
    getValue() { if (this.value === undefined) { this.value = getOrCreateWire(this.op1).getValue(); } return this.value; }
}

class AndWire extends Wire {
    constructor(public name: string, public op1: string, public op2: string) { super(name); }
    getValue() { if (this.value === undefined) { this.value = getOrCreateWire(this.op1).getValue() & getOrCreateWire(this.op2).getValue(); } return this.value; }
}

class OrWire extends Wire {
    constructor(public name: string, public op1: string, public op2: string) { super(name); }
    getValue() { if (this.value === undefined) { this.value = getOrCreateWire(this.op1).getValue() | getOrCreateWire(this.op2).getValue(); } return this.value; }
}

class LSWire extends Wire {
    constructor(public name: string, public op1: string, public num: number) { super(name); }
    getValue() { if (this.value === undefined) { this.value = (getOrCreateWire(this.op1).getValue() << this.num) & 0xFFFF; } return this.value; }
}

class RSWire extends Wire {
    constructor(public name: string, public op1: string, public num: number) { super(name); }
    getValue() { if (this.value === undefined) { this.value = (getOrCreateWire(this.op1).getValue() >> this.num) & 0xFFFF; } return this.value; }
}

class NotWire extends Wire {
    constructor(public name: string, public op1: string) { super(name); }
    getValue() { if (this.value === undefined) { this.value = (~getOrCreateWire(this.op1).getValue()) & 0xFFFF; } return this.value; }
}