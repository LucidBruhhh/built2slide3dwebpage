import * as T from 'three';
export function rearPlate(body) {
  body.updateMatrixWorld(true);
  const ray = new T.Raycaster(new T.Vector3(0,.445,-4),new T.Vector3(0,0,1));
  const hit = ray.intersectObject(body,true)[0];
  if(!hit) return null;
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;
  const c=canvas.getContext('2d');c.fillStyle='#eeeedd';c.fillRect(0,0,768,384);c.strokeStyle='#202326';c.lineWidth=14;c.strokeRect(10,10,748,364);
  c.fillStyle='#17191b';c.textAlign='center';c.font='500 44px Arial';c.fillText('N S W',384,66);c.font='bold 220px "Barlow Condensed", sans-serif';c.fillText('BRUH',384,306);
  for(const x of [46,722]){c.beginPath();c.arc(x,44,10,0,Math.PI*2);c.fill();}
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
  const mesh=new T.Mesh(new T.PlaneGeometry(.42,.21),new T.MeshStandardMaterial({map:tex,roughness:.55,metalness:.08}));
  mesh.rotation.y=Math.PI;mesh.position.copy(hit.point);  let rearZ=hit.point.z;
  for(const x of [-.18,0,.18]) for(const y of [.345,.43,.53]) {
    ray.set(new T.Vector3(x,y,-4),new T.Vector3(0,0,1));
    const sample=ray.intersectObject(body,true)[0];if(sample)rearZ=Math.min(rearZ,sample.point.z);
  }
  mesh.position.set(0,.43,rearZ-.012);return mesh;
}



