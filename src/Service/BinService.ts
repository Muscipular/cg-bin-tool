import {makeAutoObservable, runInAction} from "mobx";
import * as fs from "fs";
import {glob} from "glob";
import * as Path from 'path';
import {CGGraphicInfo} from "./CGGraphicInfo.ts";
import Worker from "../Worker/Wrapper.ts";

interface GraphicData {
  name: string,
  infoList?: CGGraphicInfo[]
}

class BinService {
  binList: string[] = [];
  animeList: string[] = [];
  #map = new Map<string, CGGraphicInfo[]>();

  async loadBin(path: string) {
    // let files = await fs.promises.readdir(path);
    let files = await glob("bin/**/GraphicInfo*.bin", { cwd: path, root: path, absolute: false, nodir: true })
    let ret: GraphicData[] = [];
    for (const file of files) {
      ret.push({ name: file.replace(/GraphicInfo/i, "Graphic"), infoList: await this.loadInfo(Path.join(path, file)) });
    }
    for (const g of ret) {
      this.#map.set(g.name, g.infoList!);
    }
    // console.log(ret);
    // console.log(files);
    runInAction(() => {
      this.binList = ret.map(e => e.name);
    })
  }

  async loadInfo(path: string) {
    console.log('load Info ' + path);
    let ret = await Worker.readGraphicInfo(path);
    // console.log(ret.length, ret[0]);
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
