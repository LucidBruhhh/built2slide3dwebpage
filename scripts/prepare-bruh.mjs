import { NodeIO } from "@gltf-transform/core";
import { weld, simplify, prune, dedup } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import { stat } from "node:fs/promises";
const input = process.argv[2] || "source-assets/candidate-a.glb",
  output = process.argv[3] || "public/assets/models/bruh-v2.glb";
const io = new NodeIO();
const doc = await io.read(input);
const count = () =>
  doc
    .getRoot()
    .listMeshes()
    .reduce(
      (n, m) =>
        n +
        m
          .listPrimitives()
          .reduce((n, p) => n + p.getIndices().getCount() / 3, 0),
      0,
    );
const before = count();
await doc.transform(
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.38, error: 0.0005 }),
  dedup(),
  prune(),
);
await io.write(output, doc);
console.log(
  JSON.stringify({
    trianglesBefore: before,
    trianglesAfter: count(),
    bytesBefore: (await stat(input)).size,
    bytesAfter: (await stat(output)).size,
  }),
);
