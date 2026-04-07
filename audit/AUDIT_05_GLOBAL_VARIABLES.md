# AUDIT_05 - Global Variables

## Technician App (technician/index.html)

### Configuration Constants
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 1 | `PRODUCTION_MODE` | 6592 | boolean | Controls console.log suppression |
| 2 | `isSafari` | 6608 | boolean | Browser detection |
| 3 | `isIOS` | 6609 | boolean | Platform detection |
| 4 | `isMobile` | 6610 | boolean | Mobile device detection |
| 5 | `SUPABASE_URL` | 7071 | string | Supabase project URL |
| 6 | `SUPABASE_ANON_KEY` | 7072 | string | Supabase public anon key |
| 7 | `API_BASE` | 7775 | string | n8n webhook base URL |
| 8 | `colors` | 7779 | object | Brand color mapping |
| 9 | `names` | 7780 | object | Brand name mapping |
| 10 | `BRAND_ERROR_EXAMPLES` | 6977 | object | Error examples per brand |
| 11 | `translations` | 6704 | object | i18n translation strings |
| 12 | `REPORT_STATUS` | 7346 | object | Report status constants |
| 13 | `MAX_BARS` | 9655 | number | Voice waveform bars |
| 14 | `MIN_HEIGHT` | 9656 | number | Waveform min height |
| 15 | `MAX_HEIGHT` | 9657 | number | Waveform max height |
| 16 | `SILENCE_THRESHOLD` | 9658 | number | Voice silence threshold |
| 17 | `REPLACE_ARRAYS` | 13550 | Set | Array fields to replace (not merge) |
| 18 | `DRAWER_MAX_UNDO` | 14469 | number | Max undo stack depth |
| 19 | `FREEMIUM_CONFIG` | 18666 | object | Freemium system configuration |

### Webhook URLs
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 20 | `WEBHOOKS.copilot` | 9759 | string | Copilot webhook URL |
| 21 | `WEBHOOKS.assistant` | 9760 | string | Assistant webhook URL (DEV) |
| 22 | `EXTRACTION_WEBHOOK` | 9762 | string | Extraction webhook URL (DEV) |
| 23 | `OCR_WEBHOOK_URL` | 17220 | string | OCR webhook URL |

### Mutable State - Core
| # | Variable | Line | Type | Purpose | Modified By |
|---|----------|------|------|---------|-------------|
| 24 | `db` | 7074 | SupabaseClient | Supabase client instance | init() |
| 25 | `supabaseReady` | 7075 | boolean | Supabase init status | waitForSupabase() |
| 26 | `mermaidReady` | 7078 | boolean | Mermaid init status | initMermaid() |
| 27 | `currentUser` | 7776 | object | Current user profile | loadUserDashboard() |
| 28 | `supabaseUser` | 7777 | object | Supabase auth user | nextLoginStep() |
| 29 | `cachedApiKeys` | 7783 | object | Cached API keys from app_settings | getApiKey() |
| 30 | `currentUserId` | 9793 | string | Current user UUID | getCurrentUserId() |
| 31 | `currentProjectId` | 9794 | string | Active project UUID | loadProject(), ensureProject() |

### Mutable State - UI
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 32 | `brand` | 6689 | string | Current HVAC brand (default: mitsubishi) |
| 33 | `mode` | 6690 | string | Current mode (copilot/assistant) |
| 34 | `isSplit` | 6691 | boolean | Split view active |
| 35 | `isConnected` | 6692 | boolean | Connection status |
| 36 | `isConnecting` | 6693 | boolean | Connection in progress |
| 37 | `isDisconnecting` | 6694 | boolean | Disconnection in progress |
| 38 | `chatOpen` | 6695 | boolean | Chat panel open |
| 39 | `currentPhotoPanel` | 6696 | string | Which panel photo is for |
| 40 | `currentPage` | 6697 | string | Current page/screen |
| 41 | `currentTheme` | 6700 | string | Dark/light theme |
| 42 | `currentLang` | 6701 | string | FR/EN language |

### Mutable State - Onboarding
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 43 | `onboardingStep` | 6970 | number | Current onboarding step |
| 44 | `onboardingComplete` | 6971 | boolean | Onboarding finished |
| 45 | `step3Done` | 6972 | boolean | Step 3 completed |
| 46 | `step4Done` | 6973 | boolean | Step 4 completed |
| 47 | `onboardingBrand` | 6974 | string | Brand selected in onboarding |

### Mutable State - Auth/Login
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 48 | `loginStep` | 8023 | number | Login wizard step |
| 49 | `existingUserData` | 8024 | object | User data during login |
| 50 | `toastTimeout` | 7330 | timeout | Toast notification timer |

### Mutable State - Report
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 51 | `lastReportData` | 11096 | object | Current report data (THE MAIN STATE) |
| 52 | `reportCompletionState` | 7351 | object | Report completion tracking |
| 53 | `pendingNewFields` | 7626 | array | Fields waiting for user acceptance |
| 54 | `reportIsCompleted` | 14464 | boolean | Whether report is marked complete |
| 55 | `_saveTimeout` | 13663 | timeout | Debounced save timer |
| 56 | `_pendingSaveData` | 13664 | object | Data pending save |

### Mutable State - Drawer
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 57 | `drawerDraggedElement` | 14460 | element | Currently dragged element |
| 58 | `drawerActiveEditable` | 14461 | element | Currently focused editable |
| 59 | `drawerNumCounter` | 14462 | number | Counter for numbering |
| 60 | `drawerAutoSaveTimeout` | 14463 | timeout | Auto-save debounce timer |
| 61 | `drawerUndoStack` | 14467 | array | Undo history |
| 62 | `drawerRedoStack` | 14468 | array | Redo history |

### Mutable State - Voice/Audio
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 63 | `recordings` | 9660 | object | Active recordings by panel |
| 64 | `audioContexts` | 9661 | object | Audio contexts by panel |
| 65 | `analysers` | 9662 | object | Audio analysers by panel |
| 66 | `waveformIntervals` | 9663 | object | Waveform animation intervals |
| 67 | `voiceTimers` | 9664 | object | Voice recording timers |
| 68 | `simulatedSpeaking` | 9665 | object | Simulated speaking state |
| 69 | `simulatedIntensityTarget` | 9666 | object | Voice intensity targets |
| 70 | `simulatedIntensityCurrent` | 9667 | object | Current voice intensity |

### Mutable State - Projects/Chat
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 71 | `projectMessageCount` | 9799 | number | Messages in current project |
| 72 | `contextMenuProjectId` | 10037 | string | Project ID for context menu |
| 73 | `currentProjectTitle` | 10038 | string | Current project title |
| 74 | `longPressTimer` | 10160 | timeout | Long press detection timer |
| 75 | `longPressTriggered` | 10161 | boolean | Long press was triggered |
| 76 | `openingFromProject` | 9242 | boolean | Opening chat from project list |

### Mutable State - Photos/Signature
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 77 | `pendingReportPhoto` | 17833 | object | Photo waiting to be added |
| 78 | `signatureContext` | 17888 | CanvasContext | Signature canvas context |
| 79 | `isDrawing` | 17889 | boolean | Drawing on signature canvas |
| 80 | `currentSignatureType` | 17890 | string | Which signature field |

### Mutable State - Hotline/Connect
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 81 | `elevenLabsConversation` | 18347 | object | ElevenLabs conversation instance |
| 82 | `elevenLabsSDKReady` | 18348 | boolean | SDK loaded |

### Mutable State - Layout
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 83 | `divider` | 18547 | element | Split view divider |
| 84 | `pC` | 18548 | element | Copilot panel element |
| 85 | `pA` | 18549 | element | Assistant panel element |
| 86 | `isDrag` | 18550 | boolean | Divider being dragged |
| 87 | `touchX` | 18604 | number | Touch X coordinate |

### Mutable State - Freemium
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 88 | `paymentPollInterval` | 19201 | interval | Stripe payment polling timer |

### Mutable State - Live Status
| # | Variable | Line | Type | Purpose |
|---|----------|------|------|---------|
| 89 | `idleTimer` | 8365 | timeout | Idle detection timer |
| 90 | `currentLiveStatus` | 8366 | string | Current online status |

---

## Critical State Dependencies

The most important state variable is `lastReportData` (line 11096). It is:
- **Read by:** updateDrawerPreview(), calculateReportCompletion(), buildPartialReport(), renderReport(), generateWord(), generatePDF(), exportReport(), drawerAutoSave(), confirmReportCompletion(), showCompletionPopup()
- **Written by:** loadProject() (from Supabase), mergeReportData() (from AI response), drawerExtractDataFromDOM() (from DOM edits)
- **Persisted to:** Supabase `projects.extracted_data` column

**This is the single source of truth for the report and the #1 cause of bugs in the system.**

---

## Total Global Variables: ~90 in technician app

### Other Apps (Summary)
| App | Approx Global Variables | Notable |
|-----|------------------------|---------|
| index.html | ~70 | Shares most with technician |
| docs/index.html | ~75 | Shares most with technician + ElevenLabs vars |
| operations/index.html | ~40 | Map markers, team data |
| master/index.html | ~30 | User list, project data |
| manager/index.html | ~35 | Team members, realtime subscriptions |
| admin/index.html | ~35 | Same as manager |
| auth/index.html | ~10 | Login state only |
