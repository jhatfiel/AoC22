import { IC } from "./intcode";
(async () => {
  let lines = await import("fs").then(fs => fs.promises.readFile('data/2019/intcode.txt', 'utf-8'));
  console.log('Running intcode tests...');
  let pass = 0, fail = 0, total = 0;
  let instrSet: string;
  
  for (const line of lines.split('\n')) {
    if (line.startsWith('//')) continue;
    if (line.trim().length === 0) { 
      instrSet = undefined;
      continue;
    }
    if (instrSet === undefined) {
      instrSet = line.trim();
      //console.log(`PROGRAM: ${instrSet}`);
    } else {
      // Name:[inputs]:[outputs]:[o1=v1,o2=v2,...]
      total++;
      let [name, inputs, outputs, memcheckStr] = line.split(':');
      let inputVals = inputs?inputs.split(',').map(s => parseInt(s.trim())):[];
      let outputVals = outputs?outputs.split(',').map(s => parseInt(s.trim())):[];
      let output: number[] = [];
      let inputIdx = 0;
      let ic = new IC(instrSet, {readint: () => inputVals[inputIdx], writeint: (n: number) => output.push(n)});
      let memchecks: {[key: number]: number} = {};
      if (memcheckStr) {
        for (const mv of memcheckStr.split(',')) {
          const [k, v] = mv.split('=').map(s => s.trim());
          memchecks[parseInt(k)] = parseInt(v);
        }
      }
      ic.run();
      let success = true;
      if (outputVals.length > 0) {
        if (output.length !== outputVals.length) success = false;
        else {
          for (let i = 0; i < outputVals.length; i++) {
            if (output[i] !== outputVals[i]) success = false;
          }
        }
      }
      for (const k of Object.keys(memchecks).map(s => parseInt(s))) {
        if (ic.mem[k] !== memchecks[k]) success = false;
      }
      if (!success) {
        console.error(`TEST FAILED: ${name}: ${inputs} -> ${outputs} : ${memcheckStr}`);
        fail++;
      } else {
        //console.log(`Test passed: ${name}`);
        pass++;
      }
    }
  }

  console.log(`Intcode tests complete: ${pass} passed, ${fail} failed, ${total} total.`);
})();