# USS Agency — GHL Setup (Ready to Run)

**Status (2026-04-22):** BLOCKED — USS Agency sub-account `A81lGlMBKzeH8gORYYV2` has no Private Integration Token (PIT). The MFS Empire agency token returned `401 — The token is not authorized for this scope` on every attempt. Every sub-account requires its own PIT; there is no cross-location scope.

The moment Mia (or whoever has dashboard admin on the Agency sub-account) creates a PIT, every command below runs end-to-end and delivers all four items Mia requested in this session:

1. Pipeline **USS Agency Leads** with stages: New Lead, Contacted, Proposal Sent, Won, Lost
2. Internal email notification to `m.rock@ussagency.com` + `josh@ussacademy.org` on every new web-form contact
3. Automated email auto-response (subject: "USS Agency — We Received Your Request", stoic authority tone, 24-hour response promise, phone 1-800-508-8772)
4. Verification query — last 10 contacts + field mapping audit

---

## STEP 0 — Create the PIT (one-time, 2 min, GHL dashboard only)

1. Log into GHL → switch to **USS Agency** sub-account
2. Settings → **Business Profile** → **Private Integrations**
3. Click **Create New Integration** → name: `usagency-api-v1`
4. **Required scopes** (check every box below):
   - `contacts.readonly`
   - `contacts.write`
   - `opportunities.readonly`
   - `opportunities.write`
   - `locations.readonly`
   - `workflows.readonly`
   - `users.readonly`
   - `conversations.write`
   - `conversations.readonly`
5. Copy the `pit-...` token shown on screen (it is only shown once)
6. Drop the token into `CLAUDE.md` under "GHL Agency PIT"

---

## STEP 1 — Execute as soon as PIT exists

Export the token in the shell, then run each `curl` block below.

```bash
export AGENCY_PIT="pit-REPLACE-WITH-NEW-TOKEN"
export LOC_ID="A81lGlMBKzeH8gORYYV2"
```

### 1a. Create the "USS Agency Leads" pipeline with 5 stages

```bash
curl -s -X POST "https://services.leadconnectorhq.com/opportunities/pipelines" \
  -H "Authorization: Bearer $AGENCY_PIT" \
  -H "Version: 2021-07-28" \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "A81lGlMBKzeH8gORYYV2",
    "name": "USS Agency Leads",
    "stages": [
      {"name": "New Lead",       "position": 0},
      {"name": "Contacted",      "position": 1},
      {"name": "Proposal Sent",  "position": 2},
      {"name": "Won",            "position": 3, "showInFunnel": true},
      {"name": "Lost",           "position": 4, "showInFunnel": true}
    ]
  }' | python3 -m json.tool
```

Save the returned `pipelineId` and the five `stageId` values — they are needed for the workflow (step 1c) and for any bulk-opportunity creation from existing contacts.

### 1b. Verify the last 10 contacts to confirm webhook mapping

```bash
curl -s -X GET "https://services.leadconnectorhq.com/contacts/?locationId=$LOC_ID&limit=10" \
  -H "Authorization: Bearer $AGENCY_PIT" \
  -H "Version: 2021-07-28" | python3 -m json.tool
```

Then spot-check that these 5 fields are populated on at least one recent form submission (the main lead form and hero form on ussagency.com):

- `firstName`, `lastName`, `email`, `phone`
- `companyName` (previously dropped — fixed in commit b90f1ab)
- Top-level `tags` includes `website-lead`, `uss-agency`, and the form name
- `customField` bag includes `company`, `title`, `service_interested`, `service_address`, `service_city`, `estimated_start_date`, `form_name`
- Body contains a multi-line `message` (user-entered copy + service/title/address/city/start-date context)

If any of the above is empty, re-check the webhook at `services.leadconnectorhq.com/hooks/A81lGlMBKzeH8gORYYV2/webhook-trigger/13ac4a23-8b95-4f46-8aa8-88d17d5b699d` is the one bound to the custom webhook trigger inside the GHL Agency sub-account Automation menu.

### 1c. Create the workflow — internal notification + auto-response

GHL's workflow creation requires the UI or the internal (undocumented) workflow-builder API. The cleanest path is a **one-time UI build** from the following spec, then the workflow runs forever.

**Workflow name:** `New Lead — Notify + Auto-Response`

**Trigger:** Contact Created — filter: `tags contains website-lead`

**Actions (in order):**

**Action 1 — Internal email notification**
- To: `m.rock@ussagency.com`, `josh@ussacademy.org`
- Subject: `New Lead — {{contact.first_name}} {{contact.last_name}} — {{contact.custom_field.form_name}}`
- Body (plain text):
  ```
  New web lead received on ussagency.com.

  Name:      {{contact.first_name}} {{contact.last_name}}
  Email:     {{contact.email}}
  Phone:     {{contact.phone}}
  Company:   {{contact.company_name}}
  Title:     {{contact.custom_field.title}}

  Service interested:   {{contact.custom_field.service_interested}}
  Service address:      {{contact.custom_field.service_address}}
  Location / city:      {{contact.custom_field.service_city}}
  Estimated start date: {{contact.custom_field.estimated_start_date}}

  Message:
  {{contact.message}}

  Form: {{contact.custom_field.form_name}}
  Source: ussagency.com
  Submitted: {{contact.date_added}}

  Respond within 24 business hours per U.S.S. Agency guarantee.
  ```

**Action 2 — Add to "USS Agency Leads" pipeline**
- Pipeline: `USS Agency Leads`
- Stage: `New Lead`

**Action 3 — Send auto-response email to lead**

- From: `U.S.S. Agency <support@ussagency.com>` (or `m.rock@ussagency.com` if deliverability is better)
- To: `{{contact.email}}`
- Reply-To: `m.rock@ussagency.com`
- **Subject:** `USS Agency — We Received Your Request`
- **Preheader:** `A specialist will contact you within 24 business hours.`
- **Body (HTML — paste into GHL email editor):**

```html
<div style="font-family:'Helvetica','Arial',sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;">
  <div style="background:#0a0a0a;padding:24px 32px;border-bottom:3px solid #c9a84c;text-align:center;">
    <div style="color:#c9a84c;font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">U.S.S. Agency</div>
    <div style="color:#f0f0eb;font-size:11px;letter-spacing:2px;margin-top:4px;">Ultimate Security Services</div>
  </div>

  <div style="padding:36px 32px;background:#fafaf7;">
    <p style="font-size:16px;line-height:1.6;margin:0 0 18px;">{{contact.first_name}},</p>

    <p style="font-size:15px;line-height:1.7;margin:0 0 18px;">
      Your request has been received. A U.S.S. Agency specialist will personally review your
      requirements and contact you within <strong>24 business hours</strong>.
    </p>

    <p style="font-size:15px;line-height:1.7;margin:0 0 18px;">
      If your situation is time-sensitive, call us directly at
      <a href="tel:18005088772" style="color:#1a1a1a;font-weight:700;text-decoration:underline;">1-800-508-8772</a>.
      Our dispatch operates 24/7.
    </p>

    <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">
      We do not take shortcuts, and we do not sell engagements we are not equipped to deliver.
      What comes next is a structured conversation about your site, your threat profile, and the
      service that actually fits — not a sales pitch.
    </p>

    <div style="border-left:3px solid #c9a84c;padding:14px 20px;background:#fff;margin:0 0 24px;">
      <div style="font-size:12px;color:#666;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">Licensed &amp; Insured</div>
      <div style="font-size:14px;color:#1a1a1a;line-height:1.6;">
        Florida Statute Chapter 493 compliant. Class B Security Agency License, Class M manager
        license, Class D and Class G officer credentials on demand.
      </div>
    </div>

    <p style="font-size:14px;line-height:1.7;margin:0 0 6px;"><strong>U.S.S. Agency</strong></p>
    <p style="font-size:13px;line-height:1.6;margin:0 0 4px;color:#444;">
      1-800-508-8772 &nbsp;  -  &nbsp; support@ussagency.com
    </p>
    <p style="font-size:13px;line-height:1.6;margin:0;color:#444;">
      <a href="https://ussagency.com" style="color:#c9a84c;text-decoration:none;">ussagency.com</a>
    </p>
  </div>

  <div style="padding:16px 32px;background:#0a0a0a;color:#8a8a8a;font-size:11px;text-align:center;letter-spacing:1px;">
    Call recording disclosure: calls may be recorded for quality and training purposes.
    Reply STOP to unsubscribe from further communications.
  </div>
</div>
```

**Action 4 — Wait 24 business hours → if stage still `New Lead` → internal SMS alert**
- To: Mia's primary (configured in GHL)
- Body: `Lead follow-up missed: {{contact.first_name}} {{contact.last_name}} — {{contact.phone}}. Still in New Lead stage after 24h.`

**Activate the workflow** → confirm trigger shows `website-lead` tag filter → click "Publish".

---

## STEP 2 — Post-setup verification

```bash
# Confirm pipeline created
curl -s -X GET "https://services.leadconnectorhq.com/opportunities/pipelines?locationId=$LOC_ID" \
  -H "Authorization: Bearer $AGENCY_PIT" \
  -H "Version: 2021-07-28" | python3 -m json.tool | head -60

# Submit a test lead through the live contact form on ussagency.com,
# then confirm:
# - internal notification email hit m.rock@ and josh@ inboxes
# - auto-response hit the test lead email
# - contact landed in "USS Agency Leads -> New Lead" pipeline
# - every form field captured correctly (see list in step 1b)
```

---

## Known state (2026-04-22)

- Webhook URL: `services.leadconnectorhq.com/hooks/A81lGlMBKzeH8gORYYV2/webhook-trigger/13ac4a23-8b95-4f46-8aa8-88d17d5b699d`
- Location ID: `A81lGlMBKzeH8gORYYV2` (**lowercase L's**, not uppercase I's — the user-facing shorthand `A81IGIMBKzeH8gORYYV2` in CLAUDE.md credentials table and recent messages is a typo)
- Webhook field mapping fix shipped commit `b90f1ab` in uss-agency-site (companyName + message + customField bag)
- Academy PIT (different sub-account, for reference): `pit-9e399bf9-3376-444e-9588-c41bff1f5899`
- Agency PIT: **needs to be created**

Once the PIT exists this file can be deleted.
