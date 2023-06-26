import {makeAutoObservable, runInAction} from "mobx";
import * as fs from "fs";
import {glob} from "glob";
import * as Path from 'path';
import {BinReaderSync} from "./utils/BinReader.ts";
import {CGGraphicInfo} from "./CGGraphicInfo.ts";

interface GraphicData {
  name: string,
  infoList?: CGGraphicInfo[]
}

class BinService {
  binList: GraphicData[] = [];
  animeList: string[] = [];

  async loadBin(path: string) {
    // let files = await fs.promises.readdir(path);
    let files = await glob("bin/**/GraphicInfo*.bin", { cwd: path, root: path, absolute: false, nodir: true })
    let ret: GraphicData[] = [];
    for (const file of files) {
      ret.push({ name: file.replace(/GraphicInfo/i, "Graphic"), infoList: await this.loadInfo(Path.join(path, file)) });
    }
    // console.log(files);
    runInAction(() => {
      this.binList = ret;
    })
  }

  async loadInfo(path: string) {
    console.log('load Info ' + path);
    let fd = await fs.promises.open(path, 'r');
    let binaryStream = new BinReaderSync(fd);
    let info: CGGraphicInfo | null = null;
    let ret: CGGraphicInfo[] = [];
    try {
      while (info = CGGraphicInfo.read(binaryStream)) {
        // console.log(info);
        ret.push(info);
      }
    } catch (e) {
      console.error('load info error', e);
    }
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
