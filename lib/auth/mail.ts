import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let cachedTransporter: Transporter | null = null;
let transporterUnavailable = false;

function getAppUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}

function getTransport(): Transporter | null {
  if (transporterUnavailable) return null;
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 1025);
  if (!host) {
    transporterUnavailable = true;
    return null;
  }

  const user = process.env.SMTP_USER || undefined;
  const pass = process.env.SMTP_PASS || undefined;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });
  return cachedTransporter;
}

const FROM = () => process.env.MAIL_FROM ?? "DoWhat <noreply@dowhat.local>";

type SendArgs = { to: string; subject: string; text: string; html: string };

async function send(args: SendArgs): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    // Dev fallback when SMTP isn't configured / reachable: log so developer can still test.
    console.warn(`[mail] SMTP unavailable, dropping message to ${args.to}: ${args.subject}`);
    console.warn(`[mail] body: ${args.text}`);
    return;
  }
  try {
    await transport.sendMail({ from: FROM(), ...args });
  } catch (err) {
    console.error("[mail] failed to send:", err);
    console.warn(`[mail] fallback link for ${args.to}: ${args.text}`);
  }
}

export async function sendVerifyEmail(to: string, token: string): Promise<void> {
  const link = `${getAppUrl()}/verify?token=${encodeURIComponent(token)}`;
  await send({
    to,
    subject: "DoWhat · 请验证你的邮箱",
    text: `欢迎加入 DoWhat。请点击以下链接完成邮箱验证（24 小时内有效）：\n${link}\n\n如果你没有注册过 DoWhat，可以忽略本邮件。`,
    html: `<p>欢迎加入 <strong>DoWhat</strong>。</p>
<p>请点击下方链接完成邮箱验证（24 小时内有效）：</p>
<p><a href="${link}">${link}</a></p>
<p>如果你没有注册过 DoWhat，可以忽略本邮件。</p>`,
  });
}

export async function sendResetEmail(to: string, token: string): Promise<void> {
  const link = `${getAppUrl()}/reset?token=${encodeURIComponent(token)}`;
  await send({
    to,
    subject: "DoWhat · 重置密码",
    text: `我们收到一封重置 DoWhat 账户密码的请求。请点击以下链接重置密码（1 小时内有效）：\n${link}\n\n如果你没有发起此请求，可以忽略本邮件。`,
    html: `<p>我们收到一封重置 <strong>DoWhat</strong> 账户密码的请求。</p>
<p>请点击下方链接重置密码（1 小时内有效）：</p>
<p><a href="${link}">${link}</a></p>
<p>如果你没有发起此请求，可以忽略本邮件。</p>`,
  });
}
