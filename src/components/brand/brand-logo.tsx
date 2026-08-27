/** Marca oficial. `logo.webp` é o original sem alteração; `logo-dark.webp` é só a inversão para Dark. */

const SIZE = { width: 2000, height: 667 } as const;

export function BrandLogo({
  className = "h-16 w-auto max-w-[260px]",
  alt = "TERVELO",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <span role="img" aria-label={alt} className="inline-flex max-w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo.webp"
        alt=""
        width={SIZE.width}
        height={SIZE.height}
        className={`object-contain object-left dark:hidden ${className}`.trim()}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/logo-dark.webp"
        alt=""
        width={SIZE.width}
        height={SIZE.height}
        className={`hidden object-contain object-left dark:block ${className}`.trim()}
      />
    </span>
  );
}
