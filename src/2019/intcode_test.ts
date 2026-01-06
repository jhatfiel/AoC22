import { IC } from "./intcode.js";
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
      let [name, inputStr, outputStr, memcheckStr] = line.split(':');
      let expectedOutputs = outputStr?outputStr.split(',').map(s => parseInt(s.trim())):[];
      let ic = new IC(instrSet, {input: inputStr?inputStr.split(',').map(s => parseInt(s.trim())):[]});
      let memchecks: {[key: number]: number} = {};
      let memactualStr = '';
      if (memcheckStr) {
        for (const mv of memcheckStr.split(',')) {
          const [k, v] = mv.split('=').map(s => s.trim());
          memchecks[parseInt(k)] = parseInt(v);
        }
      }
      ic.run();

      let success = true;
      if (expectedOutputs.length > 0) {
        if (ic.output.length !== expectedOutputs.length) success = false;
        else {
          for (let i = 0; i < expectedOutputs.length; i++) {
            if (ic.output[i] !== expectedOutputs[i]) success = false;
          }
        }
      }
      for (const k of Object.keys(memchecks).map(s => parseInt(s))) {
        if (ic.mem[k] !== memchecks[k]) success = false;
        memactualStr += `${k}=${ic.mem[k]},`;
      }
      if (!success) {
        console.error(`TEST ${name} FAILED: \nEXPECTED: ${outputStr} : ${memcheckStr??''}\n  ACTUAL: ${ic.output} : ${memactualStr}`);
        fail++;
      } else {
        //console.log(`Test passed: ${name}`);
        pass++;
      }
    }
  }

  // manual test for input halting
  total++;
  let passed = true;
  let ic = new IC('3,0,4,0,99');
  let state = ic.run();
  if (state !== 'INPUT') {
    passed = false;
  } else {
    state = ic.run();
    if (state !== 'INPUT') {
      passed = false;
    } else {
      ic.input.push(123);
      state = ic.run();
      if (state !== 'HALTED' || ic.output.length !== 1 || ic.output[0] !== 123) {
        passed = false;
      }
    }
  }

  if (passed) {
    pass++;
  } else {
    fail++;
    console.error(`TEST INPUT HALT FAILED`);
  }

  // manual test for output halting
  total++;
  passed = true;
  ic = new IC('104,42,99');
  state = ic.run({haltOnOutput: true});
  if (state !== 'OUTPUT' || ic.output.length !== 1 || ic.output[0] !== 42) {
    passed = false;
  } else {
    state = ic.run();
    if (state !== 'HALTED' || ic.output.length !== 1 || ic.output[0] !== 42) {
      passed = false;
    }
  }

  if (passed) {
    pass++;
  } else {
    fail++;
    console.error(`TEST OUTPUT HALT FAILED`);
  }

  console.log(`Intcode tests complete: ${pass} passed, ${fail} failed, ${total} total.`);
})();