import fs from 'fs';
import readline from 'readline';
import { Dijkstra } from '../../lib/dijkstraBetter.js';

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
}

class C {
    dij = new Dijkstra(this.getNeighbors.bind(this));
    constructor() { }

    valves = new Map<string, Valve>();
    best = 0;
    DEBUG = false;

    getNeighbors(node: string) {
        let result = new Map<string, number>();
        this.valves.get(node)?.connected.forEach((v) => result.set(v.name, 1));
        return result;
    }

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
        let state = {path: 'AA', cv: 'AA', released: 0, opened: new Set<string>()};
        this.try(0, state);
    }

    try(time: number, state: State) {
        if (time == MAX_TIME) {
            console.log(`${state.path}, released=${state.released}                         `);
            process.stdout.moveCursor(0, -1);
            if (state.released > this.best) { this.best = state.released; console.log(`${state.path}, released=${state.released}                         `); }
        } else {
            let triedSomething = false;

            // find the shortest path from this room to another unopened room that has a flow rate > 0, navigate there and turn it on

            this.valves.forEach((v, n) => {
                let newTime = time;
                let newState = state;
                // if this valve has flow and is unopened, find the shortest path there
                if (n !== newState.cv && v.flowRate > 0 && !newState.opened.has(n)) {
                    let pathsMap = this.dij.getShortestPaths(newState.cv, false);
                    let shortestRoute = pathsMap.get(n)[0];
                    // simulate moving to this new room and continuing from there
                    if (shortestRoute.length + newTime < MAX_TIME-1) {
                        this.clog(`[${newTime}] [${newState.path}]: trying shortestRoute from ${newState.cv} to ${n}: ${shortestRoute}`);
                        shortestRoute.slice(1).forEach((nextRoom) => {
                            newState = this.copyState(newState);
                            newState.path += nextRoom;
                            newState.cv = nextRoom;
                            newTime++;
                            this.clog(`[${newTime}] [${newState.path}]: ..... moved to ${nextRoom}, released=${newState.released}`);
                        })

                        // and open this room's valve
                        newState = this.copyState(newState);
                        newState.path += '!';
                        newState.opened.add(n);
                        newTime++;
                        this.clog(`[${newTime}] [${newState.path}]: ..... opened ${n}, released=${newState.released}`);

                        this.try(newTime, newState);
                        triedSomething = true;
                    }
                }
            })

            // if we didn't have anything to try, just spin our wheels until time runs out
            if (!triedSomething) {
                let newState = this.copyState(state);
                newState.path += '.';
                this.clog(`[${time}]: ran out of things to try, released=${newState.released}`)
                this.try(time+1, newState);
            }
        }
    }

    clog(msg: string) {
        if (this.DEBUG) console.log(msg);
    }

    copyState(state: State): State {
        let newReleased = state.released;
        state.opened.forEach((o) => newReleased += this.getOrCreateValve(o).flowRate )

        return { path: state.path, cv: state.cv, released: newReleased, opened: new Set(state.opened)};
    }

    debug() {
        Array.from(this.valves.keys()).sort().forEach((k) => {
            let v = this.valves.get(k);
            if (v) console.log(`[${v.name}] flow=${v.flowRate} - ${v.connected.join('/')}`)
        })
    }

    getResult() {
        return this.best;
    }
}

let c = new C();

let fn = process.argv[2];
const rl = readline.createInterface({ input: fs.createReadStream(fn), crlfDelay: Infinity, terminal: false});

rl.on('line', (line) => {
    c.process(line);
})

rl.on('close', () => {
    c.debug();
    c.solve();
    console.log();
    console.log(`Result: ${c.getResult()}`);
});