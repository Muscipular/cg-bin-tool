import {makeAutoObservable, runInAction} from "mobx";
import * as fs from "fs";
import {ReadStream} from "fs";
import {glob} from "glob";
import {FileHandle} from "fs/promises";
import * as Path from 'path';

class CGGraphicInfo {
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
  public SeqNo: number = 0;
  public Offset: number = 0;
  public Length: number = 0;
  public OffsetX: number = 0;
  public OffsetY: number = 0;
  public Width: number = 0;
  public Height: number = 0;
  public SizeX: number = 0;
  public SizeY: number = 0;
  public Flag: number = 0;

// [field: MarshalAs(UnmanagedType.ByValArray, SizeConst = 5)]
//   public Padding: number = 0;
//   public Padding2: number = 0;
  public MapNo: number = 0;

  public static async read(r: AsyncBinaryStream) {
    // r.read({length: 40})
    var info = new CGGraphicInfo();

    info.SeqNo = await r.readInt32LE();
    info.Offset = await r.readUInt32LE();
    info.Length = await r.readUInt32LE();
    info.OffsetX = await r.readInt32LE();
    info.OffsetY = await r.readInt32LE();
    info.Width = await r.readInt32LE();
    info.Height = await r.readInt32LE();
    info.SizeX = await r.readUInt8();
    info.SizeY = await r.readUInt8();
    info.Flag = await r.readUInt8();
    await r.readUInt32LE();
    await r.readUInt8();
    info.MapNo = await r.readInt32LE();
    return info;
  }

  public static async write(fd: FileHandle, info: CGGraphicInfo) {
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
    await fd.write(buffer, 0, 40);
  }
}

interface GraphicData {
  name: string,
  infoList?: CGGraphicInfo[]
}

class BinService {
  binList: GraphicData[] = [];
  animeList: string[] = [];

  async loadBin(path: string) {
    // let files = await fs.promises.readdir(path);
    let files = await glob("bin/**/GraphicInfo*.bin", {cwd: path, root: path, absolute: false, nodir: true})
    let ret: GraphicData[] = [];
    for (const file of files) {
      ret.push({name: file.replace(/GraphicInfo/i, "Graphic"), infoList: await this.loadInfo(Path.join(path, file))});
    }
    // console.log(files);
    runInAction(() => {
      this.binList = ret;
    })
  }

  async loadInfo(path: string) {
    console.log('load Info ' + path);
    let fd = await fs.promises.open(path, 'r');
    let stream = fd.createReadStream();
    let binaryStream = new AsyncBinaryStream(stream);
    let info: CGGraphicInfo | null = null;
    let ret: CGGraphicInfo[] = [];
    try {
      while (info = await CGGraphicInfo.read(binaryStream)) {
        // console.log(info);
        ret.push(info);
      }
    } catch (e) {
      console.error('load info error', e);
    }
    stream.close();
    await fd.close();
    return ret;
  }

  constructor() {
    makeAutoObservable(this)
  }
}

let binService = new BinService();
// @ts-ignore
window.binService = binService;
export default binService;