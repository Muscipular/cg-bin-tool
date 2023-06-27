import {makeAutoObservable, runInAction} from "mobx";
import * as fs from "fs";
import {glob} from "glob";
import * as Path from 'path';
import {CGAnimeInfo, CGGraphicInfo} from "./CGGraphicInfo.ts";
import Worker from "../Worker/Wrapper.ts";

import {CGPUtils} from "./CGPUtils.ts";

interface GraphicData {
  name: string,
  infoList?: CGGraphicInfo[]
}

interface AnimeData {
  name: string,
  infoList?: CGAnimeInfo[]
}

class BinService {
  binList: string[] = [];
  cgpList: string[] = [];
  #cgpMap = new Map<string, Buffer>();
  animeList: string[] = [];
  #binMap = new Map<string, CGGraphicInfo[]>();
  #animeMap = new Map<string, CGAnimeInfo[]>();

  async loadBin(path: string) {
    // let files = await fs.promises.readdir(path);
    let now = performance.now();
    let files = await glob("bin/**/GraphicInfo*.bin", { cwd: path, root: path, absolute: false, nodir: true })
    let ret: GraphicData[] = [];
    for (const file of files) {
      ret.push({ name: file.replace(/GraphicInfo/i, "Graphic") });
    }
    let anfiles = await glob("bin/**/AnimeInfo*.bin", { cwd: path, root: path, absolute: false, nodir: true })
    let anret: AnimeData[] = [];
    for (const file of files) {
      anret.push({ name: file.replace(/AnimeInfo/i, "Anime") });
    }
    [ret, anret] = await Promise.all([
      Promise.all(files.map(file => this.loadGraphicInfo(Path.join(path, file)).then(e => ({ name: file.replace(/GraphicInfo/i, "Graphic"), infoList: e })))),
      Promise.all(anfiles.map(file => this.loadAnimeInfo(Path.join(path, file)).then(e => ({ name: file.replace(/AnimeInfo/i, "Anime"), infoList: e }))))
    ]);
    for (const g of ret) {
      this.#binMap.set(g.name, g.infoList!);
    }
    for (const g of anret) {
      this.#animeMap.set(g.name, g.infoList!);
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
      this.animeList = anret.map(e => e.name);
    })
  }

  async loadGraphicInfo(path: string) {
    console.log('load Info ' + path);
    let ret = await Worker.readGraphicInfo(path);
    // console.log(ret.length, ret[0]);
    return ret;
  }

  async loadAnimeInfo(path: string) {
    console.log('load Info ' + path);
    let ret = await Worker.readAnimeInfo(path);
    // console.log(ret.length, ret[0]);
    return ret;
  }

  constructor() {
    makeAutoObservable(this)
  }

  getGraphicList(bin: string) {
    return this.#binMap.get(bin);
  }

  getAnimeList(bin: string) {
    return this.#animeMap.get(bin);
  }

  getCPG(cgp: string) {
    return this.#cgpMap.get(cgp);
  }
}

let binService = new BinService();
// @ts-ignore
window.binService = binService;
export default binService;
