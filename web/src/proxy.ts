import { NextResponse, type NextRequest } from "next/server";
import { RESERVED_HANDLES } from "@/lib/site";

export function proxy(request: NextRequest): NextResponse {
  const { pathname, searchParams } = request.nextUrl;
  const segment: string = pathname.slice(1);
  const isListing: boolean = segment === "product";
  if (
    searchParams.size === 0 ||
    segment.includes("/") ||
    (!isListing && RESERVED_HANDLES.includes(segment))
  )
    return NextResponse.next();
  const target: URL = request.nextUrl.clone();
  target.pathname = isListing ? "/catalog-query" : `/catalog-query/${segment}`;
  return NextResponse.rewrite(target);
}

export const config = {
  matcher: ["/product", "/:handle([^.]*)"],
};
