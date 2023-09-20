import { Puzzle } from "../../lib/puzzle.js";

class Reindeer {
    constructor(public name: string, public speed: number, public duration: number, public rest: number) {}
    run(seconds: number): number {
        let cycleLength = this.duration + this.rest;
        let fullCycles = Math.floor(seconds / cycleLength);
        let remainingTime = Math.min(this.duration, seconds - fullCycles*cycleLength);

        //console.log(`[${this.name}]: fullCycles=${fullCycles}, remainingTime=${remainingTime}`);

        return (fullCycles * this.duration + remainingTime) * this.speed;
    }
}

let herd = new Array<Reindeer>();

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    const arr = line.split(/[ \.]/);
    herd.push(new Reindeer(arr[0], Number(arr[3]), Number(arr[6]), Number(arr[13])));
};

p.onClose = () => {
    let max = 0;
    herd.forEach((r) => {
        let d = r.run(2503);
        if (d > max) max = d; 
    })

    console.log(`longest = ${max}`);
};

p.run();