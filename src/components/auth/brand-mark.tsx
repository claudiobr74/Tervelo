import { BrandLogo } from "@/components/brand/brand-logo";

export function BrandMark({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 pb-10 pt-[60px]">
      <BrandLogo className="h-[88px] w-auto max-w-full" />
      {subtitle ? (
        <p className="w-full text-center text-[15px] font-normal text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}
