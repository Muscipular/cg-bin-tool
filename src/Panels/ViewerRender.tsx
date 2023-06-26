import {CGGraphicInfo} from "../Service/CGGraphicInfo.ts";
import {useContext, useEffect, useRef} from "react";
import fs from "fs";
import config from "../Service/Config.ts";
import * as Path from "path";

export function ViewerRender({ info, bin }: { info: CGGraphicInfo, bin: string }) {
  let ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let fd = fs.openSync(Path.join(config.path, bin), 'r');
    let buffer = Buffer.alloc(info.Length);
    fs.readSync(fd, buffer, 0, info.Length, info.Offset);
    console.log(buffer);
    fs.closeSync(fd);

  }, [info, config.path, bin])
  return <canvas className={'viewer-canvas'} ref={ref}
                 width={Math.min(info.Width, 640)}
                 height={Math.min(info.Height, 480)}
  ></canvas>;
}
