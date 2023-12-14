/**
 * Cycle Detection
 * MAKE SURE YOU INITIALIZE IT WITH THE STATE FOR ITERATIONS = 0
 * I.e., if you expect it to give you results after 100 iterations and you plan on calling 
 * logValue with a unique key that represents the state of the system and a value that the system generates
 * If a cycle is detected, the return is an object representing the final results with a value property
 */
export type CycleDetectionResult<T=number> = {
    loopStart: number;      // start of the loop (the first loop detected)
    loopLength: number;     // length of the loop that was detected
    offset: number;         // from loopStart
    value: T;               // the value that was logged for the requested iteration
    valueIteration: number; // the iteration of the first value that matched this iteration
    valueKey: string;       // the key representing the first value that matched this iteration
}

export class CycleDetection<T=number> {
    constructor() {};
    lastSeenState = new Map<string, {iteration: number, value: T}>();
    iteration = 0;
    loopLength: number;
    loopStart: number;

    // returns true if we have hit a loop
    logValue(key: string, value: T): boolean {
        if (this.lastSeenState.has(key)) {
            if (this.loopStart === undefined) {
                let firstEntry = this.lastSeenState.get(key);
                this.loopStart = firstEntry.iteration;
                if (firstEntry.value !== value) throw new Error(`CycleDetection found a loop (${this.iteration} matches ${this.loopStart}) but the values don't match.  Maybe not enough information is encoded in the key?`)

                this.loopLength = this.iteration - this.loopStart;
            }
            return true;
        }

        this.lastSeenState.set(key, {iteration: this.iteration, value});
        this.iteration++;
        return false;
    }

    getValueAt(iteration: number): CycleDetectionResult<T> {
        if (this.loopStart === undefined) throw new Error(`Don't call getValueAt before cycle detected!`);
        let offset = (iteration-this.loopStart) % this.loopLength; // remaining iterations to get to FINAL_iteration
        let valueIteration = this.loopStart + (offset % this.loopLength);
        //console.debug(`Found hit for iteration: ${iteration} (loopStart=${this.loopStart}, loopLength=${this.loopLength}, offset=${offset}, valueIteration=${valueIteration})`)
        //let finalEntry = [...this.lastSeenState.entries()].find(pair => pair[1].iteration === valueIteration)
        let finalEntry = Array.from(this.lastSeenState.entries())[valueIteration];
        return {
            loopStart: this.loopStart,
            loopLength: this.loopLength,
            offset,
            value: finalEntry[1].value,
            valueIteration,
            valueKey: finalEntry[0]
        };
    }
}

/*
let cd = new CycleDetection();
cd.logValue(',', 99);
cd.logValue('.', 0);
cd.logValue('a', 1);
cd.logValue('b', 2);
cd.logValue('c', 3);
cd.logValue('a', 1);
for (let i=0; i<10; i++) {
    let cdr = cd.getValueAt(i);
    console.debug(`[${i.toString().padStart(3, ' ')}]: maps to iteration: ${cdr.valueIteration}: value = ${cdr.value}`);
}
//*/

/*
let cd = new CycleDetection();
cd.logValue('0', 0);
cd.logValue('1', 1);
cd.logValue('2', 2);
cd.logValue('3', 3);
cd.logValue('0', 0);
for (let i=0; i<10; i++) {
    let cdr = cd.getValueAt(i);
    console.debug(`[${i.toString().padStart(3, ' ')}]: maps to iteration: ${cdr.valueIteration}: value = ${cdr.value}`);
}

//*/