import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
)

import {ipcRenderer} from "electron"

ipcRenderer.on('open-dir', (_e, s: string) => {
    console.log('open-dir', s);
})
