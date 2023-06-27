import {useState} from 'react'
import './App.scss'

import {Alignment, Button, Icon, Navbar, Tab, Tabs} from "@blueprintjs/core";
import Viewer from "./Panels/Viewer.tsx";
import Tools from "./Panels/Tools.tsx";
import Settings from "./Panels/Settings.tsx";
import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

function App() {
  let [tabId, setTabId] = useState('viewer');

  return (
    <>
      <Navbar className={'navi-bar draggable'}>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>CG-BIN-TOOL</Navbar.Heading>
          <Navbar.Divider/>
          <Tabs id="MainTabs" animate={true} selectedTabId={tabId} className={"MainTabs"} onChange={e => setTabId(e + '')}>
            <Tab id="viewer" icon={"home"} title="列表"/>
            <Tab id="tools" icon={"cube"} title="工具"/>
            <Tab id="settings" icon={"settings"} title="设置"/>
          </Tabs>
        </Navbar.Group>
        {/*<Navbar.Group align={Alignment.RIGHT}>*/}
        {/*  <input className="bp5-input" type="text" placeholder="Search..."/>*/}
        {/*</Navbar.Group>*/}
      </Navbar>
      {tabId == 'viewer' && <Viewer/>}
      {tabId == 'tools' && <Tools/>}
      {tabId == 'settings' && <Settings/>}
    </>
  )
}

export default App
