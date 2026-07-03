const transporter = require("../config/mail");

const sendRecruiterInvitationEmail = async ({
  recruiterName,
  email,
  companyName,
  designation,
  department,
  invitationUrl,
}) => {
  const mailOptions = {
    from: `"AI Interview Platform" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: `You're invited to join ${companyName} on AI Interview Platform`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 20px;">

              <table width="650" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 15px rgba(0,0,0,.08);">

                <tr>
                  <td style="background:#16a34a;padding:25px;text-align:center;">
                    <h1 style="color:white;margin:0;">
                      AI Interview Platform
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:40px;">

                    <h2 style="margin-top:0;color:#111827;">
                      Hello ${recruiterName},
                    </h2>

                    <p style="font-size:16px;color:#4b5563;line-height:1.7;">
                      <strong>${companyName}</strong> has invited you to join
                      their recruitment team.
                    </p>

                    <table
                      width="100%"
                      cellpadding="12"
                      cellspacing="0"
                      style="background:#f9fafb;border-radius:8px;margin:25px 0;"
                    >
                      <tr>
                        <td><strong>Company</strong></td>
                        <td>${companyName}</td>
                      </tr>

                      <tr>
                        <td><strong>Designation</strong></td>
                        <td>${designation}</td>
                      </tr>

                      <tr>
                        <td><strong>Department</strong></td>
                        <td>${department}</td>
                      </tr>

                      <tr>
                        <td><strong>Email</strong></td>
                        <td>${email}</td>
                      </tr>
                    </table>

                    <div style="text-align:center;margin:40px 0;">

                      <a
                        href="${invitationUrl}"
                        style="
                          background:#16a34a;
                          color:white;
                          padding:16px 35px;
                          text-decoration:none;
                          border-radius:8px;
                          font-size:16px;
                          font-weight:bold;
                          display:inline-block;
                        "
                      >
                        Accept Invitation
                      </a>

                    </div>

                    <p style="color:#dc2626;font-weight:bold;">
                      This invitation will expire in 7 days.
                    </p>

                    <p style="color:#6b7280;font-size:14px;">
                      If you were not expecting this invitation,
                      you can safely ignore this email.
                    </p>

                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      background:#f3f4f6;
                      text-align:center;
                      padding:20px;
                      color:#6b7280;
                      font-size:13px;
                    "
                  >
                    © ${new Date().getFullYear()} AI Interview Platform.
                    All Rights Reserved.
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

console.log("========== FULL SMTP RESPONSE ==========");
console.dir(info, { depth: null });
console.log("========================================");
};

module.exports = {
  sendRecruiterInvitationEmail,
};