/**
 * English source strings for the "forms" namespace (link/campaign forms,
 * settings, destructive-action dialogs, embed snippets). Every key here must
 * also exist in ../ko/forms.ts.
 */
export const forms = {
  // Shared
  "forms.cancel": "Cancel",
  "forms.delete": "Delete",
  "forms.deleting": "Deleting…",
  "forms.saving": "Saving…",
  "forms.creating": "Creating…",
  "forms.copy": "Copy",

  // Link form
  "forms.createLink": "Create link",
  "forms.saveChanges": "Save changes",
  "forms.toastLinkCreated": "Link created",
  "forms.toastChangesSaved": "Changes saved",
  "forms.toastImageRemoved": "Image removed",
  "forms.toastImageRemoveError": "Could not remove image",
  "forms.destinationSection": "Destination",
  "forms.destinationLabel": "Destination URL",
  "forms.destinationHelp":
    "Where visitors are sent. You can change this later without changing the short link.",
  "forms.slugLabel": "Custom slug (optional)",
  "forms.slugPlaceholder": "auto-generated",
  "forms.slugChangeWarning":
    "Changing the slug will break existing QR codes and shared URLs using the old slug.",
  "forms.detailsSection": "Details",
  "forms.titleLabel": "Title",
  "forms.descriptionLabel": "Description",
  "forms.descriptionPlaceholder": "Optional notes about this link",
  "forms.campaignLabel": "Campaign",
  "forms.noCampaign": "No campaign",
  "forms.expirationLabel": "Expiration date (optional)",
  "forms.imageSection": "Image link (optional)",
  "forms.imageUploadsDisabledPre": "Image uploads are disabled. Set",
  "forms.imageUploadsDisabledPost": "to enable them.",
  "forms.imagePreviewAlt": "Preview",
  "forms.imageAltPlaceholder": "Alt text (for the embedded image)",
  "forms.removeImage": "Remove image",
  "forms.imageFormatsHelp": "PNG, JPEG, WebP or GIF up to 5 MB.",
  "forms.utmSection": "UTM parameters (optional)",
  "forms.utmSource": "UTM Source",
  "forms.utmMedium": "UTM Medium",
  "forms.utmCampaign": "UTM Campaign",
  "forms.utmTerm": "UTM Term",
  "forms.utmContent": "UTM Content",
  "forms.statusSection": "Status",
  "forms.statusActive": "Active",
  "forms.statusDisabled": "Disabled",
  "forms.statusActiveDesc": "This link is live and redirecting.",
  "forms.statusDisabledDesc": "This link will not redirect visitors.",

  // Campaign manager
  "forms.createCampaign": "Create campaign",
  "forms.newCampaign": "New campaign",
  "forms.toastCampaignCreated": "Campaign created",
  "forms.createCampaignDesc": "Group links and track their combined performance.",
  "forms.nameLabel": "Name",
  "forms.optionalPlaceholder": "Optional",
  "forms.deleteCampaignAria": "Delete campaign",
  "forms.toastCampaignDeleted": "Campaign deleted",
  "forms.toastCampaignDeleteError": "Could not delete",
  "forms.deleteCampaignTitle": "Delete campaign?",
  "forms.deleteCampaignDesc":
    "Links in this campaign are kept, but they'll no longer be grouped under it.",

  // Reset analytics
  "forms.toastAnalyticsReset": "Analytics reset — {count} events cleared",
  "forms.toastAnalyticsResetError": "Could not reset analytics",
  "forms.resetAllAnalytics": "Reset all analytics",
  "forms.resetAnalyticsTitle": "Reset all analytics?",
  "forms.resetAnalyticsDesc":
    "This permanently deletes every recorded click event for all of your links, setting all numbers back to zero. Your links keep working — only the analytics are cleared. This cannot be undone.",
  "forms.resetting": "Resetting…",
  "forms.resetAnalytics": "Reset analytics",
  "forms.resetAnalyticsCardDesc":
    "Clear all recorded clicks and set every number back to zero. Your links keep working.",

  // Delete all links
  "forms.toastLinksDeleted": "Deleted {count} links",
  "forms.toastLinksDeleteError": "Could not delete links",
  "forms.deleteAllLinks": "Delete all links",
  "forms.deleteAllLinksTitle": "Delete all links?",
  "forms.deleteAllLinksDesc":
    "This permanently deletes every link in this workspace along with all of their click data and images, freeing database space. The short URLs will stop working. This cannot be undone.",
  "forms.deleteEverything": "Delete everything",
  "forms.deleteAllLinksCardDesc":
    "Permanently delete every link and its data to free up space. The short URLs stop working. This cannot be undone.",

  // Embed snippets
  "forms.embedTitle": "Image embed",
  "forms.embedDesc": "Paste this where you want a clickable, trackable image.",
  "forms.embedImageUrlLabel": "Image URL",

  // New / edit link pages
  "forms.newLinkTitle": "Create a link",
  "forms.newLinkDesc": "Generate a trackable short link, image link or QR code.",
  "forms.editLinkTitle": "Edit link",
  "forms.editLinkDesc": "Update the destination or details. Analytics are preserved.",

  // Campaigns page
  "forms.campaignsTitle": "Campaigns",
  "forms.campaignsDesc": "Group links and track combined performance.",
  "forms.noCampaignsTitle": "No campaigns yet",
  "forms.noCampaignsDesc":
    "Create a campaign to organize related links and measure them together.",
  "forms.linksCount": "{count} links",
  "forms.clicksCount": "{count} clicks",
  "forms.createdOn": "Created {date}",
  "forms.viewLinks": "View links",

  // Settings page
  "forms.settingsTitle": "Settings",
  "forms.settingsDesc": "Your workspace and preferences.",
  "forms.dashboardLinkTitle": "Dashboard link",
  "forms.dashboardLinkDesc":
    "This is how you get back to this workspace — no account or password. Save it. Anyone with the link can access your dashboard.",
  "forms.usageTitle": "Usage",
  "forms.usageLinks": "Links",
  "forms.usageClickEvents": "Recorded click events",
  "forms.imageStorage": "Image storage",
  "forms.configured": "Configured",
  "forms.notConfigured": "Not configured",
  "forms.exportTitle": "Export data",
  "forms.exportDesc": "Download your links and raw click events as CSV (opens in Excel).",
  "forms.linksCsv": "Links CSV",
  "forms.eventsCsv": "Click events CSV",
  "forms.privacyTitle": "Privacy & data",
  "forms.privacyDesc": "How your analytics data is handled.",
  "forms.dataRetention": "Data retention",
  "forms.daysValue": "{days} days",
  "forms.privacyNote":
    "We never store raw IP addresses; unique visitors are estimated with rotating, salted hashes.",
  "forms.readPrivacyPolicy": "Read the privacy policy",
  "forms.newWorkspaceTitle": "New workspace",
  "forms.newWorkspaceDesc":
    "Start fresh with an empty workspace. Your current links stay reachable via the dashboard link above — save it first.",
  "forms.startNewWorkspace": "Start a new workspace",
} as const;
