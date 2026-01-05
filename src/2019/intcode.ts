// io helper
export interface IO {
  readint(): Promise<number>
  writeint(n: number): void
};

interface OP {
  name: string
  size: number
  exec: (par: number[], mode: number[]) => Promise<boolean>
};

// the intcode computer
export class IC {
  mem: number[];
  ip = 0;

  constructor(program: string, private io: IO = {readint: async () => -1, writeint: (n: number) => console.log(`DEFAULT IO: ${n}`)}) {
    //console.log(`PROGRAM: ${program}`)
    this.mem = program.split(',').map(Number);
    // console.log(`----- Program Disassembly -----`)
    // this.disassemble();
    // console.log(`-------------------------------`)
  }

  op: OP[] = [
    undefined, // opcodes start at 1 so 0 is undefined
    // 1
    {name: 'ADD', size: 4, exec: async (par: number[], mode: number[]) => {
      this.mem[par[2]] = this.resolve(par, mode, 0) + this.resolve(par, mode, 1);
      return false;
    }},
    // 2
    {name: 'MUL', size: 4, exec: async (par: number[], mode: number[]) => {
      this.mem[par[2]] = this.resolve(par, mode, 0) * this.resolve(par, mode, 1);
      return false;
    }},
    // 3
    {name: 'IN', size: 2, exec: async (par: number[], mode: number[]) => {
      this.mem[par[0]] = await this.io.readint();
      return false;
    }},
    // 4
    {name: 'OUT', size: 2, exec: async (par: number[], mode: number[]) => {
      this.io.writeint(this.resolve(par, mode, 0));
      return false;
    }},
    // 5
    {name: 'JIT', size: 3, exec: async (par: number[], mode: number[]) => {
      const bool = this.resolve(par, mode, 0) != 0;
      if (bool) this.ip = this.resolve(par, mode, 1);
      return bool;
    }},
    // 6
    {name: 'JIF', size: 3, exec: async (par: number[], mode: number[]) => {
      const bool = this.resolve(par, mode, 0) == 0;
      if (bool) this.ip = this.resolve(par, mode, 1);
      return bool;
    }},
    // 7
    {name: 'LT', size: 4, exec: async (par: number[], mode: number[]) => {
      const bool = this.resolve(par, mode, 0) < this.resolve(par, mode, 1);
      this.mem[par[2]] = bool?1:0;
      return false;
    }},
    // 8
    {name: 'EQ', size: 4, exec: async (par: number[], mode: number[]) => {
      const bool = this.resolve(par, mode, 0) == this.resolve(par, mode, 1);
      this.mem[par[2]] = bool?1:0;
      return false;
    }},
  ]

  debugResolve(par: number[], mode: number[], n: number): string {
    let result = '';
    switch (mode[n]) {
      case 0:
        result = `${par[n]}=[${this.mem[par[n]]}]`;
        break;
      case 1:
        result = `[${par[n]}]`
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
        result = this.mem[par[n]]; // single dereference
        break;
      case 1:
        result = par[n]; // literal value
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

  async tick(debug = false): Promise<boolean> {
    const instr = this.mem[this.ip];
    const {opcode, op, mode} = this.decodeInstr(instr);
    //console.debug(`IP=${this.ip} opcode=${opcode}`);
    if (opcode === 99 || op === undefined) return false;
    const par = this.mem.slice(this.ip+1, this.ip+op.size);
    if (debug) {
      const {disassembly} = this.disassembleAt(this.ip);
      console.debug(`IP [${this.ip.toString().padStart(4)}]: ${disassembly}`);
    }
    const jumped = await op.exec(par, mode);

    if (!jumped) this.ip += op.size;
    return true;
  }

  async run(debug = false): Promise<number> {
    while (await this.tick(debug))
      ;
    return this.mem[0];
  }
}