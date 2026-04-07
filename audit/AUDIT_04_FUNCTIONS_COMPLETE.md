# AUDIT_04 - Complete Functions List

## Summary

| File | Function Count |
|------|---------------|
| technician/index.html | 371 |
| index.html | 256 |
| docs/index.html | 268 |
| operations/index.html | 106 |
| master/index.html | 91 |
| manager/index.html | 119 |
| admin/index.html | 112 |
| auth/index.html | 24 |
| r/index.html | 7 |
| invite/index.html | 8 |
| debug/index.html | 19 |
| **TOTAL** | **1381** |

---

## technician/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `getVisibleHeight()` | 6613 |  |
| 2 | `setViewportHeight()` | 6620 |  |
| 3 | `handleKeyboardChange()` | 6646 |  |
| 4 | `applyTheme()` | 6876 |  |
| 5 | `toggleTheme()` | 6889 |  |
| 6 | `setLanguage()` | 6895 |  |
| 7 | `t()` | 6911 |  |
| 8 | `applyTranslations()` | 6922 |  |
| 9 | `initSettings()` | 6942 |  |
| 10 | `getErrorExample()` | 7017 |  |
| 11 | `setupChatInputTracking()` | 7025 |  |
| 12 | `onBrandChangeUpdateExample()` | 7048 |  |
| 13 | `initMermaid()` | 7079 |  |
| 14 | `renderMermaidDiagrams()` | 7119 | Yes |
| 15 | `parseHashParams()` | 7245 |  |
| 16 | `handleMagicLinkCallback()` | 7259 | Yes |
| 17 | `waitForSupabase()` | 7319 | Yes |
| 18 | `toast()` | 7331 |  |
| 19 | `lockReportFields()` | 7359 |  |
| 20 | `unlockReportFields()` | 7377 |  |
| 21 | `onLockedFieldClick()` | 7394 |  |
| 22 | `showSubtleToast()` | 7403 |  |
| 23 | `showCompletionPopup()` | 7444 |  |
| 24 | `closeCompletionPopup()` | 7545 |  |
| 25 | `confirmReportCompletion()` | 7549 | Yes |
| 26 | `modifyReport()` | 7576 | Yes |
| 27 | `updateReportFooterButtons()` | 7605 |  |
| 28 | `showNewInfoNotification()` | 7628 |  |
| 29 | `dismissNewInfoNotification()` | 7695 |  |
| 30 | `acceptNewInfo()` | 7704 | Yes |
| 31 | `setNestedValue()` | 7728 |  |
| 32 | `getNestedValue()` | 7739 |  |
| 33 | `detectNewFieldsFromExtraction()` | 7744 |  |
| 34 | `getApiKey()` | 7785 | Yes |
| 35 | `prefetchApiKeys()` | 7807 | Yes |
| 36 | `init()` | 7969 | Yes |
| 37 | `showLoginScreen()` | 8026 |  |
| 38 | `setLoginStatus()` | 8038 |  |
| 39 | `clearLoginStatus()` | 8049 |  |
| 40 | `updateLoginUI()` | 8057 |  |
| 41 | `prevLoginStep()` | 8063 |  |
| 42 | `nextLoginStep()` | 8071 | Yes |
| 43 | `resetPassword()` | 8216 | Yes |
| 44 | `setLoginStatusWithResend()` | 8237 |  |
| 45 | `resendConfirmation()` | 8250 | Yes |
| 46 | `loadUserDashboard()` | 8266 | Yes |
| 47 | `showMainApp()` | 8332 |  |
| 48 | `logout()` | 8348 | Yes |
| 49 | `updateLiveStatus()` | 8368 | Yes |
| 50 | `resetIdleTimer()` | 8386 |  |
| 51 | `initLiveStatusTracking()` | 8403 |  |
| 52 | `stopLiveStatusTracking()` | 8445 |  |
| 53 | `openProfile()` | 8454 |  |
| 54 | `closeProfile()` | 8458 |  |
| 55 | `saveProfile()` | 8476 | Yes |
| 56 | `toggleBrandSelect()` | 8608 |  |
| 57 | `selectBrandInline()` | 8613 |  |
| 58 | `completeBrandStep()` | 8646 |  |
| 59 | `handleStep1Click()` | 8665 |  |
| 60 | `handleStep3Click()` | 8687 |  |
| 61 | `handleStep4Click()` | 8720 |  |
| 62 | `showAssistantOnboardingFlow()` | 8736 |  |
| 63 | `handleOnboardingAddPhotos()` | 8824 |  |
| 64 | `handleOnboardingSkipPhotos()` | 8847 |  |
| 65 | `showOnboardingPhotosPreview()` | 8868 |  |
| 66 | `generateOnboardingReportPreview()` | 8892 |  |
| 67 | `viewOnboardingFullReport()` | 8967 |  |
| 68 | `completeStep()` | 8973 |  |
| 69 | `updateOnboardingProgress()` | 8983 |  |
| 70 | `showCongrats()` | 8994 | Yes |
| 71 | `closeCongrats()` | 9015 |  |
| 72 | `goToHome()` | 9022 |  |
| 73 | `showPage()` | 9035 |  |
| 74 | `toggleBrandDropdown()` | 9045 |  |
| 75 | `closeBrandDropdown()` | 9052 |  |
| 76 | `setBrand()` | 9059 |  |
| 77 | `updateBrandContextInHistory()` | 9076 |  |
| 78 | `toggleChatBrandDropdown()` | 9112 |  |
| 79 | `closeChatBrandDropdowns()` | 9131 |  |
| 80 | `closeChatBrandDropdownsOnClick()` | 9138 |  |
| 81 | `updateChatBrandDropdownSelection()` | 9145 |  |
| 82 | `changeChatBrand()` | 9155 | Yes |
| 83 | `openChat()` | 9244 |  |
| 84 | `closeChat()` | 9351 |  |
| 85 | `updateModeToggle()` | 9401 |  |
| 86 | `switchMode()` | 9414 | Yes |
| 87 | `toggleSplit()` | 9548 |  |
| 88 | `openReport()` | 9594 |  |
| 89 | `closeReport()` | 9605 |  |
| 90 | `stripReportDataFromDisplay()` | 9611 |  |
| 91 | `addMsg()` | 9620 |  |
| 92 | `handleChatInput()` | 9670 |  |
| 93 | `handleKeydown()` | 9708 |  |
| 94 | `resetTextarea()` | 9722 |  |
| 95 | `handleSend()` | 9732 |  |
| 96 | `handleAction()` | 9740 |  |
| 97 | `getWebhookUrl()` | 9764 |  |
| 98 | `updateSessionIds()` | 9776 |  |
| 99 | `getCurrentUserId()` | 9806 | Yes |
| 100 | `ensureProject()` | 9842 | Yes |
| 101 | `saveMessage()` | 9898 | Yes |
| 102 | `autoNameProject()` | 9930 | Yes |
| 103 | `loadProjectsListAndCheckOnboarding()` | 9967 | Yes |
| 104 | `loadProjectsList()` | 9994 | Yes |
| 105 | `generateProjectCardHtml()` | 10041 |  |
| 106 | `renderProjectsList()` | 10091 |  |
| 107 | `renderRecentProjects()` | 10109 |  |
| 108 | `showProjectContextMenu()` | 10126 |  |
| 109 | `startLongPress()` | 10163 |  |
| 110 | `cancelLongPress()` | 10174 |  |
| 111 | `closeContextMenu()` | 10190 |  |
| 112 | `renameProject()` | 10200 |  |
| 113 | `closeRenameModal()` | 10209 |  |
| 114 | `saveProjectRename()` | 10213 | Yes |
| 115 | `deleteProject()` | 10245 | Yes |
| 116 | `formatTimeAgo()` | 10284 |  |
| 117 | `escapeHtml()` | 10300 |  |
| 118 | `escapeForJs()` | 10306 |  |
| 119 | `loadProject()` | 10320 | Yes |
| 120 | `updateChatHeader()` | 10657 |  |
| 121 | `startNewProject()` | 10680 |  |
| 122 | `updateBrandUI()` | 10733 |  |
| 123 | `renderReport()` | 10757 |  |
| 124 | `shareReport()` | 11114 |  |
| 125 | `generateReportText()` | 11119 |  |
| 126 | `exportReportPDF()` | 11178 |  |
| 127 | `showExportMenu()` | 11183 |  |
| 128 | `exportReport()` | 11220 | Yes |
| 129 | `collectReportData()` | 11235 |  |
| 130 | `generateWord()` | 11282 | Yes |
| 131 | `generatePDF()` | 12218 | Yes |
| 132 | `updateDrawerPreview()` | 12739 |  |
| 133 | `calculateReportCompletion()` | 12802 |  |
| 134 | `buildPartialReport()` | 12897 |  |
| 135 | `normalizeMesureLabel()` | 13277 |  |
| 136 | `normalizeReportData()` | 13289 |  |
| 137 | `unifiedMerge()` | 13552 |  |
| 138 | `deduplicateArray()` | 13585 |  |
| 139 | `debouncedSaveExtractedData()` | 13666 |  |
| 140 | `mergeReportData()` | 13704 |  |
| 141 | `renderReportPreview()` | 13730 |  |
| 142 | `drawerSaveState()` | 14472 |  |
| 143 | `drawerUndo()` | 14495 |  |
| 144 | `drawerRedo()` | 14522 |  |
| 145 | `initDrawerKeyboardShortcuts()` | 14549 |  |
| 146 | `renderReportPreviewV12()` | 14574 |  |
| 147 | `initDrawerV12Features()` | 14856 |  |
| 148 | `initDrawerFloatingToolbar()` | 14919 |  |
| 149 | `showDrawerFontToolbar()` | 14958 |  |
| 150 | `hideDrawerFontToolbar()` | 14967 |  |
| 151 | `drawerStartDrag()` | 14973 |  |
| 152 | `drawerOnDrag()` | 14987 |  |
| 153 | `drawerEndDrag()` | 14999 |  |
| 154 | `drawerHandleBlockKey()` | 15019 |  |
| 155 | `drawerCreateBlock()` | 15046 |  |
| 156 | `drawerAddTableRow()` | 15074 |  |
| 157 | `drawerAddTableCol()` | 15094 |  |
| 158 | `drawerRemoveTableRow()` | 15117 |  |
| 159 | `drawerRemoveTableCol()` | 15128 |  |
| 160 | `drawerAutoSave()` | 15146 |  |
| 161 | `drawerExtractDataFromDOM()` | 15194 |  |
| 162 | `updateTechField()` | 15327 |  |
| 163 | `updateObservationClient()` | 15334 |  |
| 164 | `updateResultatStatus()` | 15340 |  |
| 165 | `updateResultatConclusion()` | 15356 |  |
| 166 | `updatePhotoCaption()` | 15364 |  |
| 167 | `triggerPhotoUpload()` | 15373 |  |
| 168 | `showNotification()` | 15380 |  |
| 169 | `completeReportV12()` | 15398 | Yes |
| 170 | `updateReportFooterButtonsV12()` | 15436 |  |
| 171 | `exportReportWordV12()` | 15455 | Yes |
| 172 | `updateReportField()` | 15485 |  |
| 173 | `addReportListItem()` | 15526 |  |
| 174 | `removeReportListItem()` | 15568 |  |
| 175 | `refreshReportPreview()` | 15582 |  |
| 176 | `attachEditableListeners()` | 15602 |  |
| 177 | `updateReportProgress()` | 15639 |  |
| 178 | `showAutoSaveIndicator()` | 15658 |  |
| 179 | `initEditableReport()` | 15664 |  |
| 180 | `parseMarkdown()` | 15671 |  |
| 181 | `restoreMermaid()` | 15694 |  |
| 182 | `parseTable()` | 15816 |  |
| 183 | `processMarkdown()` | 15843 |  |
| 184 | `clearChatBody()` | 15954 |  |
| 185 | `addLoadingMsg()` | 15969 |  |
| 186 | `removeLoadingMsg()` | 15983 |  |
| 187 | `triggerExtraction()` | 16136 | Yes |
| 188 | `handleExtractionResult()` | 16186 |  |
| 189 | `smartMergeExtraction()` | 16220 |  |
| 190 | `deduplicateBy()` | 16258 |  |
| 191 | `sendMsg()` | 16269 | Yes |
| 192 | `saveReport()` | 16591 | Yes |
| 193 | `saveReportData()` | 16622 | Yes |
| 194 | `getVoiceIntensity()` | 16680 |  |
| 195 | `getSimulatedIntensity()` | 16698 |  |
| 196 | `updateWaveform()` | 16715 |  |
| 197 | `startRecording()` | 16736 | Yes |
| 198 | `transcribeWithElevenLabs()` | 16812 | Yes |
| 199 | `updateVoiceTimer()` | 16886 |  |
| 200 | `stopRecording()` | 16898 |  |
| 201 | `voiceInput()` | 16968 |  |
| 202 | `copyTxt()` | 16973 |  |
| 203 | `toggleReportMenu()` | 16979 |  |
| 204 | `copyReportContent()` | 16992 |  |
| 205 | `shareReportCard()` | 17002 |  |
| 206 | `exportReportPDFMenu()` | 17009 |  |
| 207 | `shareReportMenu()` | 17016 |  |
| 208 | `toggleAttach()` | 17029 |  |
| 209 | `closeAllAttach()` | 17035 |  |
| 210 | `attachAction()` | 17043 |  |
| 211 | `handleFileSelect()` | 17054 |  |
| 212 | `addFileToChat()` | 17087 |  |
| 213 | `scrollToBottom()` | 17109 |  |
| 214 | `initScrollDetection()` | 17120 |  |
| 215 | `updateScrollButton()` | 17130 |  |
| 216 | `addPhotoToChat()` | 17142 | Yes |
| 217 | `createPhotoMessageHTML()` | 17180 |  |
| 218 | `deletePhotoMsg()` | 17209 |  |
| 219 | `extractFromPhoto()` | 17222 | Yes |
| 220 | `addOCRQuoteMessage()` | 17459 |  |
| 221 | `updateOCRQuoteWithResults()` | 17492 |  |
| 222 | `formatOCRResponse()` | 17503 |  |
| 223 | `renderOCRMessage()` | 17549 |  |
| 224 | `findSourceImage()` | 17581 |  |
| 225 | `cleanOCRText()` | 17594 |  |
| 226 | `parseOCRForStructuredInfo()` | 17610 |  |
| 227 | `explainErrorCode()` | 17732 | Yes |
| 228 | `analyzeTextWithAI()` | 17744 | Yes |
| 229 | `toggleRawText()` | 17777 |  |
| 230 | `copyOCRText()` | 17792 |  |
| 231 | `scrollToMessage()` | 17819 |  |
| 232 | `addPhotoToReport()` | 17835 |  |
| 233 | `closePhotoNameModal()` | 17879 |  |
| 234 | `openSignatureModal()` | 17892 |  |
| 235 | `closeSignatureModal()` | 17925 |  |
| 236 | `startDrawing()` | 17942 |  |
| 237 | `draw()` | 17948 |  |
| 238 | `stopDrawing()` | 17954 |  |
| 239 | `handleTouchStart()` | 17958 |  |
| 240 | `handleTouchMove()` | 17967 |  |
| 241 | `clearSignature()` | 17976 |  |
| 242 | `saveSignature()` | 17982 |  |
| 243 | `triggerPhotoUpload()` | 18009 |  |
| 244 | `handlePhotoUpload()` | 18015 |  |
| 245 | `handlePhotoDragOver()` | 18034 |  |
| 246 | `handlePhotoDrop()` | 18040 |  |
| 247 | `addPhotoToReportDirect()` | 18060 |  |
| 248 | `removePhoto()` | 18075 |  |
| 249 | `viewPhotoFull()` | 18083 |  |
| 250 | `initPhotoDragDrop()` | 18091 |  |
| 251 | `confirmAddToReport()` | 18144 | Yes |
| 252 | `uploadPhotoToStorage()` | 18212 | Yes |
| 253 | `savePhotoToProject()` | 18250 | Yes |
| 254 | `openImageViewer()` | 18283 |  |
| 255 | `closeImageViewer()` | 18290 |  |
| 256 | `handlePhotoOption()` | 18293 |  |
| 257 | `openHotline()` | 18298 |  |
| 258 | `closeHotline()` | 18303 |  |
| 259 | `resetHotline()` | 18309 |  |
| 260 | `toggleHotline()` | 18323 |  |
| 261 | `connectHotline()` | 18355 | Yes |
| 262 | `showAISpeakingIndicator()` | 18441 |  |
| 263 | `hideAISpeakingIndicator()` | 18464 |  |
| 264 | `handleHotlineDisconnect()` | 18469 |  |
| 265 | `disconnectHotline()` | 18479 | Yes |
| 266 | `toggleChatView()` | 18512 |  |
| 267 | `addHotlineMessage()` | 18527 |  |
| 268 | `startDrag()` | 18555 |  |
| 269 | `drag()` | 18567 |  |
| 270 | `stopDrag()` | 18596 |  |
| 271 | `handleInputFocus()` | 18633 |  |
| 272 | `getFreemiumUsage()` | 18692 |  |
| 273 | `createFreshUsage()` | 18712 |  |
| 274 | `saveFreemiumUsage()` | 18729 |  |
| 275 | `getFreemiumWeekStart()` | 18737 |  |
| 276 | `checkSubscriptionStatus()` | 18748 | Yes |
| 277 | `trackChatUsage()` | 18789 |  |
| 278 | `trackReportGeneration()` | 18839 |  |
| 279 | `canSendChat()` | 18885 |  |
| 280 | `canUseProFeature()` | 18910 |  |
| 281 | `showUpgradeModal()` | 18918 |  |
| 282 | `closeUpgradeModal()` | 18930 |  |
| 283 | `handleUpgradeClick()` | 18935 |  |
| 284 | `showUpgradeBanner()` | 18958 |  |
| 285 | `initFreemium()` | 18978 | Yes |
| 286 | `handleInviteClick()` | 19004 |  |
| 287 | `shareOnWhatsAppWithVariant()` | 19014 |  |
| 288 | `grantInviteBuffer()` | 19036 |  |
| 289 | `showInviteConfirmPopup()` | 19047 |  |
| 290 | `closeInviteConfirmPopup()` | 19052 |  |
| 291 | `showPendingReferralPopup()` | 19057 |  |
| 292 | `closePendingPopup()` | 19075 |  |
| 293 | `checkSprintChallenge()` | 19080 |  |
| 294 | `injectSprintBanner()` | 19102 |  |
| 295 | `showReentryPrompt()` | 19130 |  |
| 296 | `checkWeekFreeStatus()` | 19167 | Yes |
| 297 | `startPaymentPolling()` | 19202 |  |
| 298 | `getReferralLink()` | 19319 |  |
| 299 | `getWhatsAppMessage()` | 19325 |  |
| 300 | `shareOnWhatsApp()` | 19332 |  |
| 301 | `shareOnWhatsAppFromModal()` | 19341 |  |
| 302 | `copyReferralCode()` | 19347 |  |
| 303 | `copyReferralLink()` | 19365 |  |
| 304 | `trackReferralShare()` | 19386 | Yes |
| 305 | `showReferralModal()` | 19396 |  |
| 306 | `closeReferralModal()` | 19400 |  |
| 307 | `loadReferralData()` | 19405 | Yes |
| 308 | `updateReferralUI()` | 19436 |  |
| 309 | `ensureReferralCode()` | 19456 | Yes |
| 310 | `initReferral()` | 19502 | Yes |
| 311 | `trackAction()` | 19569 | Yes |
| 312 | `getWeekStart()` | 19608 |  |
| 313 | `getWeeklyStats()` | 19619 | Yes |
| 314 | `formatTimeSaved()` | 19672 |  |
| 315 | `getUserFirstName()` | 19686 |  |
| 316 | `getMotivationalMessage()` | 19693 |  |
| 317 | `formatMotivationalMessage()` | 19721 |  |
| 318 | `calculateRingPercentage()` | 19729 |  |
| 319 | `updateStatsRing()` | 19735 |  |
| 320 | `getWeekLabel()` | 19750 |  |
| 321 | `refreshWeeklyStats()` | 19763 | Yes |
| 322 | `saveLastKnownStats()` | 19810 |  |
| 323 | `createConfetti()` | 19816 |  |
| 324 | `showPlusOne()` | 19855 |  |
| 325 | `animateStatsCountUp()` | 19867 |  |
| 326 | `triggerCelebration()` | 19924 |  |
| 327 | `shouldCelebrate()` | 19953 |  |
| 328 | `initGamification()` | 19961 | Yes |
| 329 | `onReturnToHomepage()` | 20000 |  |
| 330 | `initTechCalendar()` | 20015 | Yes |
| 331 | `saveCalendarEventsToStorage()` | 20069 | Yes |
| 332 | `saveEventToSupabase()` | 20074 | Yes |
| 333 | `deleteEventFromSupabase()` | 20127 | Yes |
| 334 | `createProjectForEvent()` | 20145 | Yes |
| 335 | `formatDateKey()` | 20188 |  |
| 336 | `getEventsForDate()` | 20192 |  |
| 337 | `setTechCalView()` | 20197 |  |
| 338 | `navTechCal()` | 20204 |  |
| 339 | `renderTechCalendar()` | 20215 |  |
| 340 | `buildTechDayView()` | 20239 |  |
| 341 | `buildTechWeekView()` | 20265 |  |
| 342 | `buildTechMonthView()` | 20304 |  |
| 343 | `goToToday()` | 20359 |  |
| 344 | `goToTechDayViewDate()` | 20367 |  |
| 345 | `openCalendarEvent()` | 20375 |  |
| 346 | `createCalendarEvent()` | 20412 |  |
| 347 | `createCalendarEventForDate()` | 20416 |  |
| 348 | `openEventDrawer()` | 20423 |  |
| 349 | `openEventDrawerForEdit()` | 20457 |  |
| 350 | `closeEventDrawer()` | 20501 |  |
| 351 | `selectEventType()` | 20507 |  |
| 352 | `toggleEventAllDay()` | 20513 |  |
| 353 | `toggleMoreOptions()` | 20519 |  |
| 354 | `saveCalendarEvent()` | 20526 | Yes |
| 355 | `showEventContextMenu()` | 20595 |  |
| 356 | `hideEventContextMenu()` | 20624 |  |
| 357 | `startEventLongPress()` | 20631 |  |
| 358 | `cancelEventLongPress()` | 20641 |  |
| 359 | `handleEventClick()` | 20649 |  |
| 360 | `modifyContextEvent()` | 20659 |  |
| 361 | `deleteContextEvent()` | 20666 | Yes |
| 362 | `openConnect()` | 20696 |  |
| 363 | `closeConnect()` | 20701 |  |
| 364 | `activateConnect()` | 20708 |  |
| 365 | `openConnectDrawer()` | 20718 |  |
| 366 | `closeConnectDrawer()` | 20774 |  |
| 367 | `acceptConnectJob()` | 20778 |  |
| 368 | `showThoughtProcess()` | 21406 |  |
| 369 | `collapseThoughtProcess()` | 21407 |  |
| 370 | `hideThoughtProcess()` | 21408 |  |
| 371 | `renderPersistedThoughtProcess()` | 21411 |  |

---

## index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `getVisibleHeight()` | 5608 |  |
| 2 | `setViewportHeight()` | 5615 |  |
| 3 | `handleKeyboardChange()` | 5641 |  |
| 4 | `applyTheme()` | 5805 |  |
| 5 | `toggleTheme()` | 5818 |  |
| 6 | `setLanguage()` | 5824 |  |
| 7 | `applyTranslations()` | 5837 |  |
| 8 | `initSettings()` | 5857 |  |
| 9 | `parseHashParams()` | 5887 |  |
| 10 | `waitForSupabase()` | 5936 | Yes |
| 11 | `safeQuery()` | 5948 | Yes |
| 12 | `toast()` | 5960 |  |
| 13 | `getApiKey()` | 5987 | Yes |
| 14 | `prefetchApiKeys()` | 6009 | Yes |
| 15 | `loadUserProfile()` | 6014 | Yes |
| 16 | `loadUserAndShowApp()` | 6035 | Yes |
| 17 | `showPasswordResetScreen()` | 6126 |  |
| 18 | `initAuth()` | 6135 | Yes |
| 19 | `setLoginStatus()` | 6316 |  |
| 20 | `clearLoginStatus()` | 6329 |  |
| 21 | `resetPassword()` | 6337 | Yes |
| 22 | `setNewPassword()` | 6362 | Yes |
| 23 | `goToLoginFromPasswordReset()` | 6442 |  |
| 24 | `cancelPasswordReset()` | 6463 |  |
| 25 | `nextLoginStep()` | 6482 | Yes |
| 26 | `updateLoginUI()` | 6659 |  |
| 27 | `prevLoginStep()` | 6665 |  |
| 28 | `completeLogin()` | 6677 | Yes |
| 29 | `showEmailConfirmScreen()` | 6744 |  |
| 30 | `showPendingScreen()` | 6753 |  |
| 31 | `resendConfirmation()` | 6762 | Yes |
| 32 | `backToLogin()` | 6779 |  |
| 33 | `logoutFromPending()` | 6793 | Yes |
| 34 | `doLogin()` | 6820 | Yes |
| 35 | `logout()` | 6831 | Yes |
| 36 | `openProfile()` | 6864 |  |
| 37 | `closeProfile()` | 6868 |  |
| 38 | `saveProfile()` | 6872 | Yes |
| 39 | `toggleBrandSelect()` | 7014 |  |
| 40 | `selectBrandInline()` | 7019 |  |
| 41 | `completeBrandStep()` | 7049 |  |
| 42 | `handleStep3Click()` | 7068 |  |
| 43 | `handleStep4Click()` | 7074 |  |
| 44 | `completeStep()` | 7080 |  |
| 45 | `updateOnboardingProgress()` | 7090 |  |
| 46 | `showCongrats()` | 7101 | Yes |
| 47 | `closeCongrats()` | 7122 |  |
| 48 | `goToHome()` | 7129 |  |
| 49 | `showPage()` | 7146 |  |
| 50 | `toggleBrandDropdown()` | 7156 |  |
| 51 | `closeBrandDropdown()` | 7163 |  |
| 52 | `setBrand()` | 7168 |  |
| 53 | `updateBrandContextInHistory()` | 7185 |  |
| 54 | `toggleChatBrandDropdown()` | 7221 |  |
| 55 | `closeChatBrandDropdowns()` | 7240 |  |
| 56 | `closeChatBrandDropdownsOnClick()` | 7247 |  |
| 57 | `updateChatBrandDropdownSelection()` | 7254 |  |
| 58 | `changeChatBrand()` | 7264 | Yes |
| 59 | `openChat()` | 7348 |  |
| 60 | `closeChat()` | 7454 |  |
| 61 | `updateModeToggle()` | 7504 |  |
| 62 | `switchMode()` | 7517 | Yes |
| 63 | `toggleSplit()` | 7631 |  |
| 64 | `openReport()` | 7677 |  |
| 65 | `closeReport()` | 7685 |  |
| 66 | `addMsg()` | 7690 |  |
| 67 | `handleChatInput()` | 7729 |  |
| 68 | `handleKeydown()` | 7767 |  |
| 69 | `resetTextarea()` | 7781 |  |
| 70 | `handleSend()` | 7791 |  |
| 71 | `handleAction()` | 7799 |  |
| 72 | `updateSessionIds()` | 7826 |  |
| 73 | `getCurrentUserId()` | 7856 | Yes |
| 74 | `ensureProject()` | 7892 | Yes |
| 75 | `saveMessage()` | 7948 | Yes |
| 76 | `autoNameProject()` | 7978 | Yes |
| 77 | `loadProjectsListAndCheckOnboarding()` | 8015 | Yes |
| 78 | `loadProjectsList()` | 8042 | Yes |
| 79 | `generateProjectCardHtml()` | 8089 |  |
| 80 | `renderProjectsList()` | 8139 |  |
| 81 | `renderRecentProjects()` | 8157 |  |
| 82 | `showProjectContextMenu()` | 8174 |  |
| 83 | `startLongPress()` | 8211 |  |
| 84 | `cancelLongPress()` | 8222 |  |
| 85 | `closeContextMenu()` | 8238 |  |
| 86 | `renameProject()` | 8248 |  |
| 87 | `closeRenameModal()` | 8257 |  |
| 88 | `saveProjectRename()` | 8261 | Yes |
| 89 | `deleteProject()` | 8293 | Yes |
| 90 | `formatTimeAgo()` | 8332 |  |
| 91 | `escapeHtml()` | 8348 |  |
| 92 | `escapeForJs()` | 8354 |  |
| 93 | `loadProject()` | 8368 | Yes |
| 94 | `updateChatHeader()` | 8648 |  |
| 95 | `startNewProject()` | 8671 |  |
| 96 | `updateBrandUI()` | 8716 |  |
| 97 | `renderReport()` | 8740 |  |
| 98 | `shareReport()` | 9096 |  |
| 99 | `generateReportText()` | 9101 |  |
| 100 | `exportReportPDF()` | 9156 |  |
| 101 | `generatePDF()` | 9161 | Yes |
| 102 | `updateDrawerPreview()` | 9682 |  |
| 103 | `calculateReportCompletion()` | 9725 |  |
| 104 | `buildPartialReport()` | 9820 |  |
| 105 | `mergeReportData()` | 10068 |  |
| 106 | `renderReportPreview()` | 10105 |  |
| 107 | `updateReportField()` | 10836 |  |
| 108 | `addReportListItem()` | 10866 |  |
| 109 | `removeReportListItem()` | 10908 |  |
| 110 | `refreshReportPreview()` | 10922 |  |
| 111 | `attachEditableListeners()` | 10938 |  |
| 112 | `updateReportProgress()` | 10975 |  |
| 113 | `showAutoSaveIndicator()` | 10994 |  |
| 114 | `initEditableReport()` | 11000 |  |
| 115 | `parseMarkdown()` | 11007 |  |
| 116 | `parseTable()` | 11118 |  |
| 117 | `processMarkdown()` | 11145 |  |
| 118 | `addLoadingMsg()` | 11255 |  |
| 119 | `removeLoadingMsg()` | 11269 |  |
| 120 | `sendMsg()` | 11281 | Yes |
| 121 | `saveReport()` | 11557 | Yes |
| 122 | `getVoiceIntensity()` | 11588 |  |
| 123 | `getSimulatedIntensity()` | 11606 |  |
| 124 | `updateWaveform()` | 11623 |  |
| 125 | `startRecording()` | 11644 | Yes |
| 126 | `transcribeWithElevenLabs()` | 11720 | Yes |
| 127 | `updateVoiceTimer()` | 11794 |  |
| 128 | `stopRecording()` | 11806 |  |
| 129 | `voiceInput()` | 11876 |  |
| 130 | `copyTxt()` | 11881 |  |
| 131 | `toggleReportMenu()` | 11887 |  |
| 132 | `copyReportContent()` | 11900 |  |
| 133 | `shareReportCard()` | 11910 |  |
| 134 | `exportReportPDFMenu()` | 11917 |  |
| 135 | `shareReportMenu()` | 11924 |  |
| 136 | `toggleAttach()` | 11937 |  |
| 137 | `closeAllAttach()` | 11943 |  |
| 138 | `attachAction()` | 11951 |  |
| 139 | `handleFileSelect()` | 11962 |  |
| 140 | `addFileToChat()` | 11995 |  |
| 141 | `scrollToBottom()` | 12017 |  |
| 142 | `initScrollDetection()` | 12028 |  |
| 143 | `updateScrollButton()` | 12038 |  |
| 144 | `addPhotoToChat()` | 12050 | Yes |
| 145 | `createPhotoMessageHTML()` | 12088 |  |
| 146 | `deletePhotoMsg()` | 12117 |  |
| 147 | `extractFromPhoto()` | 12130 | Yes |
| 148 | `addOCRQuoteMessage()` | 12367 |  |
| 149 | `updateOCRQuoteWithResults()` | 12400 |  |
| 150 | `formatOCRResponse()` | 12411 |  |
| 151 | `renderOCRMessage()` | 12457 |  |
| 152 | `findSourceImage()` | 12489 |  |
| 153 | `cleanOCRText()` | 12502 |  |
| 154 | `parseOCRForStructuredInfo()` | 12518 |  |
| 155 | `explainErrorCode()` | 12640 | Yes |
| 156 | `analyzeTextWithAI()` | 12652 | Yes |
| 157 | `toggleRawText()` | 12685 |  |
| 158 | `copyOCRText()` | 12700 |  |
| 159 | `scrollToMessage()` | 12727 |  |
| 160 | `addPhotoToReport()` | 12743 |  |
| 161 | `closePhotoNameModal()` | 12787 |  |
| 162 | `openSignatureModal()` | 12800 |  |
| 163 | `closeSignatureModal()` | 12833 |  |
| 164 | `startDrawing()` | 12850 |  |
| 165 | `draw()` | 12856 |  |
| 166 | `stopDrawing()` | 12862 |  |
| 167 | `handleTouchStart()` | 12866 |  |
| 168 | `handleTouchMove()` | 12875 |  |
| 169 | `clearSignature()` | 12884 |  |
| 170 | `saveSignature()` | 12890 |  |
| 171 | `triggerPhotoUpload()` | 12916 |  |
| 172 | `handlePhotoUpload()` | 12920 |  |
| 173 | `handlePhotoDragOver()` | 12939 |  |
| 174 | `handlePhotoDrop()` | 12945 |  |
| 175 | `addPhotoToReportDirect()` | 12965 |  |
| 176 | `removePhoto()` | 12979 |  |
| 177 | `viewPhotoFull()` | 12986 |  |
| 178 | `initPhotoDragDrop()` | 12994 |  |
| 179 | `confirmAddToReport()` | 13043 | Yes |
| 180 | `uploadPhotoToStorage()` | 13111 | Yes |
| 181 | `savePhotoToProject()` | 13149 | Yes |
| 182 | `openImageViewer()` | 13182 |  |
| 183 | `closeImageViewer()` | 13189 |  |
| 184 | `handlePhotoOption()` | 13192 |  |
| 185 | `openHotline()` | 13197 |  |
| 186 | `closeHotline()` | 13202 |  |
| 187 | `resetHotline()` | 13208 |  |
| 188 | `toggleHotline()` | 13222 |  |
| 189 | `connectHotline()` | 13254 | Yes |
| 190 | `showAISpeakingIndicator()` | 13340 |  |
| 191 | `hideAISpeakingIndicator()` | 13363 |  |
| 192 | `handleHotlineDisconnect()` | 13368 |  |
| 193 | `disconnectHotline()` | 13378 | Yes |
| 194 | `toggleChatView()` | 13411 |  |
| 195 | `addHotlineMessage()` | 13426 |  |
| 196 | `startDrag()` | 13454 |  |
| 197 | `drag()` | 13466 |  |
| 198 | `stopDrag()` | 13495 |  |
| 199 | `handleInputFocus()` | 13532 |  |
| 200 | `trackAction()` | 13597 | Yes |
| 201 | `getWeekStart()` | 13636 |  |
| 202 | `getWeeklyStats()` | 13647 | Yes |
| 203 | `formatTimeSaved()` | 13700 |  |
| 204 | `getUserFirstName()` | 13714 |  |
| 205 | `getMotivationalMessage()` | 13721 |  |
| 206 | `formatMotivationalMessage()` | 13749 |  |
| 207 | `calculateRingPercentage()` | 13757 |  |
| 208 | `updateStatsRing()` | 13763 |  |
| 209 | `getWeekLabel()` | 13778 |  |
| 210 | `refreshWeeklyStats()` | 13791 | Yes |
| 211 | `saveLastKnownStats()` | 13838 |  |
| 212 | `createConfetti()` | 13844 |  |
| 213 | `showPlusOne()` | 13883 |  |
| 214 | `animateStatsCountUp()` | 13895 |  |
| 215 | `triggerCelebration()` | 13952 |  |
| 216 | `shouldCelebrate()` | 13981 |  |
| 217 | `initGamification()` | 13989 | Yes |
| 218 | `onReturnToHomepage()` | 14028 |  |
| 219 | `initTechCalendar()` | 14043 | Yes |
| 220 | `saveCalendarEventsToStorage()` | 14097 | Yes |
| 221 | `saveEventToSupabase()` | 14102 | Yes |
| 222 | `deleteEventFromSupabase()` | 14155 | Yes |
| 223 | `createProjectForEvent()` | 14173 | Yes |
| 224 | `formatDateKey()` | 14216 |  |
| 225 | `getEventsForDate()` | 14220 |  |
| 226 | `setTechCalView()` | 14225 |  |
| 227 | `navTechCal()` | 14232 |  |
| 228 | `renderTechCalendar()` | 14243 |  |
| 229 | `buildTechDayView()` | 14267 |  |
| 230 | `buildTechWeekView()` | 14293 |  |
| 231 | `buildTechMonthView()` | 14332 |  |
| 232 | `goToToday()` | 14387 |  |
| 233 | `goToTechDayViewDate()` | 14395 |  |
| 234 | `openCalendarEvent()` | 14403 |  |
| 235 | `createCalendarEvent()` | 14440 |  |
| 236 | `createCalendarEventForDate()` | 14444 |  |
| 237 | `openEventDrawer()` | 14451 |  |
| 238 | `openEventDrawerForEdit()` | 14485 |  |
| 239 | `closeEventDrawer()` | 14529 |  |
| 240 | `selectEventType()` | 14535 |  |
| 241 | `toggleEventAllDay()` | 14541 |  |
| 242 | `toggleMoreOptions()` | 14547 |  |
| 243 | `saveCalendarEvent()` | 14554 | Yes |
| 244 | `showEventContextMenu()` | 14623 |  |
| 245 | `hideEventContextMenu()` | 14652 |  |
| 246 | `startEventLongPress()` | 14659 |  |
| 247 | `cancelEventLongPress()` | 14669 |  |
| 248 | `handleEventClick()` | 14677 |  |
| 249 | `modifyContextEvent()` | 14687 |  |
| 250 | `deleteContextEvent()` | 14694 | Yes |
| 251 | `openConnect()` | 14724 |  |
| 252 | `closeConnect()` | 14729 |  |
| 253 | `activateConnect()` | 14736 |  |
| 254 | `openConnectDrawer()` | 14746 |  |
| 255 | `closeConnectDrawer()` | 14802 |  |
| 256 | `acceptConnectJob()` | 14806 |  |

---

## docs/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `getVisibleHeight()` | 5733 |  |
| 2 | `setViewportHeight()` | 5740 |  |
| 3 | `handleKeyboardChange()` | 5766 |  |
| 4 | `applyTheme()` | 5930 |  |
| 5 | `toggleTheme()` | 5943 |  |
| 6 | `setLanguage()` | 5949 |  |
| 7 | `applyTranslations()` | 5962 |  |
| 8 | `initSettings()` | 5982 |  |
| 9 | `getErrorExample()` | 6022 |  |
| 10 | `setupChatInputTracking()` | 6028 |  |
| 11 | `onBrandChangeUpdateExample()` | 6051 |  |
| 12 | `initMermaid()` | 6082 |  |
| 13 | `renderMermaidDiagrams()` | 6122 | Yes |
| 14 | `waitForSupabase()` | 6212 | Yes |
| 15 | `toast()` | 6224 |  |
| 16 | `getApiKey()` | 6247 | Yes |
| 17 | `prefetchApiKeys()` | 6269 | Yes |
| 18 | `init()` | 6431 | Yes |
| 19 | `showLoginScreen()` | 6481 |  |
| 20 | `setLoginStatus()` | 6493 |  |
| 21 | `clearLoginStatus()` | 6504 |  |
| 22 | `updateLoginUI()` | 6512 |  |
| 23 | `prevLoginStep()` | 6518 |  |
| 24 | `nextLoginStep()` | 6526 | Yes |
| 25 | `resetPassword()` | 6671 | Yes |
| 26 | `setLoginStatusWithResend()` | 6692 |  |
| 27 | `resendConfirmation()` | 6705 | Yes |
| 28 | `loadUserDashboard()` | 6721 | Yes |
| 29 | `showMainApp()` | 6787 |  |
| 30 | `logout()` | 6801 | Yes |
| 31 | `updateLiveStatus()` | 6821 | Yes |
| 32 | `resetIdleTimer()` | 6839 |  |
| 33 | `initLiveStatusTracking()` | 6856 |  |
| 34 | `stopLiveStatusTracking()` | 6898 |  |
| 35 | `openProfile()` | 6907 |  |
| 36 | `closeProfile()` | 6911 |  |
| 37 | `saveProfile()` | 6915 | Yes |
| 38 | `toggleBrandSelect()` | 7047 |  |
| 39 | `selectBrandInline()` | 7052 |  |
| 40 | `completeBrandStep()` | 7085 |  |
| 41 | `handleStep1Click()` | 7104 |  |
| 42 | `handleStep3Click()` | 7126 |  |
| 43 | `handleStep4Click()` | 7159 |  |
| 44 | `showAssistantOnboardingFlow()` | 7175 |  |
| 45 | `handleOnboardingAddPhotos()` | 7263 |  |
| 46 | `handleOnboardingSkipPhotos()` | 7286 |  |
| 47 | `showOnboardingPhotosPreview()` | 7307 |  |
| 48 | `generateOnboardingReportPreview()` | 7331 |  |
| 49 | `viewOnboardingFullReport()` | 7406 |  |
| 50 | `completeStep()` | 7412 |  |
| 51 | `updateOnboardingProgress()` | 7422 |  |
| 52 | `showCongrats()` | 7433 | Yes |
| 53 | `closeCongrats()` | 7454 |  |
| 54 | `goToHome()` | 7461 |  |
| 55 | `showPage()` | 7474 |  |
| 56 | `toggleBrandDropdown()` | 7484 |  |
| 57 | `closeBrandDropdown()` | 7491 |  |
| 58 | `setBrand()` | 7498 |  |
| 59 | `updateBrandContextInHistory()` | 7515 |  |
| 60 | `toggleChatBrandDropdown()` | 7551 |  |
| 61 | `closeChatBrandDropdowns()` | 7570 |  |
| 62 | `closeChatBrandDropdownsOnClick()` | 7577 |  |
| 63 | `updateChatBrandDropdownSelection()` | 7584 |  |
| 64 | `changeChatBrand()` | 7594 | Yes |
| 65 | `openChat()` | 7683 |  |
| 66 | `closeChat()` | 7789 |  |
| 67 | `updateModeToggle()` | 7839 |  |
| 68 | `switchMode()` | 7852 | Yes |
| 69 | `toggleSplit()` | 7965 |  |
| 70 | `openReport()` | 8011 |  |
| 71 | `closeReport()` | 8019 |  |
| 72 | `addMsg()` | 8024 |  |
| 73 | `handleChatInput()` | 8073 |  |
| 74 | `handleKeydown()` | 8111 |  |
| 75 | `resetTextarea()` | 8125 |  |
| 76 | `handleSend()` | 8135 |  |
| 77 | `handleAction()` | 8143 |  |
| 78 | `updateSessionIds()` | 8170 |  |
| 79 | `getCurrentUserId()` | 8200 | Yes |
| 80 | `ensureProject()` | 8236 | Yes |
| 81 | `saveMessage()` | 8292 | Yes |
| 82 | `autoNameProject()` | 8322 | Yes |
| 83 | `loadProjectsListAndCheckOnboarding()` | 8359 | Yes |
| 84 | `loadProjectsList()` | 8386 | Yes |
| 85 | `generateProjectCardHtml()` | 8433 |  |
| 86 | `renderProjectsList()` | 8483 |  |
| 87 | `renderRecentProjects()` | 8501 |  |
| 88 | `showProjectContextMenu()` | 8518 |  |
| 89 | `startLongPress()` | 8555 |  |
| 90 | `cancelLongPress()` | 8566 |  |
| 91 | `closeContextMenu()` | 8582 |  |
| 92 | `renameProject()` | 8592 |  |
| 93 | `closeRenameModal()` | 8601 |  |
| 94 | `saveProjectRename()` | 8605 | Yes |
| 95 | `deleteProject()` | 8637 | Yes |
| 96 | `formatTimeAgo()` | 8676 |  |
| 97 | `escapeHtml()` | 8692 |  |
| 98 | `escapeForJs()` | 8698 |  |
| 99 | `loadProject()` | 8712 | Yes |
| 100 | `updateChatHeader()` | 8999 |  |
| 101 | `startNewProject()` | 9022 |  |
| 102 | `updateBrandUI()` | 9068 |  |
| 103 | `renderReport()` | 9092 |  |
| 104 | `shareReport()` | 9448 |  |
| 105 | `generateReportText()` | 9453 |  |
| 106 | `exportReportPDF()` | 9508 |  |
| 107 | `generatePDF()` | 9513 | Yes |
| 108 | `updateDrawerPreview()` | 10034 |  |
| 109 | `calculateReportCompletion()` | 10077 |  |
| 110 | `buildPartialReport()` | 10172 |  |
| 111 | `mergeReportData()` | 10420 |  |
| 112 | `renderReportPreview()` | 10457 |  |
| 113 | `updateReportField()` | 11188 |  |
| 114 | `addReportListItem()` | 11218 |  |
| 115 | `removeReportListItem()` | 11260 |  |
| 116 | `refreshReportPreview()` | 11274 |  |
| 117 | `attachEditableListeners()` | 11290 |  |
| 118 | `updateReportProgress()` | 11327 |  |
| 119 | `showAutoSaveIndicator()` | 11346 |  |
| 120 | `initEditableReport()` | 11352 |  |
| 121 | `parseMarkdown()` | 11359 |  |
| 122 | `restoreMermaid()` | 11375 |  |
| 123 | `parseTable()` | 11496 |  |
| 124 | `processMarkdown()` | 11523 |  |
| 125 | `clearChatBody()` | 11634 |  |
| 126 | `addLoadingMsg()` | 11648 |  |
| 127 | `removeLoadingMsg()` | 11662 |  |
| 128 | `sendMsg()` | 11674 | Yes |
| 129 | `saveReport()` | 11953 | Yes |
| 130 | `getVoiceIntensity()` | 11984 |  |
| 131 | `getSimulatedIntensity()` | 12002 |  |
| 132 | `updateWaveform()` | 12019 |  |
| 133 | `startRecording()` | 12040 | Yes |
| 134 | `transcribeWithElevenLabs()` | 12116 | Yes |
| 135 | `updateVoiceTimer()` | 12190 |  |
| 136 | `stopRecording()` | 12202 |  |
| 137 | `voiceInput()` | 12272 |  |
| 138 | `copyTxt()` | 12277 |  |
| 139 | `toggleReportMenu()` | 12283 |  |
| 140 | `copyReportContent()` | 12296 |  |
| 141 | `shareReportCard()` | 12306 |  |
| 142 | `exportReportPDFMenu()` | 12313 |  |
| 143 | `shareReportMenu()` | 12320 |  |
| 144 | `toggleAttach()` | 12333 |  |
| 145 | `closeAllAttach()` | 12339 |  |
| 146 | `attachAction()` | 12347 |  |
| 147 | `handleFileSelect()` | 12358 |  |
| 148 | `addFileToChat()` | 12391 |  |
| 149 | `scrollToBottom()` | 12413 |  |
| 150 | `initScrollDetection()` | 12424 |  |
| 151 | `updateScrollButton()` | 12434 |  |
| 152 | `addPhotoToChat()` | 12446 | Yes |
| 153 | `createPhotoMessageHTML()` | 12484 |  |
| 154 | `deletePhotoMsg()` | 12513 |  |
| 155 | `extractFromPhoto()` | 12526 | Yes |
| 156 | `addOCRQuoteMessage()` | 12763 |  |
| 157 | `updateOCRQuoteWithResults()` | 12796 |  |
| 158 | `formatOCRResponse()` | 12807 |  |
| 159 | `renderOCRMessage()` | 12853 |  |
| 160 | `findSourceImage()` | 12885 |  |
| 161 | `cleanOCRText()` | 12898 |  |
| 162 | `parseOCRForStructuredInfo()` | 12914 |  |
| 163 | `explainErrorCode()` | 13036 | Yes |
| 164 | `analyzeTextWithAI()` | 13048 | Yes |
| 165 | `toggleRawText()` | 13081 |  |
| 166 | `copyOCRText()` | 13096 |  |
| 167 | `scrollToMessage()` | 13123 |  |
| 168 | `addPhotoToReport()` | 13139 |  |
| 169 | `closePhotoNameModal()` | 13183 |  |
| 170 | `openSignatureModal()` | 13196 |  |
| 171 | `closeSignatureModal()` | 13229 |  |
| 172 | `startDrawing()` | 13246 |  |
| 173 | `draw()` | 13252 |  |
| 174 | `stopDrawing()` | 13258 |  |
| 175 | `handleTouchStart()` | 13262 |  |
| 176 | `handleTouchMove()` | 13271 |  |
| 177 | `clearSignature()` | 13280 |  |
| 178 | `saveSignature()` | 13286 |  |
| 179 | `triggerPhotoUpload()` | 13312 |  |
| 180 | `handlePhotoUpload()` | 13316 |  |
| 181 | `handlePhotoDragOver()` | 13335 |  |
| 182 | `handlePhotoDrop()` | 13341 |  |
| 183 | `addPhotoToReportDirect()` | 13361 |  |
| 184 | `removePhoto()` | 13375 |  |
| 185 | `viewPhotoFull()` | 13382 |  |
| 186 | `initPhotoDragDrop()` | 13390 |  |
| 187 | `confirmAddToReport()` | 13439 | Yes |
| 188 | `uploadPhotoToStorage()` | 13507 | Yes |
| 189 | `savePhotoToProject()` | 13545 | Yes |
| 190 | `openImageViewer()` | 13578 |  |
| 191 | `closeImageViewer()` | 13585 |  |
| 192 | `handlePhotoOption()` | 13588 |  |
| 193 | `openHotline()` | 13593 |  |
| 194 | `closeHotline()` | 13598 |  |
| 195 | `resetHotline()` | 13604 |  |
| 196 | `toggleHotline()` | 13618 |  |
| 197 | `connectHotline()` | 13650 | Yes |
| 198 | `showAISpeakingIndicator()` | 13736 |  |
| 199 | `hideAISpeakingIndicator()` | 13759 |  |
| 200 | `handleHotlineDisconnect()` | 13764 |  |
| 201 | `disconnectHotline()` | 13774 | Yes |
| 202 | `toggleChatView()` | 13807 |  |
| 203 | `addHotlineMessage()` | 13822 |  |
| 204 | `startDrag()` | 13850 |  |
| 205 | `drag()` | 13862 |  |
| 206 | `stopDrag()` | 13891 |  |
| 207 | `handleInputFocus()` | 13928 |  |
| 208 | `trackAction()` | 13993 | Yes |
| 209 | `getWeekStart()` | 14032 |  |
| 210 | `getWeeklyStats()` | 14043 | Yes |
| 211 | `formatTimeSaved()` | 14096 |  |
| 212 | `getUserFirstName()` | 14110 |  |
| 213 | `getMotivationalMessage()` | 14117 |  |
| 214 | `formatMotivationalMessage()` | 14145 |  |
| 215 | `calculateRingPercentage()` | 14153 |  |
| 216 | `updateStatsRing()` | 14159 |  |
| 217 | `getWeekLabel()` | 14174 |  |
| 218 | `refreshWeeklyStats()` | 14187 | Yes |
| 219 | `saveLastKnownStats()` | 14234 |  |
| 220 | `createConfetti()` | 14240 |  |
| 221 | `showPlusOne()` | 14279 |  |
| 222 | `animateStatsCountUp()` | 14291 |  |
| 223 | `triggerCelebration()` | 14348 |  |
| 224 | `shouldCelebrate()` | 14377 |  |
| 225 | `initGamification()` | 14385 | Yes |
| 226 | `onReturnToHomepage()` | 14424 |  |
| 227 | `initTechCalendar()` | 14439 | Yes |
| 228 | `saveCalendarEventsToStorage()` | 14493 | Yes |
| 229 | `saveEventToSupabase()` | 14498 | Yes |
| 230 | `deleteEventFromSupabase()` | 14551 | Yes |
| 231 | `createProjectForEvent()` | 14569 | Yes |
| 232 | `formatDateKey()` | 14612 |  |
| 233 | `getEventsForDate()` | 14616 |  |
| 234 | `setTechCalView()` | 14621 |  |
| 235 | `navTechCal()` | 14628 |  |
| 236 | `renderTechCalendar()` | 14639 |  |
| 237 | `buildTechDayView()` | 14663 |  |
| 238 | `buildTechWeekView()` | 14689 |  |
| 239 | `buildTechMonthView()` | 14728 |  |
| 240 | `goToToday()` | 14783 |  |
| 241 | `goToTechDayViewDate()` | 14791 |  |
| 242 | `openCalendarEvent()` | 14799 |  |
| 243 | `createCalendarEvent()` | 14836 |  |
| 244 | `createCalendarEventForDate()` | 14840 |  |
| 245 | `openEventDrawer()` | 14847 |  |
| 246 | `openEventDrawerForEdit()` | 14881 |  |
| 247 | `closeEventDrawer()` | 14925 |  |
| 248 | `selectEventType()` | 14931 |  |
| 249 | `toggleEventAllDay()` | 14937 |  |
| 250 | `toggleMoreOptions()` | 14943 |  |
| 251 | `saveCalendarEvent()` | 14950 | Yes |
| 252 | `showEventContextMenu()` | 15019 |  |
| 253 | `hideEventContextMenu()` | 15048 |  |
| 254 | `startEventLongPress()` | 15055 |  |
| 255 | `cancelEventLongPress()` | 15065 |  |
| 256 | `handleEventClick()` | 15073 |  |
| 257 | `modifyContextEvent()` | 15083 |  |
| 258 | `deleteContextEvent()` | 15090 | Yes |
| 259 | `openConnect()` | 15120 |  |
| 260 | `closeConnect()` | 15125 |  |
| 261 | `activateConnect()` | 15132 |  |
| 262 | `openConnectDrawer()` | 15142 |  |
| 263 | `closeConnectDrawer()` | 15198 |  |
| 264 | `acceptConnectJob()` | 15202 |  |
| 265 | `toggleTP()` | 15563 |  |
| 266 | `showThoughtProcess()` | 15564 |  |
| 267 | `collapseThoughtProcess()` | 15565 |  |
| 268 | `hideThoughtProcess()` | 15566 |  |

---

## operations/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `toast()` | 2247 |  |
| 2 | `initLanguage()` | 2364 |  |
| 3 | `t()` | 2376 |  |
| 4 | `applyLanguage()` | 2387 |  |
| 5 | `parseHashParams()` | 2431 |  |
| 6 | `initSupabase()` | 2457 |  |
| 7 | `setLoginStatus()` | 2480 |  |
| 8 | `clearLoginStatus()` | 2491 |  |
| 9 | `resetPassword()` | 2499 | Yes |
| 10 | `nextLoginStep()` | 2518 | Yes |
| 11 | `updateLoginUI()` | 2653 |  |
| 12 | `prevLoginStep()` | 2659 |  |
| 13 | `loadUserProfile()` | 2667 | Yes |
| 14 | `showEmailConfirmScreen()` | 2687 |  |
| 15 | `showPendingScreen()` | 2697 |  |
| 16 | `showAccessDeniedScreen()` | 2707 |  |
| 17 | `showPasswordResetScreen()` | 2752 |  |
| 18 | `redirectToTechnicianApp()` | 2761 |  |
| 19 | `checkApprovalStatus()` | 2765 | Yes |
| 20 | `resendConfirmation()` | 2805 | Yes |
| 21 | `backToLogin()` | 2819 |  |
| 22 | `logoutFromPending()` | 2834 | Yes |
| 23 | `setNewPassword()` | 2863 | Yes |
| 24 | `cancelPasswordReset()` | 2930 |  |
| 25 | `showMainApp()` | 2943 |  |
| 26 | `logout()` | 2958 | Yes |
| 27 | `initAuth()` | 2992 | Yes |
| 28 | `handleAuthenticatedUser()` | 3060 | Yes |
| 29 | `checkManagerAuth()` | 3090 | Yes |
| 30 | `managerLogout()` | 3126 | Yes |
| 31 | `cleanupSubscriptions()` | 3133 |  |
| 32 | `getInitials()` | 3147 |  |
| 33 | `getStatusBadge()` | 3153 |  |
| 34 | `formatTime()` | 3168 |  |
| 35 | `getProjectDuration()` | 3174 |  |
| 36 | `loadTeamMembers()` | 3186 | Yes |
| 37 | `loadProjects()` | 3309 | Yes |
| 38 | `loadPendingShares()` | 3460 | Yes |
| 39 | `loadAllData()` | 3491 | Yes |
| 40 | `updateV7TeamUI()` | 3503 |  |
| 41 | `updateV7ProjectsUI()` | 3573 |  |
| 42 | `updateMapMarkers()` | 3635 |  |
| 43 | `updateV7DashboardStats()` | 3661 |  |
| 44 | `openLiveProjectDrawer()` | 3691 |  |
| 45 | `calculateDuration()` | 3759 |  |
| 46 | `parseErrorCodes()` | 3776 |  |
| 47 | `calculateSectionProgress()` | 3793 |  |
| 48 | `getReportField()` | 3865 |  |
| 49 | `formatFieldValue()` | 3897 |  |
| 50 | `buildReportSection()` | 3905 |  |
| 51 | `dedupeArray()` | 3923 |  |
| 52 | `buildProgressRow()` | 3950 |  |
| 53 | `buildLiveProjectDrawerContent()` | 3966 |  |
| 54 | `initMap()` | 4630 |  |
| 55 | `renderMapProjectsList()` | 4656 |  |
| 56 | `renderProjectCards()` | 4674 |  |
| 57 | `renderTeamCards()` | 4697 |  |
| 58 | `renderTechListDropdown()` | 4731 |  |
| 59 | `flyToTechProject()` | 4751 |  |
| 60 | `openTechMapDrawer()` | 4775 |  |
| 61 | `closeTechMapDrawer()` | 4803 |  |
| 62 | `buildTechMapDrawerContent()` | 4810 |  |
| 63 | `openProjectFromTechDrawer()` | 4875 |  |
| 64 | `openTechChat()` | 4880 |  |
| 65 | `callTechnician()` | 4881 |  |
| 66 | `switchView()` | 4903 |  |
| 67 | `closeCalendar()` | 4917 |  |
| 68 | `setCalendarView()` | 4924 |  |
| 69 | `calendarPrev()` | 4938 |  |
| 70 | `calendarNext()` | 4953 |  |
| 71 | `renderCalendar()` | 4968 |  |
| 72 | `getCornerClass()` | 5018 |  |
| 73 | `openDayView()` | 5032 |  |
| 74 | `renderDayView()` | 5045 |  |
| 75 | `renderWeekView()` | 5086 |  |
| 76 | `toggleNotifications()` | 5126 |  |
| 77 | `dismissNotif()` | 5131 |  |
| 78 | `showProjectsPage()` | 5146 |  |
| 79 | `showTeamsPage()` | 5152 |  |
| 80 | `goToDashboard()` | 5158 |  |
| 81 | `showSettingsPage()` | 5165 |  |
| 82 | `openNotificationDetail()` | 5169 |  |
| 83 | `initDockTooltips()` | 5176 |  |
| 84 | `closePage()` | 5197 |  |
| 85 | `buildProjectDrawerContent()` | 5203 |  |
| 86 | `buildTechDrawerContent()` | 5248 |  |
| 87 | `openProjectDetail()` | 5313 |  |
| 88 | `openMapProjectDetail()` | 5326 |  |
| 89 | `closeMapDrawer()` | 5359 |  |
| 90 | `openTechDetail()` | 5366 |  |
| 91 | `openNestedProject()` | 5378 |  |
| 92 | `closeNestedDrawer()` | 5389 |  |
| 93 | `closeDrawer()` | 5393 |  |
| 94 | `openProfileDrawer()` | 5399 |  |
| 95 | `closeProfileDrawer()` | 5403 |  |
| 96 | `openInviteDrawer()` | 5407 |  |
| 97 | `openNewProject()` | 5427 |  |
| 98 | `selectTechForProject()` | 5497 |  |
| 99 | `setNewProjAvail()` | 5516 |  |
| 100 | `selectTimeSlot()` | 5522 |  |
| 101 | `filterProjects()` | 5534 |  |
| 102 | `filterTeams()` | 5543 |  |
| 103 | `setProjectFilter()` | 5552 |  |
| 104 | `setTeamFilter()` | 5566 |  |
| 105 | `showCalendar()` | 5591 |  |
| 106 | `initV7UI()` | 5594 |  |

---

## master/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `initMermaid()` | 1297 |  |
| 2 | `renderMermaidDiagrams()` | 1337 | Yes |
| 3 | `supabaseQuery()` | 1434 | Yes |
| 4 | `supabaseUpdate()` | 1446 | Yes |
| 5 | `setConnectionStatus()` | 1453 |  |
| 6 | `loadAllData()` | 1461 | Yes |
| 7 | `loadProjectMessages()` | 1529 | Yes |
| 8 | `getInitials()` | 1579 |  |
| 9 | `formatStatus()` | 1580 |  |
| 10 | `formatDate()` | 1581 |  |
| 11 | `formatTimeAgo()` | 1582 |  |
| 12 | `parseMarkdown()` | 1585 |  |
| 13 | `restoreMermaid()` | 1604 |  |
| 14 | `renderExtractionCard()` | 1764 |  |
| 15 | `escapeHtml()` | 1807 |  |
| 16 | `processBasicMarkdown()` | 1811 |  |
| 17 | `restoreImages()` | 1823 |  |
| 18 | `openImageViewer()` | 1830 |  |
| 19 | `renderOCRCard()` | 1835 |  |
| 20 | `renderOCRTable()` | 1908 |  |
| 21 | `parseOCRText()` | 1949 |  |
| 22 | `toggleOCRRaw()` | 2001 |  |
| 23 | `renderStructuredReport()` | 2010 |  |
| 24 | `updateDashboard()` | 2163 |  |
| 25 | `updateTechniciansListHome()` | 2178 |  |
| 26 | `renderEnterprisesHome()` | 2187 |  |
| 27 | `buildEnterpriseCard()` | 2196 |  |
| 28 | `updateSettingsPage()` | 2252 |  |
| 29 | `goHome()` | 2259 |  |
| 30 | `openPage()` | 2260 |  |
| 31 | `closePage()` | 2261 |  |
| 32 | `buildTechnicianCard()` | 2264 |  |
| 33 | `buildProjectCard()` | 2409 |  |
| 34 | `openHomeDrawer()` | 2462 |  |
| 35 | `suspendEnterprise()` | 2503 |  |
| 36 | `closeHomeDrawer()` | 2508 |  |
| 37 | `accessTechnicianAccount()` | 2517 | Yes |
| 38 | `openPageDrawer()` | 2576 |  |
| 39 | `closePageDrawer()` | 2614 |  |
| 40 | `buildTechnicianDrawerContent()` | 2616 |  |
| 41 | `buildEnterpriseDrawerContent()` | 2699 |  |
| 42 | `toggleStatusDropdown()` | 2782 |  |
| 43 | `selectStatusFromDropdown()` | 2794 |  |
| 44 | `selectStatus()` | 2818 |  |
| 45 | `toggleUserExpand()` | 2822 |  |
| 46 | `openProjectView()` | 2831 | Yes |
| 47 | `renderChatMessages()` | 2879 |  |
| 48 | `closeProjectView()` | 2941 |  |
| 49 | `toggleSplit()` | 2957 |  |
| 50 | `enableSplitView()` | 2966 |  |
| 51 | `disableSplitView()` | 2976 |  |
| 52 | `startDrag()` | 2998 |  |
| 53 | `drag()` | 3001 |  |
| 54 | `stopDrag()` | 3016 |  |
| 55 | `openReportSheet()` | 3019 |  |
| 56 | `calculateReportCompletion()` | 3032 |  |
| 57 | `renderReportPreview()` | 3054 |  |
| 58 | `closeReportSheet()` | 3201 |  |
| 59 | `populateUsersList()` | 3207 |  |
| 60 | `populateEnterprisesList()` | 3224 |  |
| 61 | `filterEnterprises()` | 3236 |  |
| 62 | `filterUsersByRole()` | 3251 |  |
| 63 | `updateUserCounts()` | 3260 |  |
| 64 | `filterUsers()` | 3271 |  |
| 65 | `quickApprove()` | 3279 | Yes |
| 66 | `quickReject()` | 3338 | Yes |
| 67 | `saveStatus()` | 3375 | Yes |
| 68 | `formatStatusExtended()` | 3498 |  |
| 69 | `loadEmailHistory()` | 3510 | Yes |
| 70 | `renderEmailItem()` | 3547 |  |
| 71 | `toggleEmailExpand()` | 3602 |  |
| 72 | `loadEmailClicks()` | 3607 | Yes |
| 73 | `toggleSignatureField()` | 3637 |  |
| 74 | `sendEmailToUser()` | 3644 | Yes |
| 75 | `showEmailToast()` | 3740 |  |
| 76 | `escapeHtmlEmail()` | 3755 |  |
| 77 | `initSupabase()` | 3774 |  |
| 78 | `initAuth()` | 3792 | Yes |
| 79 | `handleAuthenticatedUser()` | 3812 | Yes |
| 80 | `loadUserProfile()` | 3838 | Yes |
| 81 | `nextLoginStep()` | 3854 | Yes |
| 82 | `prevLoginStep()` | 3943 |  |
| 83 | `updateLoginUI()` | 3951 |  |
| 84 | `showLoginScreen()` | 3962 |  |
| 85 | `showAccessDeniedScreen()` | 3975 |  |
| 86 | `showMainApp()` | 3987 |  |
| 87 | `logout()` | 4007 | Yes |
| 88 | `accessTechnicianAccount()` | 4022 | Yes |
| 89 | `setLoginStatus()` | 4095 |  |
| 90 | `clearLoginStatus()` | 4101 |  |
| 91 | `toast()` | 4108 |  |

---

## manager/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `initLanguage()` | 1238 |  |
| 2 | `t()` | 1250 |  |
| 3 | `applyLanguage()` | 1260 |  |
| 4 | `parseHashParams()` | 1298 |  |
| 5 | `initSupabase()` | 1324 |  |
| 6 | `setLoginStatus()` | 1347 |  |
| 7 | `clearLoginStatus()` | 1358 |  |
| 8 | `resetPassword()` | 1366 | Yes |
| 9 | `nextLoginStep()` | 1385 | Yes |
| 10 | `updateLoginUI()` | 1517 |  |
| 11 | `prevLoginStep()` | 1523 |  |
| 12 | `loadUserProfile()` | 1531 | Yes |
| 13 | `showEmailConfirmScreen()` | 1551 |  |
| 14 | `showPendingScreen()` | 1561 |  |
| 15 | `showAccessDeniedScreen()` | 1571 |  |
| 16 | `showPasswordResetScreen()` | 1581 |  |
| 17 | `redirectToTechnicianApp()` | 1590 |  |
| 18 | `checkApprovalStatus()` | 1594 | Yes |
| 19 | `resendConfirmation()` | 1634 | Yes |
| 20 | `backToLogin()` | 1648 |  |
| 21 | `logoutFromPending()` | 1663 | Yes |
| 22 | `setNewPassword()` | 1688 | Yes |
| 23 | `cancelPasswordReset()` | 1755 |  |
| 24 | `showMainApp()` | 1768 |  |
| 25 | `logout()` | 1779 | Yes |
| 26 | `initAuth()` | 1808 | Yes |
| 27 | `handleAuthenticatedUser()` | 1876 | Yes |
| 28 | `checkManagerAuth()` | 1906 | Yes |
| 29 | `managerLogout()` | 1942 | Yes |
| 30 | `loadTeamMembers()` | 1949 | Yes |
| 31 | `loadProjects()` | 2068 | Yes |
| 32 | `loadPendingShares()` | 2147 | Yes |
| 33 | `showPendingSharesNotification()` | 2175 |  |
| 34 | `acceptAvailabilityShare()` | 2183 | Yes |
| 35 | `rejectAvailabilityShare()` | 2238 | Yes |
| 36 | `setupRealtimeSubscriptions()` | 2257 | Yes |
| 37 | `cleanupSubscriptions()` | 2334 |  |
| 38 | `handleNewMessage()` | 2343 |  |
| 39 | `showNewShareNotification()` | 2356 |  |
| 40 | `sendTeamMessage()` | 2363 | Yes |
| 41 | `inviteInterneTechnician()` | 2386 | Yes |
| 42 | `getInitials()` | 2453 |  |
| 43 | `getStatusBadge()` | 2459 |  |
| 44 | `formatTime()` | 2473 |  |
| 45 | `getProjectDuration()` | 2479 |  |
| 46 | `updateTeamUI()` | 2491 |  |
| 47 | `updateProjectsUI()` | 2522 |  |
| 48 | `updateDashboardStats()` | 2547 |  |
| 49 | `showAvailabilityShareModal()` | 2575 |  |
| 50 | `closeAvailabilityShareModal()` | 2620 |  |
| 51 | `loadAllData()` | 2628 | Yes |
| 52 | `initManagerApp()` | 2636 | Yes |
| 53 | `toast()` | 2687 |  |
| 54 | `setHomeCalView()` | 2695 |  |
| 55 | `navHomeCal()` | 2702 |  |
| 56 | `renderHomeCalendar()` | 2704 |  |
| 57 | `buildDayView()` | 2720 |  |
| 58 | `buildWeekView()` | 2741 |  |
| 59 | `buildMonthView()` | 2781 |  |
| 60 | `goToDayView()` | 2790 |  |
| 61 | `openProjectFromCal()` | 2800 |  |
| 62 | `openHomeDrawer()` | 2809 |  |
| 63 | `closeHomeDrawer()` | 2836 |  |
| 64 | `openHomeNestedProject()` | 2841 |  |
| 65 | `closeHomeNestedDrawer()` | 2854 |  |
| 66 | `openPage()` | 2858 |  |
| 67 | `closePage()` | 2865 |  |
| 68 | `goHome()` | 2871 |  |
| 69 | `openPageDrawer()` | 2873 |  |
| 70 | `closePageDrawer()` | 2898 |  |
| 71 | `selectProject()` | 2902 |  |
| 72 | `openReportDrawer()` | 2908 |  |
| 73 | `closeReportDrawer()` | 2918 |  |
| 74 | `buildReportPreview()` | 2923 |  |
| 75 | `selectTech()` | 2978 |  |
| 76 | `openNestedProject()` | 2994 |  |
| 77 | `closeNestedDrawer()` | 3007 |  |
| 78 | `buildProjectContent()` | 3012 |  |
| 79 | `buildTechContent()` | 3041 |  |
| 80 | `buildSmallAvailability()` | 3055 |  |
| 81 | `setAvailView()` | 3068 |  |
| 82 | `buildAvailDay()` | 3087 |  |
| 83 | `buildAvailWeek()` | 3099 |  |
| 84 | `buildAvailMonth()` | 3110 |  |
| 85 | `buildCalendarDrawerContent()` | 3123 |  |
| 86 | `setDrawerCalView()` | 3136 |  |
| 87 | `buildCreateProjectContent()` | 3146 |  |
| 88 | `selectTechForProject()` | 3156 |  |
| 89 | `onProjectDateChange()` | 3180 |  |
| 90 | `buildAddTechContent()` | 3201 |  |
| 91 | `handleInviteClick()` | 3217 | Yes |
| 92 | `showInvitationSuccessModal()` | 3243 |  |
| 93 | `copyInviteLink()` | 3297 |  |
| 94 | `closeInviteSuccessModal()` | 3304 |  |
| 95 | `buildChatInput()` | 3308 |  |
| 96 | `initChatHandlers()` | 3339 |  |
| 97 | `handleChatInput()` | 3347 |  |
| 98 | `handleKeydown()` | 3364 |  |
| 99 | `handleAction()` | 3372 |  |
| 100 | `sendMessage()` | 3387 |  |
| 101 | `toggleAttach()` | 3407 |  |
| 102 | `closeAllAttach()` | 3413 |  |
| 103 | `attachAction()` | 3417 |  |
| 104 | `handleFileSelect()` | 3429 |  |
| 105 | `addPhotoToChat()` | 3456 |  |
| 106 | `deletePhotoMsg()` | 3496 |  |
| 107 | `extractFromPhoto()` | 3504 |  |
| 108 | `addToReport()` | 3509 |  |
| 109 | `openImageViewer()` | 3519 |  |
| 110 | `closeImageViewer()` | 3526 |  |
| 111 | `startRecording()` | 3531 | Yes |
| 112 | `updateWaveform()` | 3582 |  |
| 113 | `updateVoiceTimer()` | 3607 |  |
| 114 | `stopRecording()` | 3618 |  |
| 115 | `transcribeWithElevenLabs()` | 3682 | Yes |
| 116 | `openReportSheet()` | 3744 |  |
| 117 | `closeReportSheet()` | 3755 |  |
| 118 | `buildReportPreview()` | 3760 |  |
| 119 | `approveReport()` | 3783 |  |

---

## admin/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `initLanguage()` | 1111 |  |
| 2 | `t()` | 1123 |  |
| 3 | `applyLanguage()` | 1134 |  |
| 4 | `parseHashParams()` | 1178 |  |
| 5 | `initSupabase()` | 1204 |  |
| 6 | `setLoginStatus()` | 1227 |  |
| 7 | `clearLoginStatus()` | 1238 |  |
| 8 | `resetPassword()` | 1246 | Yes |
| 9 | `nextLoginStep()` | 1265 | Yes |
| 10 | `updateLoginUI()` | 1400 |  |
| 11 | `prevLoginStep()` | 1406 |  |
| 12 | `loadUserProfile()` | 1414 | Yes |
| 13 | `showEmailConfirmScreen()` | 1434 |  |
| 14 | `showPendingScreen()` | 1444 |  |
| 15 | `showAccessDeniedScreen()` | 1454 |  |
| 16 | `showPasswordResetScreen()` | 1499 |  |
| 17 | `redirectToTechnicianApp()` | 1508 |  |
| 18 | `checkApprovalStatus()` | 1512 | Yes |
| 19 | `resendConfirmation()` | 1552 | Yes |
| 20 | `backToLogin()` | 1566 |  |
| 21 | `logoutFromPending()` | 1581 | Yes |
| 22 | `setNewPassword()` | 1610 | Yes |
| 23 | `cancelPasswordReset()` | 1677 |  |
| 24 | `showMainApp()` | 1690 |  |
| 25 | `logout()` | 1701 | Yes |
| 26 | `initAuth()` | 1735 | Yes |
| 27 | `handleAuthenticatedUser()` | 1803 | Yes |
| 28 | `checkManagerAuth()` | 1833 | Yes |
| 29 | `managerLogout()` | 1869 | Yes |
| 30 | `loadTeamMembers()` | 1876 | Yes |
| 31 | `loadProjects()` | 1995 | Yes |
| 32 | `loadPendingShares()` | 2074 | Yes |
| 33 | `showPendingSharesNotification()` | 2102 |  |
| 34 | `acceptAvailabilityShare()` | 2110 | Yes |
| 35 | `rejectAvailabilityShare()` | 2165 | Yes |
| 36 | `setupRealtimeSubscriptions()` | 2184 | Yes |
| 37 | `cleanupSubscriptions()` | 2261 |  |
| 38 | `handleNewMessage()` | 2270 |  |
| 39 | `showNewShareNotification()` | 2283 |  |
| 40 | `sendTeamMessage()` | 2290 | Yes |
| 41 | `inviteInterneTechnician()` | 2313 | Yes |
| 42 | `getInitials()` | 2380 |  |
| 43 | `getStatusBadge()` | 2386 |  |
| 44 | `formatTime()` | 2400 |  |
| 45 | `getProjectDuration()` | 2406 |  |
| 46 | `updateTeamUI()` | 2418 |  |
| 47 | `updateProjectsUI()` | 2449 |  |
| 48 | `updateDashboardStats()` | 2474 |  |
| 49 | `showAvailabilityShareModal()` | 2502 |  |
| 50 | `closeAvailabilityShareModal()` | 2547 |  |
| 51 | `loadAllData()` | 2555 | Yes |
| 52 | `initManagerApp()` | 2563 | Yes |
| 53 | `toast()` | 2616 |  |
| 54 | `setHomeCalView()` | 2624 |  |
| 55 | `navHomeCal()` | 2631 |  |
| 56 | `renderHomeCalendar()` | 2633 |  |
| 57 | `buildDayView()` | 2649 |  |
| 58 | `buildWeekView()` | 2670 |  |
| 59 | `buildMonthView()` | 2710 |  |
| 60 | `goToDayView()` | 2719 |  |
| 61 | `openProjectFromCal()` | 2729 |  |
| 62 | `openHomeDrawer()` | 2738 |  |
| 63 | `closeHomeDrawer()` | 2771 |  |
| 64 | `openHomeNestedProject()` | 2776 |  |
| 65 | `closeHomeNestedDrawer()` | 2789 |  |
| 66 | `openPage()` | 2793 |  |
| 67 | `closePage()` | 2800 |  |
| 68 | `goHome()` | 2806 |  |
| 69 | `openPageDrawer()` | 2808 |  |
| 70 | `closePageDrawer()` | 2833 |  |
| 71 | `selectProject()` | 2837 |  |
| 72 | `selectTech()` | 2850 |  |
| 73 | `openNestedProject()` | 2866 |  |
| 74 | `closeNestedDrawer()` | 2879 |  |
| 75 | `buildProjectContent()` | 2884 |  |
| 76 | `buildTechContent()` | 2913 |  |
| 77 | `buildSmallAvailability()` | 2927 |  |
| 78 | `setAvailView()` | 2940 |  |
| 79 | `buildAvailDay()` | 2959 |  |
| 80 | `buildAvailWeek()` | 2971 |  |
| 81 | `buildAvailMonth()` | 2982 |  |
| 82 | `buildCalendarDrawerContent()` | 2995 |  |
| 83 | `setDrawerCalView()` | 3008 |  |
| 84 | `buildCreateProjectContent()` | 3018 |  |
| 85 | `selectTechForProject()` | 3028 |  |
| 86 | `onProjectDateChange()` | 3052 |  |
| 87 | `buildAddTechContent()` | 3073 |  |
| 88 | `handleInviteClick()` | 3089 | Yes |
| 89 | `showInvitationSuccessModal()` | 3115 |  |
| 90 | `copyInviteLink()` | 3169 |  |
| 91 | `closeInviteSuccessModal()` | 3176 |  |
| 92 | `buildChatInput()` | 3180 |  |
| 93 | `initChatHandlers()` | 3211 |  |
| 94 | `handleChatInput()` | 3219 |  |
| 95 | `handleKeydown()` | 3236 |  |
| 96 | `handleAction()` | 3244 |  |
| 97 | `sendMessage()` | 3259 |  |
| 98 | `toggleAttach()` | 3279 |  |
| 99 | `closeAllAttach()` | 3285 |  |
| 100 | `attachAction()` | 3289 |  |
| 101 | `handleFileSelect()` | 3301 |  |
| 102 | `addPhotoToChat()` | 3328 |  |
| 103 | `deletePhotoMsg()` | 3368 |  |
| 104 | `extractFromPhoto()` | 3376 |  |
| 105 | `addToReport()` | 3381 |  |
| 106 | `openImageViewer()` | 3391 |  |
| 107 | `closeImageViewer()` | 3398 |  |
| 108 | `startRecording()` | 3403 | Yes |
| 109 | `updateWaveform()` | 3454 |  |
| 110 | `updateVoiceTimer()` | 3479 |  |
| 111 | `stopRecording()` | 3490 |  |
| 112 | `transcribeWithElevenLabs()` | 3554 | Yes |

---

## auth/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `initLanguage()` | 914 |  |
| 2 | `t()` | 931 |  |
| 3 | `applyLanguage()` | 945 |  |
| 4 | `initSupabase()` | 996 |  |
| 5 | `goToScreen()` | 1018 |  |
| 6 | `showStatus()` | 1033 |  |
| 7 | `showInlineMessage()` | 1042 |  |
| 8 | `updateLoginUI()` | 1074 |  |
| 9 | `prevLoginStep()` | 1094 |  |
| 10 | `nextLoginStep()` | 1102 | Yes |
| 11 | `login()` | 1232 | Yes |
| 12 | `redirectByRole()` | 1286 |  |
| 13 | `saveLeadEmail()` | 1313 | Yes |
| 14 | `saveLeadType()` | 1337 | Yes |
| 15 | `selectUserType()` | 1356 |  |
| 16 | `continueToSignup()` | 1367 | Yes |
| 17 | `signupTechnician()` | 1386 | Yes |
| 18 | `signupEnterprise()` | 1481 | Yes |
| 19 | `showPasswordReset()` | 1583 |  |
| 20 | `sendResetEmail()` | 1588 | Yes |
| 21 | `isValidPhoneNumber()` | 1638 |  |
| 22 | `checkApprovalStatus()` | 1643 | Yes |
| 23 | `logout()` | 1689 | Yes |
| 24 | `init()` | 1698 | Yes |

---

## r/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `showScreen()` | 517 |  |
| 2 | `showError()` | 524 |  |
| 3 | `showStatus()` | 529 |  |
| 4 | `launchConfetti()` | 538 |  |
| 5 | `animate()` | 560 |  |
| 6 | `init()` | 595 | Yes |
| 7 | `createAccount()` | 662 | Yes |

---

## invite/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `initLanguage()` | 457 |  |
| 2 | `t()` | 469 |  |
| 3 | `applyLanguage()` | 480 |  |
| 4 | `showScreen()` | 510 |  |
| 5 | `showError()` | 517 |  |
| 6 | `showStatus()` | 522 |  |
| 7 | `init()` | 528 | Yes |
| 8 | `createAccount()` | 600 | Yes |

---

## debug/index.html

| # | Function | Line | Async |
|---|----------|------|-------|
| 1 | `log()` | 294 |  |
| 2 | `logData()` | 305 |  |
| 3 | `clearLogs()` | 316 |  |
| 4 | `setStatus()` | 320 |  |
| 5 | `safeQuery()` | 329 | Yes |
| 6 | `testSupabaseConnection()` | 360 | Yes |
| 7 | `testSupabaseConnectionWithLock()` | 391 | Yes |
| 8 | `testEmailExists()` | 431 | Yes |
| 9 | `testEmailExistsSimple()` | 502 | Yes |
| 10 | `testEmailExistsRaw()` | 542 | Yes |
| 11 | `testSession()` | 582 | Yes |
| 12 | `testSessionStorage()` | 621 |  |
| 13 | `testLogin()` | 661 | Yes |
| 14 | `testLogout()` | 727 | Yes |
| 15 | `simulateFullFlow()` | 744 | Yes |
| 16 | `simulateFixedFlow()` | 831 | Yes |
| 17 | `showLocalStorage()` | 910 |  |
| 18 | `clearAuthStorage()` | 940 |  |
| 19 | `clearAllStorage()` | 954 |  |

---

