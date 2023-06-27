import fs from "fs";

export class CGPUtils {
  static read(fd: number) {
    let buffer = Buffer.alloc(708);
    let ret = Buffer.alloc(1024, 0);
    fs.readSync(fd, buffer);
    const p1 = [
      [0, 0, 0], [0, 0, 0x80], [0, 0x80, 0], [0, 0x80, 0x80], [0x80, 0, 0], [0x80, 0, 0x80], [0x80, 0x80, 0], [0xc0, 0xc0, 0xc0],
      [0xc0, 0xdc, 0xc0], [0xf0, 0xca, 0xa6], [0, 0, 0xde], [0, 0x5f, 0xff], [0xa0, 0xff, 0xff], [0xd2, 0x5f, 0], [0xff, 0xd2, 0x50], [0x28, 0xe1, 0x28],
    ];
    const p2 = [
      [0x96, 0xc3, 0xf5], [0x5f, 0xa0, 0x1e], [0x46, 0x7d, 0xc3], [0x1e, 0x55, 0x9b], [0x37, 0x41, 0x46], [0x1e, 0x23, 0x28], [0xf0, 0xfb, 0xff], [0xa5, 0x6e, 0x3a],
      [0x80, 0x80, 0x80], [0x00, 0x00, 0xff], [0, 0xff, 0], [0, 0xff, 0xff], [0xff, 0, 0], [0xff, 0x80, 0xff], [0xff, 0xff, 0], [0xff, 0xff, 0xff],
    ]
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 3; j++) {
        ret.writeUint8(p1[i][j], i * 4 + (2 - j));
      }
      if (i > 0) {
        ret.writeUint8(0xff, i * 4 + 3);
      }
    }
    for (let i = 0; i < 240 - 16; i++) {
      for (let j = 0; j < 3; j++) {
        ret.writeUint8(buffer.readUInt8(i * 3 + j), (i + 16) * 4 + (2 - j));
      }
      ret.writeUint8(0xff, (i + 16) * 4 + 3);
    }
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 3; j++) {
        ret.writeUint8(p2[i][j], 240 * 4 + i * 4 + (2 - j));
      }
      if (i > 0) {
        ret.writeUint8(0xff, 240 * 4 + i * 4 + 3);
      }
    }
    return ret;
  }

  static convert(buffer: Buffer, base: Buffer) {
    let ret = Buffer.alloc(1024, 0);
    base.copy(ret);
    for (let i = 0; i < 256; i++) {
      for (let j = 0; j < 3; j++) {
        if (i * 3 + j >= buffer.length) {
          ret[3] = 0;
          return ret;
        }
        ret.writeUint8(buffer.readUInt8(i * 3 + j), (i) * 4 + (2 - j));
      }
      ret.writeUint8(0xff, (i) * 4 + 3);
    }
    ret[3] = 0;
    return ret;
  }
}
