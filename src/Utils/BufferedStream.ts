import { Duplex, DuplexOptions } from 'stream';

declare type ITypedArray = Uint8Array | Uint16Array | Uint32Array;
declare type IDataType = string | Buffer | ITypedArray;

export class BufferedStream extends Duplex {
  //@ts-ignore
  get writable(): boolean {
    return this._writable;
  }

  get position(): number {
    return this._position;
  }

  set position(value: number) {
    this._position = value;
  }

  get length(): number {
    return this._length;
  }

  private _writable: boolean = true;
  private buffer: Buffer;
  private _length: number = 0;
  private _position: number = 0;

  constructor(opts?: DuplexOptions & { initialSize?: number, buffer?: Buffer, readonly?: boolean }) {
    super();
    if (opts && opts.buffer) {
      this.buffer = opts.readonly ? opts.buffer : Buffer.from(opts.buffer.slice(0));
      this._writable = !opts.readonly;
      this._length = this.buffer.length;
    } else {
      this.buffer = Buffer.alloc(opts && opts.initialSize || 1024 * 1024 * 16);
    }
  }

  _write(chunk: IDataType, encoding: string, callback: (error?: (Error | null)) => void) {
    if (typeof chunk === 'string') {
      chunk = Buffer.from(chunk, encoding as BufferEncoding);
    }
    let dataView = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
    let buffer1 = this.buffer;
    if (buffer1.byteLength - this._length < dataView.byteLength) {
      this.extendBuffer(dataView.byteLength);
    }
    dataView.copy(this.buffer, this._length, 0, dataView.byteLength);
    this._length += dataView.byteLength;
    callback();
  }

  _writev(chunks: Array<{ chunk: any; encoding: string }>, callback: (error?: (Error | null)) => void) {
    if (chunks.length > 1) {
      let totalSize = chunks.reduce((o, {
        chunk,
        encoding,
      }) => o + Buffer.byteLength(chunk, encoding as BufferEncoding), 0);
      if (totalSize + this._length > this.buffer.byteLength) {
        this.extendBuffer(totalSize);
      }
    }
    for (const { chunk, encoding } of chunks) {
      this._write(chunk, encoding, _error => 0);
    }
    callback();
  }

  private extendBuffer(totalSize: number) {
    let buffer1 = this.buffer;
    if (buffer1.byteLength > totalSize) {
      this.buffer = Buffer.alloc(buffer1.byteLength * 2);
    } else {
      this.buffer = Buffer.alloc(totalSize * 2);
    }
    buffer1.copy(this.buffer, 0, 0, this._length);
  }

  // @ts-ignore
  get availableLength() {
    return this.length - this.position;
  }

  _read(size: number) {
    if (this._position >= this.length) {
      this.push(null);
    }
    let maxSize = Math.min(size, this.length - this.position);
    let buffer = Buffer.from(this.buffer.buffer, this._position, maxSize);
    this._position += maxSize;
    this.push(buffer);
  }

  _final(callback: (error?: (Error | null)) => void) {
    callback();
  }

  close() {
    this._writable = false;
    this.readable = false;
  }

  toBuffer() {
    return Buffer.from(this.buffer.buffer, this.buffer.byteOffset, this._length);
  }
}
