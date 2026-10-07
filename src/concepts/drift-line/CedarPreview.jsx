import React, { useMemo } from 'react';
import * as T from 'three';
// Review-only environment: the road follows the existing animation's ellipse.
function point(t, offset=0, y=0.03){const a=-1.15+t*3.6,dx=7*Math.cos(a),dz=-4.4*Math.sin(a),l=Math.hypot(dx,dz);return new T.Vector3(Math.sin(a)*7+dz/l*offset,y,Math.cos(a)*4.4-2.3-dx/l*offset);}
function ribbon(offset,width){const v=[],ix=[];for(let i=0;i<=160;i++){for(const s of [-1,1])v.push(...point(-.3+i/160*1.6,offset+s*width).toArray());if(i<160){const n=i*2;ix.push(n,n+1,n+2,n+1,n+3,n+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();return g;}
export default function CedarPreview(){const parts=useMemo(()=>({road:ribbon(-.6,2.85),edges:[ribbon(-3.22,.035),ribbon(2.02,.035)],rail:new T.TubeGeometry(new T.CatmullRomCurve3(Array.from({length:100},(_,i)=>point(-.3+i/99*1.6,-3.7,.8))),180,.065,5,false)}),[]);
const trees=useMemo(()=>Array.from({length:90},(_,i)=>{const a=i*2.39996,r=15+(i%11)*2;return {x:Math.sin(a)*r,z:Math.cos(a)*r-2,h:5+(i%7)*.75};}),[]);
return <group>
<mesh rotation={[-Math.PI/2,0,0]} position={[0,-.035,0]} receiveShadow><planeGeometry args={[180,180]}/><meshStandardMaterial color="#263d31" roughness={1}/></mesh>
<mesh geometry={parts.road} receiveShadow><meshStandardMaterial color="#353f42" roughness={.8} side={T.DoubleSide}/></mesh>
{parts.edges.map((g,i)=><mesh key={i} geometry={g} position={[0,.005,0]}><meshBasicMaterial color="#b5b6a5"/></mesh>)}
<mesh geometry={parts.rail}><meshStandardMaterial color="#819297" metalness={.55} roughness={.5}/></mesh>
{Array.from({length:35},(_,i)=><mesh key={i} position={point(-.3+i/34*1.6,-3.7,.4)}><boxGeometry args={[.075,.8,.075]}/><meshStandardMaterial color="#69797e"/></mesh>)}
{trees.map((t,i)=><group key={i} position={[t.x,0,t.z]}><mesh position={[0,t.h/2,0]}><cylinderGeometry args={[.10,.23,t.h,5]}/><meshStandardMaterial color="#383b32"/></mesh>{[0,1,2].map(k=><mesh key={k} position={[0,t.h*.48+k*t.h*.2,0]}><coneGeometry args={[1.5-k*.3,t.h*.55,7]}/><meshStandardMaterial color={i%2?'#203e36':'#29493e'} roughness={1}/></mesh>)}</group>)}
{Array.from({length:10},(_,i)=><mesh key={i} position={[Math.sin(i*1.8)*56,-2,Math.cos(i*1.8)*56]}><coneGeometry args={[17,18+(i%3)*9,7]}/><meshStandardMaterial color="#536d70" roughness={1}/></mesh>)}
</group>;
}

