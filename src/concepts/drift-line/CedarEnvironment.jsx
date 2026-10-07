import React, { useMemo, useLayoutEffect, useRef, useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import * as T from 'three';
import { roadPoint, roadRibbon } from './roadGeometry.js';

function Instances({ geometry, material, matrices }) {
  const ref = useRef();
  useLayoutEffect(() => { matrices.forEach((m,i)=>ref.current.setMatrixAt(i,m)); ref.current.instanceMatrix.needsUpdate=true; ref.current.computeBoundingSphere(); },[matrices]);
  return <instancedMesh ref={ref} args={[geometry,material,matrices.length]} />;
}
function matrix(position, scale, rotation=0) { return new T.Matrix4().compose(position,new T.Quaternion().setFromEuler(new T.Euler(0,rotation,0)),new T.Vector3(...scale)); }

export default function CedarEnvironment({ asphalt, low }) {
  const [valley, cedar] = useLoader(T.TextureLoader, ['/assets/textures/cedar-valley.png','/assets/textures/cedar-tree.png']);
  valley.colorSpace=cedar.colorSpace=T.SRGBColorSpace;
  const assets=useMemo(()=>{
    const terrain=new T.PlaneGeometry(170,170,60,60); terrain.rotateX(-Math.PI/2); const tp=terrain.attributes.position; for(let i=0;i<tp.count;i++){const r=Math.hypot(tp.getX(i),tp.getZ(i)+2.3);tp.setY(i,-.055-Math.max(0,r-13)*.48);} terrain.computeVertexNormals();
    const road=roadRibbon(-.6,2.85), edges=[roadRibbon(-3.22,.035),roadRibbon(2.02,.035)];
    const railV=[], railI=[];
    // Rolled steel W-profile instead of a pipe guardrail.
    const profile=[[-.14,-.015],[-.09,.045],[0,0],[.09,.045],[.14,-.015]];
    for(let i=0;i<=180;i++)for(const [y,o]of profile)railV.push(...roadPoint(-.36+i/180*1.72,-3.65+o,.73+y).toArray());
    for(let i=0;i<180;i++)for(let j=0;j<4;j++){const n=i*5+j;railI.push(n,n+5,n+1,n+1,n+5,n+6);}
    const rail=new T.BufferGeometry();rail.setAttribute('position',new T.Float32BufferAttribute(railV,3));rail.setIndex(railI);rail.computeVertexNormals();
    const postGeo=new T.BoxGeometry(.09,.8,.09), reflectorGeo=new T.BoxGeometry(.06,.085,.06), rockGeo=new T.DodecahedronGeometry(1,1), treeGeo=new T.PlaneGeometry(1,1);
    const steel=new T.MeshStandardMaterial({color:'#8a9490',metalness:.55,roughness:.48,side:T.DoubleSide});
    const amber=new T.MeshStandardMaterial({color:'#e6b66d',emissive:'#996226',emissiveIntensity:.18});
    const rock=new T.MeshStandardMaterial({color:'#7c8071',map:asphalt,bumpMap:asphalt,bumpScale:.1,roughness:1,flatShading:false});
    const leaves=new T.MeshBasicMaterial({map:cedar,alphaTest:.55,side:T.DoubleSide,color:'#a2afa4',fog:true});
    const posts=[],reflectors=[],rocks=[],trees=[];
    for(let i=0;i<42;i++){const t=-.36+i/41*1.72;posts.push(matrix(roadPoint(t,-3.65,.4),[1,1,1]));if(i%2===0)reflectors.push(matrix(roadPoint(t,-3.6,.87),[1,1,1]));}
    for(let i=0;i<180;i++){const a=i*2.39996,r=12+(i%9)*1.1,p=new T.Vector3(Math.sin(a)*r,-.12-Math.max(0,r-13)*.48,Math.cos(a)*r-2.3);rocks.push(matrix(p,[.35+(i%4)*.2,.18+(i%3)*.12,.3+(i%5)*.2],a));}
    const count=low?12:20;
    for(let i=0;i<count;i++){const a=i*2.39996,r=19+(i%7)*2.6,h=9+(i%6)*.8;const p=new T.Vector3(Math.sin(a)*r,h/2-.4-Math.max(0,r-13)*.48,Math.cos(a)*r-2.3);trees.push(matrix(p,[h*.62,h,1],a));trees.push(matrix(p,[h*.62,h,1],a+Math.PI/2));}
    return {terrain,road,edges,rail,postGeo,reflectorGeo,rockGeo,treeGeo,steel,amber,rock,leaves,posts,reflectors,rocks,trees};
  },[cedar,low,asphalt]);
  useEffect(()=>()=>{[assets.terrain,assets.road,...assets.edges,assets.rail,assets.postGeo,assets.reflectorGeo,assets.rockGeo,assets.treeGeo,assets.steel,assets.amber,assets.rock,assets.leaves].forEach(x=>x.dispose());},[assets]);
  return <group>
    <mesh position={[0,5,-2.3]} rotation={[0,.55,0]}><cylinderGeometry args={[88,88,75,80,1,true]}/><meshBasicMaterial map={valley} side={T.BackSide} fog={false} toneMapped={false} color="#b5c1c3"/></mesh>
    <mesh geometry={assets.terrain} receiveShadow><meshStandardMaterial color="#29382d" roughness={1} map={asphalt}/></mesh>
    <mesh geometry={assets.road} receiveShadow><meshStandardMaterial map={asphalt} bumpMap={asphalt} bumpScale={.018} color="#a0a9ac" roughness={.76} metalness={.06} side={T.DoubleSide}/></mesh>
    {assets.edges.map((g,i)=><mesh key={i} geometry={g} position={[0,.003,0]}><meshStandardMaterial color="#b6b5a0" roughness={.95}/></mesh>)}
    <mesh geometry={assets.rail} material={assets.steel}/>
    <Instances geometry={assets.postGeo} material={assets.steel} matrices={assets.posts}/>
    <Instances geometry={assets.reflectorGeo} material={assets.amber} matrices={assets.reflectors}/>
    <Instances geometry={assets.rockGeo} material={assets.rock} matrices={assets.rocks}/>
    <Instances geometry={assets.treeGeo} material={assets.leaves} matrices={assets.trees}/>
  </group>;
}
