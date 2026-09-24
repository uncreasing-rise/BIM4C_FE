import type { UiStrings } from "./ui.en";

/** Vietnamese UI strings; typed by the English file so keys can never drift. */
export const uiVi: UiStrings = {
  bimCanvas: {
    t3DModelDragToOrbit: "Mô hình 3D: kéo để xoay, cuộn để phóng to",
    buildingModel: "Đang dựng mô hình…",
    t3DRenderingIsUnavailableRetry: "Không thể hiển thị 3D. Hãy thử lại hoặc kiểm tra hỗ trợ WebGL của trình duyệt.",
    retry: "Thử lại"
  },
  bimControlsOverlay: {
    t3DSectionBox: "Hộp cắt 3D",
    no: "STT",
    type: "Loại",
    planM: "Ngang (m)",
    distance: "Khoảng cách",
    point: "Tọa độ",
    closeTool: "Đóng công cụ",
    enableSectionBox: "Bật hộp cắt",
    dragTheRoundHandlesOn: "Kéo các nút tròn trên mặt hộp để cắt trực tiếp trong khung nhìn (đỏ = X, xanh lá = Y, xanh dương = Z), hoặc chỉnh bằng thanh trượt.",
    aroundSelection: "Quanh cấu kiện chọn",
    wholeModel: "Toàn bộ mô hình",
    minimum: "Nhỏ nhất",
    maximum: "Lớn nhất",
    measureType: "Kiểu đo",
    pointCoordinates: "Tọa độ điểm",
    snapping: "Bắt điểm",
    vertex: "Đỉnh",
    midpoint: "Trung điểm",
    edge: "Cạnh",
    hoverToPreviewTheSnapped: "Rê chuột để thấy điểm được bắt, nhấp điểm 1 rồi điểm 2. Esc để hủy điểm đang chọn.",
    clickTheModelToRead: "Nhấp lên mô hình để lấy tọa độ IFC của điểm (và E/N/H nếu tệp có georeference).",
    point1SetSelectPoint: "Đã chọn điểm 1 — chọn điểm 2.",
    deleteMeasurement: "Xóa phép đo",
    plan: "Ngang",
    snap: "Bắt điểm",
    collapseModel: "Thu gọn mô hình",
    noClashResultsAreAvailable: "Mô hình chưa có dữ liệu kiểm tra xung đột. Hãy tải IFC đã được kiểm tra để xem các issue."
  },
  bimModelsPanel: {
    loadedModels: "Mô hình đã tải",
    close: "Đóng",
    filesThatShareACoordinate: "Các tệp dùng chung hệ tọa độ được ghép đúng vị trí thực. Mô hình đầu tiên làm gốc hiển thị; tọa độ đọc ra luôn là tọa độ IFC gốc.",
    base: "Gốc",
    elements: "cấu kiện",
    hide: "Ẩn",
    show: "Hiện",
    zoomToModel: "Phóng tới mô hình",
    removeModel: "Gỡ mô hình",
    fileOrigin: "Gốc tọa độ tệp: ",
    georeference: "Georeference: ",
    thisModelIsMoreThan: "Mô hình này cách mô hình gốc hơn 5 km. Có thể hai tệp không cùng hệ tọa độ — hãy chọn “Theo gốc tọa độ” và căn chỉnh thủ công.",
    alignment: "Căn chỉnh vị trí",
    sharedCoordinates: "Tọa độ dùng chung",
    byOrigin: "Theo gốc tọa độ",
    extraMoveAlongIFCAxes: "Dời thêm theo trục IFC (m) và xoay quanh trục đứng qua gốc tệp (độ).",
    rot: "Xoay°",
    clearAdjustment: "Bỏ hiệu chỉnh",
    addIFCFilesToThe: "+ Thêm tệp IFC vào cảnh"
  },
  bimPropertyInspector: {
    notProvided: "Chưa có dữ liệu",
    closeProperties: "Đóng thuộc tính",
    material: "Vật liệu",
    illustrativePropertiesNotExtractedFrom: "Thuộc tính minh họa, không trích xuất từ IFC.",
    coordinatesIFCM: "Tọa độ (hệ IFC, m)",
    model: "Mô hình",
    bottomElevation: "Cao độ đáy",
    topElevation: "Cao độ đỉnh",
    centreAndElevationsComeFrom: "Tâm và cao độ lấy theo hộp bao của cấu kiện.",
    axisAlignedBoundingDimensionsEstimate: "Kích thước hộp bao theo trục (ước lượng)",
    sampleDimensions: "Kích thước minh họa",
    alongX: "Theo trục X",
    alongY: "Theo trục Y",
    heightZ: "Chiều cao (Z)",
    area: "Diện tích",
    volume: "Thể tích",
    boundingDimensionsAreNotQuantities: "Không dùng hộp bao để tính khối lượng. Quantity gốc, nếu có, nằm trong bộ thuộc tính bên dưới.",
    noIFCSpatialHierarchyIs: "Chưa có cây không gian từ tệp IFC."
  },
  bimToolbar: {
    modelControls: "Công cụ mô hình",
    noIFCLoaded: "Chưa tải IFC",
    viewPreset: "Góc nhìn"
  },
  bimViewerPage: {
    onlyIfcFilesAreAccepted: "Chỉ nhận tệp .ifc — đã bỏ qua các tệp khác.",
    unableToReadIFCCheck: "Không đọc được IFC. Kiểm tra tệp và thử lại.",
    unableToCaptureThe3D: "Không thể chụp ảnh 3D.",
    t3DImageExported: "Đã xuất ảnh 3D.",
    fullscreenIsUnavailableInThis: "Trình duyệt chưa hỗ trợ toàn màn hình tại đây.",
    addOneOrMoreIFC: "Thêm một hoặc nhiều tệp IFC vào cảnh",
    addIFCFiles: "Thêm tệp IFC",
    reading: "Đang đọc",
    cancel: "Hủy",
    chooseOneOrMoreIFC: "Chọn một hoặc nhiều tệp IFC",
    dropOneOrMoreIFC: "Thả một hoặc nhiều tệp IFC để thêm vào cảnh",
    triangles: "tam giác",
    geometryBuffers: "bộ đệm hình học",
    noIFCModelLoaded: "Chưa tải mô hình IFC"
  },
  blogDetailView: {
    articleLinkCopiedToClipboard: "Đã sao chép liên kết bài viết vào bộ nhớ tạm!",
    published: "Xuất bản:",
    shareArticle: "Chia sẻ bài viết",
    share: "Chia sẻ",
    aboutBIM4CEditorial: "Về ban biên tập BIM4C",
    technicalInsightsAndCaseAnalysis: "Các bài viết chuyên môn được biên soạn bởi các chuyên gia và kỹ sư BIM của BIM4C nhằm chia sẻ kiến thức chuyển đổi số trong xây dựng.",
    relatedArticles: "Bài viết liên quan",
    relatedArticles2: "Bài viết cùng chủ đề"
  },
  blogExplorer: {
    viewArticle: "Xem bài viết: ",
    t5MinRead: "5 phút đọc",
    bIM4CSpecialist: "Chuyên gia BIM4C"
  },
  courseDetailView: {
    t8Weeks: "8 tuần",
    advanced: "Chuyên sâu",
    contactForCorporateCohortPricing: "Liên hệ ưu đãi khóa học",
    bIMManagerSeniorSpecialist: "BIM Manager & Giảng viên BIM4C",
    format: "Hình thức học",
    liveInteractiveLab: "Online tương tác / Lab",
    schedule: "Lịch khai giảng",
    monthlyIntakes: "Định kỳ hàng tháng",
    registerForCourse: "Đăng ký khóa học",
    keyLearningOutcomes: "Chuẩn đầu ra khóa học",
    courseCurriculum: "Nội dung khóa học",
    trainingContent: "Nội dung đào tạo:",
    handsOnProjectsWithBilingual: "Học trên dự án thực tế, tài liệu song ngữ chuyên ngành.",
    instructorMentorship: "Chuyên gia trực tiếp giảng dạy:",
    seasonedBIMManagersLeadingReal: "BIM Manager có kinh nghiệm thực chiến trên các dự án quy mô lớn.",
    bIM4CCertificate: "Chứng chỉ hoàn thành BIM4C:",
    verifiedCredentialWithQRAuthentication: "Chứng nhận kỹ năng có mã QR xác thực hồ sơ năng lực.",
    postCourseSupport: "Hỗ trợ sau khóa học:",
    communitySupportAndIndustryJob: "Hỗ trợ giải đáp thắc mắc và kết nối cơ hội việc làm BIM.",
    relatedCourses: "Khóa học liên quan",
    relatedProgrammes: "Khóa học liên quan"
  },
  footer: {
    connectWithUs: "Kết nối mạng xã hội",
    footerNavigation: "Điều hướng cuối trang"
  },
  header: {
    openNavigationMenu: "Mở menu điều hướng",
    bIM4CNavigation: "Điều hướng BIM4C",
    closeMenu: "Đóng menu",
    mainNavigation: "Điều hướng chính",
    about: "Giới thiệu",
    services: "Dịch vụ",
    projects: "Dự án",
    training: "Đào tạo",
    technicalHub: "Chuyên môn BIM",
    newsEvents: "Tin tức",
    contactUs: "Liên hệ tư vấn",
    technical: "Chuyên môn BIM",
    news: "Tin tức"
  },
  slideScrollSystem: {
    chapter: "Phần",
    pageChapters: "Các phần của trang"
  },
  projectCard: {
    exploreProject: "Khám phá dự án",
    explore: "Khám phá"
  },
  projectCarousel: {
    selectedProjects: "Dự án tiêu biểu",
    previousProject: "Dự án trước",
    nextProject: "Dự án tiếp theo"
  },
  projectDetailView: {
    requestTailoredConsultationAndDelivery: "Đăng ký nhận tư vấn và báo giá chi tiết cho dự án của bạn từ đội ngũ kỹ sư BIM4C.",
    projectGallery: "Thư viện ảnh dự án",
    projectGallery3DDeliverables: "Hình ảnh & Mô hình dự án",
    relatedProjects: "Dự án liên quan",
    relatedProjects2: "Dự án tiêu biểu khác"
  },
  projectRow: {
    standard: "Tiêu chuẩn"
  },
  aboutView: {
    bIMTechnologyIllustration: "Minh họa công nghệ BIM",
    standardizedCDEDataEnvironmentAnd: "Hệ thống dữ liệu CDE và mô hình thông tin chuẩn xác cho dự án xây dựng hiện đại",
    downloadBrochurePDF: "Tải Hồ sơ năng lực (PDF)"
  },
  bimHero3DCanvas: {
    fullBIMViewer: "Xem BIM Đầy đủ",
    multidisciplinary3DModelAutoOrbit: "Mô hình 3D đa bộ môn (Tự động xoay)"
  },
  consultationSection: {
    discussAProject: "Trao đổi dự án",
    socials: "Mạng xã hội:",
    contactMethod: "Phương thức liên hệ",
    sendAnEnquiry: "Gửi yêu cầu",
    bookAnAppointment: "Đặt lịch tư vấn",
    bookAConsultation: "Đặt lịch tư vấn",
    chooseAnAvailableTimeThat: "Chọn một khung giờ còn trống phù hợp với bạn."
  },
  deliveryProcess: {
    defineBEPSetup: "Xác định & Lập BEP",
    agreeScopeEIRInformationRequirements: "Thống nhất phạm vi, yêu cầu thông tin EIR, ma trận LOD và phân định trách nhiệm CDE.",
    bIMExecutionPlan: "BIM Execution Plan (BEP)",
    modelingIntegration: "Mô hình & Kết nối",
    bringArchitectureStructureMEPModels: "Đưa các bộ môn Kiến trúc, Kết cấu, MEP và tài liệu vào quy trình làm việc phối hợp chung.",
    federatedModel: "Mô hình phối hợp đa bộ môn",
    clashResolution: "Xử lý xung đột (Clash)",
    automatedClashDetectionIssueMatrix: "Kiểm soát chất lượng tự động, phát hiện và điều phối xử lý xung đột.",
    modelCoordinationReport: "Báo cáo phối hợp mô hình",
    digitalHandover: "Bàn giao & Vận hành",
    verifyOutputsExtractAccurateQTO: "Kiểm tra sản phẩm bàn giao, trích xuất khối lượng QTO và chuẩn bị dữ liệu COBie cho Digital Twin.",
    cOBieAsBuiltTwin: "Dữ liệu COBie & As-Built",
    swipeToExploreThe4: "Vuốt để khám phá 4 bước →",
    keyDeliverable: "Sản phẩm đầu ra:"
  },
  homeView: {
    bIMConstructionTechnology: "Công nghệ số hóa công trình BIM",
    connectedData: "Kết nối dữ liệu.",
    betterBuildings: "Kiến tạo công trình.",
    bIMConsultingMultidisciplinaryModelCoordination: "Tư vấn chiến lược BIM, điều phối mô hình đa bộ môn và quản lý dữ liệu số CDE — đồng hành tin cậy từ thiết kế, thi công đến vận hành.",
    exploreBIMIn3D: "Trải nghiệm BIM 3D",
    contentIsBeingUpdatedPlease: "Nội dung đang được cập nhật. Vui lòng liên hệ BIM4C.",
    ourExpertise: "Năng lực chuyên môn",
    defineYourBIMStrategyConnect: "Xây dựng chiến lược BIM, kết nối đa bộ môn và trang bị cho đội ngũ nguồn dữ liệu số hữu ích.",
    selectedExperience: "Kinh nghiệm thực chiến",
    realProjectsConnectedExpertise: "Dự án thực tế. Năng lực kết nối.",
    allProjects: "Tất cả dự án",
    bIMTrainingAndTechnologyTransfer: "Đào tạo và chuyển giao công nghệ BIM cho doanh nghiệp và sinh viên.",
    buildYourTeamSNext: "Nâng cao năng lực chuyên môn đội ngũ.",
    practicalProgrammesForModelersCoordinators: "Chương trình thực chiến cho Kỹ sư Mô hình (Modeler), Điều phối viên (Coordinator) và Giám đốc BIM (Manager) với case study thực tế.",
    browseAllProgrammes: "Khám phá tất cả chương trình đào tạo",
    engineeringInsights: "Góc nhìn & Bài viết chuyên môn",
    latestIdeasForDigitalProject: "Xu hướng công nghệ & Giải pháp thực chiến.",
    browseAllInsights: "Xem tất cả bài viết",
    startWithTheRightQuestion: "Bắt đầu từ câu hỏi đúng",
    makeTheNextStepClear: "Cùng làm rõ bước tiếp theo cho dự án của bạn.",
    shareTheContextGoalOr: "Chia sẻ bối cảnh, mục tiêu hoặc vấn đề đang cần giải quyết. Đội ngũ chuyên gia BIM4C sẽ cùng bạn xác định phạm vi phù hợp nhất.",
    contactTheBIM4CTeam: "Liên hệ đội ngũ BIM4C"
  },
  legalDetailView: {
    lASTUPDATED: "CẬP NHẬT LẦN CUỐI",
    allLegalInformation: "Tất cả thông tin pháp lý"
  },
  officeLocationMap: {
    headquartersAddressCopiedToClipboard: "Đã sao chép địa chỉ: 20 Bắc Sơn, Đà Nẵng, Việt Nam",
    bIM4CDaNangHeadquartersMap: "Bản đồ vị trí Trụ sở chính BIM4C Đà Nẵng",
    corporateHeadquarters: "Trụ sở Chính Doanh Nghiệp",
    bIM4CTECHNOLOGYCONSTRUCTIONJOINTSTOCK: "CÔNG TY CỔ PHẦN XÂY DỰNG CÔNG NGHỆ BIM4C",
    openMaps: "Mở Google Maps",
    socialMediaNetworks: "Mạng xã hội & Kênh kết nối",
    connectWithBIM4CAcrossPlatforms: "Kết nối với BIM4C trên các nền tảng",
    followUsToStayUpdated: "Theo dõi chúng tôi để cập nhật bài viết chuyên môn, video kỹ thuật BIM và các sự kiện ngành mới nhất."
  },
  serviceDetailView: {
    enquireForThisService: "Yêu cầu tư vấn dịch vụ",
    serviceDeliveryFramework: "Quy chuẩn thực thi dịch vụ",
    informationManagementAndCDECoordination: "Quản trị quy trình thông tin và môi trường CDE.",
    openBIMIFCBCFComplianceEnsuring: "Hỗ trợ định dạng mở OpenBIM (IFC, BCF) tương thích đa nền tảng phần mềm.",
    fullLegalNDAComplianceSafeguarding: "Cam kết bảo mật dữ liệu công trình theo thỏa thuận NDA pháp lý chặt chẽ.",
    receiveExpertConsultationDetailedScope: "Nhận tư vấn giải pháp, phạm vi công việc và báo giá chi tiết từ các chuyên gia BIM4C.",
    relatedServices: "Dịch vụ liên quan",
    relatedServices2: "Giải pháp BIM liên quan"
  },
  catalogControls: {
    clearSearch: "Xóa tìm kiếm",
    alreadyOnTheFirstPage: "Đang ở trang đầu",
    previousPage: "Trang trước",
    alreadyOnTheLastPage: "Đang ở trang cuối",
    nextPage: "Trang sau"
  },
  commandMenu: {
    t3DOpenBIMViewerInteractiveModel: "3D OpenBIM Viewer (Mô hình trực quan)",
    inspectIFCBCFSpatialCoordination: "Kiểm tra IFC, BCF và phân tích không gian",
    allProjectsCaseStudies: "Tất cả Dự án Thực chiến",
    exploreHighRiseAndInfrastructure: "Khám phá danh mục dự án cao ốc, hạ tầng của BIM4C",
    bIMConsultingSolutions: "Dịch vụ & Giải pháp Tư vấn BIM",
    iSO19650StrategyCDEMEP: "Chiến lược ISO 19650, CDE, Phối hợp MEP & 5D",
    bIM4CAcademyProfessionalTraining: "BIM4C Academy (Đào tạo Kỹ sư)",
    practicalRevitNavisworksOpenBIMCurriculum: "Chương trình đào tạo Revit, Navisworks, OpenBIM thực chiến",
    insightsTechnicalJournal: "Góc nhìn & Bài viết Kỹ thuật",
    fieldTestedAECDigitalMethods: "Kinh nghiệm thực tế từ các công trình và chuyển đổi số",
    aboutBIM4CLeadershipCapability: "Về BIM4C (Ban Lãnh đạo & Năng lực)",
    executiveTeamEngineeringCapability: "Đội ngũ chuyên gia và năng lực thực chiến",
    technicalHotline84932468: "Hotline Kỹ thuật: +84 93 2468 099",
    directProjectScopingSupport: "Hỗ trợ dự án và tư vấn phạm vi",
    sendRFPAndProjectRequirements: "Gửi yêu cầu báo giá và tài liệu dự án",
    hQ20BacSonDa: "Trụ sở chính: 20 Bắc Sơn, Đà Nẵng",
    taxAddressAnKheWard: "Địa chỉ kê khai thuế: 20 Bắc Sơn, P. An Khê, TP Đà Nẵng",
    quickSearchNavigationMenu: "Menu tìm kiếm và điều hướng nhanh",
    searchProjectsServicesCoursesArticles: "Tìm kiếm nhanh dự án, dịch vụ, khóa học, bài viết, MST...",
    quickSearchInput: "Ô tìm kiếm nhanh",
    closeSearch: "Đóng tìm kiếm",
    noMatchingCommandsFound: "Không tìm thấy kết quả phù hợp.",
    trySearchingBIMProjectsOr: "Thử tìm 'BIM', 'Đà Nẵng', hoặc 'Dự án'",
    navigate: "Di chuyển",
    execute: "Chọn",
    close: "Đóng"
  },
  contentBlockRenderer: {
    imageGallery: "Thư viện ảnh",
    watchVideo: "Xem video"
  },
  floatingContactWidget: {
    quickContactChannels: "Kênh liên hệ nhanh",
    callConsultationHotline: "Gọi Hotline tư vấn",
    closeContactMenu: "Đóng menu liên hệ",
    openContactMenu: "Mở menu liên hệ"
  },
  languageSwitcher: {
    languageSelection: "Chọn ngôn ngữ"
  },
  notFoundView: {
    t404ERRORPAGENOTFOUND: "404 · LỖI / KHÔNG TÌM THẤY TRANG",
    thisPageDoesNotExist: "Trang không tồn tại hoặc đã được di chuyển.",
    theLinkYouAccessedIs: "Địa chỉ liên kết bạn vừa truy cập không khả dụng. Hãy quay về trang chủ hoặc khám phá các giải pháp công nghệ BIM của chúng tôi.",
    returnToHomepage: "Về trang chủ",
    solutionsServices: "Giải pháp & Dịch vụ",
    contactSupport: "Liên hệ hỗ trợ"
  },
  pageHero: {
    breadcrumb: "Đường dẫn trang"
  },
  slideControls: {
    pauseSlideshow: "Dừng tự chuyển slide",
    playSlideshow: "Bật tự chuyển slide",
    previousSlide: "Slide trước",
    nextSlide: "Slide tiếp theo"
  },
  errorState: {
    weCouldNotLoadThis: "Không thể tải nội dung này",
    aConnectionIssueOccurredOr: "Đã có sự cố kết nối hoặc nội dung tạm thời không khả dụng. Vui lòng thử lại.",
    tryAgain: "Thử lại"
  },
  formats: {
    snap: { vertex: "Đỉnh", midpoint: "Trung điểm", edge: "Cạnh", face: "Mặt" },
    axisHint: { X: "Đông", Y: "Bắc", Z: "Cao độ" },
    hoverToReadCoordinates: "Di chuột lên mô hình để xem tọa độ",
    centreAxis: (axis) => `Tâm ${axis}`,
    modelsInScene: (count) => `${count} mô hình trong cảnh`,
    federatedModels: (count) => `${count} mô hình đã ghép`,
    modelAdded: (file, elements) => `Đã thêm ${file}: ${elements} cấu kiện.`,
    ifcErrors: {
      IFC_FILE_EMPTY: "Tệp IFC rỗng.",
      IFC_NO_GEOMETRY: "Tệp không chứa hình học 3D được hỗ trợ. Không có khối thay thế nào được tạo.",
      IFC_WORKER_FAILED: "Không thể khởi tạo bộ đọc IFC. Hãy tải lại trang và thử lại.",
    },
    diagnostics: (missing, failed, properties) =>
      `Không có hình học: ${missing}; lỗi hình học: ${failed}; thuộc tính đọc chưa đầy đủ: ${properties}.`,
    page: (n) => `Trang ${n}`,
    expertiseTitle: ["Giải pháp phù hợp.", "Mọi giai đoạn dự án."],
  }
};
