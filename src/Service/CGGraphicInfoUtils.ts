import {BinReaderSync} from "../Utils/BinReader.ts";
import {FileHandle} from "fs/promises";
import fs from "fs";
import {CGGraphicInfo, CGType} from "./CGGraphicInfo.ts";

export class CGGraphicInfoUtils {
  public static read(r: BinReaderSync) {
    if (r.eof || r.size - r.position < 40) {
      return null;
    }
    // r.read({length: 40})
    let info: CGGraphicInfo = { Type: CGType.Graphic } as CGGraphicInfo;

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

