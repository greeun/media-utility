/**
 * Next.js App Router: shown while the page segment is loading (chunk fetch, module load).
 * Covers all routes under [locale]: /ko, /ko/watermark, /ko/image-converter, etc.
 */
export default function LocaleLoading() {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center bg-white px-6"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div
        className="w-14 h-14 border-4 border-black border-t-transparent animate-spin motion-reduce:animate-none"
        aria-hidden
      />
      <p className="mt-6 text-lg font-bold uppercase tracking-wide text-black">
        Loading
      </p>
      <p className="mt-2 text-sm font-bold text-gray-900">
        Please wait...
      </p>
    </div>
  );
}
