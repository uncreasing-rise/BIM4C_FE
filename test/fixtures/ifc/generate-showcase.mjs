import { createHash } from "node:crypto";

/**
 * The public demo model: an authored 8-storey office tower on a paved plaza.
 * Illustrative geometry only (not a real design), built to show what the
 * viewer does: a glass curtain wall over a concrete frame and core, stairs,
 * rooftop plant, and per-floor MEP (supply/return ducts, sprinkler and chilled
 * water pipes, cable trays). Each floor's cable tray runs through the core
 * wall on purpose, so the clash check has real conflicts to find.
 *
 * Colours are linear RGB (the viewer converts them to sRGB for display).
 * Run `node test/fixtures/ifc/build-showcase.mjs` to regenerate the file.
 */
export function generateShowcaseIfc() {
  const lines = [];
  let sequence = 0;
  const add = (text) => {
    const id = ++sequence;
    lines.push(`#${id}=${text};`);
    return `#${id}`;
  };
  const guid = (label) =>
    `'${createHash("sha256").update(`showcase:${label}`).digest("base64").replaceAll("+", "$").replaceAll("/", "_").replace(/^[^0-3]/, "1").slice(0, 22)}'`;
  const n = (v) => {
    const s = String(Math.round(v * 10000) / 10000);
    return s.includes(".") || s.includes("e") ? s : `${s}.`;
  };
  const text = (s) => `'${s.replaceAll("'", "''")}'`;

  // ---- Shared geometry context ------------------------------------------------
  const point = (x, y, z) => add(`IFCCARTESIANPOINT((${n(x)},${n(y)},${n(z)}))`);
  const direction = (x, y, z) => add(`IFCDIRECTION((${n(x)},${n(y)},${n(z)}))`);
  const origin = point(0, 0, 0);
  const axis = add(`IFCAXIS2PLACEMENT3D(${origin},$,$)`);
  const profileAxis = add(`IFCAXIS2PLACEMENT2D(${add("IFCCARTESIANPOINT((0.,0.))")},$)`);
  const Z = direction(0, 0, 1);
  const X = direction(1, 0, 0);
  const Y = direction(0, 1, 0);
  // Extrusion frames: local Z along world X (or Y) so a profile can run along it.
  const alongX = add(`IFCAXIS2PLACEMENT3D(${origin},${X},${Y})`);
  const alongY = add(`IFCAXIS2PLACEMENT3D(${origin},${Y},${X})`);
  const context = add(`IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,${axis},$)`);
  const units = add(
    `IFCUNITASSIGNMENT((${add("IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)")},${add("IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.)")},${add("IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.)")}))`,
  );

  // ---- Styles and materials ---------------------------------------------------
  const PALETTE = {
    concrete: [[0.67, 0.65, 0.61], 0],
    frame: [[0.51, 0.48, 0.42], 0],
    glass: [[0.27, 0.48, 0.62], 0.55],
    spandrel: [[0.045, 0.063, 0.08], 0],
    aluminium: [[0.1, 0.12, 0.15], 0],
    paving: [[0.6, 0.57, 0.51], 0],
    plant: [[0.58, 0.62, 0.66], 0],
    supply: [[0.21, 0.45, 0.66], 0],
    return: [[0.33, 0.6, 0.33], 0],
    sprinkler: [[0.65, 0.05, 0.05], 0],
    chilled: [[0.05, 0.21, 0.65], 0],
    tray: [[0.87, 0.35, 0.03], 0],
    steel: [[0.07, 0.08, 0.1], 0],
    planter: [[0.32, 0.29, 0.25], 0],
    green: [[0.16, 0.34, 0.08], 0],
  };
  const styles = new Map();
  const style = (key) => {
    if (!styles.has(key)) {
      const [[r, g, b], transparency] = PALETTE[key];
      const colour = add(`IFCCOLOURRGB($,${n(r)},${n(g)},${n(b)})`);
      const shading = add(`IFCSURFACESTYLESHADING(${colour},${n(transparency)})`);
      styles.set(key, add(`IFCSURFACESTYLE(${text(key)},.BOTH.,(${shading}))`));
    }
    return styles.get(key);
  };
  const materials = new Map();
  const materialElements = new Map();
  const material = (name) => {
    if (!materials.has(name)) {
      materials.set(name, add(`IFCMATERIAL(${text(name)},$,$)`));
      materialElements.set(name, []);
    }
    return name;
  };

  // ---- Shapes -----------------------------------------------------------------
  const shapes = new Map();
  const body = (key, items) => {
    if (!shapes.has(key)) {
      const rep = add(`IFCSHAPEREPRESENTATION(${context},'Body','SweptSolid',(${items().join(",")}))`);
      shapes.set(key, add(`IFCPRODUCTDEFINITIONSHAPE($,$,(${rep}))`));
    }
    return shapes.get(key);
  };
  const styled = (solid, styleKey) => {
    add(`IFCSTYLEDITEM(${solid},(${style(styleKey)}),$)`);
    return solid;
  };
  const rectangle = (w, d) => add(`IFCRECTANGLEPROFILEDEF(.AREA.,$,${profileAxis},${n(w)},${n(d)})`);
  const circle = (r) => add(`IFCCIRCLEPROFILEDEF(.AREA.,$,${profileAxis},${n(r)})`);
  /** Vertical box, centred on the placement in plan, from z = 0 up. */
  const box = (w, d, h, styleKey) =>
    body(`box:${w}:${d}:${h}:${styleKey}`, () => [
      styled(add(`IFCEXTRUDEDAREASOLID(${rectangle(w, d)},${axis},${Z},${n(h)})`), styleKey),
    ]);
  /**
   * A run along world X (or Y) from the placement, centred on its axis.
   * Profile XDim is the width across the run, YDim the height.
   */
  const run = (along, length, profile, key, styleKey) =>
    body(`run:${along}:${length}:${key}:${styleKey}`, () => [
      styled(add(`IFCEXTRUDEDAREASOLID(${profile()},${along === "x" ? alongX : alongY},${Z},${n(length)})`), styleKey),
    ]);
  const cylinder = (r, h, styleKey) =>
    body(`cyl:${r}:${h}:${styleKey}`, () => [styled(add(`IFCEXTRUDEDAREASOLID(${circle(r)},${axis},${Z},${n(h)})`), styleKey)]);
  /** A straight flight of steps rising along +Y. */
  const stairShape = (risers, riser, tread, width) =>
    body(`stair:${risers}:${riser}:${tread}:${width}`, () => Array.from({ length: risers }, (_, i) => {
      const at = add(`IFCAXIS2PLACEMENT3D(${point(0, i * tread + tread / 2, 0)},$,$)`);
      return styled(add(`IFCEXTRUDEDAREASOLID(${rectangle(width, tread)},${at},${Z},${n((i + 1) * riser)})`), "frame");
    }));

  // ---- Spatial structure ------------------------------------------------------
  const project = add(`IFCPROJECT(${guid("project")},$,'BIM4C Showcase',$,$,$,$,(${context}),${units})`);
  const root = add(`IFCLOCALPLACEMENT($,${axis})`);
  const site = add(`IFCSITE(${guid("site")},$,'BIM4C Plaza',$,$,${root},$,$,.ELEMENT.,$,$,$,$,$)`);
  const building = add(`IFCBUILDING(${guid("building")},$,'BIM4C Tower',$,$,${root},$,$,.ELEMENT.,$,$,$)`);
  add(`IFCRELAGGREGATES(${guid("r-project")},$,$,$,${project},(${site}))`);
  add(`IFCRELAGGREGATES(${guid("r-site")},$,$,$,${site},(${building}))`);

  const placed = (x, y, z) => add(`IFCLOCALPLACEMENT(${root},${add(`IFCAXIS2PLACEMENT3D(${point(x, y, z)},$,$)`)})`);
  const quantities = [];
  const element = (kind, name, at, shape, materialName, extra = "$,$") => {
    const id = add(`${kind}(${guid(name)},$,${text(name)},$,$,${placed(...at)},${shape},${extra})`);
    if (materialName) materialElements.get(material(materialName)).push(id);
    return id;
  };
  const pset = (target, name, props) => {
    const values = Object.entries(props).map(([key, value]) =>
      add(
        `IFCPROPERTYSINGLEVALUE(${text(key)},$,${
          typeof value === "boolean"
            ? `IFCBOOLEAN(.${value ? "T" : "F"}.)`
            : typeof value === "number"
              ? `IFCREAL(${n(value)})`
              : `IFCLABEL(${text(value)})`
        },$)`,
      ),
    );
    const set = add(`IFCPROPERTYSET(${guid(`${target}:${name}`)},$,${text(name)},$,(${values.join(",")}))`);
    add(`IFCRELDEFINESBYPROPERTIES(${guid(`${target}:${name}:rel`)},$,$,$,(${target}),${set})`);
  };
  const volume = (target, name, value) => quantities.push([target, name, value]);

  // ---- Building -----------------------------------------------------------------
  const W = 36; // east-west
  const D = 24; // north-south
  const levels = [0, 5, 8.8, 12.6, 16.4, 20.2, 24, 27.8];
  const roofLevel = 31.6;
  const panel = 1.5;
  const columnsX = [-15, -9, -3, 3, 9, 15];
  const columnsY = [-9, -3, 3, 9];
  const inCore = (x, y) => Math.abs(x) < 4 && Math.abs(y) < 4;
  const storeys = [];

  levels.forEach((z0, f) => {
    const top = levels[f + 1] ?? roofLevel;
    const height = top - z0;
    const name = f === 0 ? "Level 01 (Lobby)" : `Level ${String(f + 1).padStart(2, "0")}`;
    const storey = add(`IFCBUILDINGSTOREY(${guid(`storey-${f}`)},$,${text(name)},$,$,${root},$,$,.ELEMENT.,${n(z0)})`);
    storeys.push(storey);
    const contained = [];
    const put = (id) => (contained.push(id), id);
    const tag = `L${f + 1}`;

    // Floor slab (its top at the storey level).
    const slab = put(element("IFCSLAB", `Slab ${tag}`, [0, 0, z0 - 0.3], box(W, D, 0.3, "concrete"), "Concrete C30/37", "$,.FLOOR."));
    pset(slab, "Pset_SlabCommon", { LoadBearing: true, IsExternal: false, FireRating: "REI 120" });
    volume(slab, "NetVolume", W * D * 0.3);

    // Columns on the grid, clear of the core.
    for (const x of columnsX)
      for (const y of columnsY) {
        if (inCore(x, y)) continue;
        const c = put(element("IFCCOLUMN", `Column ${tag} ${x}/${y}`, [x, y, z0], box(0.6, 0.6, height - 0.3, "frame"), "Concrete C40/50", "$,.COLUMN."));
        volume(c, "NetVolume", 0.36 * (height - 0.3));
      }

    // Concrete core: four walls around the lifts and stair.
    for (const [wx, wy, ww, wd, label] of [
      [0, -3.85, 8, 0.3, "south"],
      [0, 3.85, 8, 0.3, "north"],
      [-3.85, 0, 0.3, 7.4, "west"],
      [3.85, 0, 0.3, 7.4, "east"],
    ]) {
      const wall = put(element("IFCWALL", `Core wall ${tag} ${label}`, [wx, wy, z0], box(ww, wd, height - 0.3, "frame"), "Concrete C40/50", "$,.SHEAR."));
      pset(wall, "Pset_WallCommon", { LoadBearing: true, IsExternal: false, FireRating: "REI 120" });
    }

    // Stair inside the core.
    const risers = Math.round((height - 0.3) / 0.18);
    put(element("IFCSTAIR", `Stair ${tag}`, [-2.6, -3.5, z0], stairShape(risers, (height - 0.3) / risers, 6.8 / risers, 1.3), "Concrete C30/37", "$,.STRAIGHT_RUN_STAIR."));

    // Curtain wall: one assembly per facade, glass + spandrel + mullions.
    const out = 0.1;
    const facades = [
      ["south", "x", -W / 2, -D / 2 - out, W],
      ["north", "x", -W / 2, D / 2 + out, W],
      ["west", "y", -W / 2 - out, -D / 2, D],
      ["east", "y", W / 2 + out, -D / 2, D],
    ];
    for (const [side, along, fx, fy, length] of facades) {
      const wall = put(element("IFCCURTAINWALL", `Curtain wall ${tag} ${side}`, [0, 0, z0], "$", null));
      const parts = [];
      const count = Math.round(length / panel);
      const vision = height - 0.9;
      for (let i = 0; i < count; i++) {
        const mid = i * panel + panel / 2;
        const px = along === "x" ? fx + mid : fx;
        const py = along === "x" ? fy : fy + mid;
        const [pw, pd] = along === "x" ? [panel - 0.06, 0.03] : [0.03, panel - 0.06];
        // The lobby entrance replaces two glass bays with doors.
        const entrance = f === 0 && side === "south" && Math.abs(px) < panel;
        if (entrance) {
          parts.push(element("IFCDOOR", `Entrance door ${px < 0 ? "west" : "east"}`, [px, py, z0], box(pw, 0.06, 3, "glass"), "Glass", `$,${n(3)},${n(pw)},.DOOR.,.SINGLE_SWING_LEFT.,$`));
        } else
          parts.push(element("IFCPLATE", `Glass ${tag} ${side} ${i + 1}`, [px, py, z0 + 0.05], box(pw, pd, vision - 0.05, "glass"), "Glass", "$,.CURTAIN_PANEL."));
        parts.push(element("IFCPLATE", `Spandrel ${tag} ${side} ${i + 1}`, [px, py, top - 0.85], box(pw, pd, 0.85, "spandrel"), "Aluminium", "$,.CURTAIN_PANEL."));
        const mx = along === "x" ? fx + i * panel : fx;
        const my = along === "x" ? fy : fy + i * panel;
        parts.push(element("IFCMEMBER", `Mullion ${tag} ${side} ${i + 1}`, [mx, my, z0], box(along === "x" ? 0.06 : 0.18, along === "x" ? 0.18 : 0.06, height, "aluminium"), "Aluminium", "$,.MULLION."));
      }
      add(`IFCRELAGGREGATES(${guid(`cw-${tag}-${side}`)},$,$,$,${wall},(${parts.join(",")}))`);
    }

    // MEP in the ceiling zone.
    const ceiling = top - 0.3 - 0.6;
    const duct = (name, y, w, h, styleKey, mat) =>
      put(element("IFCDUCTSEGMENT", `${name} ${tag}`, [-16, y, ceiling], run("x", 32, () => rectangle(w, h), `r${w}x${h}`, styleKey), mat, "$,.RIGIDSEGMENT."));
    duct("Supply duct", 6.2, 1.0, 0.45, "supply", "Galvanised steel");
    duct("Return duct", -6.2, 0.9, 0.4, "return", "Galvanised steel");
    for (const x of [-10, 10])
      put(element("IFCDUCTSEGMENT", `Supply branch ${tag} ${x}`, [x, 6.7, ceiling], run("y", 4.3, () => rectangle(0.5, 0.3), "b0.5x0.3", "supply"), "Galvanised steel", "$,.RIGIDSEGMENT."));
    const pipe = (name, y, r, zOffset, styleKey) =>
      put(element("IFCPIPESEGMENT", `${name} ${tag}`, [-17, y, ceiling + zOffset], run("x", 34, () => circle(r), `c${r}`, styleKey), "Steel", "$,.RIGIDSEGMENT."));
    pipe("Sprinkler main", -7.6, 0.06, 0.2, "sprinkler");
    pipe("Chilled water flow", 9.6, 0.08, 0.3, "chilled");
    pipe("Chilled water return", 10.0, 0.08, 0.3, "chilled");
    // Runs through the south core wall (y -4.0 … -3.7): an intentional clash.
    put(element("IFCCABLECARRIERSEGMENT", `Cable tray ${tag}`, [0.6, -11, ceiling + 0.45], run("y", 9, () => rectangle(0.4, 0.1), "t0.4x0.1", "tray"), "Galvanised steel", "$,.CABLETRAYSEGMENT."));

    add(`IFCRELCONTAINEDINSPATIALSTRUCTURE(${guid(`contains-${f}`)},$,$,$,(${contained.join(",")}),${storey})`);
  });

  // ---- Roof ---------------------------------------------------------------------
  const roof = add(`IFCBUILDINGSTOREY(${guid("storey-roof")},$,'Roof',$,$,${root},$,$,.ELEMENT.,${n(roofLevel)})`);
  storeys.push(roof);
  const onRoof = [];
  onRoof.push(element("IFCSLAB", "Roof slab", [0, 0, roofLevel - 0.3], box(W, D, 0.3, "concrete"), "Concrete C30/37", "$,.ROOF."));
  for (const [px, py, pw, pd, label] of [
    [0, -D / 2 + 0.125, W, 0.25, "south"],
    [0, D / 2 - 0.125, W, 0.25, "north"],
    [-W / 2 + 0.125, 0, 0.25, D - 0.5, "west"],
    [W / 2 - 0.125, 0, 0.25, D - 0.5, "east"],
  ])
    onRoof.push(element("IFCWALL", `Parapet ${label}`, [px, py, roofLevel], box(pw, pd, 1.1, "concrete"), "Concrete C30/37", "$,.PARAPET."));
  onRoof.push(element("IFCWALL", "Lift overrun", [0, 0, roofLevel], box(8.3, 8.0, 3.2, "frame"), "Concrete C40/50", "$,.SOLIDWALL."));
  for (const x of [-11, 11])
    onRoof.push(element("IFCUNITARYEQUIPMENT", `Air handling unit ${x < 0 ? "west" : "east"}`, [x, 4, roofLevel], box(5, 2.4, 2.2, "plant"), "Steel", "$,.AIRHANDLER."));
  add(`IFCRELCONTAINEDINSPATIALSTRUCTURE(${guid("contains-roof")},$,$,$,(${onRoof.join(",")}),${roof})`);

  // ---- Plaza: paving, canopy and planters ----------------------------------------
  const outside = [];
  outside.push(element("IFCSLAB", "Plaza paving", [0, -4, -0.5], box(72, 52, 0.2, "paving"), "Granite paving", "$,.BASESLAB."));
  outside.push(element("IFCSLAB", "Entrance canopy", [0, -D / 2 - 2.25, 4.3], box(10, 4, 0.25, "steel"), "Steel", "$,.ROOF."));
  for (const x of [-4.5, 4.5])
    outside.push(element("IFCCOLUMN", `Canopy post ${x < 0 ? "west" : "east"}`, [x, -D / 2 - 3.9, 0], box(0.2, 0.2, 4.3, "steel"), "Steel", "$,.COLUMN."));
  for (const x of [-22, -14, 14, 22]) {
    outside.push(element("IFCBUILDINGELEMENTPROXY", `Planter ${x}`, [x, -D / 2 - 7, -0.3], box(3, 3, 0.8, "planter"), "Concrete C30/37", "$,$"));
    outside.push(element("IFCGEOGRAPHICELEMENT", `Tree ${x}`, [x, -D / 2 - 7, 0.5], cylinder(1.2, 2.6, "green"), null, "$,.TERRAIN."));
  }
  add(`IFCRELCONTAINEDINSPATIALSTRUCTURE(${guid("contains-site")},$,$,$,(${outside.join(",")}),${site})`);

  add(`IFCRELAGGREGATES(${guid("r-storeys")},$,$,$,${building},(${storeys.join(",")}))`);
  for (const [name, elements] of materialElements)
    if (elements.length)
      add(`IFCRELASSOCIATESMATERIAL(${guid(`mat-${name}`)},$,$,$,(${elements.join(",")}),${materials.get(name)})`);
  for (const [target, name, value] of quantities) {
    const q = add(`IFCQUANTITYVOLUME(${text(name)},$,$,${n(value)},$)`);
    const set = add(`IFCELEMENTQUANTITY(${guid(`${target}:qto`)},$,'Qto_BaseQuantities',$,$,(${q}))`);
    add(`IFCRELDEFINESBYPROPERTIES(${guid(`${target}:qto:rel`)},$,$,$,(${target}),${set})`);
  }

  return `ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION(('BIM4C showcase model: illustrative geometry, not a design'),'2;1');\nFILE_NAME('bim4c-commercial-tower.ifc','2026-09-27T00:00:00',('BIM4C'),('BIM4C'),'BIM4C showcase generator','BIM4C','Demonstration only');\nFILE_SCHEMA(('IFC4'));\nENDSEC;\nDATA;\n${lines.join("\n")}\nENDSEC;\nEND-ISO-10303-21;\n`;
}
