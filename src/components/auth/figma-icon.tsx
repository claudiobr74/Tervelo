export function FigmaIcon({
  src,
  alt = "",
  size,
}: {
  src: string;
  alt?: string;
  size: number;
}) {
  return (
    <span
      className="relative inline-block shrink-0 overflow-clip"
      style={{ width: size, height: size }}
    >
      {/* Asset exportado do Figma — não redesenhar o glifo. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={size} height={size} className="size-full object-contain" />
    </span>
  );
}
