/**
 * English strings for the "links" namespace (dashboard links list + detail).
 * Every key here must also exist in ../ko/links.ts.
 */
export const links = {
  // Status badges (shared by list + detail)
  "links.statusActive": "Active",
  "links.statusDisabled": "Disabled",
  "links.statusExpired": "Expired",

  // Links list page
  "links.pageTitle": "Links",
  "links.pageDescription": "Manage your short links, image links and QR codes.",
  "links.exportCsv": "Export CSV",
  "links.newLink": "New link",
  "links.emptyNoMatchTitle": "No matching links",
  "links.emptyNoMatchDescription": "Try adjusting your search or filters.",
  "links.emptyTitle": "No links yet",
  "links.emptyDescription":
    "Create your first trackable short link to get started.",
  "links.createLink": "Create link",
  "links.colLink": "Link",
  "links.colDestination": "Destination",
  "links.colClicks": "Clicks",
  "links.colStatus": "Status",
  "links.colCreated": "Created",

  // Link detail page
  "links.detailDescription": "Link details and analytics.",
  "links.open": "Open",
  "links.edit": "Edit",
  "links.metaShortUrl": "Short URL",
  "links.metaDestination": "Destination",
  "links.metaStatus": "Status",
  "links.metaCreated": "Created",
  "links.metaLastClick": "Last click",
  "links.metaExpires": "Expires",
  "links.metaCampaign": "Campaign",
  "links.metaTrafficSource": "Traffic source",
  "links.trafficSourceValue": "{link} link · {qr} QR",
  "links.kpiTotalClicks": "Total clicks",
  "links.kpiClicksHint": "{human} human · {bot} bot",
  "links.kpiUniqueVisitors": "Unique visitors",
  "links.kpiEstimated": "Estimated",
  "links.kpiReturning": "Returning",
  "links.kpiToday": "Today",
  "links.kpiThisWeek": "This week",
  "links.kpiThisMonth": "This month",
  "links.estimatesNote":
    "Bot detection and unique/returning visitors are estimates.",
  "links.timelineTitle": "Clicks — last 7 days",
  "links.campaignImageAlt": "Campaign image",

  // Toolbar
  "links.searchPlaceholder": "Search by title, slug or destination…",
  "links.filterAria": "Filter",
  "links.sortAria": "Sort",
  "links.filterAll": "All links",
  "links.filterActive": "Active",
  "links.filterDisabled": "Disabled",
  "links.filterExpired": "Expired",
  "links.filterHigh": "High traffic",
  "links.filterRecent": "Recently created",
  "links.sortNewest": "Newest",
  "links.sortMostClicks": "Most clicks",
  "links.sortOldest": "Oldest",

  // Row actions menu + dialogs
  "links.actionsAria": "Actions",
  "links.actionAnalytics": "Analytics",
  "links.actionEdit": "Edit",
  "links.actionCopyUrl": "Copy URL",
  "links.actionQrCode": "QR code",
  "links.actionOpen": "Open",
  "links.actionEnable": "Enable",
  "links.actionDisable": "Disable",
  "links.actionDelete": "Delete",
  "links.qrTitle": "QR code",
  "links.qrDescription":
    "Encodes the short URL. Changing the destination never breaks it.",
  "links.qrAlt": "QR code",
  "links.downloadPng": "Download PNG",
  "links.deleteTitle": "Delete this link?",
  "links.deleteDescription":
    "This permanently deletes the link and all of its analytics. The short URL will stop working. This cannot be undone.",
  "links.cancel": "Cancel",
  "links.deleting": "Deleting…",
  "links.deleteConfirm": "Delete link",

  // Toasts
  "links.toastCopied": "Short URL copied",
  "links.toastCopyError": "Could not copy",
  "links.toastEnabled": "Link enabled",
  "links.toastDisabled": "Link disabled",
  "links.toastUpdateError": "Could not update",
  "links.toastDeleted": "Link deleted",
  "links.toastDeleteError": "Could not delete",

  // Pagination
  "links.pageOf": "Page {current} of {total}",
  "links.previous": "Previous",
  "links.next": "Next",
} as const;
