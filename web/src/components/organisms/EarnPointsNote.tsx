import { InfoIcon } from "@/components/atoms/Icons";

interface EarnPointsNoteProps {
  points: number;
}

export function EarnPointsNote({ points }: EarnPointsNoteProps) {
  return (
    <p className="flex items-center justify-between gap-2 rounded-lg border border-[#e2a7a1] bg-[#ffdad1] px-3 py-2 text-xs font-medium text-[#825650]">
      <span>You will earn {points} Tingle Points on this order.</span>
      <span className="group relative inline-flex shrink-0 cursor-help" tabIndex={0} aria-describedby="earn-points-tip">
        <InfoIcon width={14} height={14} aria-hidden />
        <span
          id="earn-points-tip"
          role="tooltip"
          className="pointer-events-none absolute bottom-full right-0 z-10 mb-2 w-52 rounded-md border border-[#e2a7a1] bg-[#ffdad1] px-3 py-2 text-xs font-medium text-[#825650] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100"
        >
          These points can be redeemed in your next order. 1 point = ₹1
        </span>
      </span>
    </p>
  );
}
