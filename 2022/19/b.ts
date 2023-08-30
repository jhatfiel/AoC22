import fs from 'fs';
import readline from 'readline';

type BP = {
    id: number;
    orCost: number;
    crCost: number;
    sroCost: number;
    srcCost: number;
    groCost: number;
    grsCost: number;
}

class State {
    static MAX_TIME = 32;
    minute = 1;

    ore = 0;
    clay = 0;
    obsidian = 0;
    geodes = 0;

    opm = 1;
    cpm = 0;
    spm = 0;
    gpm = 0;

    builds = new Map<number, string>();

    tick(): boolean {
        this.minute++;
        this.ore += this.opm;
        this.clay += this.cpm;
        this.obsidian += this.spm;
        this.geodes += this.gpm;
        return this.minute <= State.MAX_TIME;
    }

    copy(): State {
        let state = new State;
        state.minute = this.minute;
        state.ore = this.ore;
        state.clay = this.clay;
        state.obsidian = this.obsidian;
        state.geodes = this.geodes;
        state.opm = this.opm;
        state.cpm = this.cpm;
        state.spm = this.spm;
        state.gpm = this.gpm;
        this.builds.forEach((v,k) => state.builds.set(k, v));
        return state;
    }

    toString() {
        let result = '';
        let timeline = new Array<string>(State.MAX_TIME+1).fill('.');
        this.builds.forEach((v,k) => timeline[k] = v);
        result = `[${this.minute.toString().padStart(2, ' ')}]: ${this.ore.toString().padStart(3, ' ')} (${this.opm.toString().padStart(2, ' ')}/m) ` +
                                                               `${this.clay.toString().padStart(3, ' ')} (${this.cpm.toString().padStart(2, ' ')}/m) ` +
                                                               `${this.obsidian.toString().padStart(3, ' ')} (${this.spm.toString().padStart(2, ' ')}/m) ` +
                                                               `${this.geodes.toString().padStart(3, ' ')} (${this.gpm.toString().padStart(2, ' ')}/m) ` +
                                                               `Builds: [${timeline.slice(1).join('')}]`;
        return result;
    }
}

class C {
    constructor() { }

    bp = new Array<BP>();
    bestState = new State();

    process(line: string) {
        if (this.bp.length < 3) {
            console.log(line);
            this.bp.push(this.parseBP(line))
        }
    }

    parseBP(line: string): BP {
        let arr = line.split(/[ :\\.]+/);
        return { id: Number(arr[1]), orCost: Number(arr[6]), crCost: Number(arr[12]), sroCost: Number(arr[18]), srcCost: Number(arr[21]), groCost: Number(arr[27]), grsCost: Number(arr[30])};
    }

    getResult() {
        let result = 1;
        this.bp.forEach((bp) => {
            this.bestState = new State();
            console.log(`BP ${bp.id}: Begin ${bp.orCost} / ${bp.crCost} / ${bp.sroCost},${bp.srcCost} / ${bp.groCost},${bp.grsCost}`);
            this.iterate(bp, new State());

            console.log(`BP ${bp.id}: End ${this.bestState}`);
            result *= this.bestState.geodes;

        });
        console.log();
        return result;
    }

    potentialG(bp: BP, state: State) {
        let timeLeft = State.MAX_TIME - state.minute + 1;
        if (timeLeft < 1) timeLeft = 1;
        return state.geodes + timeLeft*state.gpm + (timeLeft*(timeLeft-1))/2
    }

    potentialS(bp: BP, state: State) {
        let timeLeft = State.MAX_TIME - state.minute + 1;
        if (timeLeft < 1) timeLeft = 1;
        return state.obsidian + timeLeft*state.spm + (timeLeft*(timeLeft-1))/2
    }

    iterate(bp: BP, state: State) {
        // shortcut if we can't get to the current bestState.geodes even if we could theoretically spawn a geode robot every minute
        if (this.potentialG(bp, state) < this.bestState.geodes) return;

        // shortcut if we can't afford to buy another geodes before time runs out
        if (this.potentialS(bp, state) < bp.grsCost) {
            while (state.tick()) {
                //
            }
            this.checkBest(state);
            return;
        }

        //console.log(state.toString());
        // we can build a robot and after this tick it will start producing
        // - build a geode robot
        // - build a obsidian robot
        // - build a clay robot
        // - build a ore robot
        // if we could create a geode robot, that's always the best path.
        if (state.ore >= bp.groCost && state.obsidian >= bp.grsCost) {
            // try building geode robot
            //console.log(`${state} Built geode robot`);
            let newState = state.copy();
            newState.builds.set(newState.minute, 'G');
            newState.ore -= bp.groCost; newState.obsidian -= bp.grsCost;
            if (newState.tick()) {
                newState.gpm++;
                this.iterate(bp, newState);
            } else this.checkBest(newState);
        } else {
            if (state.ore >= bp.sroCost && state.clay >= bp.srcCost && state.spm < bp.grsCost) {
                // try building obsidian robot
                //console.log(`${state} Built obsidian robot`);
                let newState = state.copy();
                newState.builds.set(newState.minute, 'S');
                newState.ore -= bp.sroCost; newState.clay -= bp.srcCost;
                if (newState.tick()) {
                    newState.spm++;
                    this.iterate(bp, newState);
                } else this.checkBest(newState);
            }
            // don't build clay robot if cpm is already greater than or equal to the cost in clay for obsidian robots
            if (state.ore >= bp.crCost && state.cpm < bp.srcCost) {
                // try building clay robot
                //console.log(`${state} Built clay robot`);
                let newState = state.copy();
                newState.builds.set(newState.minute, 'C');
                newState.ore -= bp.crCost;
                if (newState.tick()) {
                    newState.cpm++;
                    this.iterate(bp, newState);
                } else this.checkBest(newState);
            } 
            // don't build another ore robot if opm is already greater than or equal to the maximum cost in ore for any other robot
            if (state.ore >= bp.orCost && state.opm < Math.max(bp.orCost, bp.crCost, bp.sroCost, bp.groCost)) {
                // try building ore robot
                //console.log(`${state} Built ore robot`);
                let newState = state.copy();
                newState.builds.set(newState.minute, 'O');
                newState.ore -= bp.orCost;
                if (newState.tick()) {
                    newState.opm++;
                    this.iterate(bp, newState);
                } else this.checkBest(newState);
            }

            // try just continuing to collect resources
            //console.log(`${state} Just collecting resources`);
            // if we could have literally done all the other things, there's no need to try "doing nothing"
            if (state.ore < Math.max(bp.sroCost, bp.crCost, bp.orCost) || state.clay < bp.srcCost) {
                if (state.tick()) {
                    this.iterate(bp, state);
                } else this.checkBest(state);
            }
        }
    }

    debug() {
    }

    checkBest(state: State) {
        //fs.writeSync(process.stdout.fd, `.........Trying ${state}\n`);
        //process.stdout.moveCursor(0, -1);
        if (state.geodes > this.bestState.geodes) {
            console.log(`Found new best! ${state}`);
            this.bestState = state;
        }
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