import { Puzzle } from '../../lib/puzzle.js';
import { Simulation } from './simulation.js';

let sim = new Simulation();

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        sim.parseInput(lines);

        // run the simulation now
        //sim.drawScreen();
        //sim.drawCarts();

        while (!sim.crashed) {
            sim.moveCarts();
            sim.debugCarts();

            //sim.drawScreen();
            //sim.drawCarts();

            //puzzle.waitFor(1000);
        }

        // 85,98 is not right
        console.debug(`Done!`);
    });