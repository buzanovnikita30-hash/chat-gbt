"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-heading text-2xl font-bold text-gray-900">Страница временно недоступна</h1>
      <p className="mt-3 max-w-md text-sm text-gray-600">
        Попробуйте обновить. Если ошибка повторяется — напишите в поддержку, витрина и тарифы должны
        открываться даже при сбое базы.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-xl bg-[#10a37f] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Попробовать снова
      </button>
    </div>
  );
}
