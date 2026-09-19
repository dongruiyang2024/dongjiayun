import { useEffect, useRef, useState } from 'react';
import { createRabbitWorld } from '../lib/rabbit/engine';

export default function RabbitScene({ reaction, stageIndex, name, onComplete, onPat }) {
  const host=useRef(null),world=useRef(null),callbacks=useRef({onComplete,onPat});
  const [info,setInfo]=useState({text:'小兔正在熟悉它的家…',routine:'小兔的日常'});
  const [version,setVersion]=useState(0);
  useEffect(()=>{callbacks.current={onComplete,onPat};},[onComplete,onPat]);
  useEffect(()=>{
    try {world.current=createRabbitWorld(host.current,setInfo,()=>callbacks.current.onComplete(),()=>callbacks.current.onPat());}
    catch {const timer=setTimeout(()=>setInfo({error:'这个浏览器暂时无法显示 3D 场景，请尝试重新加载或换一个支持 WebGL 的浏览器。'}),0);return()=>clearTimeout(timer);}
    return()=>{world.current?.destroy();world.current=null;};
  },[version]);
  useEffect(()=>{world.current?.setScale(1.12+stageIndex*.06);},[stageIndex,version]);
  useEffect(()=>{if(reaction) {if(world.current)world.current.command(reaction);else callbacks.current.onComplete();}},[reaction]);
  return <div className="rabbit-game">
    <div className="rabbit-game-bar"><span>{info.night?'☾':'☀'} {info.routine}</span><span>跟随设备当地时间</span></div>
    <div className="rabbit-webgl" ref={host} />
    {info.error&&<div className="rabbit-game-error" role="alert"><p>{info.error}</p><button className="btn btn-secondary" onClick={()=>{callbacks.current.onComplete();setInfo({text:'正在重新加载…'});setVersion(v=>v+1);}}>重新加载</button></div>}
    <div className="rabbit-game-controls"><span>点击{name}摸摸头 · 点草地让它过去</span><div><button aria-label="向左转动视角" onClick={()=>world.current?.rotate(-.3)}>↶</button><button aria-label="向右转动视角" onClick={()=>world.current?.rotate(.3)}>↷</button><button aria-label="拉近视角" onClick={()=>world.current?.zoom(-.1)}>＋</button><button aria-label="拉远视角" onClick={()=>world.current?.zoom(.1)}>−</button></div></div>
    <p className="rabbit-game-status" role="status">{info.text}</p><p className="rabbit-routine-hint">{info.hint}</p>
    <button className="pet-pat" disabled={Boolean(reaction)||Boolean(info.error)} onClick={()=>world.current?.command('call')}>🐾 叫它到面前来</button>
  </div>;
}
