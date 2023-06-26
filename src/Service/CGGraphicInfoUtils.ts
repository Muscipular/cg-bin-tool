import {BinReaderSync} from "../Utils/BinReader.ts";
import {FileHandle} from "fs/promises";
import fs from "fs";
import {CGGraphicInfo} from "./CGGraphicInfo.ts";

export class CGGraphicInfoUtils {
  public static read(r: BinReaderSync) {
    if (r.eof || r.size - r.position < 40) {
      return null;
    }
    // r.read({length: 40})
    let info: CGGraphicInfo = {} as CGGraphicInfo;

    info.SeqNo = r.readInt32LE();
    info.Offset = r.readUInt32LE();
    info.Length = r.readUInt32LE();
    info.OffsetX = r.readInt32LE();
    info.OffsetY = r.readInt32LE();
    info.Width = r.readInt32LE();
    info.Height = r.readInt32LE();
    info.SizeX = r.readUint8();
    info.SizeY = r.readUint8();
    info.Flag = r.readUint8();
    info.Padding = r.readUInt32LE();
    info.Padding2 = r.readUint8();
    info.MapNo = r.readInt32LE();
    return info;
  }

  public static write(fd: FileHandle, info: CGGraphicInfo) {
    let buffer = Buffer.alloc(40, 0, 'binary');
    let n = 0;
    info.SeqNo = buffer.writeInt32LE(n);
    n += 4;
    info.Offset = buffer.writeUint32LE(n);
    n += 4;
    info.Length = buffer.writeUint32LE(n);
    n += 4;
    info.OffsetX = buffer.writeInt32LE(n);
    n += 4;
    info.OffsetY = buffer.writeInt32LE(n);
    n += 4;
    info.Width = buffer.writeInt32LE(n);
    n += 4;
    info.Height = buffer.writeInt32LE(n);
    n += 4;
    info.SizeX = buffer.writeUint8(n);
    n += 1;
    info.SizeY = buffer.writeUint8(n);
    n += 1;
    info.Flag = buffer.writeUint8(n);
    n += 1;
    n += 5;
    info.MapNo = buffer.writeInt32LE(n);
    fs.writeSync(fd.fd, buffer);
  }
}

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
        ret.writeUint8(p1[i][j], i * 4 + j);
      }
      if (i > 0) {
        ret.writeUint8(0xff, i * 4 + 3);
      }
    }
    for (let i = 0; i < 240 - 16; i++) {
      for (let j = 0; j < 3; j++) {
        ret.writeUint8(buffer.readUInt8(i * 3 + j), (i + 16) * 4 + j);
      }
      ret.writeUint8(0xff, (i + 16) * 4 + 3);
    }
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 3; j++) {
        ret.writeUint8(p2[i][j], 240 + i * 4 + j);
      }
      if (i > 0) {
        ret.writeUint8(0xff, 240 + i * 4 + 3);
      }
    }
    return ret;
  }
}