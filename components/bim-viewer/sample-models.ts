import type { BimModelDefinition, BimElementData, BimClashItem } from "./types";

// Generates a complex commercial tower model
function generateTowerModel(): BimModelDefinition {
  const elements: BimElementData[] = [];
  const stories = ["Tầng hầm B1", "Tầng 1 (Trệt)", "Tầng 2 - 5 (Văn phòng)", "Tầng 6 - 10 (Thương mại)", "Tầng Mái"];
  let elementId = 1;

  // Base Foundation Slabs
  elements.push({
    id: `elem-${elementId++}`,
    guid: "2A5b8X9m01KjL7N4PqRtVw",
    name: "Móng Bè Cọc Bê Tông C35/45 (Mat Foundation Slab)",
    ifcType: "IfcSlab",
    discipline: "structure",
    storey: "Tầng hầm B1",
    material: "Bê tông C35/45 cốt thép",
    color: "#64748b",
    dimensions: { length: 24, width: 18, height: 1.2, area: 432, volume: 518.4 },
    psets: [
      {
        name: "Pset_SlabCommon",
        properties: [
          { name: "Reference", value: "FD-432-B1" },
          { name: "LoadBearing", value: "TRUE" },
          { name: "IsExternal", value: "TRUE" },
          { name: "AcousticRating", value: "STC 55" },
        ],
      },
      {
        name: "Pset_ConcreteElementGeneral",
        properties: [
          { name: "ConcreteStrengthClass", value: "C35/45" },
          { name: "ReinforcementRatio", value: "1.85%" },
        ],
      },
    ],
    position: [0, -0.6, 0],
    size: [24, 1.2, 18],
    geometryType: "slab",
  });

  // Structural Grid Columns & Floor Slabs for 4 tiers
  for (let floor = 0; floor < 4; floor++) {
    const floorHeight = 3.6;
    const yOffset = floor * floorHeight;
    const storeyName = stories[floor + 1] || `Tầng ${floor + 1}`;

    // Floor Slab
    elements.push({
      id: `elem-${elementId++}`,
      guid: `3F7d9Z${floor}m01KjL7N4PqRt${floor}`,
      name: `Sàn Dầm Dự Ứng Lực ${storeyName} (Post-Tensioned Slab)`,
      ifcType: "IfcSlab",
      discipline: "structure",
      storey: storeyName,
      material: "Bê tông C30/37",
      color: "#94a3b8",
      dimensions: { length: 22, width: 16, height: 0.3, area: 352, volume: 105.6 },
      psets: [
        {
          name: "Pset_SlabCommon",
          properties: [
            { name: "LoadBearing", value: "TRUE" },
            { name: "FireRating", value: "REI 120" },
            { name: "Thickness", value: "300", unit: "mm" },
          ],
        },
      ],
      position: [0, yOffset + floorHeight, 0],
      size: [22, 0.3, 16],
      geometryType: "slab",
    });

    // Columns (4x3 grid)
    for (let ix = -3; ix <= 3; ix += 2) {
      for (let iz = -2; iz <= 2; iz += 2) {
        const cx = ix * 3.2;
        const cz = iz * 3.2;
        elements.push({
          id: `elem-${elementId++}`,
          guid: `4H8k2A${floor}${ix}${iz}KjL7N4Pq`,
          name: `Cột Bê Tông Vuông C${Math.abs(ix) + Math.abs(iz) + 1} (${storeyName})`,
          ifcType: "IfcColumn",
          discipline: "structure",
          storey: storeyName,
          material: "Bê tông cốt thép C40/50",
          color: "#475569",
          dimensions: { length: 0.8, width: 0.8, height: floorHeight, area: 0.64, volume: 2.3 },
          psets: [
            {
              name: "Pset_ColumnCommon",
              properties: [
                { name: "Reference", value: `COL-800x800-F${floor + 1}` },
                { name: "LoadBearing", value: "TRUE" },
                { name: "FireRating", value: "REI 180" },
              ],
            },
          ],
          position: [cx, yOffset + floorHeight / 2, cz],
          size: [0.8, floorHeight, 0.8],
          geometryType: "box",
        });
      }
    }

    // Glass Curtain Wall Facade (Architecture)
    elements.push({
      id: `elem-${elementId++}`,
      guid: `5J9p4Q${floor}m01KjL7N4PqRt`,
      name: `Vách Kính Low-E Unitized Facade (${storeyName})`,
      ifcType: "IfcCurtainWall",
      discipline: "architecture",
      storey: storeyName,
      material: "Kính Low-E phản xạ nhiệt 2 lớp + Khung Nhôm Anodize",
      color: "#38bdf8",
      dimensions: { length: 22.4, width: 16.4, height: floorHeight, area: 280, volume: 28 },
      psets: [
        {
          name: "Pset_CurtainWallCommon",
          properties: [
            { name: "AcousticRating", value: "STC 42" },
            { name: "ThermalTransmittance", value: "1.45", unit: "W/(m²·K)" },
            { name: "SolarHeatGainCoefficient", value: "0.28" },
          ],
        },
      ],
      position: [0, yOffset + floorHeight / 2, 0],
      size: [22.4, floorHeight, 16.4],
      geometryType: "box",
    });

    // Core Elevator & Staircase Shaft (Architecture / Concrete)
    elements.push({
      id: `elem-${elementId++}`,
      guid: `6K0r7W${floor}m01KjL7N4PqRt`,
      name: `Vách Lõi Thang Máy & Thoát Hiểm (${storeyName})`,
      ifcType: "IfcWallStandardCase",
      discipline: "architecture",
      storey: storeyName,
      material: "Bê tông chịu lực C35",
      color: "#cbd5e1",
      dimensions: { length: 5, width: 4.5, height: floorHeight, area: 22.5, volume: 45 },
      psets: [
        {
          name: "Pset_WallCommon",
          properties: [
            { name: "LoadBearing", value: "TRUE" },
            { name: "FireRating", value: "REI 240 (Chống cháy 4h)" },
            { name: "CompartmentWall", value: "TRUE" },
          ],
        },
      ],
      position: [0, yOffset + floorHeight / 2, 0],
      size: [5, floorHeight, 4.5],
      geometryType: "box",
    });

    // MEP HVAC Supply Ducts
    elements.push({
      id: `elem-${elementId++}`,
      guid: `7L1t9Y${floor}m01KjL7N4PqRt`,
      name: `Tuyến Ống Gió Cấp Lạnh HVAC AHU-0${floor + 1} (Galvanized Steel Duct)`,
      ifcType: "IfcDuctSegment",
      discipline: "mep",
      storey: storeyName,
      material: "Tôn kẽm bọc cách nhiệt PU 25mm",
      color: "#06b6d4",
      dimensions: { length: 18, width: 0.8, height: 0.4, area: 43.2, volume: 5.76 },
      psets: [
        {
          name: "Pset_DuctSegmentTypeCommon",
          properties: [
            { name: "AirFlowRate", value: "4,500", unit: "m³/h" },
            { name: "Velocity", value: "6.5", unit: "m/s" },
            { name: "InsulationType", value: "Polyurethane Foam 25mm" },
          ],
        },
      ],
      position: [0, yOffset + floorHeight - 0.45, 2.5],
      size: [18, 0.4, 0.8],
      geometryType: "duct",
    });

    // MEP Fire Protection & Chilled Water Pipes
    elements.push({
      id: `elem-${elementId++}`,
      guid: `8M2v1A${floor}m01KjL7N4PqRt`,
      name: `Tuyến Ống Cứu Hỏa & Chiller DN150 (${storeyName})`,
      ifcType: "IfcPipeSegment",
      discipline: "mep",
      storey: storeyName,
      material: "Thép đúc tráng kẽm SCH40",
      color: "#ef4444",
      dimensions: { length: 18, width: 0.25, height: 0.25, area: 14.1, volume: 0.88 },
      psets: [
        {
          name: "Pset_PipeSegmentTypeCommon",
          properties: [
            { name: "NominalDiameter", value: "150", unit: "mm" },
            { name: "WorkingPressure", value: "16", unit: "bar" },
            { name: "FluidType", value: "Chilled Water / Sprinkler" },
          ],
        },
      ],
      position: [0, yOffset + floorHeight - 0.5, -2.5],
      size: [18, 0.25, 0.25],
      geometryType: "pipe",
    });
  }

  // Rooftop Cooling Tower & Chillers (MEP Equipment)
  elements.push({
    id: `elem-${elementId++}`,
    guid: "9N3x5C9m01KjL7N4PqRtVw",
    name: "Tháp Giải Nhiệt & Chiller Trung Tâm (Cooling Tower CT-01)",
    ifcType: "IfcEnergyConversionDevice",
    discipline: "mep",
    storey: "Tầng Mái",
    material: "FRP & Thép không gỉ 316",
    color: "#0ea5e9",
    dimensions: { length: 6, width: 4, height: 3, area: 24, volume: 72 },
    psets: [
      {
        name: "Pset_CoolingTowerCommon",
        properties: [
          { name: "Capacity", value: "500", unit: "RT" },
          { name: "WaterFlowRate", value: "340", unit: "m³/h" },
          { name: "PowerSupply", value: "380V / 3P / 50Hz" },
        ],
      },
    ],
    position: [0, 4 * 3.6 + 1.5, 0],
    size: [6, 3, 4],
    geometryType: "box",
  });

  const clashes: BimClashItem[] = [
    {
      id: "clash-01",
      title: "Xung đột Ống gió HVAC với Dầm Kết cấu D2 (Tầng 2)",
      description: "Ống gió chính AHU-02 kích thước 800x400mm va chạm 120mm với dầm bê tông cốt thép trục D-4.",
      severity: "high",
      disciplineA: "MEP HVAC",
      elementA: "Tuyến Ống Gió Cấp Lạnh HVAC AHU-02",
      disciplineB: "Kết cấu",
      elementB: "Sàn Dầm Dự Ứng Lực Tầng 2 - 5",
      point: [4.5, 3.6 + 3.15, 2.5],
      status: "open",
    },
    {
      id: "clash-02",
      title: "Ống cứu hỏa Sprinkler giao cắt thanh Giằng thép (Tầng 3)",
      description: "Tuyến ống DN150 đi xuyên qua tim thanh giằng chéo gây suy giảm khả năng chịu lực.",
      severity: "high",
      disciplineA: "MEP PCCC",
      elementA: "Tuyến Ống Cứu Hỏa & Chiller DN150",
      disciplineB: "Kết cấu",
      elementB: "Cột Bê Tông Vuông C3",
      point: [-3.2, 2 * 3.6 + 3.1, -2.5],
      status: "in_review",
    },
    {
      id: "clash-03",
      title: "Khoảng tĩnh không đường ống cấp thoát nước (Tầng 1)",
      description: "Độ cao đáy ống 2.2m không đảm bảo khoảng thông thủy tối thiểu 2.4m của lối vào sảnh.",
      severity: "medium",
      disciplineA: "MEP Plumbing",
      elementA: "Ống cấp nước trục đứng",
      disciplineB: "Kiến trúc",
      elementB: "Trần thạch cao tiêu âm",
      point: [0, 2.3, 0],
      status: "open",
    },
  ];

  return {
    id: "tower",
    nameKey: "tower",
    description: "Tòa tháp Phức hợp Văn phòng & Thương mại BIM4C đạt chuẩn ISO 19650 với đầy đủ các bộ môn Kiến trúc, Kết cấu bê tông và Hệ thống Cơ điện MEP.",
    elementsCount: elements.length,
    elements,
    clashes,
    defaultCamera: {
      position: [28, 22, 28],
      target: [0, 7, 0],
    },
  };
}

// Generates Structural Steel & Truss Frame Model
function generateSteelModel(): BimModelDefinition {
  const elements: BimElementData[] = [];
  let elementId = 1;

  // Concrete Base Foundation
  elements.push({
    id: `steel-${elementId++}`,
    guid: "ST-BASE-01",
    name: "Móng Băng & Bệ Bê Tông Đỡ Cột Thép C30/37",
    ifcType: "IfcFooting",
    discipline: "structure",
    storey: "Mặt đất",
    material: "Bê tông C30/37",
    color: "#64748b",
    dimensions: { length: 30, width: 20, height: 1.0, area: 600, volume: 600 },
    psets: [
      {
        name: "Pset_FootingCommon",
        properties: [
          { name: "Reference", value: "F-STEEL-01" },
          { name: "BearingCapacity", value: "250", unit: "kPa" },
        ],
      },
    ],
    position: [0, -0.5, 0],
    size: [30, 1.0, 20],
    geometryType: "slab",
  });

  // Main Steel Columns (H-Beams)
  for (let x = -12; x <= 12; x += 6) {
    for (let z = -8; z <= 8; z += 8) {
      elements.push({
        id: `steel-${elementId++}`,
        guid: `ST-COL-${x}-${z}`,
        name: `Cột Thép H-Beam H400x400x13x21 (Trục ${x > 0 ? "B" : "A"}-${Math.abs(z / 4) + 1})`,
        ifcType: "IfcColumn",
        discipline: "structure",
        storey: "Tầng Trệt",
        material: "Thép Kết Cấu Q345B / ASTM A572 Gr.50",
        color: "#f59e0b",
        dimensions: { length: 0.4, width: 0.4, height: 8, area: 0.16, volume: 1.28 },
        psets: [
          {
            name: "Pset_SteelElementGeneral",
            properties: [
              { name: "SteelGrade", value: "Q345B" },
              { name: "YieldStrength", value: "345", unit: "MPa" },
              { name: "SectionProfile", value: "H 400x400x13x21" },
            ],
          },
        ],
        position: [x, 4, z],
        size: [0.4, 8, 0.4],
        geometryType: "box",
      });
    }
  }

  // Steel Roof Truss System (Long-span Trusses)
  for (let x = -12; x <= 12; x += 6) {
    elements.push({
      id: `steel-${elementId++}`,
      guid: `ST-TRUSS-${x}`,
      name: `Vì Kèo Thép Không Gian Nhịp 18m (Space Steel Truss)`,
      ifcType: "IfcMember",
      discipline: "structure",
      storey: "Mái Nhà Xưởng",
      material: "Thép hình ống hộp mạ kẽm",
      color: "#d97706",
      dimensions: { length: 0.3, width: 18, height: 1.8, area: 32.4, volume: 4.8 },
      psets: [
        {
          name: "Pset_MemberCommon",
          properties: [
            { name: "SpanLength", value: "18", unit: "m" },
            { name: "DesignLoad", value: "4.5", unit: "kN/m²" },
          ],
        },
      ],
      position: [x, 8.9, 0],
      size: [0.3, 1.8, 18],
      geometryType: "truss",
    });
  }

  const clashes: BimClashItem[] = [
    {
      id: "clash-steel-01",
      title: "Bulong Neo Chân Cột Xung Đột Cốt Thép Đài Móng",
      description: "Cụm bulong neo M36 chân cột trục A-2 chạm trực tiếp vào lưới thép chủ đài móng D25@150.",
      severity: "high",
      disciplineA: "Kết cấu thép",
      elementA: "Chân cột H400x400",
      disciplineB: "Bê tông cốt thép",
      elementB: "Bệ Móng C30/37",
      point: [-12, 0.1, -8],
      status: "open",
    },
  ];

  return {
    id: "steel",
    nameKey: "steel",
    description: "Mô hình Kết cấu Thép nhịp lớn LOD 400 chuẩn bị cho sản xuất chế tạo (Fabrication & Shop Drawing).",
    elementsCount: elements.length,
    elements,
    clashes,
    defaultCamera: {
      position: [26, 18, 26],
      target: [0, 4, 0],
    },
  };
}

// Generates MEP Plant Room Model
function generateMepModel(): BimModelDefinition {
  const elements: BimElementData[] = [];
  let elementId = 1;

  // Plant Room Floor
  elements.push({
    id: `mep-${elementId++}`,
    guid: "MEP-FL-01",
    name: "Sàn Phòng Máy Chiller & Trạm Bơm B2 (Mechanical Room)",
    ifcType: "IfcSlab",
    discipline: "structure",
    storey: "Tầng Hầm B2",
    material: "Bê tông xoa nền Epoxy chống thấm C30",
    color: "#334155",
    dimensions: { length: 20, width: 15, height: 0.5, area: 300, volume: 150 },
    psets: [],
    position: [0, -0.25, 0],
    size: [20, 0.5, 15],
    geometryType: "slab",
  });

  // Water Cooled Chillers (2 Units)
  for (let i = -1; i <= 1; i += 2) {
    elements.push({
      id: `mep-${elementId++}`,
      guid: `MEP-CHILLER-${i}`,
      name: `Cụm Máy Chiller Giải Nhiệt Nước Centrifugal CH-0${i === -1 ? 1 : 2}`,
      ifcType: "IfcEnergyConversionDevice",
      discipline: "mep",
      storey: "Tầng Hầm B2",
      material: "Thép đúc & Máy nén trục vít",
      color: "#0284c7",
      dimensions: { length: 4.8, width: 2.2, height: 2.4, area: 10.5, volume: 25.3 },
      psets: [
        {
          name: "Pset_ChillerCommon",
          properties: [
            { name: "CoolingCapacity", value: "800", unit: "RT" },
            { name: "RefrigerantType", value: "R134a / Eco Low GWP" },
            { name: "COP", value: "6.45" },
          ],
        },
      ],
      position: [i * 5, 1.2, 0],
      size: [4.8, 2.4, 2.2],
      geometryType: "box",
    });
  }

  // Primary & Secondary Chilled Water Pumps (4 Units)
  for (let j = -3; j <= 3; j += 2) {
    elements.push({
      id: `mep-${elementId++}`,
      guid: `MEP-PUMP-${j}`,
      name: `Bơm Nước Lạnh Tuần Hoàn End-Suction P-0${Math.abs(j)}`,
      ifcType: "IfcPump",
      discipline: "mep",
      storey: "Tầng Hầm B2",
      material: "Gang đúc EN-GJL-250",
      color: "#16a34a",
      dimensions: { length: 1.4, width: 0.9, height: 1.1, area: 1.26, volume: 1.38 },
      psets: [
        {
          name: "Pset_PumpCommon",
          properties: [
            { name: "FlowRate", value: "180", unit: "m³/h" },
            { name: "Head", value: "35", unit: "m" },
            { name: "MotorPower", value: "22", unit: "kW" },
          ],
        },
      ],
      position: [j * 2.5, 0.55, -4.5],
      size: [1.4, 1.1, 0.9],
      geometryType: "cylinder",
    });
  }

  // Main Header Pipes (Chilled Water Supply & Return)
  elements.push({
    id: `mep-${elementId++}`,
    guid: "MEP-PIPE-HDR-01",
    name: "Ống Góp Nước Lạnh Cấp DN350 (Chilled Water Supply Header)",
    ifcType: "IfcPipeSegment",
    discipline: "mep",
    storey: "Tầng Hầm B2",
    material: "Thép carbon ASTM A53 Gr.B bọc cách nhiệt Armaflex 50mm",
    color: "#2563eb",
    dimensions: { length: 16, width: 0.45, height: 0.45, area: 22.6, volume: 2.54 },
    psets: [
      {
        name: "Pset_PipeSegmentTypeCommon",
        properties: [
          { name: "NominalDiameter", value: "350", unit: "mm" },
          { name: "FluidTemperature", value: "7", unit: "°C" },
        ],
      },
    ],
    position: [0, 3.2, 2.5],
    size: [16, 0.45, 0.45],
    geometryType: "pipe",
  });

  const clashes: BimClashItem[] = [
    {
      id: "clash-mep-01",
      title: "Ống Góp Nước Lạnh DN350 Va Chạm Máng Cáp Điện Động Lực",
      description: "Khoảng cách cách điện giữa ống nước lạnh và thang máng cáp 400x100mm chỉ đạt 40mm (yêu cầu tối thiểu 200mm theo TCVN 9207).",
      severity: "high",
      disciplineA: "MEP Cơ (HVAC)",
      elementA: "Ống Góp Nước Lạnh DN350",
      disciplineB: "MEP Điện (Electrical)",
      elementB: "Máng Cáp Điện Động Lực 400x100",
      point: [2.5, 3.2, 2.5],
      status: "open",
    },
  ];

  return {
    id: "mep",
    nameKey: "mep",
    description: "Hệ thống Cơ điện Phòng máy Trung tâm (HVAC Chiller Plant Room & Pumping Station) LOD 400 chuẩn bị bàn giao vận hành COBie.",
    elementsCount: elements.length,
    elements,
    clashes,
    defaultCamera: {
      position: [18, 14, 18],
      target: [0, 2, 0],
    },
  };
}

export const SAMPLE_BIM_MODELS: Record<string, BimModelDefinition> = {
  tower: generateTowerModel(),
  steel: generateSteelModel(),
  mep: generateMepModel(),
};
