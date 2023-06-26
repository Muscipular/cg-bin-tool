import {BufferedStream} from "./BufferedStream.ts";

export function decode(buf: Buffer) {
  if (buf.readUInt16LE(0) != 17490) {
    throw new Error('incorrect header');
  }
  let ver = buf.readUInt8(2);
  let pad = buf.readUInt8(3);
  let w = buf.readInt32LE(4);
  let h = buf.readInt32LE(8);
  let size = buf.readInt32LE(12);
  if (!(ver & 0x1)) {
    return buf.subarray(16, 16 + size);
  }
  let stream = new BufferedStream({ initialSize: w * h });
  for (let i = 16; i < buf.length && i < size + 16;) {
    let n1 = buf[i++];
    if (n1 < 0x10) {
      let chunk = buf.subarray(i, i + n1);
      stream.write(chunk);
      i += chunk.length;
    } else if (n1 < 0x20) {
      let n2 = buf[i++];
      let chunk = buf.subarray(i, i + ((n1 & 0xf) << 8) + n2);
      stream.write(chunk);
      i += chunk.length;
    } else if (n1 < 0x30) {
      let n2 = buf[i++];
      let n3 = buf[i++];
      let chunk = buf.subarray(i, i + ((n1 & 0xf) << 16) + (n2 << 8) + n3);
      stream.write(chunk);
      i += chunk.length;
    } else if (n1 >= 0x80 && n1 < 0xB0) {
      if (n1 < 0x90) {
        stream.write(Buffer.alloc((n1 & 0xf), buf[i++]));
      } else if (n1 < 0xA0) {
        let n2 = buf[i++];
        stream.write(Buffer.alloc(((n1 & 0xf) << 8) + buf[i++], n2));
      } else if (n1 < 0xB0) {
        let n2 = buf[i++];
        let n3 = buf[i++];
        stream.write(Buffer.alloc(((n1 & 0xf) << 16) + (n3 << 8) + buf[i++], n2));
      }
    } else if (n1 >= 0xC0 && n1 < 0xF0) {
      if (n1 < 0xD0) {
        stream.write(Buffer.alloc((n1 & 0xf), 0));
      } else if (n1 < 0xE0) {
        let n2 = buf[i++];
        stream.write(Buffer.alloc(((n1 & 0xf) << 8) + n2, 0));
      } else if (n1 < 0xF0) {
        let n2 = buf[i++];
        let n3 = buf[i++];
        stream.write(Buffer.alloc(((n1 & 0xf) << 16) + (n2 << 8) + n3, 0));
      }
    } else {
      throw new Error('incorrect data');
    }
  }
  return stream.toBuffer();
}
