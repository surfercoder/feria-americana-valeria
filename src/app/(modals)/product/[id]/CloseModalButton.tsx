"use client";
export default function CloseModalButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="absolute top-4 right-4 bg-white text-black px-5 py-2 rounded font-semibold text-base shadow-lg border border-gray-300 hover:bg-gray-100 transition z-50 cursor-pointer"
      aria-label="Cerrar"
      type="button"
    >
      Cerrar
    </button>
  );
} 