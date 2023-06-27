import {BinReaderSync} from "../Utils/BinReader.ts";
import fs from "fs";
import {CGAnimeInfo, CGGraphicInfo} from "../Service/CGGraphicInfo.ts";
import {CGGraphicInfoUtils} from "../Service/CGGraphicInfoUtils.ts";
import {CGAnimeInfoTools} from "../Service/CGAnimeInfoTools.ts";

export async function readGraphicInfo(channel: string, args: any[]) {
  // console.log(channel, ...args);
  const path = args[0] as string;
  let fd = fs.openSync(path, 'r');
  let binaryStream = new BinReaderSync(fd);
  let info: CGGraphicInfo | null = null;
  let ret: CGGraphicInfo[] = [];
  try {
    while (info = CGGraphicInfoUtils.read(binaryStream)) {
      // console.log(info);
      ret.push(info);
    }
  } catch (e) {
    console.error('load info error', e);
  }
  fs.closeSync(fd);
  return ret;
}

export async function readAnimeInfo(channel: string, args: any[]) {
  // console.log(channel, ...args);
  const path = args[0] as string;
  let fd = fs.openSync(path, 'r');
  let binaryStream = new BinReaderSync(fd);
  let info: CGAnimeInfo | null = null;
  let ret: CGAnimeInfo[] = [];
  try {
    while (info = CGAnimeInfoTools.read(binaryStream)) {
      // console.log(info);
      ret.push(info);
    }
  } catch (e) {
    console.error('load info error', e);
  }
  fs.closeSync(fd);
  return ret;
}
