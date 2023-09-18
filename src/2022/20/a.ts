import fs from 'fs';
import readline from 'readline';

class Node {
    constructor() {}
    prev?: Node;
    next?: Node;
    value?: number;

    append(n: Node) {
        if (!this.prev) throw new Error("Node has no prev");
        if (!this.next) throw new Error("Node has no next");
        let oldNext = this.next;
        this.next = n;
        n.next = oldNext;

        oldNext.prev = n;
        n.prev = this;
    }

    detach() {
        if (!this.prev) throw new Error("Node has no prev");
        if (!this.next) throw new Error("Node has no next");
        this.next.prev = this.prev;
        this.prev.next = this.next;
        this.next = this;
        this.prev = this;
    }

    toString() {
        return this.value?.toString()??'UNDEFINED';
    }
};

class C {
    constructor() { }
    numbers = new Array<Node>();
    head?: Node;
    zero?: Node;

    process(line: string) {
        console.log(`line: ${line}`);
        let n = new Node();
        n.value = Number(line);
        if (line === '0') this.zero = n;
        if (!this.head) {
            this.head = n;
            this.head.prev = this.head;
            this.head.next = this.head;
        } else {
            this.head.prev!.append(n);
        }
        this.numbers.push(n);
    }

    getResult() {
        let result = 1;
        this.mix();
        console.log();
        return this.calculateCoordinates();
    }

    calculateCoordinates() {
        let result = 0;
        let n = this.zero!;
        for (let i=0; i<3; i++) {
            for (let j=0; j<1000; j++) {
                n = n.next!;
            }
            console.log(`${i}: ${n.value}`);
            result += n.value!;
        }
        return result;
    }

    mix() {
        this.debug();
        this.numbers.forEach((n) => {
            let prev = n.prev;
            n.detach();
            let move = Number(n.value);
            if (move < 0) {
                move = move * -1;
                while (move-->0) { prev = prev?.prev; }
            } else {
                while (move-->0) { prev = prev?.next; }
            }
            prev?.append(n);
        })
        this.debug();
    }

    debug() {
        let n = this.head!;
        process.stdout.write(n.value + ' ');
        while (n.next !== this.head) {
            n = n.next!;
            process.stdout.write(n.value + ' ');
        }
        process.stdout.write('\n');
    }

    debugArray() {
        for (let i=0; i<this.numbers.length; i++) { console.log(`Number ${i} is ${this.numbers[i]}, prev=${this.numbers[i].prev}, next=${this.numbers[i].next}`) }
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