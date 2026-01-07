export type CPU_State = 'HALTED' | 'RUNNING' | 'OUTPUT' | 'INPUT' | 'INPUT_HALT';
interface OP {
  name: string
  size: number
  state?: CPU_State
  exec: (par: number[], mode: number[]) => boolean
};

interface Config {
  debug?: boolean;
  singleStep?: boolean;
  haltOnOutput?: boolean;
  haltOnInput?: boolean;
  input?: number[];
  output?: number[];
}

// the intcode computer
export class IC {
  mem: number[];
  input: number[];
  output: number[];

  ip = 0;
  rb = 0;

  haltedIp = -1;

  constructor(program: string, props: {input?: number[], output?: number[]} = {}) {
    //console.log(`PROGRAM: ${program}`)
    this.mem = program.split(',').map(Number);
    this.input = props.input ?? [];
    this.output = props.output ?? [];
    // console.log(`----- Program Disassembly -----`)
    // this.disassemble();
    // console.log(`-------------------------------`)
  }

  op: OP[] = [
    undefined, // opcodes start at 1 so 0 is undefined
    // 1
    {name: 'ADD', size: 4, exec: (par: number[], mode: number[]) => {
      this.mem[par[2] + (mode[2]?this.rb:0)] = this.resolve(par, mode, 0) + this.resolve(par, mode, 1);
      return false;
    }},
    // 2
    {name: 'MUL', size: 4, exec: (par: number[], mode: number[]) => {
      this.mem[par[2] + (mode[2]?this.rb:0)] = this.resolve(par, mode, 0) * this.resolve(par, mode, 1);
      return false;
    }},
    // 3
    {name: 'IN', size: 2, state: 'INPUT', exec: (par: number[], mode: number[]) => {
      this.mem[par[0] + (mode[0]?this.rb:0)] = this.input.shift();
      return false;
    }},
    // 4
    {name: 'OUT', size: 2, state: 'OUTPUT', exec: (par: number[], mode: number[]) => {
      this.output.push(this.resolve(par, mode, 0))
      return false;
    }},
    // 5
    {name: 'JIT', size: 3, exec: (par: number[], mode: number[]) => {
      const bool = this.resolve(par, mode, 0) != 0;
      if (bool) this.ip = this.resolve(par, mode, 1);
      return bool;
    }},
    // 6
    {name: 'JIF', size: 3, exec: (par: number[], mode: number[]) => {
      const bool = this.resolve(par, mode, 0) == 0;
      if (bool) this.ip = this.resolve(par, mode, 1);
      return bool;
    }},
    // 7
    {name: 'LT', size: 4, exec: (par: number[], mode: number[]) => {
      const bool = this.resolve(par, mode, 0) < this.resolve(par, mode, 1);
      this.mem[par[2] + (mode[2]?this.rb:0)] = bool?1:0;
      return false;
    }},
    // 8
    {name: 'EQ', size: 4, exec: (par: number[], mode: number[]) => {
      const bool = this.resolve(par, mode, 0) == this.resolve(par, mode, 1);
      this.mem[par[2] + (mode[2]?this.rb:0)] = bool?1:0;
      return false;
    }},
    // 9
    {name: 'RB', size: 2, exec: (par: number[], mode: number[]) => {
      this.rb += this.resolve(par, mode, 0);
      return false;
    }},
  ]

  debugResolve(par: number[], mode: number[], n: number): string {
    let result = '';
    switch (mode[n]) {
      case 0:
        result = `${par[n]}=[${this.resolve(par, mode, n)}]`;
        break;
      case 1:
        result = `[${this.resolve(par, mode, n)}]`
        break;
      case 2:
        result = `~${par[n]}=${this.rb+par[n]}=[${this.resolve(par, mode, n)}]`;
        break;
      default:
        throw new Error(`Encountered unknown mode for resolve`)
    }
    return result;
  }

  resolve(par: number[], mode: number[], n: number): number {
    let result: number;
    switch (mode[n]) {
      case 0:
        result = this.mem[par[n]]??0; // single dereference
        break;
      case 1:
        result = par[n]; // literal value
        break;
      case 2:
        result = this.mem[this.rb + par[n]]??0; // relative
        break;
      default:
        throw new Error(`Encountered unknown mode for resolve`)
    }
    return result;
  }

  decodeInstr(instr: number): {opcode: number, op: OP, mode: number[]} {
    const opcode = instr % 100;
    const op = this.op[opcode];
    const mode: number[] = [];
    if (op) {
      instr = Math.floor(instr/100);
      for (let i=0; i<op.size; i++) {
        mode.push(instr%10);
        instr = Math.floor(instr/10);
      }
    }

    return {opcode, op, mode};
  }

  disassemble() {
    for (let i=0; i<this.mem.length;) {
      const {opSize, disassembly} = this.disassembleAt(i);
      console.debug(`[${i.toString().padStart(4)}]: ${disassembly}`);
      i += opSize;
    }
  }

  disassembleAt(ip: number): {opSize: number, disassembly: string} {
    const instr = this.mem[ip];
    const {opcode, op, mode} = this.decodeInstr(instr);
    const opSize = op?.size ?? 1;
    let disassembly = instr===99?'EXIT':`[${instr}]`;
    if (op) {
      const par = this.mem.slice(ip+1, ip+op.size);
      //disassembly = op.disasm(par, mode);
      disassembly = op.name;
      for (let i=0; i<op.size-1; i++) {
        disassembly += ` ${this.debugResolve(par, mode, i)}`;
      }
    }

    return {opSize, disassembly};
  }

  tick(config: Config = {}): CPU_State {
    const instr = this.mem[this.ip];
    const {opcode, op, mode} = this.decodeInstr(instr);
    //console.debug(`IP=${this.ip} opcode=${opcode}`);
    if (opcode === 99 || op === undefined) return 'HALTED';
    let state = op.state??'RUNNING';
    const par = this.mem.slice(this.ip+1, this.ip+op.size);
    if (config.debug) {
      const {disassembly} = this.disassembleAt(this.ip);
      console.debug(`IP [${this.ip.toString().padStart(4)}]: ${disassembly}`);
    }

    // if we want to break in input and we are not resuming from an input halt
    // we need to break in input before the input occurs
    //console.log(`haltedIp=${this.haltedIp}, ip=${this.ip}, input.length=${this.input.length}`)
    if ((this.haltedIp !== this.ip && state === 'INPUT' && config.haltOnInput) ||
        (state === 'INPUT' && this.input.length === 0)) {
      this.haltedIp = this.ip;
      return 'INPUT_HALT';
    }

    const jumped = op.exec(par, mode);
    this.haltedIp = -1; // reset haltedIp on successful exec

    if (!jumped) this.ip += op.size;
    return state;
  }

  run(config: Config = {}): CPU_State {
    while (true) {
      let state = this.tick(config)
      if ( state === 'INPUT_HALT') return 'INPUT';
      if ( state === 'HALTED' ||
           config.singleStep || 
          (config.haltOnOutput && state === 'OUTPUT')) return state;
    }
  }
}