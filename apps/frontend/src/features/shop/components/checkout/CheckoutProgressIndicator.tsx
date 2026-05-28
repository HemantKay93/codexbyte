export function CheckoutProgressIndicator() {
  return (
    <nav className="mb-12 flex justify-center md:justify-start items-center gap-4 md:gap-12">
      <div className="flex items-center gap-3 text-stitch-primary border-b-2 border-stitch-primary pb-2 px-1">
        <span className="font-stitch-label-sm text-stitch-label-sm">01</span>
        <span className="font-stitch-headline-lg-mobile text-stitch-headline-lg-mobile uppercase tracking-widest">
          Address
        </span>
      </div>
      <div className="h-[1px] w-8 md:w-16 bg-stitch-outline-variant/30"></div>
      <div className="flex items-center gap-3 text-stitch-outline pb-2 px-1">
        <span className="font-stitch-label-sm text-stitch-label-sm">02</span>
        <span className="font-stitch-headline-lg-mobile text-stitch-headline-lg-mobile uppercase tracking-widest">
          Payment
        </span>
      </div>
      <div className="h-[1px] w-8 md:w-16 bg-stitch-outline-variant/30"></div>
      <div className="flex items-center gap-3 text-stitch-outline pb-2 px-1">
        <span className="font-stitch-label-sm text-stitch-label-sm">03</span>
        <span className="font-stitch-headline-lg-mobile text-stitch-headline-lg-mobile uppercase tracking-widest">
          Review
        </span>
      </div>
    </nav>
  );
}
