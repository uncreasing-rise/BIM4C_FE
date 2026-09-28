# BIM 3D viewer capability matrix

## Implemented in the browser

- Loads the public IFC demonstration automatically and accepts additional IFC uploads and `.bim4c` packages.
- **Engine: ThatOpen Fragments.** Each IFC is parsed in a Web Worker with `web-ifc` (properties, spatial hierarchy, materials, quantities, coordinates, element boxes) and converted to Fragments in the same worker. Fragments draws with levels of detail and worker-side tile culling; the viewer's tools (picking, snapping, measuring, walking, clashes, quantities, explode, 2D sheets) use per-element triangles fetched from the Fragments model in the background ("hydration"), kept once. On a 10-file federation (5.8 M triangles) the view draws ~0.5 M triangles at a time. If conversion fails, the file opens with the parser's own triangles; `?engine=parser` forces that path.
- **Cache and packages.** Converted models are kept in IndexedDB by the file's SHA-256 (reopening a 250 MB pair of files: 25 s → 0.8 s; LRU up to 1.5 GB, clearable in the models panel). A model downloads as a `.bim4c` package (element data + Fragments) that opens without the IFC; `npm run convert:bim4c -- model.ifc --out dir` produces the same package on a server.
- Federates multiple IFC files with shared/origin alignment and manual offsets.
- Orbit, perspective/orthographic, top, front, right and isometric views, fit-all and fit-selection. Near/far planes follow the scene every frame (no depth fighting in plan views); small parts are skipped while navigating when frames get slow (guaranteed frame rate).
- Element picking, Ctrl/Shift multi-selection, property inspection and spatial path inspection.
- Model search/filter by filename, name, IFC type, GUID, material, property sets, discipline and storey. Spatial tree follows IFC ancestry, mounts children on expansion and loads element rows in batches of 100 without truncating results.
- Hide, isolate (the rest ghosted) and restore visibility.
- **Appearance:** colour and transparency per selected element; Appearance Profiler colouring by IFC type, level, material, discipline, file, name or any property (each value, or numeric bands), with an editable legend (colours, hide a value, select its elements). Stored in the session by GlobalId / definition.
- Section box and planes (turnable), section caps, explode view, discipline visibility.
- **Measure:** point to point, point to multiple points, point line, accumulate, angle (with arc), area (area, plan area, perimeter), single point (with E/N/H), shortest distance between two objects, arc/radius, triangle area. Snapping to vertices, circle centres, midpoints, edges and faces, including just outside the silhouette and on neighbouring elements. Locks along X/Y/Z, perpendicular and parallel to the first surface (also over empty space). Units (m, cm, mm, ft, in) and precision. Undo/redo, labels kept from overlapping, CSV export, conversion to markup and to an issue (BCF) with a snapshot.
- PNG snapshot, fullscreen mode, diagnostics and cancellation during IFC loading.
- Browser-local saved viewpoints capture camera position/target/up/FOV, projection, section box, element visibility, discipline layers, selection, explode and each file’s visibility and placement (restored for files still open).
- Named selection sets store IFC GlobalIds, so they survive reopening files in any order.
- Sessions are keyed by the SHA-256 of each file’s content (order-independent); saved ids use content tokens and are translated to the current model keys on load. Validated JSON export/import uses the same tokens.
- New measurements keep model-local anchors, follow manual model placement changes and are removed when their model is removed.
- **Clash detective:** AABB candidates, mesh verification and clearance checks with model/type filters. Rules: same discipline, parts of one assembly, user-listed type pairs. Results grouped by element, level, type pair or nearby area; statuses open / reviewed / approved / resolved; assignment, notes and a per-clash history with the reviewer's name; runs of the same test are compared (new, still there, gone — gone clashes are resolved automatically); CSV report and BCF export.
- Browser-local issue notes linked to the current element selection (or to measured elements), with the viewpoint and a snapshot captured when raised; "go to" restores them.
- BCF 2.1 (.bcfzip) export of issues and of clash results and import of BCF 2.0/2.1 topics from other tools. Clipping planes, comments and BCF 3.0 extensions are not exchanged.
- Quantity take-off from file quantities, falling back to the exact volume of each element’s closed mesh (flagged "≈").
- **2D sheets and split screen:** floor plans per level (cut at the plan height, plus the floor line), a plan at the height looked at, vertical sections east–west / north–south through the point looked at, or at the section plane active in 3D. Shown beside the 3D view; clicking a line selects its element in 3D; the 3D camera is shown on plans. A3 SVG export with title block, standard scale, scale bar and north arrow (plans).
- Column grids (IfcGrid) drawn with axis bubbles, on plans too; a minimap (plan overview with the camera, click to go there).
- Automated unit/integration coverage for IFC parsing, federation, snapping, measuring, appearance, clash review, packages, plans and sections, and viewer wiring.

## Not generated by the current frontend

- Clash detection results are local candidate reviews, not certified coordination results.
- Issues/BCF: comments, attachments, clipping-plane exchange and a shared BCF server/API are not implemented.
- Revit/RVT, NWD/NWC, DWG/DXF and point clouds: require format-specific conversion services.
- 4D (TimeLiner), animation, VR.
- Sharing converted models, views, measurements and reviews across users: requires project/version persistence on a server.
- Realtime collaboration, permissions and audit history across users.

## Validation

Chromium checks (software rendering) cover loading real multi-file projects, cached reopening, packages, plan views, section, edges/AO, explode, isolation, appearance, measuring, markup, clash review, 2D sheets, grids and the minimap. Frame rates in those checks are not representative: performance must be confirmed on the target GPUs. Do not advertise Autodesk feature parity.
