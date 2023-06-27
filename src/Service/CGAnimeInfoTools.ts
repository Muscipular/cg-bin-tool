import {BinReaderSync} from "../Utils/BinReader.ts";
import {CGAnimeInfo, CGType} from "./CGGraphicInfo.ts";

export class CGAnimeInfoTools {
  public static read(r: BinReaderSync) {
    /*DWORD序号;动画序号4
     DWORD 地址;指明在动画信息文件中的地址4
     WORD动作数目;表示该角色有多少个完整的动作(包括各个方向)2
     WORD未知;2*/
    if (r.eof || r.size - r.position < 12) {
      return null;
    }
    // r.read({length: 40})
    let info = { Type: CGType.Anime } as CGAnimeInfo;

    info.AnimateNo = r.readUInt32LE();
    info.Offset = r.readUInt32LE();
    info.Count = r.readUInt16LE();
    info.Padding = r.readUInt16LE();
    return info;
  }
}
