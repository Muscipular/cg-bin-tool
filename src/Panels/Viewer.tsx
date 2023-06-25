import {useState} from 'react'
import {Tab, Tabs} from "@blueprintjs/core";
import binService from "../BinService.ts";


export default () => {
  let [list, setList] = useState([]);

  return <div className={'main-container'}>
    <div className={'bin-list'}>
      <Tabs id={'BinTabs'} vertical={true} fill={true}>
        {binService.binList.map(e =>
          <Tab id={'BinTabs-' + e} title={e} key={e}></Tab>
        )}
      </Tabs>
    </div>
    <div className={'img-list'}>
      我是列表
    </div>
    <div className={'img-viewer'}>
      <div>
        图档信息：
      </div>
      <canvas className={'viewer-canvas'}></canvas>
    </div>
  </div>
}