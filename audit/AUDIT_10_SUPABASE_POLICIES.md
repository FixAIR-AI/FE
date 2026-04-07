# AUDIT_10 - Supabase RLS Policies

## Important Note

RLS policies are configured in the **Supabase dashboard**, not in the frontend code. This audit documents:
1. What policies SHOULD exist based on the frontend code analysis
2. What policies are documented in existing audit files
3. Recommendations for proper RLS configuration

**To complete this audit, access to the Supabase dashboard (project fwuhzraxqrvmpqxnzpqm) is required.**

---

## Known RLS Policies (from docs/REFERRAL-DATABASE-SCHEMA.sql)

### Table: referrals
| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view own referrals | SELECT | auth.uid() IN (referrer auth_id OR referee auth_id) |
| Users can create referrals | INSERT | auth.uid() matches referrer auth_id |

### Table: referral_milestones
| Policy | Operation | Rule |
|--------|-----------|------|
| Users can view own milestones | SELECT | auth.uid() matches user auth_id |

---

## Required RLS Policies (Based on Frontend Analysis)

### Table: users
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can read own profile | SELECT | All apps read own user data |
| Users can update own profile | UPDATE | Profile editing in technician, admin, etc. |
| Admin/Manager can read team members | SELECT | Team dashboards in admin/manager/operations |
| Master can read all users | SELECT | Master app reads all users |
| Insert own profile on signup | INSERT | Auth flow creates user profile |

**[SECURITY CONCERN]** The master app uses direct REST API calls to read/update ANY user. If RLS isn't strict, master-level access could be abused.

### Table: projects
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can CRUD own projects | ALL | Technician app creates/reads/updates/deletes |
| Admin/Manager can read team projects | SELECT | Dashboard views |
| Users can delete own projects | DELETE | Project deletion in technician app |

### Table: chats
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can CRUD own chats | ALL | Chat creation and deletion |
| Master can read all chats | SELECT | Master chat viewer |

### Table: messages
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can CRUD own messages | ALL | Message creation and deletion |
| Master can read all messages | SELECT | Master message viewer |

### Table: calendar_events
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can CRUD own events | ALL | Calendar management |
| Admin/Manager can read shared events | SELECT | Availability calendar |

### Table: availability_shares
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can read own shares | SELECT | View shared availability |
| Admin/Manager can manage shares | ALL | Accept/reject/create shares |

### Table: team_messages
| Policy | Operation | Reason |
|--------|-----------|--------|
| Company members can read team messages | SELECT | Team messaging |
| Company members can insert messages | INSERT | Send team messages |

### Table: invitations
| Policy | Operation | Reason |
|--------|-----------|--------|
| Admin/Manager can create invitations | INSERT | Invite team members |
| Anyone with token can read invitation | SELECT | /invite page validates tokens |
| Admin/Manager can read own invitations | SELECT | View sent invitations |

### Table: reports
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can CRUD own reports | ALL | Report generation |
| Admin/Manager can read team reports | SELECT | Dashboard |

### Table: user_actions
| Policy | Operation | Reason |
|--------|-----------|--------|
| Users can insert own actions | INSERT | Analytics tracking |
| Users can read own actions | SELECT | Weekly stats |

### Table: app_settings
| Policy | Operation | Reason |
|--------|-----------|--------|
| Authenticated users can read | SELECT | API key fetching |
| No write access from frontend | - | Settings managed via dashboard |

**[SECURITY CONCERN]** app_settings contains the ElevenLabs API key. Any authenticated user can read it. Consider: should this key be proxied through an Edge Function instead?

---

## Recommended RLS Audit Steps

1. **Login to Supabase Dashboard** → Authentication → Policies
2. **For each table above**, verify:
   - RLS is ENABLED
   - SELECT policies restrict to own data (or team data for admin/manager)
   - INSERT policies require auth.uid() match
   - UPDATE policies prevent cross-user modification
   - DELETE policies prevent cross-user deletion
3. **Test with different roles:**
   - Standalone technician: can only see own data
   - Internal technician: can see own data + manager can see theirs
   - Manager: can see team data
   - Admin: can see company data
   - Master: elevated access (internal only)

---

## Existing Documentation Reference

See `docs/AUDIT_RLS_PREPARATION.md` for detailed role-permission mapping created during the RLS preparation phase. That document contains:
- Complete role definitions (Admin, Manager, Technician standalone, Technician internal)
- Per-file Supabase query inventory
- Access pattern analysis
