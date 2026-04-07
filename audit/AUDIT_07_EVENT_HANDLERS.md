# AUDIT_07 - Event Handlers

## Summary

| File | Total Event References | Method |
|------|----------------------|--------|
| technician/index.html | 332 | Mostly inline onclick, some addEventListener |
| index.html | ~280 | Same pattern |
| docs/index.html | ~290 | Same pattern |
| operations/index.html | ~120 | Same pattern |
| master/index.html | ~100 | Same pattern |
| manager/index.html | ~110 | Same pattern |
| admin/index.html | ~105 | Same pattern |

## Technician App Event Handlers (Key Categories)

### Navigation Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| navHome | onclick | goToHome() | 6078 |
| navProjects | onclick | Router.navigate({page:'projects'}) | 6079 |
| navConnect | onclick | openConnect() | 6080 |
| nav-hotline | onclick | openHotline() | 6081 |
| nav-profile | onclick | openProfile() | 6091 |
| profile-back | onclick | goToHome() | 6099 |
| panel-back (copilot) | onclick | closeChat(); goToHome() | 6216 |
| panel-back (assistant) | onclick | closeChat(); goToHome() | 6327 |

### Login Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| loginEmail | onkeypress | nextLoginStep() on Enter | 5812 |
| loginPassword | onkeypress | nextLoginStep() on Enter | 5815 |
| loginBtn | onclick | nextLoginStep() | 5819 |
| loginBack | onclick | prevLoginStep() | 5807 |

### Chat Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| copilotInput | oninput | handleChatInput('copilot') | 6298 |
| copilotInput | onkeydown | handleKeydown(event,'copilot') | 6298 |
| copilotActionBtn | onclick | handleAction('copilot') | 6304 |
| assistantInput | oninput | handleChatInput('assistant') | 6409 |
| assistantInput | onkeydown | handleKeydown(event,'assistant') | 6409 |
| assistantActionBtn | onclick | handleAction('assistant') | 6415 |
| toggle-card copilot | onclick | openChat('copilot') | 5997 |
| toggle-card assistant | onclick | openChat('assistant') | 6005 |
| mode-btn copilot | onclick | switchMode('copilot') | 6272 |
| mode-btn assistant | onclick | switchMode('assistant') | 6276 |

### Brand Selection Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| brandPill | onclick | toggleBrandDropdown() | 5832 |
| brand-chip carrier | onclick | setBrand('carrier') | 6018 |
| brand-chip daikin | onclick | setBrand('daikin') | 6019 |
| brand-chip mitsubishi | onclick | setBrand('mitsubishi') | 6020 |
| panel-brand-btn (copilot) | onclick | toggleChatBrandDropdown('copilot') | 6221 |
| panel-brand-option * | onclick | changeChatBrand(brand, panel) | 6226-6262 |

### Project Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| new-chat-btn | onclick | startNewProject() | 6282 |
| split-btn | onclick | toggleSplit() | 6283 |
| context-menu rename | onclick | renameProject() | 6066 |
| context-menu delete | onclick | deleteProject() | 6070 |

### Report/Drawer Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| report-btn | onclick | openReport() | 6455 |
| report-close | onclick | closeReport() | 6459 |
| report export PDF | onclick | exportReport('pdf') | ~6470 |
| report export Word | onclick | exportReport('word') | ~6472 |
| report share | onclick | shareReport() | ~6474 |
| contenteditable elements | input | drawerAutoSave() (debounced) | via initDrawerV12Features |

### Calendar Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| calendar-tab day | onclick | setTechCalView('day', this) | 6030 |
| calendar-tab week | onclick | setTechCalView('week', this) | 6031 |
| calendar-tab month | onclick | setTechCalView('month', this) | 6032 |
| calendar-nav prev | onclick | navTechCal(-1) | 6036 |
| calendar-nav next | onclick | navTechCal(1) | 6037 |
| calendar add event | onclick | openEventDrawer(...) | 6038 |

### Photo/Media Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| attach camera | onclick | attachAction('camera', panel) | 6292 |
| attach file | onclick | attachAction('file', panel) | 6293 |
| plus-btn | onclick | toggleAttach(panel) | 6296 |

### Profile Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| langFR | onclick | setLanguage('fr') | 6137 |
| langEN | onclick | setLanguage('en') | 6138 |
| themeToggle | onclick | toggleTheme() | 6148 |
| profile-save | onclick | saveProfile() | 6153 |
| logout-btn | onclick | logout() | 6207 |

### Referral Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| copy referral code | onclick | copyReferralCode() | 6181 |
| share WhatsApp | onclick | shareOnWhatsApp() | 6190 |
| copy referral link | onclick | copyReferralLink() | 6196 |

### Freemium/Upgrade Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| upgrade overlay | onclick | closeUpgradeModal(event) | 5679 |
| upgrade referral btn | onclick | handleInviteClick() | 5695 |
| upgrade pro btn | onclick | handleUpgradeClick() | 5700 |
| upgrade later btn | onclick | closeUpgradeModal() | 5705 |

### Programmatic addEventListener Calls
| Target | Event | Handler | Line (approx) |
|--------|-------|---------|------|
| window | resize | setViewportHeight | 6613-6640 |
| window | orientationchange | setViewportHeight | 6613-6640 |
| window | focus/blur | handleKeyboardChange | 6646 |
| window | elevenlabs-ready | SDK init | 18348 |
| document | click | closeChatBrandDropdownsOnClick | 9138 |
| document | click | closeContextMenu | 10190 |
| divider | mousedown/touchstart | startDrag | ~18555 |
| document | mousemove/touchmove | drag | ~18560 |
| document | mouseup/touchend | stopDrag | ~18565 |

### Onboarding Events
| Element | Event | Handler | Line |
|---------|-------|---------|------|
| step1 | onclick | handleStep1Click() | 5890 |
| step2 | onclick | toggleBrandSelect() | 5895 |
| brand options | onclick | selectBrandInline(brand) | 5901-5903 |
| step3 | onclick | handleStep3Click() | 5905 |
| step4 | onclick | handleStep4Click() | 5917 |

---

## Pattern Analysis

### Anti-Patterns Found
1. **Inline onclick everywhere** - Makes event handlers hard to trace and impossible to test
2. **No event delegation** - Each element gets its own handler instead of parent delegation
3. **Mixed patterns** - Some addEventListener, mostly inline onclick
4. **String-based event handlers** - `onclick="functionName()"` prevents minification and analysis

### Recommendation
During extraction, convert all inline onclick handlers to addEventListener calls registered in module initialization functions. This enables:
- Event delegation for lists
- Easier testing
- Better TypeScript support
- Proper cleanup on navigation
