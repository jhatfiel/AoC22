import { Puzzle } from '../../lib/puzzle.js';
import { SimulationController } from './simulationController.js';

const puzzle = new Puzzle(process.argv[2]);
const simController = new SimulationController(false);
await puzzle.run()
    .then((lines: Array<string>) => {
        // Initialize the simulation
        simController.simulate(lines);
    });