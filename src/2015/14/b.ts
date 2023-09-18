import { Puzzle } from "../../lib/puzzle";

class Reindeer {
    constructor(public name: string, public speed: number, public duration: number, public rest: number) {}
    distance = 0;
    run(seconds: number): number {
        let cycleLength = this.duration + this.rest;
        let fullCycles = Math.floor(seconds / cycleLength);
        let remainingTime = Math.min(this.duration, seconds - fullCycles*cycleLength);

        this.distance = (fullCycles * this.duration + remainingTime) * this.speed;
        return this.distance;
    }
}

let herd = new Array<Reindeer>();

const p = new Puzzle(process.argv[2]);

p.onLine = (line) => {
    const arr = line.split(/[ \.]/);
    herd.push(new Reindeer(arr[0], Number(arr[3]), Number(arr[6]), Number(arr[13])));
};

p.onClose = () => {
    let maxSeconds = 2503;
    let scores = new Map<string, number>();
    herd.forEach((r) => scores.set(r.name, 0));

    // inefficient - would have been better to incrementally calculate, but this is sufficient
    for (let seconds = 1; seconds <= maxSeconds; seconds++) {
        let max = 0;
        herd.forEach((r) => {
            let d = r.run(seconds);
            if (d > max) max = d;
        })
        herd.forEach((r) => {
            if (r.distance === max) scores.set(r.name, scores.get(r.name)!+1);
        })
    }

    console.log(`Final scores:`);
    let max = 0;
    scores.forEach((v, k) => {
        if (v > max) max = v;
        console.log(`${k}: ${v}`)
    })

    console.log(`highest score = ${max}`);
};

p.run();