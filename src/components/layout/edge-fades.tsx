/**
 * Two white-to-transparent plates that soften the viewport edges: one under the
 * sticky header, one along the bottom. Without them content is cut flat where it
 * meets the header and the viewport edge; with them it dissolves.
 *
 * The top plate starts at the header's height (h-44): the header paints its own
 * area, and the fade runs from where that ends down into the page. Both are
 * fixed and pointer-transparent so they never intercept a click.
 */
export function EdgeFades() {
  return (
    <>
      <div
        aria-hidden
        className="from-background pointer-events-none fixed inset-x-0 top-44 z-40 h-16 bg-linear-to-b to-transparent"
      />
      <div
        aria-hidden
        className="from-background pointer-events-none fixed inset-x-0 bottom-0 z-40 h-16 bg-linear-to-t to-transparent"
      />
    </>
  );
}
