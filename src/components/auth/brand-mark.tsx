import { FigmaIcon } from "@/components/auth/figma-icon";

export function BrandMark({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 pb-10 pt-[60px]">
      <div className="flex items-center gap-2">
        <FigmaIcon src="/brand/dumbbell-logo.svg" alt="" size={28} className="text-brand" />
        <p className="text-[28px] font-extrabold tracking-tight text-foreground">TERVELO</p>
      </div>
      {subtitle ? (
        <p className="w-full text-center text-[15px] font-normal text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}
