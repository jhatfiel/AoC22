import { Puzzle } from "../../lib/puzzle.js";

const puzzle = new Puzzle(process.argv[2]);

type Pulse = {
    from: string;
    value: boolean;
}

let HIGH_COUNT = 0;
let LOW_COUNT = 0;

abstract class Module {
    constructor(public name: string) { }

    inputs = new Array<Module>();
    outputs = new Array<Module>();
    queue = new Array<Pulse>();
    lastPulseReceived: Pulse;
    watchState: boolean;
    watchStateNum = 0;

    setWatchState(v: boolean) { this.watchState = v; }

    addOutput(mod: Module) {
        this.outputs.push(mod);
    }

    addInput(mod: Module) {
        this.addInputName(mod.name);
        this.inputs.push(mod);
    }

    receivePulse(pulse: Pulse) {
        if (!this.watchStateNum && pulse.value === this.watchState) {
            this.watchStateNum = numButtonPresses;
            console.debug(`[${numButtonPresses.toString().padStart(6, ' ')}] ${this.name} received ${pulse.value} from ${pulse.from}`);
        }
        this.lastPulseReceived = pulse;
        this.queue.push(pulse);
    }

    hasPulses(): boolean {
        return this.queue.length > 0;
    }

    processPulses() {
        let toProcess = this.queue;
        this.queue = new Array<Pulse>();
        //if (toProcess.length) console.debug(`[${this.name}] Processing pulses ${toProcess.length}`)
        while (toProcess.length) {
            let pulse = toProcess.shift();
            if (pulse.value) HIGH_COUNT++;
            else LOW_COUNT++;
            this.process(pulse);
        }
    }

    addInputName(name: string) {};

    abstract process(pulse: Pulse);

    sendToOutputs(value: boolean) {
        this.outputs.forEach(o => o.receivePulse({from: this.name, value}))
    }
}

class OutputModule extends Module {
    process(pulse: Pulse) { };
}

class BroadcasterModule extends Module {
    process(pulse: Pulse) {
        this.sendToOutputs(false);
    }
}

class FlipFlopModule extends Module {
    state = false;
    process(pulse: Pulse) {
        if (pulse.value === false) {
            this.state = !this.state;
            this.sendToOutputs(this.state);
        }
    }
}

class ConjunctionModule extends Module {
    state = new Map<string, boolean>();

    addInputName(name: string) {
        this.state.set(name, false);
    }

    process(pulse: Pulse) {
        this.state.set(pulse.from, pulse.value);
        if (Array.from(this.state.values()).every(v => v)) {
            this.sendToOutputs(false);
        } else {
            this.sendToOutputs(true);
        }
    }
}

let modMap = new Map<string, Module>();
let numButtonPresses = 0;
let broadcasterModule = new BroadcasterModule('broadcaster');
let outputModule: OutputModule;
modMap.set('broadcaster', broadcasterModule);

await puzzle.run()
    .then((lines: Array<string>) => {
        lines.forEach(line => {
            //console.log(line);
            let arr = line.split(' -> ');
            let name = arr[0];
            if (name.startsWith('%')) {
                name = name.substring(1);
                modMap.set(name, new FlipFlopModule(name));
            } else if (name.startsWith('&')) {
                name = name.substring(1);
                modMap.set(name, new ConjunctionModule(name));
            } else {
                // broadcaster
            }
        });

        lines.forEach(line => {
            let arr = line.split(' -> ');
            let name = arr[0].replace(/[%&]/, '');
            let mod = modMap.get(name);
            let outputArr = arr[1].split(', ');
            outputArr.forEach(outputName => {
                let outputMod = modMap.get(outputName);
                if (!outputMod) {
                    outputModule = new OutputModule(outputName);
                    outputMod= outputModule;
                    modMap.set(outputName, outputMod);
                }
                mod.addOutput(outputMod);
                outputMod.addInput(mod);
            })
        })

        generateGraph(modMap);

        let cqMod = modMap.get('cq'); cqMod.setWatchState(false);
        let dcMod = modMap.get('dc'); dcMod.setWatchState(false);
        let vpMod = modMap.get('vp'); vpMod.setWatchState(false);
        let rvMod = modMap.get('rv'); rvMod.setWatchState(false);
        // the answer is just the period of each of these getting a false - basically, when they all 
        // get a low pulse, that sets ns to false, which sends a low pulse to rx
        // rx is the output in my input
        // rx is fed by ns
        // ns is fed by cq, dc, vp, and rv

        while (numButtonPresses < 1000 || cqMod.watchStateNum*dcMod.watchStateNum*vpMod.watchStateNum*rvMod.watchStateNum === 0) {
            numButtonPresses++;
            //if (numButtonPresses%10000 === 0) console.debug(`[${numButtonPresses.toString().padStart(3, ' ')}] Pressing button`);
            broadcasterModule.process({from: 'button', value: false});
            LOW_COUNT++; // broadcaster process
            while (Array.from(modMap.values()).some(mod => mod.hasPulses())) {
                modMap.forEach((mod, name) => {
                    mod.processPulses();
                })
            }
            if (numButtonPresses === 1000) {
                console.debug(`LOW_COUNT=${LOW_COUNT} HIGH_COUNT=${HIGH_COUNT}`);
                console.log(`Result = ${LOW_COUNT*HIGH_COUNT}`);
            }
        }

        console.log(`Final numButtonPresses=${numButtonPresses}`);
        console.log(`Watch states hit at: ${cqMod.watchStateNum}, ${dcMod.watchStateNum}, ${vpMod.watchStateNum}, ${rvMod.watchStateNum}`)
        console.log(`LCM of numbers is ${Puzzle.lcm(cqMod.watchStateNum, Puzzle.lcm(dcMod.watchStateNum, Puzzle.lcm(vpMod.watchStateNum, rvMod.watchStateNum)))}`)
    });

function generateGraph(modMap: Map<string, Module>) {
    /**
     * Generate input for https://edotor.net/
     */
    let link = 'https://edotor.net';
    console.debug(`Generating input for ${link}`);
    link += '/?engine=dot#digraph%7B%7B'
    modMap.forEach((mod, name) => {
        let shape = 'tripleoctagon';
        if (mod instanceof BroadcasterModule) {
            shape = 'doublecircle';
        } else if (mod instanceof FlipFlopModule) {
            shape = 'invtriangle';
        } else if (mod instanceof ConjunctionModule) {
            shape = 'invhouse';
        }
        link += `${name}%5Bshape%3D${shape}%5D`;
    });
    link += '%7D';
    modMap.forEach((mod, name) => {
        mod.outputs.forEach(outputMod => {
            //console.debug(`${name} -> ${outputMod.name}`);
            link += `${name}-%3E${outputMod.name};`
        })
    });
    link += '%7D'
    console.debug(link);

}