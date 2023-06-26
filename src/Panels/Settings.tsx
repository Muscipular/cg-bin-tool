import {} from 'react'
import {Button, Classes, FormGroup, InputGroup, Label} from "@blueprintjs/core";
import {observer,} from 'mobx-react-lite';
import config from '../Service/Config.ts'
import {ipcRenderer} from "electron";
import binService from "../Service/BinService.ts";
import {runInAction} from "mobx";

ipcRenderer.on('open-dir', (e, { path, error }: { path: string, error: any }) => {
  runInAction(() => {
    config.path = path;
  })
  binService.loadBin(path);
})

function Settings() {
  return <div className={'main-container'}>
    <FormGroup
      labelInfo={<small>选择cg所在目录</small>}
      label="CG目录"
      labelFor="text-input" style={{ width: 400 }}
    >
      <InputGroup id="text-input" placeholder="" value={config.path} readOnly={true} inputClassName={'none-selection'} rightElement={<Button onClick={() => {
        ipcRenderer.postMessage('open-dir', '');
      }}>选择文件夹</Button>}/>
    </FormGroup>
  </div>
}

const _Settings = observer(Settings);
export default _Settings;
