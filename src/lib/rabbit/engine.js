import * as T from 'three';
import { buildWorld } from './models';
import { rabbitRoutine, routeTo, walkable, FOOD, WATER } from './routine';

export function createRabbitWorld(host, notify, complete, onPat) {
  const renderer=new T.WebGLRenderer({antialias:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','立体小兔花园。点击地面让小兔走过去，点击小兔轻轻摸头。也可以使用下方按钮互动。');host.appendChild(canvas);
  const scene=new T.Scene();scene.background=new T.Color('#ede8f0');
  const camera=new T.PerspectiveCamera(37,1,.1,70);camera.position.set(8,8.8,11.5);camera.lookAt(0,.15,0);
  const ambient=new T.HemisphereLight('#fff6eb','#9294ac',2);scene.add(ambient);
  const sun=new T.DirectionalLight('#fff1d8',3);sun.position.set(-3,8,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.1,far:25});sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;scene.add(sun);
  const lamp=new T.PointLight('#ffd0a2',1.5,6);lamp.position.set(-2.7,1,-1);scene.add(lamp);
  const m=buildWorld(scene);m.rabbit.position.set(-.5,0,.1);m.rabbit.rotation.y=.4;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let path=[], mode='observe', arrival='observe', until=performance.now()/1000+12, activeCommand=null, last=0, running=true, frame=0, scale=.9, lastRoutine='', lastInfo='', markerUntil=0, visible=true;
  let orbit=0, zoom=1;
  const describe = () => {
    const routine=rabbitRoutine();
    const labels={walk:'正走向你点的地方',food:'低头吃牧草',water:'正在喝清水',pat:'享受你的摸摸头',rest:'在安静的角落打个盹',groom:'洗洗脸，整理毛毛',sniff:'嗅嗅附近的味道',observe:'竖起耳朵，看看周围'};
    const text=labels[mode] || '自在地待一会儿';
    const info=`${routine.key}-${text}`;
    if(info!==lastInfo){lastInfo=info;notify({text,routine: routine.title,hint:routine.hint,night:routine.night,busy:Boolean(activeCommand)});}
    canvas.dataset.behavior=mode;
  };
  function setMode(next,duration) {mode=next;until=performance.now()/1000+duration;describe();}
  function go(target,after='observe',command=null) {
    const next=routeTo(m.rabbit.position,target);
    if(!next.length && Math.hypot(target.x-m.rabbit.position.x,target.z-m.rabbit.position.z)>.45) return false;
    activeCommand=command;arrival=after;path=next;
    setMode(path.length?'walk':after,after==='rest'?65:after==='food'||after==='water'?5:8);
    return true;
  }
  const feedingTargets={food:{x:FOOD.x,z:FOOD.z+.7},water:{x:WATER.x,z:WATER.z+.7}};
  function command(kind) {
    if(activeCommand) return;
    if(kind==='food'||kind==='water') {
      if(!go(feedingTargets[kind],kind,kind)){ complete(); return; }
    } else if(kind==='pat') {path=[];activeCommand='pat';setMode('pat',3.2);}
    else if(kind==='call') go({x:0,z:1.4});
  }
  function wander() {
    const routine=rabbitRoutine();const roll=Math.random();
    if(roll<routine.restChance){go({x:-1.4,z:-.6},'rest');return;}
    if(roll<routine.restChance+.18){setMode('groom',10+Math.random()*12);return;}
    if(roll<routine.restChance+.35){setMode('sniff',7+Math.random()*9);return;}
    for(let i=0;i<15;i++){const target={x:(Math.random()-.5)*6.5,z:(Math.random()-.5)*4.5};if(walkable(target.x,target.z)&&go(target))return;}
    setMode('observe',routine.minPause);
  }
  const ray=new T.Raycaster(),pointer=new T.Vector2();
  let down=null;
  function pointerDown(e){down={x:e.clientX,y:e.clientY};}
  function pointerUp(e) {
    if(!down || Math.hypot(e.clientX-down.x,e.clientY-down.y)>10) {down=null;return;}down=null;
    const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);
    if(activeCommand)return;
    if(ray.intersectObject(m.rabbit,true).length){onPat();return;}
    const hit=ray.intersectObject(m.ground)[0];
    if(hit&&walkable(hit.point.x,hit.point.z)&&go(hit.point)){m.marker.position.set(hit.point.x,.04,hit.point.z);m.marker.visible=true;markerUntil=performance.now()/1000+3;}
  }
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);
  function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;updateCamera();}
  function updateCamera(){const distance=Math.max(11.5,12/camera.aspect)*zoom;camera.position.set(Math.sin(.6+orbit)*distance,distance*.63,Math.cos(.6+orbit)*distance);camera.lookAt(0,.1,0);camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;});intersection.observe(host);
  function animate(ms){if(!running)return;frame=requestAnimationFrame(animate);const time=ms/1000,dt=Math.min(last?(ms-last)/1000:0,.05);last=ms;if(document.hidden||!visible)return;
    const routine=rabbitRoutine();if(routine.key!==lastRoutine){lastRoutine=routine.key;sun.intensity=routine.night?1.2:3;ambient.intensity=routine.night?1.5:2;lamp.intensity=routine.night?3:0;scene.background.set(routine.night?'#9691aa':'#ede8f0');describe();}
    if(mode==='walk'&&path.length){const dest=path[0],dx=dest.x-m.rabbit.position.x,dz=dest.z-m.rabbit.position.z,dist=Math.hypot(dx,dz);const speed=activeCommand?1.55:routine.key==='active'?1.2:.8;
      if(dist<speed*dt+.02){m.rabbit.position.x=dest.x;m.rabbit.position.z=dest.z;path.shift();}else{m.rabbit.position.x+=dx/dist*speed*dt;m.rabbit.position.z+=dz/dist*speed*dt;}
      const angle=Math.atan2(dx,dz),diff=Math.atan2(Math.sin(angle-m.rabbit.rotation.y),Math.cos(angle-m.rabbit.rotation.y));m.rabbit.rotation.y+=diff*Math.min(1,dt*10);
      if(!path.length){setMode(arrival,arrival==='rest'?65+Math.random()*60:arrival==='food'||arrival==='water'?5:routine.minPause+Math.random()*12);}
    }else if(time>until){if(activeCommand){activeCommand=null;complete();setMode('groom',5);}else wander();}
    const moving=mode==='walk',nibble=mode==='food'||mode==='water',resting=mode==='rest';
    m.rabbit.scale.setScalar(scale);m.body.position.y=!reduced.matches&&moving?Math.abs(Math.sin(time*10))*.085:0;
    m.body.scale.y=T.MathUtils.lerp(m.body.scale.y,resting?.82:1,dt*4);
    m.body.rotation.x=moving&&!reduced.matches?Math.sin(time*10)*.04:0;
    m.head.rotation.x=T.MathUtils.lerp(m.head.rotation.x,nibble?.62:mode==='groom'?.4:mode==='pat'?.18:0,dt*5);
    if(nibble){const bowl=mode==='food'?FOOD:WATER;m.rabbit.rotation.y=Math.atan2(bowl.x-m.rabbit.position.x,bowl.z-m.rabbit.position.z);if(!reduced.matches)m.head.rotation.x+=Math.sin(time*17)*.014;}
    m.head.rotation.y=!reduced.matches&&mode==='observe'?Math.sin(time*.6)*.14:0;
    m.nose.scale.z=.03*(1+(!reduced.matches&&mode==='sniff'?Math.sin(time*16)*.18:0));
    for(let i=0;i<m.ears.length;i++){m.ears[i].rotation.x=T.MathUtils.lerp(m.ears[i].rotation.x,resting?-.6:mode==='pat'?-.32:!reduced.matches?Math.sin(time*1.3+i)*.05:0,dt*4);}
    const blink=resting?.12:time%5.7>5.53?.08:1;for(const eye of m.eyes)eye.scale.y=.063*blink;
    for(let i=0;i<m.paws.length;i++){m.paws[i].position.y=.085+(!reduced.matches&&mode==='groom'&&i%2===1?.15+Math.sin(time*7)*.05:0);}
    m.marker.visible=time<markerUntil;if(m.marker.visible)m.marker.scale.setScalar(1+Math.sin(time*7)*.12);
    renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(animate);describe();
  const lose=(e)=>{e.preventDefault();running=false;notify({error:'3D 画面暂时中断，请点击重新加载。'});};canvas.addEventListener('webglcontextlost',lose);
  return {command,setScale(value){scale=value;},rotate(delta){orbit+=delta;updateCamera();},zoom(delta){zoom=T.MathUtils.clamp(zoom+delta,.8,1.25);updateCamera();},destroy(){running=false;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('webglcontextlost',lose);const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();canvas.remove();}};
}
