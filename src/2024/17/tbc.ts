export function toOctB(num: bigint|number, bits: number = Math.log2(Number(num))): string {
    let n = BigInt(num);
    let str = n.toString(2).padStart(bits);
    return str.split('').map((ch,ind)=>(bits-ind-1)%3===0 && ind !== bits-1?ch+' ':ch).join('');
}

export function toOct(num: bigint|number, digits: number): string {
    return BigInt(num).toString(8).padStart(digits);
}

export class TBC {
    ip = 0;
    out: number[] = [];
    mem: number[];
    reg: bigint[] = [0n,0n,0n];
    instr = ['adv', 'bxl', 'bst', 'jnz', 'bxc', 'out', 'bdv', 'cdv'];

    constructor(args: {lines?: string[]}) {
        for (let i=0; i<3; i++) {
            this.reg[i] = BigInt(args.lines[i].match(/\d+/)[0]);
        }

        this.mem = [...args.lines[4].matchAll(/\d+/g)].map(Number);
    }

    halted(): boolean {
        let different = this.out.length > this.mem.length || this.out.some((v, ind) => this.mem[ind] !== v);
        different = false;
        return different || (this.ip < 0 || this.ip >= this.mem.length-1);
    }

    combo(operand: number): bigint {
        if (operand < 0 || operand >= 7) throw new Error(`Operand (${operand}) out of range!`);
        if (operand < 4) return BigInt(operand);
        else return this.reg[operand-4];
    }

    step() {
        if (this.halted()) return;
        let step = 2;

        let opcode = this.mem[this.ip];
        let operand = this.mem[this.ip+1];

        switch (opcode) {
            case 0: // adv (division)
                this.reg[0] = this.reg[0] >> this.combo(operand); // this.reg[0]/(2n**this.combo(operand));
                break;
            case 1: // bxl
                this.reg[1] = this.reg[1] ^ BigInt(operand);
                break;
            case 2: // bst
                this.reg[1] = this.combo(operand) % 8n;
                break;
            case 3: // jnz
                if (this.reg[0]) { step = 0; this.ip = operand; }
                break;
            case 4: // bxc
                this.reg[1] = this.reg[1] ^ this.reg[2];
                break;
            case 5: // out
                this.out.push(Number(this.combo(operand)%8n));
                break;
            case 6: // bdv
                this.reg[1] = this.reg[0] >> this.combo(operand); // this.reg[0]/(2n**this.combo(operand));
                break;
            case 7: // cdv
                this.reg[2] = this.reg[0] >> this.combo(operand); // this.reg[0]/(2n**this.combo(operand));
                break;
        }

        //console.log(`A=${toOct(this.reg[0],3)} B=${toOct(this.reg[1],3)} C=${toOct(this.reg[2],3)}`);
        this.ip += step;
    }

    getLine(i: number): string {
        let opcode = this.mem[i];
        let operand = this.mem[i+1];
        let str = `[${i.toString().padStart(3)}]: (${this.instr[opcode]} ${operand}) // `;
        switch (opcode) {
            case 0: // adv (division / shift right)
                str += `A = A >> ${this.disassembleCombo(operand)}`;
                break;
            case 1: // bxl
                str += `B = B XOR ${toOctB(operand, 3)}b`;
                break;
            case 2: // bst
                str += `B = ${this.disassembleCombo(operand)} AND 111b`;
                break;
            case 3: // jnz
                str += `GOTO ${operand} if (A)`;
                break;
            case 4: // bxc
                str += `B = B XOR C`;
                break;
            case 5: // out
                str += `OUTPUT (${this.disassembleCombo(operand)} AND 111b)`;
                break;
            case 6: // bdv
                str += `B = A >> ${this.disassembleCombo(operand)}`;
                break;
            case 7: // cdv
                str += `C = A >> ${this.disassembleCombo(operand)}`;
                break;
        }
        return str;
    }

    getCurrentCommandValue(): string {
        let opcode = this.mem[this.ip];
        let operand = this.mem[this.ip+1];
        
        let str = `[${this.ip.toString().padStart(3)}]: (${this.instr[opcode]} ${operand}) // ${toOct(this.reg[0],18)} ${toOct(this.reg[1],18)} ${toOct(this.reg[2],18)} // `;
        switch (opcode) {
            case 0: // adv (division / shift right)
                str += `A = ${toOct(this.reg[0] >> this.disassembleComboValue(operand), 16)}`;
                break;
            case 1: // bxl
                str += `B = ${toOctB(this.reg[1])}b XOR ${toOctB(operand, 3)}b`;
                break;
            case 2: // bst
                str += `B = ${toOct(this.disassembleComboValue(operand) & 7n, 16)}`;
                break;
            case 3: // jnz
                str += `GOTO ${operand} if (${this.reg[0]})`;
                break;
            case 4: // bxc
                str += `B = ${toOct(this.reg[1] ^ this.reg[2], 16)}`;
                break;
            case 5: // out
                str += `OUTPUT (${this.out.join(',')}${this.out.length?',':''}${this.disassembleComboValue(operand) & 7n})`;
                break;
            case 6: // bdv
                str += `B = ${toOct(this.reg[0] >> this.disassembleComboValue(operand), 16)}`;
                break;
            case 7: // cdv
                str += `C = ${toOct(this.reg[0] >> this.disassembleComboValue(operand), 16)}`;
                break;
        }
        return str;
    }

    disassembleCombo(operand: number): string {
        if (operand < 4) return operand.toString();
        else if (operand < 7) return 'ABC'.charAt(operand-4);
        else return 'RESERVED';
    }

    disassembleComboValue(operand: number): bigint {
        if (operand < 4) return BigInt(operand);
        else if (operand < 7) return this.reg[operand-4];
        else throw new Error(`RESERVED COMBO VALUE`);
    }

    disassemble(): string[] {
        let result: string[] = [];
        for (let i=0; i<this.mem.length; i+=2) {
            result.push(this.getLine(i));
        }
        return result;
    }

    debug(): string[] {
        return [
            `IP: ${this.ip} opcode: ${this.mem[this.ip]}, operand=${this.mem[this.ip+1]}`,
            `Registers: ${this.reg}`
        ];
    }
}
