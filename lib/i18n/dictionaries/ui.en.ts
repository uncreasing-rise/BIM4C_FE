/** English UI strings. Source of truth for the key structure (see ui.vi.ts). */
export const uiEn = {
  bimCanvas: {
    t3DModelDragToOrbit: "3D model: drag to orbit, scroll to zoom",
    buildingModel: "Building model…",
    t3DRenderingIsUnavailableRetry:
      "3D rendering is unavailable. Retry or check your browser's WebGL support.",
    retry: "Retry",
  },
  bimControlsOverlay: {
    t3DSectionBox: "3D section box",
    no: "No.",
    type: "Type",
    planM: "Plan (m)",
    distance: "Distance",
    point: "Point",
    closeTool: "Close tool",
    enableSectionBox: "Enable section box",
    dragTheRoundHandlesOn:
      "Drag the round handles on the box faces to cut directly in the view (red = X, green = Y, blue = Z), or use the sliders.",
    aroundSelection: "Around selection",
    wholeModel: "Whole model",
    minimum: "Minimum",
    maximum: "Maximum",
    measureType: "Measure type",
    pointCoordinates: "Point coordinates",
    angle: "Angle (3 points)",
    triangle: "Triangle area",
    threePointHelp: "Select A, B, C. Angle is measured at B; area is the 3D triangle area, not a polygon or surface area.",
    snapping: "Snapping",
    vertex: "Vertex",
    midpoint: "Midpoint",
    edge: "Edge",
    hoverToPreviewTheSnapped:
      "Hover to preview the snapped point, click point 1 then point 2. Esc cancels the pending point.",
    clickTheModelToRead:
      "Click the model to read the point's IFC coordinates (and E/N/H when the file is georeferenced).",
    point1SetSelectPoint: "Point 1 set — select point 2.",
    deleteMeasurement: "Delete measurement",
    plan: "Plan",
    snap: "Snap",
    collapseModel: "Collapse model",
    noClashResultsAreAvailable:
      "No clash results are available for this model. Load an IFC with coordination issues to review them.",
    clashesLoaded: (count: number) =>
      `${count} clash result${count === 1 ? "" : "s"} loaded from the IFC model.`,
  },
  bimModelsPanel: {
    loadedModels: "Loaded models",
    close: "Close",
    filesThatShareACoordinate:
      "Files that share a coordinate system are placed at their true positions. The first model anchors the view; displayed coordinates are always the original IFC coordinates.",
    base: "Base",
    elements: "elements",
    hide: "Hide",
    show: "Show",
    zoomToModel: "Zoom to model",
    removeModel: "Remove model",
    fileOrigin: "File origin: ",
    georeference: "Georeference: ",
    thisModelIsMoreThan:
      "This model is more than 5 km from the base model. The files may not share a coordinate system — choose “By origin” and align manually.",
    alignment: "Alignment",
    sharedCoordinates: "Shared coordinates",
    byOrigin: "By origin",
    extraMoveAlongIFCAxes:
      "Extra move along IFC axes (m) and rotation about the vertical axis through the file origin (degrees).",
    rot: "Rot°",
    clearAdjustment: "Clear adjustment",
    addIFCFilesToThe: "+ Add IFC files to the scene",
  },
  bimPropertyInspector: {
    notProvided: "Not provided",
    closeProperties: "Close properties",
    material: "Material",
    illustrativePropertiesNotExtractedFrom:
      "Illustrative properties, not extracted from IFC.",
    coordinatesIFCM: "Coordinates (IFC, m)",
    model: "Model",
    bottomElevation: "Bottom elevation",
    topElevation: "Top elevation",
    centreAndElevationsComeFrom:
      "Centre and elevations come from the element's bounding box.",
    axisAlignedBoundingDimensionsEstimate:
      "Axis-aligned bounding dimensions (estimate)",
    sampleDimensions: "Sample dimensions",
    alongX: "Along X",
    alongY: "Along Y",
    heightZ: "Height (Z)",
    area: "Area",
    volume: "Volume",
    boundingDimensionsAreNotQuantities:
      "Bounding dimensions are not quantities. Source quantities, when available, are listed below with their units.",
    noIFCSpatialHierarchyIs: "No IFC spatial hierarchy is available.",
    hideElement: "Hide element",
    isolateElement: "Isolate element",
    showAllElements: "Show all elements",
    fitSelection: "Fit selection",
  },
  bimToolbar: {
    modelControls: "Model controls",
    noIFCLoaded: "No IFC loaded",
    viewPreset: "View preset",
  },
  bimViewerPage: {
    onlyIfcFilesAreAccepted:
      "Only .ifc files are accepted — others were skipped.",
    unableToReadIFCCheck: "Unable to read IFC. Check the file and retry.",
    unableToCaptureThe3D: "Unable to capture the 3D view.",
    t3DImageExported: "3D image exported.",
    fullscreenIsUnavailableInThis: "Fullscreen is unavailable in this browser.",
    addOneOrMoreIFC: "Add one or more IFC files to the scene",
    addIFCFiles: "Add IFC files",
    reading: "Reading",
    cancel: "Cancel",
    chooseOneOrMoreIFC: "Choose one or more IFC files",
    dropOneOrMoreIFC: "Drop one or more IFC files to add them to the scene",
    triangles: "triangles",
    geometryBuffers: "geometry buffers",
    noIFCModelLoaded: "No IFC model loaded",
  },
  blogDetailView: {
    articleLinkCopiedToClipboard: "Article link copied to clipboard!",
    published: "Published:",
    shareArticle: "Share article",
    share: "Share",
    aboutBIM4CEditorial: "About BIM4C Editorial",
    technicalInsightsAndCaseAnalysis:
      "Technical insights and case analysis authored by BIM4C specialists to advance digital construction practices.",
    relatedArticles: "Related articles",
    relatedArticles2: "Related articles",
  },
  blogExplorer: {
    viewArticle: "View article: ",
    t5MinRead: "5 min read",
    bIM4CSpecialist: "BIM4C Specialist",
  },
  courseDetailView: {
    t8Weeks: "8 weeks",
    advanced: "Advanced",
    contactForCorporateCohortPricing: "Contact for corporate/cohort pricing",
    bIMManagerSeniorSpecialist: "BIM Manager & Senior Specialist",
    format: "Format",
    liveInteractiveLab: "Live Interactive / Lab",
    schedule: "Schedule",
    monthlyIntakes: "Monthly Intakes",
    registerForCourse: "Register for course",
    keyLearningOutcomes: "Key Learning Outcomes",
    courseCurriculum: "Course curriculum",
    trainingContent: "Training content:",
    handsOnProjectsWithBilingual:
      "Hands-on projects with bilingual technical standards.",
    instructorMentorship: "Instructor Mentorship:",
    seasonedBIMManagersLeadingReal:
      "Seasoned BIM Managers leading real mega projects.",
    bIM4CCertificate: "BIM4C Certificate:",
    verifiedCredentialWithQRAuthentication:
      "Verified credential with QR authentication.",
    postCourseSupport: "Post-course Support:",
    communitySupportAndIndustryJob:
      "Community support and industry job connections.",
    relatedCourses: "Related courses",
    relatedProgrammes: "Related programmes",
  },
  footer: {
    connectWithUs: "Connect with us",
    footerNavigation: "Footer navigation",
  },
  header: {
    openNavigationMenu: "Open navigation menu",
    bIM4CNavigation: "BIM4C navigation",
    closeMenu: "Close menu",
    mainNavigation: "Main navigation",
    about: "About",
    services: "Services",
    projects: "Projects",
    training: "Training",
    technicalHub: "Technical Hub",
    newsEvents: "News & Events",
    contactUs: "Contact us",
    technical: "Technical",
    news: "News",
  },
  slideScrollSystem: {
    chapter: "Chapter",
    pageChapters: "Page chapters",
  },
  projectCard: {
    exploreProject: "Explore project",
    explore: "Explore",
  },
  projectCarousel: {
    selectedProjects: "Selected projects",
    previousProject: "Previous project",
    nextProject: "Next project",
  },
  projectDetailView: {
    requestTailoredConsultationAndDelivery:
      "Request tailored consultation and delivery proposal for your project from BIM4C engineers.",
    projectGallery: "Project gallery",
    projectGallery3DDeliverables: "Project Gallery & 3D Deliverables",
    relatedProjects: "Related projects",
    relatedProjects2: "Related projects",
  },
  projectRow: {
    standard: "Standard",
  },
  aboutView: {
    bIMTechnologyIllustration: "BIM technology illustration",
    standardizedCDEDataEnvironmentAnd:
      "Standardized CDE data environment and accurate information models for modern construction",
    downloadBrochurePDF: "Download Brochure (PDF)",
  },
  bimHero3DCanvas: {
    fullBIMViewer: "Full BIM Viewer",
    multidisciplinary3DModelAutoOrbit:
      "Multidisciplinary 3D Model (Auto-Orbit)",
  },
  consultationSection: {
    discussAProject: "Discuss a project",
    socials: "Socials:",
    contactMethod: "Contact method",
    sendAnEnquiry: "Send an enquiry",
    bookAnAppointment: "Book an appointment",
    bookAConsultation: "Book a consultation",
    chooseAnAvailableTimeThat: "Choose an available time that works for you.",
  },
  deliveryProcess: {
    defineBEPSetup: "Define & BEP Setup",
    agreeScopeEIRInformationRequirements:
      "Agree scope, EIR information requirements, LOD matrix and CDE responsibilities.",
    bIMExecutionPlan: "BIM Execution Plan",
    modelingIntegration: "Modeling & Integration",
    bringArchitectureStructureMEPModels:
      "Bring Architecture, Structure, MEP models and specs into a unified federated CDE workflow.",
    federatedModel: "Federated Model",
    clashResolution: "Clash Resolution",
    automatedClashDetectionIssueMatrix:
      "Automated clash detection, issue matrix tracking and multi-discipline coordination sign-off.",
    modelCoordinationReport: "Model coordination report",
    digitalHandover: "Digital Handover",
    verifyOutputsExtractAccurateQTO:
      "Verify outputs, extract accurate QTO quantities and assemble COBie data for Digital Twin/FM.",
    cOBieAsBuiltTwin: "COBie & As-Built Twin",
    swipeToExploreThe4: "Swipe to explore the 4 steps →",
    keyDeliverable: "Key deliverable:",
  },
  homeView: {
    bIMConstructionTechnology: "BIM Construction Technology",
    connectedData: "Connected data.",
    betterBuildings: "Better buildings.",
    bIMConsultingMultidisciplinaryModelCoordination:
      "BIM consulting, multidisciplinary model coordination and CDE information governance — from concept through operations.",
    exploreBIMIn3D: "Explore BIM in 3D",
    contentIsBeingUpdatedPlease:
      "Content is being updated. Please contact BIM4C.",
    ourExpertise: "Our expertise",
    defineYourBIMStrategyConnect:
      "Define your BIM strategy, connect your disciplines and equip your team with information they can use.",
    selectedExperience: "Selected experience",
    realProjectsConnectedExpertise: "Real projects. Connected expertise.",
    allProjects: "All projects",
    bIMTrainingAndTechnologyTransfer:
      "BIM training and technology transfer for businesses and students.",
    buildYourTeamSNext: "Build your team’s next BIM capability.",
    practicalProgrammesForModelersCoordinators:
      "Practical programmes for Modelers, Coordinators and BIM Managers with guided hands-on exercises.",
    browseAllProgrammes: "Browse all programmes",
    engineeringInsights: "Engineering Insights",
    latestIdeasForDigitalProject: "Latest ideas for digital project delivery.",
    browseAllInsights: "Browse all insights",
    startWithTheRightQuestion: "Start with the right question",
    makeTheNextStepClear: "Make the next step clear for your project.",
    shareTheContextGoalOr:
      "Share the context, goal or issue you are working through. We will help define the right scope together.",
    contactTheBIM4CTeam: "Contact the BIM4C team",
  },
  legalDetailView: {
    lASTUPDATED: "LAST UPDATED",
    allLegalInformation: "All legal information",
  },
  officeLocationMap: {
    headquartersAddressCopiedToClipboard:
      "Headquarters address copied to clipboard",
    bIM4CDaNangHeadquartersMap: "BIM4C Da Nang Headquarters Map",
    corporateHeadquarters: "Corporate Headquarters",
    bIM4CTECHNOLOGYCONSTRUCTIONJOINTSTOCK:
      "BIM4C TECHNOLOGY & CONSTRUCTION JOINT STOCK COMPANY",
    openMaps: "Open Maps",
    socialMediaNetworks: "Social Media & Networks",
    connectWithBIM4CAcrossPlatforms: "Connect with BIM4C across platforms",
    followUsToStayUpdated:
      "Follow us to stay updated with professional insights, BIM tutorials, and industry events.",
  },
  serviceDetailView: {
    enquireForThisService: "Enquire for this service",
    serviceDeliveryFramework: "Service Delivery Framework",
    informationManagementAndCDECoordination:
      "Information management and CDE coordination.",
    openBIMIFCBCFComplianceEnsuring:
      "OpenBIM (IFC, BCF) compliance ensuring frictionless cross-platform interoperability.",
    fullLegalNDAComplianceSafeguarding:
      "Full legal NDA compliance safeguarding intellectual property and proprietary data.",
    receiveExpertConsultationDetailedScope:
      "Receive expert consultation, detailed scope of work and quotation tailored to your needs.",
    relatedServices: "Related services",
    relatedServices2: "Related services",
  },
  catalogControls: {
    clearSearch: "Clear search",
    alreadyOnTheFirstPage: "Already on the first page",
    previousPage: "Previous page",
    alreadyOnTheLastPage: "Already on the last page",
    nextPage: "Next page",
  },
  commandMenu: {
    t3DOpenBIMViewerInteractiveModel: "3D OpenBIM Viewer (Interactive Model)",
    inspectIFCBCFSpatialCoordination: "Inspect IFC, BCF & spatial coordination",
    allProjectsCaseStudies: "All Projects & Case Studies",
    exploreHighRiseAndInfrastructure:
      "Explore high-rise and infrastructure portfolio",
    bIMConsultingSolutions: "BIM Consulting & Solutions",
    iSO19650StrategyCDEMEP: "ISO 19650 Strategy, CDE, MEP & 5D Cost",
    bIM4CAcademyProfessionalTraining: "BIM4C Academy (Professional Training)",
    practicalRevitNavisworksOpenBIMCurriculum:
      "Practical Revit, Navisworks & OpenBIM curriculum",
    insightsTechnicalJournal: "Insights & Technical Journal",
    fieldTestedAECDigitalMethods:
      "Field-tested AEC digital methods and lessons",
    aboutBIM4CLeadershipCapability: "About BIM4C (Leadership & Capability)",
    executiveTeamEngineeringCapability:
      "Executive team & engineering capability",
    technicalHotline84932468: "Technical Hotline: +84 93 2468 099",
    directProjectScopingSupport: "Direct project scoping & support",
    sendRFPAndProjectRequirements: "Send RFP and project requirements",
    hQ20BacSonDa: "HQ: 20 Bac Son, Da Nang",
    taxAddressAnKheWard: "Tax address: An Khe Ward, Da Nang City",
    quickSearchNavigationMenu: "Quick Search & Navigation Menu",
    searchProjectsServicesCoursesArticles:
      "Search projects, services, courses, articles, tax ID...",
    quickSearchInput: "Quick search input",
    closeSearch: "Close search",
    noMatchingCommandsFound: "No matching commands found.",
    trySearchingBIMProjectsOr: "Try searching 'BIM', 'Projects', or 'Contact'",
    navigate: "Navigate",
    execute: "Execute",
    close: "Close",
  },
  contentBlockRenderer: {
    imageGallery: "Image gallery",
    watchVideo: "Watch video",
  },
  floatingContactWidget: {
    quickContactChannels: "Quick contact channels",
    callConsultationHotline: "Call consultation hotline",
    closeContactMenu: "Close contact menu",
    openContactMenu: "Open contact menu",
  },
  languageSwitcher: {
    languageSelection: "Language selection",
  },
  notFoundView: {
    t404ERRORPAGENOTFOUND: "404 · ERROR / PAGE NOT FOUND",
    thisPageDoesNotExist: "This page does not exist or has been moved.",
    theLinkYouAccessedIs:
      "The link you accessed is no longer available. Please return to the homepage or explore our enterprise BIM technology solutions.",
    returnToHomepage: "Return to Homepage",
    solutionsServices: "Solutions & Services",
    contactSupport: "Contact Support",
  },
  pageHero: {
    breadcrumb: "Breadcrumb",
  },
  slideControls: {
    pauseSlideshow: "Pause slideshow",
    playSlideshow: "Play slideshow",
    previousSlide: "Previous slide",
    nextSlide: "Next slide",
  },
  errorState: {
    weCouldNotLoadThis: "We could not load this content",
    aConnectionIssueOccurredOr:
      "A connection issue occurred or this content is temporarily unavailable. Please try again.",
    tryAgain: "Try again",
  },
  /** Strings with parameters or structure (functions keep word order per language). */
  formats: {
    snap: {
      vertex: "Vertex",
      midpoint: "Midpoint",
      edge: "Edge",
      face: "Face",
    },
    axisHint: { X: "East", Y: "North", Z: "Elevation" },
    hoverToReadCoordinates: "Hover the model to read coordinates",
    centreAxis: (axis: string) => `Centre ${axis}`,
    modelsInScene: (count: number) =>
      `${count} model${count === 1 ? "" : "s"} in scene`,
    federatedModels: (count: number) => `${count} federated models`,
    modelAdded: (file: string, elements: number) =>
      `Added ${file}: ${elements} elements.`,
    ifcErrors: {
      IFC_FILE_EMPTY: "The IFC file is empty.",
      IFC_NO_GEOMETRY:
        "This file contains no supported 3D geometry. No substitute shapes were created.",
      IFC_WORKER_FAILED:
        "The IFC reader could not start. Reload the page and retry.",
    } as Record<string, string>,
    diagnostics: (missing: number, failed: number, properties: number) =>
      `Without geometry: ${missing}; geometry errors: ${failed}; incomplete properties: ${properties}.`,
    page: (n: number) => `Page ${n}`,
    expertiseTitle: ["The right support.", "At every project stage."] as [
      string,
      string,
    ],
  },
};

export type UiStrings = typeof uiEn;
