// Optional secrets are not listed in wrangler.jsonc "required", so the generated
// types do not know them. Declared here so the code can read them safely.
interface Env {
  STELLAR_WHOLESALE_KEY?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}
