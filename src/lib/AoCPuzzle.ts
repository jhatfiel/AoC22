export abstract class AoCPuzzle {
    result = '';
    stepIdx = 0;

    abstract loadData(lines: Array<string>);
    /**
     * 
     * @returns boolean true if there is more to do, false if we are done (`this.result` should how the answer at this point)
     */
    runStep(): boolean { this.stepIdx++; return this._runStep(); }
    abstract _runStep(): boolean;
};