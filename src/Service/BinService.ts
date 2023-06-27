import {makeAutoObservable, runInAction} from "mobx";
import * as fs from "fs";
import {glob} from "glob";
import * as Path from 'path';
import {CGGraphicInfo} from "./CGGraphicInfo.ts";
import Worker from "../Worker/Wrapper.ts";

import {CGPUtils} from "./CGPUtils.ts";

interface GraphicData {
  name: string,
  infoList?: CGGraphicInfo[]
}

class BinService {
  binList: string[] = [];
  cgpList: string[] = [];
  #cgpMap = new Map<string, Buffer>();
  animeList: string[] = [];
  #map = new Map<string, CGGraphicInfo[]>();

  async loadBin(path: string) {
    // let files = await fs.promises.readdir(path);
    let files = await glob("bin/**/GraphicInfo*.bin", { cwd: path, root: path, absolute: false, nodir: true })
    let ret: GraphicData[] = [];
    let now = performance.now();
    for (const file of files) {
      ret.push({ name: file.replace(/GraphicInfo/i, "Graphic") });
    }
    ret = await Promise.all(files.map(file => this.loadInfo(Path.join(path, file)).then(e => ({ name: file.replace(/GraphicInfo/i, "Graphic"), infoList: e }))));
    for (const g of ret) {
      this.#map.set(g.name, g.infoList!);
    }
    let cgpList = await glob("bin/pal/*.cgp", { cwd: path, root: path, absolute: false, nodir: true });
    cgpList.sort();
    for (const cgpFile of cgpList) {
      let fd = fs.openSync(Path.join(path, cgpFile), 'r');
      let buffer = CGPUtils.read(fd);
      fs.closeSync(fd);
      this.#cgpMap.set(cgpFile, buffer);
    }
    let ts = performance.now() - now;
    console.log('done in ' + ts + 'ms');
    // console.log(ret);
    // console.log(files);
    runInAction(() => {
      this.cgpList = cgpList;
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

  getGraphicList(bin: string) {
    return this.#map.get(bin);
  }

  getCPG(cgp: string) {
    return this.#cgpMap.get(cgp);
  }
}

let binService = new BinService();
// @ts-ignore
window.binService = binService;
export default binService;
