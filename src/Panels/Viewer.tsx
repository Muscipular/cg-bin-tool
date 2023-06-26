import {useState} from 'react'
import {Tab, Tabs} from "@blueprintjs/core";
import binService from "../Service/BinService.ts";
import GraphicsList from "./GraphicsList.tsx";
import {observer} from "mobx-react-lite";
import {CGGraphicInfo} from "../Service/CGGraphicInfo.ts";


let Viewer = () => {
  // let [list, setList] = useState([]);
  let [currentBin, setCurrentBin] = useState(binService.binList[0]);
  let [g, setG] = useState<CGGraphicInfo | null>(null);

  return <div className={'main-container'}>
    <div className={'bin-list'}>
      <Tabs id={'BinTabs'} vertical={true} fill={true} selectedTabId={currentBin} onChange={e => setCurrentBin(e.toString())}>
        {binService.binList.map(e =>
          <Tab id={e} title={e} key={e}></Tab>
        )}
      </Tabs>
    </div>
    <div className={'img-list'}>
      {currentBin && <GraphicsList bin={currentBin} onSelect={e => setG(e)}></GraphicsList>}
    </div>
    <div className={'img-viewer'}>
      <div>
        占位: {g?.SizeX}X{g?.SizeY} 宽高: {g?.Width}x{g?.Height} 偏移:{g?.OffsetX}x{g?.OffsetY}
      </div>
      <div> 标记: {g?.Flag} 大小:{g?.Length}@{g?.Offset}
      </div>
    </div>
  </div>
};

let _Viewer = observer(Viewer);
export default _Viewer
