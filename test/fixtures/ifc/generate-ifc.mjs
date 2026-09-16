import { createHash } from "node:crypto";

/** Authored demonstration building, not an exported or certified design model. */
export function generateDemoIfc({ millimetres = false } = {}) {
  const lines = [];
  let sequence = 0;
  const add = (text) => {
    const id = ++sequence;
    lines.push(`#${id}=${text};`);
    return `#${id}`;
  };
  const guid = (label) =>
    `'0${createHash("sha256").update(label).digest("base64").replaceAll("+", "$").replaceAll("/", "_").slice(0, 21)}'`;
  const scale = millimetres ? 1000 : 1;
  const n = (v) => {
    const s = String(v * scale);
    return s.includes(".") ? s : `${s}.`;
  };
  const origin = add("IFCCARTESIANPOINT((0.,0.,0.))");
  const axis = add(`IFCAXIS2PLACEMENT3D(${origin},$,$)`);
  const profileOrigin = add("IFCCARTESIANPOINT((0.,0.))");
  const profileAxis = add(`IFCAXIS2PLACEMENT2D(${profileOrigin},$)`);
  const z = add("IFCDIRECTION((0.,0.,1.))");
  const context = add(
    `IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,${axis},$)`,
  );
  const length = add(
    `IFCSIUNIT(*,.LENGTHUNIT.,${millimetres ? ".MILLI." : "$"},.METRE.)`,
  );
  const area = add("IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.)");
  const volume = add("IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.)");
  const units = add(`IFCUNITASSIGNMENT((${length},${area},${volume}))`);
  const project = add(
    `IFCPROJECT(${guid("project")},$,'BIM4C IFC demonstration',$,$,$,$,(${context}),${units})`,
  );
  const rootPlacement = add(`IFCLOCALPLACEMENT($,${axis})`);
  const site = add(
    `IFCSITE(${guid("site")},$,'Demonstration site',$,$,${rootPlacement},$,$,.ELEMENT.,$,$,$,$,$)`,
  );
  const building = add(
    `IFCBUILDING(${guid("building")},$,'Three-storey demonstration building',$,$,${rootPlacement},$,$,.ELEMENT.,$,$,$)`,
  );
  add(`IFCRELAGGREGATES(${guid("project-site")},$,$,$,${project},(${site}))`);
  add(`IFCRELAGGREGATES(${guid("site-building")},$,$,$,${site},(${building}))`);
  const concrete = add("IFCMATERIAL('Demo concrete',$,$)");
  const steel = add("IFCMATERIAL('Demo steel',$,$)");
  const materialElements = new Map([
    [concrete, []],
    [steel, []],
  ]);
  const shapeCache = new Map();
  const shape = (w, d, h, kind) => {
    const key = `${w}/${d}/${h}/${kind}`;
    if (shapeCache.has(key)) return shapeCache.get(key);
    const profile = add(
      `IFCRECTANGLEPROFILEDEF(.AREA.,$,${profileAxis},${n(w)},${n(d)})`,
    );
    const solid = add(`IFCEXTRUDEDAREASOLID(${profile},${axis},${z},${n(h)})`);
    const rgb =
      kind === "IFCDUCTFITTING"
        ? "0.08,0.55,0.62"
        : kind === "IFCSLAB"
          ? "0.38,0.48,0.58"
          : kind === "IFCWALL"
            ? "0.72,0.72,0.68"
            : "0.5,0.57,0.65";
    const colour = add(`IFCCOLOURRGB($,${rgb})`);
    const shading = add(`IFCSURFACESTYLESHADING(${colour},0.)`);
    const style = add(`IFCSURFACESTYLE($,.BOTH.,(${shading}))`);
    add(`IFCSTYLEDITEM(${solid},(${style}),$)`);
    const rep = add(
      `IFCSHAPEREPRESENTATION(${context},'Body','SweptSolid',(${solid}))`,
    );
    const result = add(`IFCPRODUCTDEFINITIONSHAPE($,$,(${rep}))`);
    shapeCache.set(key, result);
    return result;
  };
  const storeys = [];
  for (let floor = 0; floor < 3; floor++) {
    const elevation = floor * 3.6;
    const storey = add(
      `IFCBUILDINGSTOREY(${guid(`storey-${floor}`)},$,'Level ${floor + 1}',$,$,${rootPlacement},$,$,.ELEMENT.,${n(elevation)})`,
    );
    storeys.push(storey);
    const elements = [];
    const element = (kind, name, x, y, z0, w, d, h, material = concrete) => {
      const point = add(`IFCCARTESIANPOINT((${n(x)},${n(y)},${n(z0)}))`);
      const placement = add(
        `IFCLOCALPLACEMENT(${rootPlacement},${add(`IFCAXIS2PLACEMENT3D(${point},$,$)`)})`,
      );
      const id = add(
        `${kind}(${guid(name)},$,'${name}',$,$,${placement},${shape(w, d, h, kind)},$,$)`,
      );
      elements.push(id);
      materialElements.get(material).push(id);
      const quantity = add(
        `IFCQUANTITYVOLUME('NetVolume',$,${volume},${w * d * h},$)`,
      );
      const set = add(
        `IFCELEMENTQUANTITY(${guid(name + "-qto")},$,'Demo quantities',$,$,(${quantity}))`,
      );
      add(
        `IFCRELDEFINESBYPROPERTIES(${guid(name + "-rel-qto")},$,$,$,(${id}),${set})`,
      );
      return id;
    };
    element("IFCSLAB", `Slab L${floor + 1}`, 0, 0, elevation, 24, 18, 0.3);
    for (const x of [-10, 0, 10])
      for (const y of [-7, 7])
        element(
          "IFCCOLUMN",
          `Column ${floor}-${x}-${y}`,
          x,
          y,
          elevation + 0.3,
          0.6,
          0.6,
          3.3,
        );
    const wall = element(
      "IFCWALL",
      `Wall L${floor + 1}`,
      0,
      -8,
      elevation + 0.3,
      20,
      0.2,
      3.3,
    );
    const property = add(
      "IFCPROPERTYSINGLEVALUE('Reference',$,IFCLABEL('DEMO-WALL'),$)",
    );
    const loadBearing = add(
      "IFCPROPERTYSINGLEVALUE('LoadBearing',$,IFCBOOLEAN(.FALSE.),$)",
    );
    const pset = add(
      `IFCPROPERTYSET(${guid(`pset-${floor}`)},$,'Pset_WallCommon',$,(${property},${loadBearing}))`,
    );
    add(
      `IFCRELDEFINESBYPROPERTIES(${guid(`rel-pset-${floor}`)},$,$,$,(${wall}),${pset})`,
    );
    // This subtype was omitted by the old fixed entity list.
    element(
      "IFCDUCTFITTING",
      `Duct fitting L${floor + 1}`,
      2,
      2,
      elevation + 2.8,
      1,
      0.8,
      0.4,
      steel,
    );
    add(
      `IFCRELCONTAINEDINSPATIALSTRUCTURE(${guid(`contains-${floor}`)},$,$,$,(${elements.join(",")}),${storey})`,
    );
  }
  add(
    `IFCRELAGGREGATES(${guid("building-storeys")},$,$,$,${building},(${storeys.join(",")}))`,
  );
  for (const [material, elements] of materialElements)
    add(
      `IFCRELASSOCIATESMATERIAL(${guid(material)},$,$,$,(${elements.join(",")}),${material})`,
    );
  return `ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('BIM4C authored demonstration geometry'),'2;1');\nFILE_NAME('bim4c-commercial-tower.ifc','2026-09-15T00:00:00',('BIM4C'),('BIM4C'),'BIM4C demo generator','BIM4C','Demonstration only');\nFILE_SCHEMA(('IFC4'));\nENDSEC;\nDATA;\n${lines.join("\n")}\nENDSEC;\nEND-ISO-10303-21;\n`;
}
