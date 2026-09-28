/**
 * BCF 2.1 (BIM Collaboration Format) topics as a .bcfzip: the open exchange
 * format for issues between Revit, Navisworks, Solibri, BIMcollab and others.
 * Each topic folder holds markup.bcf (title, status, dates), viewpoint.bcfv
 * (camera and selected IFC GUIDs) and an optional snapshot image.
 *
 * Coordinates here are IFC world metres (Z up), as BCF requires; the viewer
 * converts to and from its scene space. Parsing uses plain string matching so
 * it runs anywhere (browser, worker, tests) and tolerates namespaces and the
 * element ordering of other tools.
 */
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { ifcToScene, sceneToIfc } from "./federation";

export type BcfVec3 = [number, number, number];

export interface BcfCamera {
  /** Eye position, IFC world coordinates. */
  position: BcfVec3;
  /** Viewing direction (need not be normalised). */
  direction: BcfVec3;
  up: BcfVec3;
  /** Vertical field of view in degrees. */
  fov: number;
}

export interface BcfTopic {
  guid: string;
  title: string;
  description: string;
  status: "open" | "resolved";
  /** "Issue", "Clash", … (free text in BCF 2.1). */
  type: string;
  createdAt: string;
  author: string;
  /** IFC GlobalIds of the elements the topic is about. */
  components: string[];
  camera?: BcfCamera;
  snapshot?: { data: Uint8Array; type: "png" | "jpg" };
}

const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const unxml = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&");

const num = (n: number) => (Number.isFinite(n) ? String(Math.round(n * 1e6) / 1e6) : "0");
const vec = (tag: string, [x, y, z]: BcfVec3) =>
  `<${tag}><X>${num(x)}</X><Y>${num(y)}</Y><Z>${num(z)}</Z></${tag}>`;

export const newBcfGuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 3) | 8).toString(16);
      });

function markupXml(topic: BcfTopic, viewpointGuid: string | null, snapshotName: string | null) {
  const viewpoints = viewpointGuid
    ? `<Viewpoints Guid="${viewpointGuid}"><Viewpoint>viewpoint.bcfv</Viewpoint>${
        snapshotName ? `<Snapshot>${snapshotName}</Snapshot>` : ""
      }</Viewpoints>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<Markup xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
<Topic Guid="${topic.guid}" TopicType="${xml(topic.type)}" TopicStatus="${topic.status === "resolved" ? "Closed" : "Open"}">
<Title>${xml(topic.title)}</Title>
<CreationDate>${xml(topic.createdAt)}</CreationDate>
<CreationAuthor>${xml(topic.author)}</CreationAuthor>
<Description>${xml(topic.description)}</Description>
</Topic>
${viewpoints}
</Markup>
`;
}

function viewpointXml(topic: BcfTopic, guid: string) {
  const selection = topic.components.length
    ? `<Selection>${topic.components.map((g) => `<Component IfcGuid="${xml(g)}"/>`).join("")}</Selection>`
    : "";
  const camera = topic.camera
    ? `<PerspectiveCamera>${vec("CameraViewPoint", topic.camera.position)}${vec("CameraDirection", topic.camera.direction)}${vec("CameraUpVector", topic.camera.up)}<FieldOfView>${num(topic.camera.fov)}</FieldOfView></PerspectiveCamera>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<VisualizationInfo Guid="${guid}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
<Components>${selection}<Visibility DefaultVisibility="true"/></Components>
${camera}
</VisualizationInfo>
`;
}

/** A .bcfzip with one folder per topic. */
export function buildBcfZip(topics: BcfTopic[], projectName = "BIM4C"): Uint8Array {
  const files: Record<string, Uint8Array> = {
    "bcf.version": strToU8(
      `<?xml version="1.0" encoding="UTF-8"?>\n<Version VersionId="2.1"><DetailedVersion>2.1</DetailedVersion></Version>\n`,
    ),
    "project.bcfp": strToU8(
      `<?xml version="1.0" encoding="UTF-8"?>\n<ProjectExtension><Project ProjectId="${newBcfGuid()}"><Name>${xml(projectName)}</Name></Project><ExtensionSchema></ExtensionSchema></ProjectExtension>\n`,
    ),
  };
  for (const topic of topics) {
    const hasView = Boolean(topic.camera || topic.components.length);
    const viewpointGuid = hasView ? newBcfGuid() : null;
    const snapshotName = topic.snapshot ? `snapshot.${topic.snapshot.type === "jpg" ? "jpg" : "png"}` : null;
    files[`${topic.guid}/markup.bcf`] = strToU8(markupXml(topic, viewpointGuid, snapshotName));
    if (viewpointGuid) files[`${topic.guid}/viewpoint.bcfv`] = strToU8(viewpointXml(topic, viewpointGuid));
    if (topic.snapshot && snapshotName) files[`${topic.guid}/${snapshotName}`] = topic.snapshot.data;
  }
  return zipSync(files, { level: 6 });
}

// ---- Parsing -----------------------------------------------------------------

/** Inner text of the first <tag> (namespace prefixes ignored). */
const text = (source: string, tag: string) => {
  const match = new RegExp(`<(?:\\w+:)?${tag}\\b[^>]*>([\\s\\S]*?)</(?:\\w+:)?${tag}>`).exec(source);
  return match ? unxml(match[1].trim()) : "";
};
const attr = (source: string, tag: string, name: string) => {
  const open = new RegExp(`<(?:\\w+:)?${tag}\\b([^>]*)>`).exec(source);
  const value = open && new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`).exec(open[1]);
  return value ? unxml(value[1]) : "";
};
const readVec = (source: string, tag: string): BcfVec3 | null => {
  const block = text(source, tag);
  if (!block) return null;
  const v = ["X", "Y", "Z"].map((axis) => Number(text(block, axis))) as BcfVec3;
  return v.every(Number.isFinite) ? v : null;
};

function parseCamera(viewpoint: string): BcfCamera | undefined {
  const perspective = text(viewpoint, "PerspectiveCamera");
  const orthogonal = perspective ? "" : text(viewpoint, "OrthogonalCamera");
  const block = perspective || orthogonal;
  if (!block) return undefined;
  const position = readVec(block, "CameraViewPoint");
  const direction = readVec(block, "CameraDirection");
  const up = readVec(block, "CameraUpVector") ?? [0, 0, 1];
  if (!position || !direction || Math.hypot(...direction) < 1e-9) return undefined;
  const fov = Number(text(block, "FieldOfView"));
  // An orthogonal camera has no FOV; the viewer shows it in perspective.
  return { position, direction, up, fov: Number.isFinite(fov) && fov > 1 && fov < 179 ? fov : 60 };
}

/** Topics of a .bcfzip (BCF 2.0/2.1; also reads the common parts of 3.0). */
export function parseBcfZip(bytes: Uint8Array): BcfTopic[] {
  const files = unzipSync(bytes);
  const folders = new Map<string, Record<string, Uint8Array>>();
  for (const [path, data] of Object.entries(files)) {
    const [folder, ...rest] = path.split("/");
    if (!rest.length || !rest.join("/")) continue;
    if (!folders.has(folder)) folders.set(folder, {});
    folders.get(folder)![rest.join("/")] = data;
  }
  const topics: BcfTopic[] = [];
  for (const [folder, entries] of folders) {
    if (!entries["markup.bcf"]) continue;
    const markup = strFromU8(entries["markup.bcf"]);
    const topicXml = /<(?:\w+:)?Topic\b[\s\S]*?<\/(?:\w+:)?Topic>/.exec(markup)?.[0] ?? "";
    // The first viewpoint listed (<Viewpoint>, not <Viewpoints>), else any .bcfv.
    const viewpointName =
      text(markup, "Viewpoint") || Object.keys(entries).find((name) => name.endsWith(".bcfv")) || "";
    const viewpoint = entries[viewpointName] ? strFromU8(entries[viewpointName]) : "";
    const snapshotName =
      text(markup, "Snapshot") || Object.keys(entries).find((name) => /\.(png|jpe?g)$/i.test(name)) || "";
    const snapshotData = entries[snapshotName];
    const selection = text(viewpoint, "Selection");
    const status = attr(topicXml, "Topic", "TopicStatus") || text(topicXml, "TopicStatus");
    topics.push({
      guid: attr(topicXml, "Topic", "Guid") || folder,
      title: text(topicXml, "Title") || folder,
      description: text(topicXml, "Description"),
      status: /^(closed|resolved|done|fixed)$/i.test(status.trim()) ? "resolved" : "open",
      type: attr(topicXml, "Topic", "TopicType") || text(topicXml, "TopicType") || "Issue",
      createdAt: text(topicXml, "CreationDate") || new Date().toISOString(),
      author: text(topicXml, "CreationAuthor"),
      components: [...selection.matchAll(/\bIfcGuid\s*=\s*"([^"]+)"/g)].map((m) => m[1]),
      camera: viewpoint ? parseCamera(viewpoint) : undefined,
      snapshot: snapshotData
        ? { data: snapshotData, type: /\.jpe?g$/i.test(snapshotName) ? "jpg" : "png" }
        : undefined,
    });
  }
  return topics;
}

// ---- Viewer camera <-> BCF camera ----------------------------------------------

/** The viewer's camera: scene space (Y up), a look-at target instead of a direction. */
export interface SceneCamera {
  position: BcfVec3;
  target: BcfVec3;
  up: BcfVec3;
  fov: number;
}


/** Axis swaps negate components; -0 would leak into files and comparisons. */
const clean = (v: BcfVec3): BcfVec3 => v.map((n) => (n === 0 ? 0 : n)) as BcfVec3;

export function cameraToBcf(camera: SceneCamera, sceneOrigin: BcfVec3): BcfCamera {
  const world = (p: BcfVec3) => sceneToIfc([p[0] + sceneOrigin[0], p[1] + sceneOrigin[1], p[2] + sceneOrigin[2]]);
  const d: BcfVec3 = [
    camera.target[0] - camera.position[0],
    camera.target[1] - camera.position[1],
    camera.target[2] - camera.position[2],
  ];
  const length = Math.hypot(...d) || 1;
  return {
    position: clean(world(camera.position)),
    direction: clean(sceneToIfc([d[0] / length, d[1] / length, d[2] / length])),
    up: clean(sceneToIfc(camera.up)),
    fov: camera.fov,
  };
}

/**
 * BCF has no target, only a direction; the viewer orbits about a target, so
 * one is placed `focusDistance` metres ahead of the eye.
 */
export function cameraFromBcf(camera: BcfCamera, sceneOrigin: BcfVec3, focusDistance: number): SceneCamera {
  const [px, py, pz] = ifcToScene(camera.position);
  const position = clean([px - sceneOrigin[0], py - sceneOrigin[1], pz - sceneOrigin[2]]);
  const d = ifcToScene(camera.direction);
  const length = Math.hypot(...d) || 1;
  const distance = Math.max(0.5, focusDistance);
  return {
    position,
    target: clean([
      position[0] + (d[0] / length) * distance,
      position[1] + (d[1] / length) * distance,
      position[2] + (d[2] / length) * distance,
    ]),
    up: Math.hypot(...camera.up) > 1e-9 ? clean(ifcToScene(camera.up)) : [0, 1, 0],
    fov: camera.fov,
  };
}

/** Bytes of a data: URL (snapshots) and back. */
export function dataUrlToBytes(url: string): { data: Uint8Array; type: "png" | "jpg" } | null {
  const match = /^data:image\/(png|jpe?g);base64,(.+)$/.exec(url);
  if (!match) return null;
  const binary = atob(match[2]);
  const data = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i);
  return { data, type: match[1] === "png" ? "png" : "jpg" };
}

export function bytesToDataUrl(snapshot: { data: Uint8Array; type: "png" | "jpg" }): string {
  let binary = "";
  for (let i = 0; i < snapshot.data.length; i += 0x8000)
    binary += String.fromCharCode(...snapshot.data.subarray(i, i + 0x8000));
  return `data:image/${snapshot.type === "png" ? "png" : "jpeg"};base64,${btoa(binary)}`;
}
