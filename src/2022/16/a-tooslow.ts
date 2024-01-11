import { createReadStream } from "fs";
import { createInterface } from "readline";

class Valve {
    constructor(public name: string) {};
    enabled = false;
    flowRate = 0;
    connected = Array<Valve>();

    toString() { return this.name; }
}

const MAX_TIME = 30;

type State = {
    path: string;
    cv: string;
    released: number;
    opened: Set<string>;
    traversed: Set<string>;
}

class C {
    constructor() { }

    valves = new Map<string, Valve>();
    best = 0;

    process(line: string) {
        console.log(line);
        const parts = line.split(/; tunnels? leads? to valves? /);
        const valveDetailArr = parts[0].split(/[ =]/);
        const name = valveDetailArr[1];
        const flowRate = Number(valveDetailArr[5]);
        const connectedArr = parts[1].split(', ');

        let valve = this.getOrCreateValve(name);
        valve.flowRate = flowRate;
        connectedArr.forEach((c) => valve.connected.push(this.getOrCreateValve(c)) );

    }

    getOrCreateValve(name: string): Valve {
        let valve = this.valves.get(name);
        if (!valve) { valve = new Valve(name); this.valves.set(name, valve); }
        return valve;
    }

    solve() {
        let state = {path: 'AA', cv: 'AA', released: 0, opened: new Set<string>(), traversed: new Set<string>(['AA'])};
        this.try(0, state);
    }

    try(time: number, state: State) {
        if (time == MAX_TIME) {
            console.log(`${state.path}, released=${state.released}                         `);
            process.stdout.moveCursor(0, -1);
            if (state.released > this.best) { this.best = state.released; console.log(`${state.path}, released=${state.released}                         `); }
        } else {
            let triedSomething = false;
            let cv = this.getOrCreateValve(state.cv);
            // we could try turning on this valve (if the flow rate is > 0)
            if (cv.flowRate && !state.opened.has(state.cv)) {
                let newState = this.copyState(state);
                newState.path += '!';
                newState.opened.add(state.cv);
                newState.traversed = new Set<string>();
                this.try(time+1, newState);
                triedSomething = true;
            }

            // maybe we should see what valves aren't open (that could be) and only pick connected nodes that might get us there (without coming back through here)

            // or we could try moving to a room
            let dontUse = new Set<string>([state.cv, ...(cv.connected.map((valve) => valve.name))])
            cv.connected.forEach((valve) => {
                // could we maybe NOT move back to a room we just came from?
                dontUse.delete(valve.name);
                if (!state.traversed.has(valve.name) && this.canAccessDisabledValves(valve, dontUse)) {
                    let newState = this.copyState(state);
                    newState.path += valve.name;
                    newState.cv = valve.name;
                    newState.traversed.add(valve.name);
                    this.try(time+1, newState);
                    triedSomething = true;
                }
                dontUse.add(valve.name);
            })

            // if we didn't have anything to try, just spin our wheels until time runs out
            if (!triedSomething) {
                let newState = this.copyState(state);
                newState.path += '.';
                this.try(time+1, newState);
            }
        }
    }

    canAccessDisabledValves(valve: Valve, dontUse: Set<string>) {
        let result = false;
        let newDontUse = new Set<string>([valve.name, ...dontUse, ...(valve.connected.map((v) => v.name))]);
        //console.log(`canAccessDisabledValues ${valve.name} dontUse ${Array.from(dontUse)}`);
        valve.connected.forEach((v) => {
            if (!dontUse.has(v.name)) {
                if (!v.enabled && v.flowRate) result = true;
                else {
                    newDontUse.delete(v.name)
                    return this.canAccessDisabledValves(v, newDontUse);
                }
                newDontUse.add(v.name)
            }
        })
        return result;
    }

    copyState(state: State): State {
        let newReleased = state.released;
        state.opened.forEach((o) => newReleased += this.getOrCreateValve(o).flowRate )

        return { path: state.path, cv: state.cv, released: newReleased, opened: new Set(state.opened), traversed: new Set(state.traversed)};
    }

    debug() {
        Array.from(this.valves.keys()).sort().forEach((k) => {
            let v = this.valves.get(k);
            if (v) console.log(`[${v.name}] flow=${v.flowRate} - ${v.connected.join('/')}`)
        })
    }

    getResult() {
        let result = 0;
        return 0;
    }
}

let c = new C();

let fn = process.argv[2];
const rl = createInterface({ input: createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    c.debug();
    c.solve();
    console.log();
    console.log(`Result: ${c.getResult()}`);
});