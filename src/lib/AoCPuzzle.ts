export abstract class AoCPuzzle {
    constructor(public fn: string, protected log: (...data: any[]) => void = console.log) {
        if (fn && fn.startsWith('sample')) {
            this.log('SAMPLE MODE ACTIVE');
            this.inSampleMode = true;
        }
    }
    inSampleMode = false;
    result = '';
    stepNumber = 0;

    loadData(lines: Array<string>) {
        if (this.inSampleMode) this.sampleMode();
        this._loadData(lines);
    }
    abstract _loadData(lines: Array<string>);

    /**
     * 
     * @returns boolean true if there is more to do, false if we are done (`this.result` should how the answer at this point)
     */
    runStep(): boolean { this.stepNumber++; return this._runStep(); }
    abstract _runStep(): boolean;
    sampleMode() { };
};