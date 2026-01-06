import { appendFileSync } from "fs";
import { IC } from "./intcode.js";
(async () => {
  let benchfile = `./src/2019/intcode_benchmark_results.txt`;
  appendFileSync(benchfile, `\n===== Intcode Benchmark Results Run at ${(new Date()).toISOString()} [${(process.env['HOSTNAME'] ?? process.env['COMPUTERNAME'] ?? 'UNKNOWN').padStart(20, ' ').substring(0, 20)}] =====\n`);
  let lines = await import("fs").then(fs => fs.promises.readFile('data/2019/intcode_benchmark.txt', 'utf-8'));
  console.log('Running intcode benchmark tests...');
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
      const startTime = Date.now();
      ic.run();
      const endTime = Date.now();

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
        console.error(`TEST ${name} FAILED in ${endTime-startTime}ms: \nEXPECTED: ${outputStr} : ${memcheckStr??''}\n  ACTUAL: ${ic.output} : ${memactualStr}`);
        appendFileSync(benchfile, `TEST ${name} FAILED in ${endTime-startTime}ms\n`);
        fail++;
      } else {
        console.log(`Test ${name} ${endTime-startTime}ms`);
        appendFileSync(benchfile, `TEST ${name} PASSED in ${endTime-startTime}ms\n`);
        pass++;
      }
    }
  }

  console.log(`Intcode benchmark complete: ${pass} passed, ${fail} failed, ${total} total.`);
})();