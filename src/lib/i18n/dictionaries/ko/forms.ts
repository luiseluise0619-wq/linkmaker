/**
 * Korean strings for the "forms" namespace. Must cover every key present in
 * ../en/forms.ts.
 */
export const forms: Record<string, string> = {
  // Shared
  "forms.cancel": "취소",
  "forms.delete": "삭제",
  "forms.deleting": "삭제 중…",
  "forms.saving": "저장 중…",
  "forms.creating": "생성 중…",
  "forms.copy": "복사",

  // Link form
  "forms.createLink": "링크 생성",
  "forms.saveChanges": "변경사항 저장",
  "forms.toastLinkCreated": "링크가 생성되었습니다",
  "forms.toastChangesSaved": "변경사항이 저장되었습니다",
  "forms.toastImageRemoved": "이미지가 삭제되었습니다",
  "forms.toastImageRemoveError": "이미지를 삭제할 수 없습니다",
  "forms.destinationSection": "대상",
  "forms.destinationLabel": "대상 URL",
  "forms.destinationHelp":
    "방문자가 이동할 주소입니다. 짧은 링크를 바꾸지 않고 나중에 변경할 수 있습니다.",
  "forms.slugLabel": "사용자 지정 슬러그 (선택)",
  "forms.slugPlaceholder": "자동 생성",
  "forms.slugChangeWarning":
    "슬러그를 변경하면 기존 슬러그를 사용하는 QR 코드와 공유된 URL이 작동하지 않게 됩니다.",
  "forms.detailsSection": "세부 정보",
  "forms.titleLabel": "제목",
  "forms.descriptionLabel": "설명",
  "forms.descriptionPlaceholder": "이 링크에 대한 메모 (선택)",
  "forms.campaignLabel": "캠페인",
  "forms.noCampaign": "캠페인 없음",
  "forms.expirationLabel": "만료일 (선택)",
  "forms.imageSection": "이미지 링크 (선택)",
  "forms.imageUploadsDisabledPre": "이미지 업로드가 비활성화되어 있습니다. 활성화하려면",
  "forms.imageUploadsDisabledPost": "을(를) 설정하세요.",
  "forms.imagePreviewAlt": "미리보기",
  "forms.imageAltPlaceholder": "대체 텍스트 (임베드된 이미지용)",
  "forms.removeImage": "이미지 삭제",
  "forms.imageFormatsHelp": "PNG, JPEG, WebP 또는 GIF, 최대 5MB.",
  "forms.utmSection": "UTM 매개변수 (선택)",
  "forms.utmSource": "UTM 소스",
  "forms.utmMedium": "UTM 매체",
  "forms.utmCampaign": "UTM 캠페인",
  "forms.utmTerm": "UTM 검색어",
  "forms.utmContent": "UTM 콘텐츠",
  "forms.statusSection": "상태",
  "forms.statusActive": "활성",
  "forms.statusDisabled": "비활성",
  "forms.statusActiveDesc": "이 링크는 활성 상태이며 리디렉션됩니다.",
  "forms.statusDisabledDesc": "이 링크는 방문자를 리디렉션하지 않습니다.",

  // Campaign manager
  "forms.createCampaign": "캠페인 생성",
  "forms.newCampaign": "새 캠페인",
  "forms.toastCampaignCreated": "캠페인이 생성되었습니다",
  "forms.createCampaignDesc": "링크를 그룹으로 묶어 통합 성과를 추적하세요.",
  "forms.nameLabel": "이름",
  "forms.optionalPlaceholder": "선택 사항",
  "forms.deleteCampaignAria": "캠페인 삭제",
  "forms.toastCampaignDeleted": "캠페인이 삭제되었습니다",
  "forms.toastCampaignDeleteError": "삭제할 수 없습니다",
  "forms.deleteCampaignTitle": "캠페인을 삭제할까요?",
  "forms.deleteCampaignDesc":
    "이 캠페인의 링크는 유지되지만 더 이상 이 캠페인으로 그룹화되지 않습니다.",

  // Reset analytics
  "forms.toastAnalyticsReset": "분석이 초기화되었습니다 — 이벤트 {count}개 삭제됨",
  "forms.toastAnalyticsResetError": "분석을 초기화할 수 없습니다",
  "forms.resetAllAnalytics": "모든 분석 초기화",
  "forms.resetAnalyticsTitle": "모든 분석을 초기화할까요?",
  "forms.resetAnalyticsDesc":
    "모든 링크에 기록된 클릭 이벤트를 영구적으로 삭제하고 모든 수치를 0으로 되돌립니다. 링크는 계속 작동하며 분석만 삭제됩니다. 이 작업은 되돌릴 수 없습니다.",
  "forms.resetting": "초기화 중…",
  "forms.resetAnalytics": "분석 초기화",
  "forms.resetAnalyticsCardDesc":
    "기록된 모든 클릭을 삭제하고 모든 수치를 0으로 되돌립니다. 링크는 계속 작동합니다.",

  // Delete all links
  "forms.toastLinksDeleted": "링크 {count}개를 삭제했습니다",
  "forms.toastLinksDeleteError": "링크를 삭제할 수 없습니다",
  "forms.deleteAllLinks": "모든 링크 삭제",
  "forms.deleteAllLinksTitle": "모든 링크를 삭제할까요?",
  "forms.deleteAllLinksDesc":
    "이 워크스페이스의 모든 링크를 클릭 데이터 및 이미지와 함께 영구적으로 삭제하여 데이터베이스 공간을 확보합니다. 짧은 URL이 작동을 멈춥니다. 이 작업은 되돌릴 수 없습니다.",
  "forms.deleteEverything": "모두 삭제",
  "forms.deleteAllLinksCardDesc":
    "공간을 확보하기 위해 모든 링크와 데이터를 영구적으로 삭제합니다. 짧은 URL이 작동을 멈춥니다. 이 작업은 되돌릴 수 없습니다.",

  // Embed snippets
  "forms.embedTitle": "이미지 임베드",
  "forms.embedDesc": "클릭과 추적이 가능한 이미지를 넣고 싶은 곳에 붙여넣으세요.",
  "forms.embedImageUrlLabel": "이미지 URL",

  // New / edit link pages
  "forms.newLinkTitle": "링크 만들기",
  "forms.newLinkDesc": "추적 가능한 짧은 링크, 이미지 링크 또는 QR 코드를 생성하세요.",
  "forms.editLinkTitle": "링크 편집",
  "forms.editLinkDesc": "대상 또는 세부 정보를 수정하세요. 분석은 유지됩니다.",

  // Campaigns page
  "forms.campaignsTitle": "캠페인",
  "forms.campaignsDesc": "링크를 그룹으로 묶어 통합 성과를 추적하세요.",
  "forms.noCampaignsTitle": "아직 캠페인이 없습니다",
  "forms.noCampaignsDesc": "관련 링크를 정리하고 함께 측정하려면 캠페인을 만드세요.",
  "forms.linksCount": "링크 {count}개",
  "forms.clicksCount": "클릭 {count}회",
  "forms.createdOn": "{date} 생성",
  "forms.viewLinks": "링크 보기",

  // Settings page
  "forms.settingsTitle": "설정",
  "forms.settingsDesc": "워크스페이스 및 환경설정.",
  "forms.dashboardLinkTitle": "대시보드 링크",
  "forms.dashboardLinkDesc":
    "계정이나 비밀번호 없이 이 워크스페이스로 돌아오는 방법입니다. 링크를 저장해 두세요. 링크가 있는 누구나 대시보드에 접근할 수 있습니다.",
  "forms.usageTitle": "사용량",
  "forms.usageLinks": "링크",
  "forms.usageClickEvents": "기록된 클릭 이벤트",
  "forms.imageStorage": "이미지 저장소",
  "forms.configured": "구성됨",
  "forms.notConfigured": "구성되지 않음",
  "forms.exportTitle": "데이터 내보내기",
  "forms.exportDesc": "링크와 원본 클릭 이벤트를 CSV로 다운로드하세요 (Excel에서 열림).",
  "forms.linksCsv": "링크 CSV",
  "forms.eventsCsv": "클릭 이벤트 CSV",
  "forms.privacyTitle": "개인정보 및 데이터",
  "forms.privacyDesc": "분석 데이터가 처리되는 방식.",
  "forms.dataRetention": "데이터 보관 기간",
  "forms.daysValue": "{days}일",
  "forms.privacyNote":
    "원본 IP 주소는 저장하지 않으며, 순 방문자는 주기적으로 교체되는 솔트 해시로 추정합니다.",
  "forms.readPrivacyPolicy": "개인정보 처리방침 읽기",
  "forms.newWorkspaceTitle": "새 워크스페이스",
  "forms.newWorkspaceDesc":
    "빈 워크스페이스로 새로 시작하세요. 현재 링크는 위의 대시보드 링크로 계속 접근할 수 있으니 먼저 저장하세요.",
  "forms.startNewWorkspace": "새 워크스페이스 시작",
};
