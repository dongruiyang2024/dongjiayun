import * as T from 'three';
export function buildWorld(scene) {
  const materials = new Map();
  const mat = (color, roughness = .85) => { const key = `${color}-${roughness}`; if (!materials.has(key)) materials.set(key, new T.MeshStandardMaterial({ color, roughness })); return materials.get(key); };
  const mesh = (geo, color, parent, pos, scale) => { const m = new T.Mesh(geo, mat(color)); if (pos) m.position.set(...pos); if (scale) m.scale.set(...scale); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  const sphere = (color, parent, pos, scale) => mesh(new T.SphereGeometry(1, 24, 16), color, parent, pos, scale);
  const box = (size, color, parent, pos) => mesh(new T.BoxGeometry(...size), color, parent, pos);
  const cylinder = (r1,r2,h,color,parent,pos) => mesh(new T.CylinderGeometry(r1,r2,h,32),color,parent,pos);
  const ground = box([8,.4,6], '#a7c38d',scene,[0,-.22,0]);
  box([8.04,.13,6.04], '#d7bda6',scene,[0,-.48,0]);
  // Fine clumps of grass and tiny flowers around the perimeter.
  let seed = 41;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i=0;i<105;i++) {
    const x=(random()-.5)*7.7,z=(random()-.5)*5.7;
    if (Math.abs(x)<3.3 && Math.abs(z)<2.15) continue;
    for(let j=0;j<3;j++) { const blade=mesh(new T.ConeGeometry(.025,.12+random()*.12,4),j%2?'#88aa68':'#72955a',scene,[x+j*.04,.08,z]); blade.rotation.z=(random()-.5)*.7; }
    if(i%5===0) { sphere('#f6dcea',scene,[x,.2,z],[.08,.035,.08]); sphere('#edc967',scene,[x,.22,z],[.03,.02,.03]); }
  }
  for (let x=-3.8;x<4;x+=.5) { box([.1,.76,.1],'#f4e7da',scene,[x,.36,-2.83]); }
  for(const y of [.2,.57]) box([7.8,.09,.08],'#f4e7da',scene,[0,y,-2.83]);
  for (let z=-2.8;z<2.9;z+=.5) box([.1,.76,.1],'#f4e7da',scene,[-3.85,.36,z]);
  for(const y of [.2,.57]) box([.08,.09,5.8],'#f4e7da',scene,[-3.85,y,0]);
  // Open-front timber shelter; the rabbit can rest at its shaded entrance.
  const house = new T.Group();house.position.set(-2.7,0,-1.65);scene.add(house);
  box([1.65,.13,1.45],'#b58a68',house,[0,.08,0]);
  box([.12,1.05,1.45],'#dfbda0',house,[-.79,.59,0]);box([.12,1.05,1.45],'#dfbda0',house,[.79,.59,0]);box([1.65,1.05,.12],'#c89f7d',house,[0,.59,-.67]);
  for (const side of [-1,1]) { const roof=box([1.07,.13,1.77],'#bc869f',house,[side*.44,1.3,0]);roof.rotation.z=-side*.4; }
  for(let i=0;i<18;i++) { const straw=box([.5,.025,.025],'#dcc284',house,[(random()-.5)*1.25,.17,(random()-.5)*1.1]);straw.rotation.y=random()*Math.PI; }
  // Bowls are open rings, with water and hay inside.
  function bowl(x,z,color,water) {
    const group=new T.Group();group.position.set(x,0,z);scene.add(group);
    cylinder(.36,.28,.17,color,group,[0,.095,0]);
    const ring=mesh(new T.TorusGeometry(.32,.05,12,40),color,group,[0,.19,0]);ring.rotation.x=Math.PI/2;
    const fill=cylinder(.29,.29,.02,water?'#7cc9dc':'#799850',group,[0,.183,0]);
    if(water) { fill.material=new T.MeshStandardMaterial({color:'#92d7e4',roughness:.15,metalness:.2}); }
    else for(let i=0;i<13;i++){const hay=box([.32,.03,.035],i%2?'#b8b677':'#8aab66',group,[(random()-.5)*.35,.21+random()*.09,(random()-.5)*.35]);hay.rotation.y=random()*Math.PI;}
    return {group,fill};
  }
  const food=bowl(1.65,.7,'#dda8bb',false),water=bowl(2.65,-.35,'#93bfcf',true);
  // Shade tree and play objects.
  cylinder(.12,.18,1.65,'#b08b72',scene,[2.8,.7,-2.15]);
  for(const [x,y,z,r] of [[2.8,2,-2.15,.85],[2.3,1.8,-2,.6],[3.25,1.85,-2.1,.6]])sphere('#93b080',scene,[x,y,z],[r,r*.8,r]);
  sphere('#d3aac8',scene,[.3,.22,1.7],[.23,.23,.23]);
  const toyRing=mesh(new T.TorusGeometry(.3,.055,12,32),'#d4b180',scene,[-1.4,.065,1.5]);toyRing.rotation.x=Math.PI/2;
  // Articulated rabbit, facing local +Z. Unequal haunches, paws and muzzle give a rabbit silhouette.
  const rabbit = new T.Group(); scene.add(rabbit);
  const body = new T.Group();rabbit.add(body);
  sphere('#f3eee8',body,[0,.43,-.08],[.35,.36,.49]);
  sphere('#e9e1df',body,[-.24,.29,-.25],[.22,.25,.29]);sphere('#e9e1df',body,[.24,.29,-.25],[.22,.25,.29]);
  sphere('#fff9f2',body,[0,.45,-.57],[.16,.17,.16]);
  const paws=[];
  for(const x of [-.23,.23])for(const z of [-.25,.28]) paws.push(sphere('#fff9f3',body,[x,.085,z],[.13,.09,z<0?.25:.18]));
  const head = new T.Group();head.position.set(0,.65,.36);body.add(head);
  sphere('#fff9f2',head,[0,0,0],[.29,.28,.28]);
  for(const x of [-.12,.12]) sphere('#fffaf5',head,[x,-.09,.22],[.14,.1,.105]);
  const nose=sphere('#d89caa',head,[0,-.055,.31],[.05,.036,.03]);
  const eyes=[];
  for(const side of [-1,1]) {eyes.push(sphere('#302b31',head,[side*.235,.045,.15],[.05,.063,.035]));sphere('#ffffff',head,[side*.238,.067,.177],[.015,.018,.01]);
    for(let i=0;i<3;i++){const geo=new T.BufferGeometry().setFromPoints([new T.Vector3(side*.13,-.08,.27),new T.Vector3(side*.43,-.04-i*.035,.3)]);const line=new T.Line(geo,new T.LineBasicMaterial({color:'#bdb1b4',transparent:true,opacity:.7}));head.add(line);}}
  const ears=[];
  for(const side of [-1,1]) {const ear=new T.Group();ear.position.set(side*.14,.19,-.015);ear.rotation.z=-side*.13;head.add(ear);sphere('#f9f4ed',ear,[0,.28,0],[.085,.34,.065]);sphere('#e7b1bc',ear,[0,.29,.054],[.046,.265,.013]);ears.push(ear);}
  const marker=mesh(new T.TorusGeometry(.22,.016,8,40),'#e9b0d4',scene,[0,.025,0]);marker.rotation.x=Math.PI/2;marker.visible=false;
  return {ground,rabbit,body,head,ears,eyes,nose,paws,food,water,marker};
}
