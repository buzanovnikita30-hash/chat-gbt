export function normalizeEmailForAuth(rawEmail: string): string {
  const value = rawEmail.trim().toLowerCase();

  if (value.endsWith("gmailcom")) {
    return value.replace(/gmailcom$/, "gmail.com");
  }

  if (value.endsWith("mailru")) {
    return value.replace(/mailru$/, "mail.ru");
  }

  return value;
}

