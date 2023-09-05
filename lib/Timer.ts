export class Timer {
    NS_PER_SEC: number;
    MS_PER_NS: number;
    startTime: any;
    // Automatically starts the timer
    constructor(public name = 'Benchmark') {
        this.NS_PER_SEC = 1e9;
        this.MS_PER_NS = 1e-6
        this.startTime = process.hrtime();
    }

    // returns the time in ms since instantiation
    // can be called multiple times
    runtimeMs() {
        const diff = process.hrtime(this.startTime);
        return (diff[0] * this.NS_PER_SEC + diff[1]) * this.MS_PER_NS;
    }

    // retuns a string: the time in ms since instantiation
    runtimeMsStr() {
        return `${this.name} took ${this.runtimeMs()} milliseconds`;
    }
}