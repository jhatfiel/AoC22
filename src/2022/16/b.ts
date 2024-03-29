import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { Dijkstra } from '../../lib/dijkstraBetter.js';

class Valve {
    constructor(public name: string) {};
    enabled = false;
    flowRate = 0;
    connected = Array<Valve>();

    toString() { return this.name; }
}

const MAX_TIME = 26;

type State = {
    uPath: string;
    uCur: string;
    uNext?: Array<string>;
    ePath: string;
    eCur: string;
    eNext?: Array<string>;
    released: number;
    opened: Set<string>;
}

class C {
    constructor() { }

    valves = new Map<string, Valve>();
    best = 0;
    dij = new Dijkstra(this.getNeighbors.bind(this));
    DEBUG = false;
    maxFlow = 0;

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
        let state = {uPath: '', ePath: '', uCur: 'AA', eCur: 'AA', released: 0, opened: new Set<string>()};

        this.valves.forEach((v, n) => {
            this.maxFlow += v.flowRate;
        });

        this.try(0, state);
    }

    try(time: number, state: State) {
        if (time == MAX_TIME) {
            if (process.stdout.moveCursor) {
                console.log(`${state.uPath} / ${state.ePath}, released=${state.released}                         `);
                process.stdout.moveCursor(0, -1);
            }
            if (state.released > this.best) { this.best = state.released; console.log(`${state.uPath} / ${state.ePath}, released=${state.released}                         `); }
        } else {
            // if u has no planned rooms, see if we can find potential rooms to move u to, and recurse
            if (state.uNext === undefined) {
                let newState = this.copyState(state, false);
                let triedSomething = false;
                //Array.from(this.valves.values()).sort((a,b) => b.flowRate-a.flowRate).forEach((v) => {
                this.valves.forEach((v) => {
                    // eNext is empty
                    // or eNext is not going to end at this n
                    // or eNext length is 0 && eCur = n
                    if (v.flowRate > 0 && !state.opened.has(v.name) &&
                            (!state.eNext ||
                             (state.eNext.length > 0 && state.eNext[state.eNext.length-1] !== v.name) ||
                             (state.eNext.length == 0 && state.eCur !== v.name)
                            )
                        ) {
                        newState.uNext = this.dij.pathTo(newState.uCur, v.name, false)[0].slice(1);
                        // if we were to think about jumping ahead to when we get to the next location and turning on that valve, then "instantly" turn on all others, is it worth pursuing?
                        if (time+newState.uNext.length < MAX_TIME-1) {
                            this.clog(`[${time}] [${newState.uPath}] [${newState.uPath}]: trying u shortestRoute from ${newState.uCur} to ${v.name}: ${newState.uNext}`);
                            this.try(time, newState);
                            triedSomething = true;
                        }
                    }
                })
                // if we didn't have anything to try, just spin our wheels until time runs out
                if (!triedSomething) {
                    newState.uNext = new Array<string>();
                    this.try(time, newState);
                }
            } else if (state.eNext === undefined) {
                // if e has no planned rooms, see if we can find potential rooms to move e to, and recurse
                let newState = this.copyState(state, false);
                let triedSomething = false;
                //Array.from(this.valves.values()).sort((a,b) => b.flowRate-a.flowRate).forEach((v) => {
                this.valves.forEach((v) => {
                    if (v.flowRate > 0 && !state.opened.has(v.name)) this.clog(`[${time}] [${newState.uPath}]: should e try shortestRoute from ${newState.eCur} to ${v.name}?`);
                    if (v.flowRate > 0 && !state.opened.has(v.name) &&
                            (!state.uNext ||
                             (state.uNext.length > 0 && state.uNext[state.uNext.length-1] !== v.name) ||
                             (state.uNext.length == 0 && state.uCur !== v.name)
                            )
                        ) {
                        newState.eNext = this.dij.pathTo(newState.eCur, v.name, false)[0].slice(1);
                        if (time+newState.eNext.length < MAX_TIME-1) {
                            this.clog(`[${time}] [${newState.ePath}]: trying e shortestRoute from ${newState.eCur} to ${v.name}: ${newState.eNext}`);
                            this.try(time, newState);
                            triedSomething = true;
                        }
                    }
                })
                // if we didn't have anything to try, just spin our wheels until time runs out
                if (!triedSomething) {
                    newState.eNext = new Array<string>();
                    this.try(time, newState);
                }
            } else {
                // at this point, we should either be at a room we need to turn a valve on, or we should have some "next" path to follow
                // OR, we have nothing to do and we'll just spin.  Either way, it's deterministic, so we just do what we're supposed to do and try(time+1)

                // we can save a lot of time here by chopping out any potential path where it's just not possible to beat our best score so far
                // even if all valves magically were on
                let timeLeft = MAX_TIME-time;
                let potentialRelease = timeLeft*this.maxFlow;
                if (state.released + potentialRelease < this.best) {
                    time = MAX_TIME-1;
                } else {
                    let newState = this.copyState(state); // we have increased the state.released by what is currently open
                    time++;

                    // if u are at the next planned room, open the valve
                    if (state.uNext.length === 0) {
                        //newState.uPath += '<>';
                        if (!newState.opened.has(newState.uCur)) newState.uPath += '+' + newState.uCur;
                        newState.opened.add(newState.uCur);
                        newState.uNext = undefined;

                        this.clog(`[${time}] [${newState.uPath}]: u opened ${newState.uCur}, released=${newState.released}`);
                    } else if (state.uNext.length >= 1) {
                        // move along the path to the new room
                        newState.uCur = newState.uNext!.shift()!;
                        //newState.uPath += newState.uCur;
                        this.clog(`[${time}] [${newState.uPath}]: u moved ${newState.uCur}, released=${newState.released}`);
                    }

                    // if e is at the next planned room, open the valve
                    if (state.eNext.length === 0) {
                        //newState.ePath += '<>';
                        if (!newState.opened.has(newState.eCur)) newState.ePath += '+' + newState.eCur;
                        newState.opened.add(newState.eCur);
                        newState.eNext = undefined;

                        this.clog(`[${time}] [${newState.ePath}]: e opened ${newState.eCur}, released=${newState.released}`);
                    } else if (state.eNext.length >= 1) {
                        // move along the path to the new room
                        newState.eCur = newState.eNext!.shift()!;
                        //newState.ePath += newState.eCur;
                        this.clog(`[${time}] [${newState.ePath}]: e moved ${newState.eCur}, released=${newState.released}`);
                    }

                    this.try(time, newState);
                }
            }
        }
    }

    clog(msg: string) {
        if (this.DEBUG) console.log(msg);
    }

    copyState(state: State, advance=true): State {
        let newReleased = state.released;
        if (advance) state.opened.forEach((o) => newReleased += this.getOrCreateValve(o).flowRate )

        let newState =  { uPath: state.uPath, uCur: state.uCur,
                          ePath: state.ePath, eCur: state.eCur,
                          released: newReleased, opened: new Set(state.opened)} as State;
        if (state.uNext) newState.uNext = [...state.uNext];
        if (state.eNext) newState.eNext = [...state.eNext];
        return newState;
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