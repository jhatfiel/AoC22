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

    addOutput(mod: Module) {
        this.outputs.push(mod);
    }

    addInput(mod: Module) {
        this.addInputName(mod.name);
        this.inputs.push(mod);
    }

    receivePulse(pulse: Pulse) {
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
    process(pulse: Pulse) {
        if (pulse.value === false) console.log(`Button press: ${buttonPress} Received low: ${JSON.stringify(pulse)}`)
    };
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
let buttonPress = 0;

await puzzle.run()
    .then((lines: Array<string>) => {
        let broadcasterModule = new BroadcasterModule('broadcaster');
        modMap.set('broadcaster', broadcasterModule);
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
                //console.debug(`${name} processing outputName=${outputName}`)
                let outputMod = modMap.get(outputName);
                if (!outputMod) {
                    outputMod = new OutputModule(outputName);
                    modMap.set(outputName, outputMod);
                }
                mod.addOutput(outputMod);
                outputMod.addInput(mod);
            })
        })


        for (buttonPress=0; ; buttonPress++) {
            //console.debug(`[${n.toString().padStart(3, ' ')}] Pressing button`);
            broadcasterModule.process({from: 'button', value: false});
            LOW_COUNT++; // broadcaster process
            while (Array.from(modMap.values()).some(mod => mod.hasPulses())) {
                modMap.forEach((mod, name) => {
                    mod.processPulses();
                })
            }
        }

        console.debug(`LOW_COUNT=${LOW_COUNT} HIGH_COUNT=${HIGH_COUNT}`);
        console.log(`Result = ${LOW_COUNT*HIGH_COUNT}`)
    });
