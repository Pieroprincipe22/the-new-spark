import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "sorteo@the-new-spark.es";
const FROM_NAME = "The New Spark";

export async function sendWinnerEmail(input: {
  toEmail: string;
  toName: string;
  prizeName: string;
  instagramHandle: string | null;
}): Promise<void> {

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>¡Has ganado el sorteo!</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0a0a0a;border:1px solid #222222;border-radius:12px;overflow:hidden;">

          <!-- Cabecera -->
          <tr>
            <td style="padding:40px 40px 32px;border-bottom:1px solid #222222;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.35em;text-transform:uppercase;color:#666666;">
                The New Spark
              </p>
              <h1 style="margin:0;font-size:32px;font-weight:900;color:#ffffff;text-transform:uppercase;letter-spacing:-0.02em;line-height:1.1;">
                ¡Felicidades,<br/>${input.toName}!
              </h1>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 24px;font-size:16px;color:#aaaaaa;line-height:1.6;">
                Has sido seleccionado como ganador del sorteo de
                <strong style="color:#ffffff;">The New Spark</strong>.
                Tu premio es:
              </p>

              <!-- Premio -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #333333;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#666666;">
                      Tu premio
                    </p>
                    <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;text-transform:uppercase;">
                      ${input.prizeName}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:15px;color:#aaaaaa;line-height:1.6;">
                Para reclamar tu premio tienes <strong style="color:#ffffff;">7 días</strong>
                desde la recepción de este email. Contáctanos por cualquiera de estos medios:
              </p>

              <!-- Contacto -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td width="50%" style="padding-right:8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #333333;border-radius:8px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#666666;">WhatsApp</p>
                          <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;">+34 624 54 15 95</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="50%" style="padding-left:8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;border:1px solid #333333;border-radius:8px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:#666666;">Instagram</p>
                          <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;">@nthenewspark</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#555555;line-height:1.6;">
                Si no reclamas el premio en 7 días, quedará desierto.
                Este email se envió a ${input.toEmail}.
              </p>
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #222222;">
              <p style="margin:0;font-size:11px;color:#444444;text-align:center;">
                The New Spark · Barbería · @nthenewspark · www.the-new-spark.es
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const { error } = await resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [input.toEmail],
    subject: `🎉 ¡Has ganado el sorteo de The New Spark!`,
    html,
  });

  if (error) {
    throw new Error(`Error enviando email: ${error.message}`);
  }
}