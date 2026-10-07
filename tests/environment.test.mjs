import test from 'node:test';
import assert from 'node:assert/strict';
import {roadPoint,roadRibbon} from '../src/concepts/drift-line/roadGeometry.js';
import {trajectory,heading} from '../src/animation/trajectory.js';
import {driftAngle} from '../src/animation/choreography.js';
test('road centre matches animation and road triangles have positive area/upward normals',()=>{for(let i=0;i<=100;i++){const t=i/100,p=roadPoint(t),q=trajectory(t);assert.ok(Math.hypot(p.x-q[0],p.z-q[2])<1e-6);}const g=roadRibbon(-.6,2.85),p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<n.count;i++){assert.ok(n.getY(i)>.99);assert.ok(Number.isFinite(p.getX(i)));}g.dispose();});
test('drifting tyre contact points stay on the paved road throughout the sequence',()=>{for(let i=0;i<=200;i++){const t=i/200,p=trajectory(t),yaw=heading(t)+driftAngle(t);for(const axle of [-1.342,1.342])for(const side of [-1,1]){const x=p[0]+Math.sin(yaw)*axle+Math.cos(yaw)*side*.835,z=p[2]+Math.cos(yaw)*axle-Math.sin(yaw)*side*.835;let nearest=Infinity,lateral=0;for(let j=0;j<=1000;j++){const u=-.36+j/1000*1.72,c=roadPoint(u),d=Math.hypot(x-c.x,z-c.z);if(d<nearest){nearest=d;const inward=roadPoint(u,1);lateral=(x-c.x)*(inward.x-c.x)+(z-c.z)*(inward.z-c.z);}}assert.ok(lateral> -3.45+.12&&lateral<2.25-.12,`tyre off road at ${t}: ${lateral}`);}}});
