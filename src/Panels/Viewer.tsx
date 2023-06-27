import React, {useState} from 'react'
import {HTMLSelect, Tab, Tabs} from "@blueprintjs/core";
import binService from "../Service/BinService.ts";
import GraphicsList from "./GraphicsList.tsx";
import {observer} from "mobx-react-lite";
import {CGAnimeInfo, CGGraphicInfo, CGType} from "../Service/CGGraphicInfo.ts";
import {CGGraphicRender} from "./CGGraphicRender.tsx";


function GraphicInfoView({ info }: { info: CGGraphicInfo }) {
  return <>
    <div>占位: {info.SizeX}X{info.SizeY} 宽高: {info.Width}x{info.Height} 偏移: {info.OffsetX}x{info.OffsetY}
    </div>
    <div>标记: {info.Flag} 大小:{info.Length}@{info.Offset}
    </div>
  </>
}

const Viewer = () => {
  // let [list, setList] = useState([]);
  let [currentBin, setCurrentBin] = useState(binService.binList[0]);
  let [g, setG] = useState<CGGraphicInfo | CGAnimeInfo | null>(null);
  let [cgp, setCGP] = useState<string | null>(binService.cgpList?.[0]);

  return <div className={'main-container'}>
    <div className={'bin-list list-scroller'}>
      <Tabs id={'BinTabs'} vertical={true} fill={true} selectedTabId={currentBin} onChange={e => {
        setCurrentBin(e.toString());
        setG(null);
      }}>
        {binService.binList.map(e =>
          <Tab id={e} title={e} key={e}></Tab>
        )}
        {binService.animeList.map(e =>
          <Tab id={e} title={e} key={e}></Tab>
        )}
      </Tabs>
    </div>
    <div className={'img-list'}>
      {currentBin && <GraphicsList bin={currentBin} onSelect={e => setG(e)}></GraphicsList>}
    </div>
    <div className={'img-viewer'}>
      {g?.Type === CGType.Graphic && <GraphicInfoView info={g as CGGraphicInfo}></GraphicInfoView>}
      <div>
        调色板: <HTMLSelect value={cgp!} options={binService.cgpList} onChange={(e) => {
        setCGP(e.currentTarget.value);
      }}></HTMLSelect>
      </div>
      {currentBin && g && cgp && <CGGraphicRender bin={currentBin} info={g as CGGraphicInfo} cgp={cgp}/>}
    </div>
  </div>
};

let _Viewer = observer(Viewer);
export default _Viewer
