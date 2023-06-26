import {BinReaderSync} from "../Utils/BinReader.ts";
import {FileHandle} from "fs/promises";
import * as fs from "fs";

export interface CGGraphicInfo {
  /*LONG	序號;	圖片的編號
DWORD	地址;	指明圖片在數據文件中的起始位置
DWORD	塊長度;	圖片數據塊的大小
LONG	偏移量X;	顯示圖片時，橫坐標偏移X
LONG	偏移量Y;	顯示圖片時，縱坐標偏移Y
LONG	圖片寬度;	...
LONG	圖片高度;	...
BYTE	佔地面積-東;	佔地面積是物件所佔的大小，1就表示占1格
BYTE	佔地面積-南;	同上
BYTE	標誌;	用於地圖，0表示障礙物，1表示可以走上去
BYTE[5]	未知;	在StoneAge中本字段長度為45字節
LONG	地圖編號;	低16位表示在地圖文件裡的編號，高16位可能表示版本，非地圖單位的此項均為0*/
  SeqNo: number;
  Offset: number;
  Length: number;
  OffsetX: number;
  OffsetY: number;
  Width: number;
  Height: number;
  SizeX: number;
  SizeY: number;
  Flag: number;

// [field: MarshalAs(UnmanagedType.ByValArray, SizeConst = 5)]
//   public Padding: number = 0;
//   public Padding2: number = 0;
  MapNo: number;
}

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
    r.readUInt32LE();
    r.readUint8();
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
