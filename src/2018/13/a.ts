import { Puzzle } from '../../lib/puzzle.js';
import { Simulation } from './simulation.js';

let sim = new Simulation();

const puzzle = new Puzzle(process.argv[2]);
await puzzle.run()
    .then((lines: Array<string>) => {
        sim.parseInput(lines);

        // run the simulation now
        while (!sim.crashed) {
            //sim.drawScreen();
            //sim.drawCarts();

            sim.moveCarts();

            //puzzle.waitFor(1000);
        }

        // 85,98 is not right
        console.debug(`Done!`);
    });