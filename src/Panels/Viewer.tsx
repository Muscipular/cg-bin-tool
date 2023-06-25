import {useState} from 'react'
import {Tab, Tabs} from "@blueprintjs/core";
import binService from "../BinService.ts";


export default () => {
  let [list, setList] = useState([]);

  return <div className={'main-container'}>
    <Tabs id={'BinTabs'} vertical={true}>
      {binService.binList.map(e =>
        <Tab id={'BinTabs-' + e} title={e} panel={
          <div></div>
        }></Tab>
      )}
      <Tabs.Expander/>
    </Tabs>
  </div>
}