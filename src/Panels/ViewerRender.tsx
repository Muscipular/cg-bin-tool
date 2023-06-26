import {CGGraphicInfo} from "../Service/CGGraphicInfo.ts";
import {useContext, useEffect} from "react";

function ViewerRender({ info }: { info: CGGraphicInfo }) {
  useEffect(() => {
  })
  return <canvas className={'viewer-canvas'}></canvas>;
}
