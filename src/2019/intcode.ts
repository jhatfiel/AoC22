// the intcode computer
export class IC {
  mem: number[];
  ip = 0;
  OP: {name: string, size: number, exec: (par: number[]) => void, debug: (par: number[]) => string}[] = [
    undefined, // opcodes start at 1 so 0 is undefined
    {name: 'ADD', size: 4, exec: ([par1L, par2L, resL]: number[]) => {
      this.mem[resL] = this.mem[par1L] + this.mem[par2L];
    }, debug: ([par1L, par2L, resL]: number[]) => {
      return `ADD ${this.mem[par1L]}@${par1L} ${this.mem[par2L]}@${par2L} @${resL}`;
    }},
    {name: 'MUL', size: 4, exec: ([par1L, par2L, resL]: number[]) => {
      this.mem[resL] = this.mem[par1L] * this.mem[par2L];
    }, debug: ([par1L, par2L, resL]: number[]) => {
      return `MUL ${this.mem[par1L]}@${par1L} ${this.mem[par2L]}@${par2L} @${resL}`;
    }}
  ]

  constructor(line: string) {
    this.mem = line.split(',').map(Number);
  }

  debug() {
    for (let i=0; i<this.mem.length;) {
      const opcode = this.mem[i];
      const op = this.OP[opcode];
      const opSize = op?.size ?? 1;
      let instrLine = 'EXIT';
      if (op) {
        const par = this.mem.slice(i+1, i+op.size);
        instrLine = op.debug(par);
      }
      console.debug(`[${i.toString().padStart(4)}]: ${instrLine}`);

      i += opSize;
    }
  }

  tick(): boolean {
    const opcode = this.mem[this.ip];
    //console.debug(`IP=${this.ip} opcode=${opcode}`);
    if (opcode === 99) return false;
    const op = this.OP[opcode];
    const par = this.mem.slice(this.ip+1, this.ip+op.size);
    //console.debug(`[${this.ip.toString().padStart(4)}]: ${op?.debug(par)}`);
    op.exec(par);

    this.ip += op.size;
    return true;
  }

  run(): number {
    while (this.tick())
      ;
    return this.mem[0];
  }
}