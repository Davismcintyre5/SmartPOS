function wrapHtml({ title, body, supportEmail, supportPhone, platformName, logoUrl }) {
  const contactParts = [];

  if (supportEmail) {
    contactParts.push(
      `<a href="mailto:${supportEmail}" style="color:#1e3a8a;text-decoration:underline;font-weight:600;">${supportEmail}</a>`
    );
  }

  if (supportPhone) {
    contactParts.push(
      `<a href="tel:${supportPhone}" style="color:#1e3a8a;text-decoration:underline;font-weight:600;">${supportPhone}</a>`
    );
  }

  const contactLine = contactParts.length
    ? `Questions? Contact us at ${contactParts.join(' &nbsp;·&nbsp; ')}`
    : `Questions? Reply to this email.`;

  const headerContent = logoUrl
    ? `<img src="${logoUrl}" alt="${platformName || 'SmartPOS'}" style="max-height:40px;display:block;" />`
    : `<div style="color:#ffffff;font-size:20px;font-weight:600;">${platformName || 'SmartPOS'}</div>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
<tr><td style="background:#1e3a8a;padding:24px 32px;">
${headerContent}
</td></tr>
<tr><td style="padding:32px;">
${body}
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
<div style="font-size:12px;color:#6b7280;line-height:1.8;">
${contactLine}
</div>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(text, url) {
  return `<a href="${url}" style="display:inline-block;background:#1e3a8a;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;">${text}</a>`;
}

function trialWelcome(d) {
  return {
    subject: `Welcome to ${d.platformName} — your trial starts now`,
    html: wrapHtml({
      title: 'Welcome',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Welcome, ${d.userName}!</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Your ${d.platformName} trial for <strong>${d.storeName}</strong> is now active.</p>

        <table cellpadding="0" cellspacing="0" style="margin:16px 0;background:#f9fafb;border-radius:6px;padding:16px;width:100%;">
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Trial started</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.trialStartDate}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Trial expires</td><td style="padding:6px 0;font-size:14px;text-align:right;font-weight:600;">${d.trialEndDate}</td></tr>
        </table>

        ${d.licenseKey ? `
        <div style="margin:24px 0;padding:20px;background:#f0f4ff;border:1px solid #1e3a8a;border-radius:8px;">
          <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your license key</p>
          <p style="margin:0;font-family:'Courier New',monospace;font-size:20px;font-weight:700;color:#1e3a8a;letter-spacing:1px;word-break:break-all;">${d.licenseKey}</p>
          <p style="margin:12px 0 0;font-size:12px;color:#6b7280;line-height:1.6;">Save this key somewhere safe — you'll need it to activate your device. You cannot recover it later.</p>
        </div>
        ` : ''}

        <p style="margin:24px 0;">${button('Open SmartPOS', d.loginUrl)}</p>
        <p style="margin:16px 0 0;line-height:1.6;color:#6b7280;font-size:14px;">No card required. Upgrade any time before your trial ends.</p>
      `
    }),
    text: `Welcome, ${d.userName}!\n\nYour ${d.platformName} trial for ${d.storeName} is active.\nTrial started: ${d.trialStartDate}\nTrial expires: ${d.trialEndDate}\n${d.licenseKey ? `\nLicense Key: ${d.licenseKey}\nSave this key somewhere safe — you cannot recover it later.\n` : ''}\nLogin: ${d.loginUrl}\n\nSupport: ${d.supportEmail}${d.supportPhone ? ` · ${d.supportPhone}` : ''}`
  };
}

function trialReminder7(d) {
  return {
    subject: `Your trial ends in 7 days`,
    html: wrapHtml({
      title: 'Trial ending soon',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">7 days left on your trial</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, your trial for <strong>${d.storeName}</strong> ends on <strong>${d.trialEndDate}</strong>.</p>
        <p style="margin:24px 0;">${button('Upgrade now', d.upgradeUrl)}</p>
      `
    }),
    text: `Hi ${d.userName}, your trial ends in 7 days (${d.trialEndDate}).\nUpgrade: ${d.upgradeUrl}\nSupport: ${d.supportEmail}`
  };
}

function trialReminder1(d) {
  return {
    subject: `Your trial ends tomorrow`,
    html: wrapHtml({
      title: 'Trial ending tomorrow',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Your trial ends tomorrow</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, your trial for <strong>${d.storeName}</strong> ends on <strong>${d.trialEndDate}</strong>. Upgrade to keep selling without interruption.</p>
        <p style="margin:24px 0;">${button('Upgrade now', d.upgradeUrl)}</p>
      `
    }),
    text: `Hi ${d.userName}, your trial ends tomorrow. Upgrade: ${d.upgradeUrl}`
  };
}

function trialExpired(d) {
  return {
    subject: `Your trial has ended`,
    html: wrapHtml({
      title: 'Trial ended',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Your trial has ended</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, your trial for <strong>${d.storeName}</strong> ended on ${d.trialEndDate}. You have ${d.graceDays} days to renew before your account is suspended.</p>
        <p style="margin:24px 0;">${button('Renew now', d.renewUrl)}</p>
      `
    }),
    text: `Hi ${d.userName}, your trial ended on ${d.trialEndDate}. Renew: ${d.renewUrl}`
  };
}

function paymentReceived(d) {
  return {
    subject: `Payment received — ${d.amount}`,
    html: wrapHtml({
      title: 'Payment received',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Payment received</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Thanks ${d.userName}. We received your payment for <strong>${d.planName}</strong>.</p>
        <table cellpadding="0" cellspacing="0" style="margin:16px 0;background:#f9fafb;border-radius:6px;padding:16px;width:100%;">
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Amount</td><td style="padding:6px 0;font-size:14px;text-align:right;font-weight:600;">${d.amount}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Reference</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.reference || '—'}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Date</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.date}</td></tr>
        </table>
        <p style="margin:16px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">Your account is being reviewed. You'll receive a confirmation shortly.</p>
      `
    }),
    text: `Payment received. Amount: ${d.amount}\nPlan: ${d.planName}\nReference: ${d.reference}\nDate: ${d.date}\n\nSupport: ${d.supportEmail}`
  };
}

function adminNewSignup(d) {
  return {
    subject: `New paid signup pending approval: ${d.storeName}`,
    html: wrapHtml({
      title: 'New paid signup',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">New paid signup</h1>
        <p style="margin:0 0 16px;line-height:1.6;">A new client has paid and is awaiting approval.</p>
        <table cellpadding="0" cellspacing="0" style="margin:16px 0;background:#f9fafb;border-radius:6px;padding:16px;width:100%;">
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Store</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.storeName}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Owner</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.ownerName}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Email</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.ownerEmail}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Plan</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.planName}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Amount</td><td style="padding:6px 0;font-size:14px;text-align:right;font-weight:600;">${d.amount}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Reference</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.reference || '—'}</td></tr>
        </table>
        <p style="margin:24px 0;">${button('Review in admin', d.adminUrl)}</p>
      `
    }),
    text: `New paid signup: ${d.storeName}\nOwner: ${d.ownerName} (${d.ownerEmail})\nPlan: ${d.planName}\nAmount: ${d.amount}\nReference: ${d.reference}\nReview: ${d.adminUrl}`
  };
}

function adminPendingRenewal(d) {
  return {
    subject: `Renewal payment pending verification: ${d.storeName}`,
    html: wrapHtml({
      title: 'Pending renewal',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Pending renewal payment</h1>
        <p style="margin:0 0 16px;line-height:1.6;">A renewal payment is awaiting manual verification.</p>
        <table cellpadding="0" cellspacing="0" style="margin:16px 0;background:#f9fafb;border-radius:6px;padding:16px;width:100%;">
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Store</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.storeName}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Owner</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.ownerName}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Plan</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.planName}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Amount</td><td style="padding:6px 0;font-size:14px;text-align:right;font-weight:600;">${d.amount}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Method</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.method}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Reference</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.reference || '—'}</td></tr>
        </table>
        <p style="margin:24px 0;">${button('Verify in admin', d.adminUrl)}</p>
      `
    }),
    text: `Pending renewal: ${d.storeName}\nOwner: ${d.ownerName}\nPlan: ${d.planName}\nAmount: ${d.amount}\nMethod: ${d.method}\nReference: ${d.reference}\n\nVerify: ${d.adminUrl}`
  };
}

function approvalWelcome(d) {
  return {
    subject: `Your ${d.platformName} account is ready`,
    html: wrapHtml({
      title: 'Account approved',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Welcome aboard, ${d.userName}!</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Your account for <strong>${d.storeName}</strong> has been approved and is now active.</p>

        <table cellpadding="0" cellspacing="0" style="margin:16px 0;background:#f9fafb;border-radius:6px;padding:16px;width:100%;">
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Plan</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.planName}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Active from</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.periodStart}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Renews on</td><td style="padding:6px 0;font-size:14px;text-align:right;font-weight:600;">${d.periodEnd}</td></tr>
        </table>

        ${d.licenseKey ? `
        <div style="margin:24px 0;padding:20px;background:#f0f4ff;border:1px solid #1e3a8a;border-radius:8px;">
          <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your license key</p>
          <p style="margin:0;font-family:'Courier New',monospace;font-size:20px;font-weight:700;color:#1e3a8a;letter-spacing:1px;word-break:break-all;">${d.licenseKey}</p>
          <p style="margin:12px 0 0;font-size:12px;color:#6b7280;line-height:1.6;">Save this key somewhere safe — you'll need it to activate your desktop and mobile devices.</p>
        </div>
        ` : ''}

        <p style="margin:24px 0;">${button('Log in to SmartPOS', d.loginUrl)}</p>
      `
    }),
    text: `Welcome ${d.userName}! Your ${d.storeName} account is active.\nPlan: ${d.planName}\nActive from: ${d.periodStart}\nRenews: ${d.periodEnd}\n${d.licenseKey ? `\nLicense Key: ${d.licenseKey}\nSave this key somewhere safe.\n` : ''}\nLogin: ${d.loginUrl}`
  };
}

function rejection(d) {
  return {
    subject: `Update on your ${d.platformName} signup`,
    html: wrapHtml({
      title: 'Signup update',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">We couldn't activate your account</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, after reviewing your signup for <strong>${d.storeName}</strong>, we're unable to activate your account at this time.</p>
        ${d.reason ? `<p style="margin:0 0 16px;line-height:1.6;"><strong>Reason:</strong> ${d.reason}</p>` : ''}
        <p style="margin:0 0 16px;line-height:1.6;">A refund has been issued. It may take 5–10 business days to appear.</p>
        <p style="margin:16px 0 0;line-height:1.6;">If you believe this is a mistake, contact us.</p>
      `
    }),
    text: `Hi ${d.userName}, we couldn't activate your account for ${d.storeName}.\nReason: ${d.reason || 'N/A'}\nA refund has been issued.\nSupport: ${d.supportEmail}`
  };
}

function passwordReset(d) {
  return {
    subject: `Reset your ${d.platformName} password`,
    html: wrapHtml({
      title: 'Reset password',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Reset your password</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, click below to reset your password. This link expires in 1 hour.</p>
        <p style="margin:24px 0;">${button('Reset password', d.resetUrl)}</p>
        <p style="margin:16px 0 0;line-height:1.6;color:#6b7280;font-size:14px;">If you didn't request this, ignore this email.</p>
      `
    }),
    text: `Hi ${d.userName}, reset your password: ${d.resetUrl}\nExpires in 1 hour.`
  };
}

function emailVerification(d) {
  return {
    subject: `Verify your email`,
    html: wrapHtml({
      title: 'Verify email',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Verify your email</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, please verify your email address to continue.</p>
        <p style="margin:24px 0;">${button('Verify email', d.verifyUrl)}</p>
      `
    }),
    text: `Hi ${d.userName}, verify your email: ${d.verifyUrl}`
  };
}

function adminInvite(d) {
  return {
    subject: `You've been invited to ${d.platformName} Admin`,
    html: wrapHtml({
      title: 'Admin invite',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Welcome, ${d.userName}!</h1>
        <p style="margin:0 0 16px;line-height:1.6;">You've been invited to the ${d.platformName} admin panel.</p>
        <table cellpadding="0" cellspacing="0" style="margin:16px 0;background:#f9fafb;border-radius:6px;padding:16px;width:100%;">
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Email</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.userName}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Temp password</td><td style="padding:6px 0;font-size:14px;text-align:right;font-family:monospace;font-weight:600;">${d.tempPassword}</td></tr>
        </table>
        <p style="margin:24px 0;">${button('Log in', d.loginUrl)}</p>
        <p style="margin:16px 0 0;line-height:1.6;color:#6b7280;font-size:14px;">Please change your password after your first login.</p>
      `
    }),
    text: `Welcome ${d.userName}! You've been invited to ${d.platformName} admin.\nTemp password: ${d.tempPassword}\nLogin: ${d.loginUrl}`
  };
}

function renewalReminder7(d) {
  return {
    subject: `Your plan renews in 7 days`,
    html: wrapHtml({
      title: 'Renewal soon',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Renewal in 7 days</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, your <strong>${d.planName}</strong> plan renews on <strong>${d.periodEnd}</strong> for ${d.amount}.</p>
        <p style="margin:16px 0;line-height:1.6;color:#6b7280;font-size:14px;">No action needed. We'll charge your saved payment method automatically.</p>
        <p style="margin:24px 0;">${button('Manage billing', d.portalUrl)}</p>
      `
    }),
    text: `Hi ${d.userName}, your ${d.planName} plan renews on ${d.periodEnd} for ${d.amount}.\nManage: ${d.portalUrl}`
  };
}

function renewalReminder1(d) {
  return {
    subject: `Your plan renews tomorrow`,
    html: wrapHtml({
      title: 'Renewal tomorrow',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Renewal tomorrow</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, your <strong>${d.planName}</strong> plan renews tomorrow for ${d.amount}.</p>
        <p style="margin:24px 0;">${button('Manage billing', d.portalUrl)}</p>
      `
    }),
    text: `Hi ${d.userName}, your ${d.planName} plan renews tomorrow for ${d.amount}. Manage: ${d.portalUrl}`
  };
}

function renewalReceived(d) {
  return {
    subject: `Renewal received — your plan is active`,
    html: wrapHtml({
      title: 'Renewal received',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Renewal received</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, your <strong>${d.planName}</strong> plan for <strong>${d.storeName}</strong> has been renewed successfully.</p>
        <table cellpadding="0" cellspacing="0" style="margin:16px 0;background:#f9fafb;border-radius:6px;padding:16px;width:100%;">
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Amount</td><td style="padding:6px 0;font-size:14px;text-align:right;font-weight:600;">${d.amount}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Reference</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.reference || '—'}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">New period ends</td><td style="padding:6px 0;font-size:14px;text-align:right;font-weight:600;">${d.periodEnd}</td></tr>
        </table>
        <p style="margin:24px 0;">${button('Manage billing', d.portalUrl)}</p>
      `
    }),
    text: `Hi ${d.userName}, your ${d.planName} plan has been renewed.\nAmount: ${d.amount}\nReference: ${d.reference}\nNew period ends: ${d.periodEnd}\n\nManage: ${d.portalUrl}`
  };
}

function paymentFailed(d) {
  return {
    subject: `Payment failed — action needed`,
    html: wrapHtml({
      title: 'Payment failed',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">We couldn't process your payment</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, we couldn't charge your payment method for <strong>${d.planName}</strong>.</p>
        <p style="margin:0 0 16px;line-height:1.6;">Please update your payment method within ${d.graceDays} days to avoid suspension.</p>
        <p style="margin:24px 0;">${button('Update payment method', d.portalUrl)}</p>
      `
    }),
    text: `Hi ${d.userName}, payment failed. Update: ${d.portalUrl}\nGrace period: ${d.graceDays} days.`
  };
}

function renewalGrace7(d) {
  return {
    subject: `7 days until suspension`,
    html: wrapHtml({
      title: 'Account at risk',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">7 days left before suspension</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, we still can't process your payment. Update your method within 7 days to avoid suspension.</p>
        <p style="margin:24px 0;">${button('Update payment method', d.portalUrl)}</p>
      `
    }),
    text: `Hi ${d.userName}, 7 days left before suspension. Update: ${d.portalUrl}`
  };
}

function suspended(d) {
  return {
    subject: `Your account is suspended`,
    html: wrapHtml({
      title: 'Account suspended',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Your account is suspended</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, your <strong>${d.storeName}</strong> account has been suspended because we couldn't process your renewal payment.</p>
        <p style="margin:0 0 16px;line-height:1.6;">Your data is safe. Renew to restore access immediately.</p>
        <p style="margin:24px 0;">${button('Restore account', d.renewUrl)}</p>
      `
    }),
    text: `Hi ${d.userName}, your account is suspended. Your data is safe. Restore: ${d.renewUrl}`
  };
}

function accountSuspended(d) {
  return {
    subject: `Your ${d.platformName} account has been suspended`,
    html: wrapHtml({
      title: 'Account suspended',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;color:#b91c1c;">Account suspended</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, your account for <strong>${d.storeName}</strong> has been suspended by an administrator.</p>
        ${d.reason ? `<table cellpadding="0" cellspacing="0" style="margin:16px 0;background:#fef2f2;border-radius:6px;padding:16px;width:100%;">
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Reason</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.reason}</td></tr>
        </table>` : ''}
        <p style="margin:0 0 16px;line-height:1.6;">Your data is safe. Contact support to resolve this.</p>
      `
    }),
    text: `Hi ${d.userName}, your ${d.storeName} account has been suspended.${d.reason ? `\nReason: ${d.reason}` : ''}\n\nSupport: ${d.supportEmail}`
  };
}

function restored(d) {
  return {
    subject: `Your account is active again`,
    html: wrapHtml({
      title: 'Account restored',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Welcome back</h1>
        <p style="margin:0 0 16px;line-height:1.6;">Hi ${d.userName}, your payment was received and your account is active again.</p>
        <p style="margin:24px 0;">${button('Log in', d.loginUrl)}</p>
      `
    }),
    text: `Hi ${d.userName}, your account is active again. Login: ${d.loginUrl}`
  };
}

function backupComplete(d) {
  return {
    subject: `Backup completed — ${d.fileName}`,
    html: wrapHtml({
      title: 'Backup completed',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;">Backup completed</h1>
        <p style="margin:0 0 16px;line-height:1.6;">A database backup completed successfully.</p>
        <table cellpadding="0" cellspacing="0" style="margin:16px 0;background:#f9fafb;border-radius:6px;padding:16px;width:100%;">
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">File</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.fileName}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Size</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.sizeHuman}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Documents</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.documentCount}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Duration</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.durationHuman}</td></tr>
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Completed</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.completedAt}</td></tr>
        </table>
        <p style="margin:24px 0;">${button('View backups', d.adminUrl)}</p>
      `
    }),
    text: `Backup completed.\nFile: ${d.fileName}\nSize: ${d.sizeHuman}\nDocuments: ${d.documentCount}\nDuration: ${d.durationHuman}\nCompleted: ${d.completedAt}`
  };
}

function backupFailed(d) {
  return {
    subject: `Backup failed`,
    html: wrapHtml({
      title: 'Backup failed',
      supportEmail: d.supportEmail,
      supportPhone: d.supportPhone,
      platformName: d.platformName,
      logoUrl: d.logoUrl,
      body: `
        <h1 style="margin:0 0 16px;font-size:22px;color:#b91c1c;">Backup failed</h1>
        <p style="margin:0 0 16px;line-height:1.6;">A database backup failed on ${d.startedAt}.</p>
        <table cellpadding="0" cellspacing="0" style="margin:16px 0;background:#fef2f2;border-radius:6px;padding:16px;width:100%;">
          <tr><td style="padding:6px 0;font-size:14px;color:#6b7280;">Error</td><td style="padding:6px 0;font-size:14px;text-align:right;">${d.error}</td></tr>
        </table>
        <p style="margin:24px 0;">${button('View in admin', d.adminUrl)}</p>
      `
    }),
    text: `Backup failed on ${d.startedAt}.\nError: ${d.error}`
  };
}

module.exports = {
  trialWelcome,
  trialReminder7,
  trialReminder1,
  trialExpired,
  paymentReceived,
  adminNewSignup,
  adminPendingRenewal,
  approvalWelcome,
  rejection,
  passwordReset,
  emailVerification,
  adminInvite,
  renewalReminder7,
  renewalReminder1,
  renewalReceived,
  paymentFailed,
  renewalGrace7,
  suspended,
  accountSuspended,
  restored,
  backupComplete,
  backupFailed
};