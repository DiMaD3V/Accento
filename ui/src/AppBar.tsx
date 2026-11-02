import {useEffect,useState} from 'react';
import {Minus,Square,Copy,X} from 'lucide-react';
import {getCurrentWindow} from '@tauri-apps/api/window';
import {Button} from './components';
import {desktop} from './api';
import {version} from '../../package.json';
import type dictionaries from './messages.json';

type Props={paused:boolean;text:typeof dictionaries.it;onError:(error:string)=>void};
export function AppBar({paused,text,onError}:Props){
  const [maximized,setMaximized]=useState(false);
  useEffect(()=>{
    if(!desktop)return;
    let disposed=false,stop:undefined|(()=>void);
    const window=getCurrentWindow();
    const update=()=>void window.isMaximized().then(value=>{if(!disposed)setMaximized(value);}).catch(error=>onError(String(error)));
    update();
    void window.onResized(update).then(unlisten=>{if(disposed)unlisten();else stop=unlisten;}).catch(error=>onError(String(error)));
    return()=>{disposed=true;stop?.();};
  },[onError]);
  async function act(action:'minimize'|'toggleMaximize'|'close'){
    if(!desktop)return;
    try{await getCurrentWindow()[action]();}catch(error){onError(String(error));}
  }
  return <header className="app-bar">
    <div className="app-drag-region" data-tauri-drag-region>
      <div className="brand" data-tauri-drag-region>
        <img className="brand-mark" src="/brand/accento.svg" alt="" width={16} height={16} data-tauri-drag-region/>
        <strong data-tauri-drag-region>Accento</strong>
      </div>
      <div className="runtime" aria-live="polite" data-tauri-drag-region>
        <span className={'status-dot '+(paused?'off':'')} aria-hidden="true" data-tauri-drag-region/>
        <span data-tauri-drag-region>{text[paused?'Disabled':'Enabled']}</span>
      </div>
      <span className="version" data-tauri-drag-region>v{version}</span>
    </div>
    <div className="window-controls">
      <Button variant="quiet" aria-label={text.Minimize} disabled={!desktop} onPress={()=>void act('minimize')}><Minus size={13}/></Button>
      <Button variant="quiet" aria-label={text[maximized?'Restore':'Maximize']} disabled={!desktop} onPress={()=>void act('toggleMaximize')}>{maximized?<Copy size={12}/>:<Square size={12}/>}</Button>
      <Button variant="quiet" className="window-close" aria-label={text.CloseWindow} disabled={!desktop} onPress={()=>void act('close')}><X size={14}/></Button>
    </div>
  </header>;
}
