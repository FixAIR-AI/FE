# AUDIT_06 - DOM Elements

## Technician App - Key DOM Elements by Section

### Total Static Element IDs: ~200

---

### Login Screen
| ID | Type | Purpose |
|----|------|---------|
| loginScreen | div | Login screen container |
| loginSlider | div | Login step slider |
| loginEmail | input | Email input |
| loginPassword | input | Password input |
| loginBtn | button | Login/next button |
| loginBack | button | Back button |
| loginStatus | div | Status messages |
| loginSphere | div | Animated login sphere |
| pulseSphere | div | Pulse animation sphere |

### Main App Shell
| ID | Type | Purpose |
|----|------|---------|
| mainApp | div | Main app container (hidden during login) |
| homePage | div | Home page view |
| homepageContent | div | Home page content |
| chatView | div | Chat interface view |
| chatEmpty | div | Empty chat placeholder |
| profileView | div | Profile view |
| connectView | div | Connect feature view |
| hotlineView | div | Hotline feature view |
| projectsPage | div | Projects list page |

### Navigation Bar
| ID | Type | Purpose |
|----|------|---------|
| navHome | div | Home nav button |
| navProjects | div | Projects nav button |
| navConnect | div | Connect nav button |

### Chat Panels - Copilot
| ID | Type | Purpose |
|----|------|---------|
| panelCopilot | div | Copilot panel container |
| copilotBody | div | Copilot message area |
| copilotInput | textarea | Copilot text input |
| copilotActionBtn | button | Send/voice button |
| copilotBars | div | Voice waveform bars |
| copilotWaveform | div | Voice waveform container |
| copilotTimer | div | Recording timer |
| copilotTranscriptionSphere | div | Transcription animation |
| copilotProjectName | span | Current project name |
| copilotProjectSep | span | Project name separator |
| copilotSub | span | Panel subtitle |
| copilotBrandDropdown | div | Brand selector dropdown |
| copilotBrandWrapper | div | Brand selector wrapper |
| copilotInputRow | div | Input row container |
| attachCopilot | div | Attachment menu |
| scrollBtnCopilot | button | Scroll to bottom |

### Chat Panels - Assistant
| ID | Type | Purpose |
|----|------|---------|
| panelAssistant | div | Assistant panel container |
| assistantBody | div | Assistant message area |
| assistantInput | textarea | Assistant text input |
| assistantActionBtn | button | Send/voice button |
| assistantBars | div | Voice waveform bars |
| assistantWaveform | div | Voice waveform container |
| assistantTimer | div | Recording timer |
| assistantTranscriptionSphere | div | Transcription animation |
| assistantProjectName | span | Current project name |
| assistantProjectSep | span | Project name separator |
| assistantSub | span | Panel subtitle |
| assistantBrandDropdown | div | Brand selector dropdown |
| assistantBrandWrapper | div | Brand selector wrapper |
| assistantInputRow | div | Input row container |
| attachAssistant | div | Attachment menu |
| scrollBtnAssistant | button | Scroll to bottom |

### Brand Selection
| ID | Type | Purpose |
|----|------|---------|
| brandPill | div | Brand pill button |
| brandDropdown | div | Brand dropdown menu |
| brandDot | div | Brand color dot |
| brandText | span | Brand name text |
| brandSelectInline | div | Inline brand selector (onboarding) |

### Report Drawer
| ID | Type | Purpose |
|----|------|---------|
| reportSheet | div | Report drawer sheet |
| reportBackdrop | div | Report backdrop overlay |
| reportPreviewContainer | div | Report preview scroll area |
| reportPreviewContent | div | Report content container |
| reportPreviewEmpty | div | Empty state message |
| reportFooter | div | Report action buttons |
| reportHeaderProgress | div | Progress header |
| reportProgressFill | div | Progress bar fill |
| reportProgressText | span | Progress percentage text |
| rptDoc | div | Report document content |
| autosaveIndicator | div | Auto-save status indicator |
| fontToolbar | div | Floating font toolbar |

### Report Data Sections
| ID | Type | Purpose |
|----|------|---------|
| codes-defaut-list | div | Error codes list |
| adressage-tbody | tbody | Addressing table body |
| travaux-list | div | Completed work list |
| travaux-prevoir-list | div | Planned work list |
| mesures-list | div | Measurements list |
| reserves-list | div | Reserves list |
| pieces-list | div | Parts list |

### Photos
| ID | Type | Purpose |
|----|------|---------|
| cameraInput | input | Camera capture input |
| fileInput | input | File upload input |
| photoUploadInput | input | Photo upload input |
| photoUploadInputV12 | input | V12 photo upload input |
| sortablePhotos | div | Sortable photos container |
| sortablePhotosV12 | div | V12 sortable photos |
| photoNameModal | div | Photo naming modal |
| photoNameInput | input | Photo name input |
| photoNamePreviewImg | img | Photo name preview |
| imageViewer | div | Full-screen image viewer |
| imageViewerImg | img | Image viewer image |

### Signature
| ID | Type | Purpose |
|----|------|---------|
| signatureModal | div | Signature modal overlay |
| signatureCanvas | canvas | Signature drawing canvas |
| signatureModalTitle | div | Signature modal title |
| sigAreaTech | div | Technician signature area |
| sigAreaClient | div | Client signature area |
| sigNameTech | div | Technician name display |
| sigNameClient | div | Client name display |

### Font Toolbar
| ID | Type | Purpose |
|----|------|---------|
| ftBold | button | Bold toggle |
| ftItalic | button | Italic toggle |
| ftUnderline | button | Underline toggle |
| ftAlignLeft | button | Left align |
| ftAlignCenter | button | Center align |
| ftJustify | button | Justify align |
| ftBlockType | button | Block type selector |

### Onboarding
| ID | Type | Purpose |
|----|------|---------|
| onboardingSection | div | Onboarding section container |
| onboardingCard | div | Onboarding card |
| onboardingSteps | div | Steps container |
| onboardingProgress | div | Progress indicator |
| step1-step4 | div | Individual step elements |
| step1Check-step4Check | div | Step completion checkmarks |

### Stats/Gamification
| ID | Type | Purpose |
|----|------|---------|
| statsSection | div | Stats section container |
| statsEurosSaved | span | Euros saved counter |
| statsReports | span | Reports counter |
| statsTimeValue | span | Time value |
| statsTimeUnit | span | Time unit |
| statsWeekLabel | span | Week label |
| statsMessage | div | Motivational message |
| statsRingContainer | div | Progress ring |
| statsRingProgress | circle | Ring SVG progress |
| statsRingPercent | span | Ring percentage |
| statsRingTooltip | div | Ring tooltip |

### Calendar
| ID | Type | Purpose |
|----|------|---------|
| techCalendar | div | Calendar container |
| techCalContent | div | Calendar content area |
| techCalTitle | span | Calendar title |
| eventDrawer | div | Event drawer overlay |
| eventDrawerOverlay | div | Event overlay backdrop |
| eventDrawerTitle | div | Event drawer title |
| eventDrawerSubtitle | div | Event drawer subtitle |
| eventName | input | Event name |
| eventDate | input | Event date |
| eventStartTime | input | Start time |
| eventEndTime | input | End time |
| eventClient | input | Client name |
| eventLocation | input | Location |
| eventNotes | textarea | Notes |
| eventAllDay | checkbox | All day toggle |
| eventContextMenu | div | Event context menu |

### Referral/Freemium
| ID | Type | Purpose |
|----|------|---------|
| upgradeOverlay | div | Upgrade modal overlay |
| upgradeTitle | div | Upgrade modal title |
| upgradeSubtitle | div | Upgrade modal subtitle |
| inviteConfirmPopup | div | Invite confirmation popup |
| referralPendingPopup | div | Pending referral popup |
| referralSection | div | Referral section in profile |
| referralCount | span | Referral count display |
| myReferralCode | span | User's referral code |
| bonusQueries | span | Bonus queries count |

### Profile
| ID | Type | Purpose |
|----|------|---------|
| userName | span | User name display |
| profileFirstName | input | First name input |
| profileLastName | input | Last name input |
| profileEmail | input | Email input |
| profilePhone | input | Phone input |
| langFR | button | French language button |
| langEN | button | English language button |
| themeToggle | div | Theme toggle switch |

### Connect
| ID | Type | Purpose |
|----|------|---------|
| connectActive | div | Active toggle |
| connectOnlineDot | div | Online status dot |
| connectAvailCount | span | Available count |
| connectAvailJobs | div | Available jobs list |
| connectMyJobs | div | My jobs list |
| connectMissions | span | Missions count |
| connectEarnings | span | Earnings display |
| connectRating | span | Rating display |
| connectDrawer | div | Connect drawer |
| connectPromo | div | Connect promo section |

### Hotline
| ID | Type | Purpose |
|----|------|---------|
| hotlineChat | div | Hotline chat container |
| hotlineChatMessages | div | Hotline messages area |
| hotlineWidget | div | Hotline floating widget |
| widgetLabel | span | Widget label |
| widgetSublabel | span | Widget sublabel |

### Layout
| ID | Type | Purpose |
|----|------|---------|
| divider | div | Split view divider |
| gapCover | div | Gap cover for iOS |
| messagesWrapper | div | Messages wrapper |
| toast | div | Toast notification container |
| toggleChat | div | Chat toggle button |
| toggleText | span | Toggle button text |

### SVG Icons (sprite)
All icons defined as `<symbol>` elements with IDs like `icon-*`:
`icon-air`, `icon-arrow-left`, `icon-arrow-right`, `icon-briefcase`, `icon-calendar`, `icon-camera`, `icon-check`, `icon-checklist`, `icon-clipboard`, `icon-clock`, `icon-columns`, `icon-connect`, `icon-copy`, `icon-dollar`, `icon-download`, `icon-edit`, `icon-fixair-logo`, `icon-folder`, `icon-home`, `icon-image`, `icon-map-pin`, `icon-mic`, `icon-paperclip`, `icon-phone`, `icon-plus`, `icon-search`, `icon-send`, `icon-share`, `icon-star`, `icon-trash`, `icon-user`, `icon-x`
