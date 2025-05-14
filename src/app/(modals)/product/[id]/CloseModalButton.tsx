"use client";
export default function CloseModalButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl font-bold"
      aria-label="Cerrar"
      type="button"
    >
      ×
    </button>
  );
} 