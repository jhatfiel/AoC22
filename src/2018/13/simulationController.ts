import pkg from '../../../node_modules/terminal-kit/lib/termkit.js'
const { Terminal } = pkg;
import { Simulation } from './simulation.js';

export class SimulationController {
    constructor(public stopOnFirstCrash = true) {
        this.term.clear();
        this.term.grabInput();
        this.term.on('key', (name, matches, data) => {
            this.showGrid = true;
            //console.log("'key' event:", name);
                 if (name === 'CTRL_C' || name === 'q') this.terminate();
            else if (name === 'UP') this.changeRow(-1);
            else if (name === 'DOWN') this.changeRow(1);
            else if (name === 'LEFT') this.changeCol(-1);
            else if (name === 'RIGHT') this.changeCol(1);
            else if (name === ' ') this.togglePlay();
            else if (name === 'ENTER') this.runSingleStep();
            else if (name === 'f') this.finishIt();
            else if (name === 'c') this.runTillCrash();
        });
    }

    term = new Terminal();
    sim = new Simulation(this.term);
    firstRow=0;
    firstCol=0;
    outputCol=65
    outputRow=1;
    height = this.term.height - 2;
    width = this.term.width - 70;
    runningSim = false;
    stopAtCrash = false;
    showGrid = true;
    finished = false;

    simulate(lines: string[]) {
        this.sim.parseInput(lines);
        this.sim.prepareBackground();

        // Draw the screen
        this.sim.debugCarts(1, 1);
        this.drawSimScreen();
    }

    changeRow(delta: number) {
        this.firstRow += delta;
        if (this.firstRow + this.height > this.sim.numRows) this.firstRow = this.sim.numRows - this.height;
        this.firstRow = Math.max(0, this.firstRow);
        if (!this.runningSim) this.drawSimScreen();
    }

    changeCol(delta: number) {
        this.firstCol += delta;
        if (this.firstCol + this.width > this.sim.numCols) this.firstCol = this.sim.numCols - this.width;
        this.firstCol = Math.max(0, this.firstCol);
        if (!this.runningSim) this.drawSimScreen();
    }

    runTillCrash() {
        this.runningSim = true;
        this.stopAtCrash = true;
        this.runStep();
    }

    runSingleStep() {
        this.runningSim = false;
        this.runStep();
    }

    runStep() {
        if (!this.finished) {
            this.sim.moveCarts();

            // draw resulting screen
            this.sim.debugCarts(1, 1);
            this.finished = (this.stopOnFirstCrash && this.sim.getAnyCrashedCarts()) ||
                            (!this.stopOnFirstCrash && this.sim.getNumRemainingCarts() === 1);
            if (this.finished || (this.stopAtCrash && this.sim.crashJustHappened())) {
                this.runningSim = false;
                this.showGrid = true;
            }

            if (this.sim.crashJustHappened()) {
                let [crashCol, crashRow] = this.sim.crashLocations[this.sim.crashLocations.length-1].split(':')[1].split(',').map(Number)
                this.firstRow = crashRow - Math.floor(this.height/2);
                this.firstCol = crashCol - Math.floor(this.width/2);

            }

            this.drawSimScreen();

            if (this.runningSim) {
                setTimeout(this.runStep.bind(this), 1);
            }
        }
    }

    drawSimScreen() {
        this.sim.drawScreen(this.outputRow, this.outputCol, this.showGrid, this.firstRow, this.firstCol, this.height, this.width);
    }
        
    // Iteration number: 2247 Crashes: [530]:116,91 / [669]:30,122 / [882]:91,80 / [1140]:32,64 / [1363]:67,107 / [2176]:70,67 / [2366]:55,5 / [17316]:69,21
    finishIt() {
        this.showGrid = false;
        this.runningSim = true;
        this.stopAtCrash = false;
        this.runStep();
    }

    togglePlay() {
        if (!this.runningSim) {
            this.runningSim = true;
            this.stopAtCrash = false;
            this.runStep();
        } else {
            this.runningSim = false;
        }
    }

    terminate() {
        this.term.moveTo(1, this.height);
        console.debug(`crashes: ${this.sim.crashLocations.join(' / ')}`);
        console.debug(`Done!, Last cart is at: ${(this.sim.carts.filter(c => !c.crashed)[0] ?? '').toString()}`);
        this.term.grabInput(false);
        setTimeout(_ => process.exit(), 100);
    }
}