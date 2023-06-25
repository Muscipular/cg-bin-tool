import {FileHandle} from "fs/promises";
import * as fs from "fs";

type ReadMethods = 'readUInt8' |
  'readUint8' |
  'readUInt16LE' |
  'readUint16LE' |
  'readUInt16BE' |
  'readUint16BE' |
  'readUInt32LE' |
  'readUint32LE' |
  'readUInt32BE' |
  'readUint32BE' |
  'readInt8' |
  'readInt16LE' |
  'readInt16BE' |
  'readInt32LE' |
  'readInt32BE' |
  'readFloatLE' |
  'readFloatBE' |
  'readDoubleLE' |
  'readDoubleBE';

class BinReader {
  set position(value: number) {
    if (value > this.#position && value < this.#position + this.#bufferSize) {
      this.#bufferOffset += value - this.position;
    } else {
      this.#position = value;
      this.#bufferOffset = -1;
    }
  }

  get position(): number {
    return this.#position + this.#bufferOffset;
  }

  get size(): number {
    return this.#size;
  }

  get eof(): boolean {
    return this.position >= this.#size;
  }

  #fd: FileHandle;
  #size: number;
  #position = 0;
  #buffer: Buffer = Buffer.alloc(16 * 1024);
  #bufferOffset = -1;
  #bufferSize = 0;

  constructor(fd: FileHandle) {
    this.#fd = fd;
    let stats = fs.fstatSync(fd.fd);
    this.#size = stats.size;
  }

  private async tryFetchBuffer() {
    if (this.#position >= this.#size) {
      return -1;
    }
    this.#position += this.#bufferSize;
    let { bytesRead } = await this.#fd.read(this.#buffer, 0, this.#buffer.length, this.#position);
    this.#bufferOffset = 0;
    this.#bufferSize = bytesRead;
    return bytesRead;
  }

  async #readBuffer(sz: number, needCopy = false) {
    let buf: Buffer[] = [];
    while (sz > 0) {
      if (this.#bufferOffset < 0 || this.#bufferOffset >= this.#bufferSize) {
        if (await this.tryFetchBuffer() <= 0) {
          break;
        }
      }
      let remain = this.#bufferSize - this.#bufferOffset;
      if (sz > remain) {
        buf.push(Buffer.from(this.#buffer.subarray(this.#bufferOffset)));
        this.#bufferOffset = -1;
        sz -= remain;
      } else {
        let buffer = this.#buffer.subarray(this.#bufferOffset, this.#bufferOffset + sz);
        if (!needCopy && buf.length == 0) {
          this.#bufferOffset += sz;
          sz = 0;
          return buffer;
        }
        buf.push(Buffer.from(buffer));
        this.#bufferOffset += sz;
        sz = 0;
      }
    }
    return Buffer.concat(buf);
  }

  private async readNumber(s: ReadMethods, sz: number) {
    let buffer = await this.#readBuffer(sz);
    if (buffer.length < sz) {
      throw new Error('eof');
    }
    return buffer[s]();
  }

  public readUint8() {
    return this.readNumber('readUint8', 1);
  }

  public async readInt8() {
    return this.readNumber('readInt8', 1);
  }

  public async readInt16LE() {
    return this.readNumber('readInt16LE', 2);
  }

  public async readInt16BE() {
    return this.readNumber('readInt16BE', 2);
  }

  public async readUInt16LE() {
    return this.readNumber('readUInt16LE', 2);
  }

  public async readUInt16BE() {
    return this.readNumber('readUInt16BE', 2);
  }

  public async readInt32LE() {
    return this.readNumber('readInt32LE', 4);
  }

  public async readInt32BE() {
    return this.readNumber('readInt32BE', 4);
  }

  public async readUInt32LE() {
    return this.readNumber('readUInt32LE', 4);
  }

  public async readUInt32BE() {
    return this.readNumber('readUInt32BE', 4);
  }

  public async readFloatLE() {
    return this.readNumber('readFloatLE', 4);
  }

  public async readFloatBE() {
    return this.readNumber('readFloatBE', 4);
  }

  public async readDoubleLE() {
    return this.readNumber('readDoubleLE', 8);
  }

  public async readDoubleBE() {
    return this.readNumber('readDoubleBE', 8);
  }

  public async readBuffer(sz: number) {
    return this.#readBuffer(sz, true);
  }
}

export default BinReader;
