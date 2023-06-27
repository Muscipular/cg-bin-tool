import React, {useState} from 'react'
import {HTMLSelect, Tab, Tabs} from "@blueprintjs/core";
import binService from "../Service/BinService.ts";
import GraphicsList from "./GraphicsList.tsx";
import {observer} from "mobx-react-lite";
import {CGGraphicInfo} from "../Service/CGGraphicInfo.ts";
import {ViewerRender} from "./ViewerRender.tsx";

let Viewer = () => {
  // let [list, setList] = useState([]);
  let [currentBin, setCurrentBin] = useState(binService.binList[0]);
  let [g, setG] = useState<CGGraphicInfo | null>(null);
  let [cgp, setCGP] = useState<string | null>(binService.cgpList?.[0]);

  return <div className={'main-container'}>
    <div className={'bin-list list-scroller'}>
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
      <div>占位: {g?.SizeX}X{g?.SizeY} 宽高: {g?.Width}x{g?.Height} 偏移: {g?.OffsetX}x{g?.OffsetY}
      </div>
      <div>标记: {g?.Flag} 大小:{g?.Length}@{g?.Offset}
      </div>
      <div>
        调色板: <HTMLSelect value={cgp!} options={binService.cgpList} onChange={(e) => {
          setCGP(e.currentTarget.value);
        }}></HTMLSelect>
      </div>
      {currentBin && g && cgp && <ViewerRender bin={currentBin} info={g} cgp={cgp}/>}
    </div>
  </div>
};

let _Viewer = observer(Viewer);
export default _Viewer
