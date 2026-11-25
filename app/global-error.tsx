"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 520, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Сайт временно недоступен</h1>
        <p style={{ marginTop: 12, color: "#4b5563", fontSize: 14, lineHeight: 1.5 }}>
          Обновите страницу через минуту. Если снова ошибка — проблема на стороне приложения за nginx,
          не домена.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            borderRadius: 12,
            border: "none",
            background: "#10a37f",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Повторить
        </button>
      </body>
    </html>
  );
}
