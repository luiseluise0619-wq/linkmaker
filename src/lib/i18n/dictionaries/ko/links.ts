/**
 * Korean strings for the "links" namespace (dashboard links list + detail).
 * Must cover every key present in ../en/links.ts.
 */
export const links: Record<string, string> = {
  // Status badges (shared by list + detail)
  "links.statusActive": "활성",
  "links.statusDisabled": "비활성",
  "links.statusExpired": "만료됨",

  // Links list page
  "links.pageTitle": "링크",
  "links.pageDescription": "단축 링크, 이미지 링크, QR 코드를 관리하세요.",
  "links.exportCsv": "CSV 내보내기",
  "links.newLink": "새 링크",
  "links.emptyNoMatchTitle": "일치하는 링크 없음",
  "links.emptyNoMatchDescription": "검색어나 필터를 조정해 보세요.",
  "links.emptyTitle": "아직 링크가 없습니다",
  "links.emptyDescription": "추적 가능한 첫 단축 링크를 만들어 시작하세요.",
  "links.createLink": "링크 만들기",
  "links.colLink": "링크",
  "links.colDestination": "대상 URL",
  "links.colClicks": "클릭수",
  "links.colStatus": "상태",
  "links.colCreated": "생성일",

  // Link detail page
  "links.detailDescription": "링크 상세 정보 및 분석.",
  "links.open": "열기",
  "links.edit": "편집",
  "links.metaShortUrl": "단축 URL",
  "links.metaDestination": "대상 URL",
  "links.metaStatus": "상태",
  "links.metaCreated": "생성일",
  "links.metaLastClick": "마지막 클릭",
  "links.metaExpires": "만료일",
  "links.metaCampaign": "캠페인",
  "links.metaTrafficSource": "유입 경로",
  "links.trafficSourceValue": "링크 {link} · QR {qr}",
  "links.kpiTotalClicks": "총 클릭수",
  "links.kpiClicksHint": "사람 {human} · 봇 {bot}",
  "links.kpiUniqueVisitors": "순 방문자",
  "links.kpiEstimated": "추정치",
  "links.kpiReturning": "재방문자",
  "links.kpiToday": "오늘",
  "links.kpiThisWeek": "이번 주",
  "links.kpiThisMonth": "이번 달",
  "links.estimatesNote": "봇 탐지 및 순/재방문자 수는 추정치입니다.",
  "links.timelineTitle": "클릭수 — 최근 7일",
  "links.campaignImageAlt": "캠페인 이미지",

  // Toolbar
  "links.searchPlaceholder": "제목, 슬러그, 대상으로 검색…",
  "links.filterAria": "필터",
  "links.sortAria": "정렬",
  "links.filterAll": "모든 링크",
  "links.filterActive": "활성",
  "links.filterDisabled": "비활성",
  "links.filterExpired": "만료됨",
  "links.filterHigh": "높은 트래픽",
  "links.filterRecent": "최근 생성됨",
  "links.sortNewest": "최신순",
  "links.sortMostClicks": "클릭수순",
  "links.sortOldest": "오래된순",

  // Row actions menu + dialogs
  "links.actionsAria": "작업",
  "links.actionAnalytics": "분석",
  "links.actionEdit": "편집",
  "links.actionCopyUrl": "URL 복사",
  "links.actionQrCode": "QR 코드",
  "links.actionOpen": "열기",
  "links.actionEnable": "활성화",
  "links.actionDisable": "비활성화",
  "links.actionDelete": "삭제",
  "links.qrTitle": "QR 코드",
  "links.qrDescription":
    "단축 URL을 인코딩합니다. 대상을 변경해도 QR 코드는 그대로 작동합니다.",
  "links.qrAlt": "QR 코드",
  "links.downloadPng": "PNG 다운로드",
  "links.deleteTitle": "이 링크를 삭제할까요?",
  "links.deleteDescription":
    "링크와 모든 분석 데이터가 영구적으로 삭제됩니다. 단축 URL이 작동을 멈춥니다. 이 작업은 되돌릴 수 없습니다.",
  "links.cancel": "취소",
  "links.deleting": "삭제 중…",
  "links.deleteConfirm": "링크 삭제",

  // Toasts
  "links.toastCopied": "단축 URL을 복사했습니다",
  "links.toastCopyError": "복사할 수 없습니다",
  "links.toastEnabled": "링크를 활성화했습니다",
  "links.toastDisabled": "링크를 비활성화했습니다",
  "links.toastUpdateError": "업데이트할 수 없습니다",
  "links.toastDeleted": "링크를 삭제했습니다",
  "links.toastDeleteError": "삭제할 수 없습니다",

  // Pagination
  "links.pageOf": "{current} / {total} 페이지",
  "links.previous": "이전",
  "links.next": "다음",
};
