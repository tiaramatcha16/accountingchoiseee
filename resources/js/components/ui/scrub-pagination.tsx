import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type NavProps = React.ComponentProps<"nav">;

export type ScrubPaginationItem = number | "start-ellipsis" | "end-ellipsis";

export type ScrubPaginationLabels = {
  previous?: React.ReactNode;
  next?: React.ReactNode;
  /** Text of the tooltip above the handle, e.g. "Page 37 / 120". */
  pageOf?: (page: number, count: number) => string;
  /** Spoken value of the scrubber and of the live region, e.g. "Page 37 of 120". */
  valueText?: (page: number, count: number) => string;
  /** Accessible name of a page button. */
  page?: (page: number) => string;
  jumpTo?: string;
  scrub?: string;
  pagination?: string;
};

export type ScrubPaginationProps = NavProps & {
  page?: number;
  defaultPage?: number;
  pageCount: number;
  /** Fires when a page is committed: a click, a key, Enter in the jump field or releasing the handle. */
  onPageChange?: (page: number) => void;
  /** Fires while the handle is dragged, each time the page under it changes. Nothing is committed yet. */
  onScrub?: (page: number) => void;
  /** Page buttons on each side of the current page. */
  siblingCount?: number;
  /** Page buttons kept at each end. */
  boundaryCount?: number;
  showTrack?: boolean;
  /** The "7 / 120" summary at the end of the row. */
  showSummary?: boolean;
  /** A tick on the track every n pages; PageUp/PageDown on the handle move by the same amount. 0 hides the ticks. */
  tickEvery?: number;
  labels?: ScrubPaginationLabels;
  size?: "sm" | "md";
  /** Called on any pointer or key interaction. Hosts use it to stop tours or demos. */
  onInteractionStart?: (event: React.SyntheticEvent) => void;
};

type Box = { left: number; width: number };
type Drag = { pointerId: number; left: number; width: number };
type Jump = { key: "start-ellipsis" | "end-ellipsis"; phase: "open" | "closing"; from: number };

/** Handle size in CSS px; the handle centre travels from HALF to width − HALF so it never hangs over the track ends. */
export const SCRUB_THUMB_WIDTH = 28;
const HALF = SCRUB_THUMB_WIDTH / 2;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const FLIP_EASE = "cubic-bezier(0.45, 0, 0.2, 1)";
const FLIP_MS = 220;
const SNAP_MS = 120;
const TIP_MS = 120;
const DIGITS = Array.from({ length: 10 }, (_, index) => index);

const SIZE = {
  md: { px: 32, jump: 64, h: "h-8", button: "h-8 min-w-8 px-1.5 text-[13px]", nav: "h-8 gap-1 px-2 text-[13px]", summary: "text-xs", icon: "size-3.5" },
  sm: { px: 28, jump: 56, h: "h-7", button: "h-7 min-w-7 px-1 text-xs", nav: "h-7 gap-1 px-1.5 text-xs", summary: "text-[11px]", icon: "size-3" },
} as const;

const DEFAULT_LABELS = {
  previous: "Prev",
  next: "Next",
  pageOf: (page: number, count: number) => `Page ${page} / ${count}`,
  valueText: (page: number, count: number) => `Page ${page} of ${count}`,
  page: (page: number) => `Page ${page}`,
  jumpTo: "Jump to page",
  scrub: "Scrub through pages",
  pagination: "Pagination",
};

const clampNumber = (value: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, value));
const wholeCount = (value: number) => Math.max(1, Math.floor(Number.isFinite(value) ? value : 1) || 1);
const wholeOrZero = (value: number | undefined, fallback: number) => Math.max(0, Math.floor(Number.isFinite(value) ? (value as number) : fallback) || 0);

/** The row of page buttons for `page`: boundary pages at both ends, siblings around the current page, ellipses between. The length stays constant while `pageCount` is large enough. */
export function paginationRange(page: number, pageCount: number, siblingCount = 1, boundaryCount = 1): ScrubPaginationItem[] {
  const count = wholeCount(pageCount);
  const siblings = wholeOrZero(siblingCount, 1);
  const boundary = wholeOrZero(boundaryCount, 1);
  const current = clampNumber(Math.round(page) || 1, 1, count);
  const range = (start: number, end: number) => Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
  const startPages = range(1, Math.min(boundary, count));
  const endPages = range(Math.max(count - boundary + 1, boundary + 1), count);
  const siblingsStart = Math.max(Math.min(current - siblings, count - boundary - siblings * 2 - 1), boundary + 2);
  const siblingsEnd = Math.min(Math.max(current + siblings, boundary + siblings * 2 + 2), endPages.length > 0 ? (endPages[0] ?? count) - 2 : count - 1);
  const items: ScrubPaginationItem[] = [...startPages];
  if (siblingsStart > boundary + 2) items.push("start-ellipsis");
  else if (boundary + 1 < count - boundary) items.push(boundary + 1);
  items.push(...range(siblingsStart, siblingsEnd));
  if (siblingsEnd < count - boundary - 1) items.push("end-ellipsis");
  else if (count - boundary > boundary) items.push(count - boundary);
  items.push(...endPages);
  return items;
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(true);
  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Whole-label roll: the old text slides out one way and the new text slides in from the other, so a row of page numbers reads as re-labelled. */
function Roll({ text, up, reduced, duration }: { text: string; up: boolean; reduced: boolean; duration: number }) {
  const [state, setState] = React.useState({ text, leaving: null as string | null, up });
  const inRef = React.useRef(null as HTMLSpanElement | null);
  const outRef = React.useRef(null as HTMLSpanElement | null);
  const timer = React.useRef(0);

  React.useLayoutEffect(() => {
    if (text === state.text) return;
    if (reduced) { setState({ text, leaving: null, up }); return; }
    setState({ text, leaving: state.text, up });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState((current) => ({ ...current, leaving: null })), duration);
  }, [text]);

  React.useLayoutEffect(() => {
    if (state.leaving === null) return;
    const sign = state.up ? 1 : -1;
    const options = { duration, easing: EASE };
    if (inRef.current && typeof inRef.current.animate === "function") inRef.current.animate([{ transform: `translateY(${sign * 100}%)`, opacity: 0 }, { transform: "translateY(0)", opacity: 1 }], options);
    if (outRef.current && typeof outRef.current.animate === "function") outRef.current.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: `translateY(${-sign * 100}%)`, opacity: 0 }], { ...options, fill: "forwards" });
  }, [state.leaving, state.text]);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <span data-roll={text} aria-hidden="true" className="relative inline-grid h-[1em] overflow-hidden leading-none">
      <span ref={inRef} data-roll-in className="col-start-1 row-start-1 block h-[1em] text-center leading-none">{state.text}</span>
      {state.leaving !== null && <span ref={outRef} data-roll-out className="col-start-1 row-start-1 block h-[1em] text-center leading-none">{state.leaving}</span>}
    </span>
  );
}

/** Odometer text: every digit sits in a column that rolls to its value; other characters stay put. */
function Odometer({ text, reduced, duration, className = "" }: { text: string; reduced: boolean; duration: number; className?: string }) {
  const chars = Array.from(text);
  return (
    <span data-odometer={text} className={`inline-flex items-end leading-none whitespace-nowrap tabular-nums ${className}`}>
      <span className="sr-only">{text}</span>
      {chars.map((character, index) => {
        const key = chars.length - index;
        if (!/\d/.test(character)) return <span key={key} aria-hidden="true" className="block h-[1em] whitespace-pre">{character}</span>;
        return (
          <span key={key} aria-hidden="true" className="relative block h-[1em] w-[0.6em] overflow-hidden">
            <span data-digit={character} className="block" style={{ transform: `translateY(-${character}em)`, transition: reduced ? "none" : `transform ${duration}ms ${EASE}` }}>
              {DIGITS.map((digit) => <span key={digit} className="block h-[1em] text-center">{digit}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function ScrubPagination({
  page: pageProp,
  defaultPage,
  pageCount,
  onPageChange,
  onScrub,
  siblingCount = 1,
  boundaryCount = 1,
  showTrack = true,
  showSummary = true,
  tickEvery = 10,
  labels: labelsProp,
  size = "md",
  onInteractionStart,
  className = "",
  ref,
  onPointerDownCapture,
  onKeyDownCapture,
  ...rest
}: ScrubPaginationProps) {
  const reduced = useReducedMotion();
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const S = SIZE[size];
  const count = wholeCount(pageCount);
  const clampPage = (value: number) => clampNumber(Math.round(Number.isFinite(value) ? value : 1) || 1, 1, count);
  const [localPage, setLocalPage] = React.useState(() => clampPage(defaultPage ?? pageProp ?? 1));
  const page = clampPage(pageProp ?? localPage);
  const items = paginationRange(page, count, siblingCount, boundaryCount);
  const itemsKey = items.join("|");
  const tick = wholeOrZero(tickEvery, 10);
  const keyStep = tick > 0 ? tick : 10;

  const [drag, setDrag] = React.useState(null as { fraction: number } | null);
  const [hoverX, setHoverX] = React.useState(null as number | null);
  const [focused, setFocused] = React.useState(false);
  const [linger, setLinger] = React.useState(false);
  const [jump, setJump] = React.useState(null as Jump | null);
  const [trackWidth, setTrackWidth] = React.useState(0);
  const [tipWidth, setTipWidth] = React.useState(0);
  const [announce, setAnnounce] = React.useState("");

  const navRef = React.useRef(null as HTMLElement | null);
  const pagesRef = React.useRef(null as HTMLDivElement | null);
  const pillRef = React.useRef(null as HTMLSpanElement | null);
  const pillBox = React.useRef(null as Box | null);
  const pillAnim = React.useRef(null as Animation | null);
  const trackRef = React.useRef(null as HTMLDivElement | null);
  const thumbRef = React.useRef(null as HTMLDivElement | null);
  const tipRef = React.useRef(null as HTMLDivElement | null);
  const tipAnim = React.useRef(null as Animation | null);
  const tipPrevWidth = React.useRef(0);
  const jumpRef = React.useRef(null as HTMLSpanElement | null);
  const inputRef = React.useRef(null as HTMLInputElement | null);
  const dragRef = React.useRef(null as Drag | null);
  const lastScrub = React.useRef(page);
  const prevPage = React.useRef(page);
  const pointerFocus = React.useRef(false);
  const pendingFocus = React.useRef("" as "" | "page" | "ellipsis");
  const jumpState = React.useRef(jump);
  const announceTimer = React.useRef(0);
  const lingerTimer = React.useRef(0);
  const reducedRef = React.useRef(reduced);
  reducedRef.current = reduced;
  jumpState.current = jump;

  const travel = Math.max(0, trackWidth - SCRUB_THUMB_WIDTH);
  const fractionOf = (value: number) => (count > 1 ? (value - 1) / (count - 1) : 0);
  const fractionAt = (x: number, width: number) => clampNumber((x - HALF) / Math.max(1, width - SCRUB_THUMB_WIDTH), 0, 1);
  const pageAt = (fraction: number) => 1 + Math.round(fraction * (count - 1));
  const livePage = drag ? pageAt(drag.fraction) : page;
  const thumbX = HALF + (drag ? drag.fraction : fractionOf(page)) * travel;
  const hoverPage = hoverX !== null ? pageAt(fractionAt(hoverX, trackWidth)) : null;
  const tipPage = drag ? livePage : hoverPage ?? page;
  const tipAnchor = drag ? thumbX : hoverX !== null ? clampNumber(hoverX, HALF, Math.max(HALF, trackWidth - HALF)) : thumbX;
  const tipOpen = !!drag || hoverX !== null || focused || linger;
  const tipText = labels.pageOf(tipPage, count);
  const tipHalf = tipWidth / 2;
  const tipLeft = trackWidth > 0 ? clampNumber(tipAnchor, Math.min(tipHalf, trackWidth / 2), Math.max(trackWidth - tipHalf, trackWidth / 2)) : tipAnchor;
  const up = page >= prevPage.current;

  let tickStep = tick;
  if (tickStep > 0) while (count / tickStep > 60) tickStep *= 2;
  const ticks: number[] = [];
  if (tickStep > 0) for (let value = tickStep; value <= count; value += tickStep) ticks.push(value);

  const announceSoon = (text: string) => {
    window.clearTimeout(announceTimer.current);
    announceTimer.current = window.setTimeout(() => setAnnounce(text), 400);
  };

  const commit = (next: number) => {
    const target = clampPage(next);
    if (target === page) return;
    if (pageProp === undefined) setLocalPage(target);
    onPageChange?.(target);
    announceSoon(labels.valueText(target, count));
  };

  const scrubTo = (fraction: number) => {
    const live = pageAt(fraction);
    if (live === lastScrub.current) return;
    lastScrub.current = live;
    onScrub?.(live);
  };

  const latest = React.useRef({ commit, scrubTo, fractionAt, pageAt });
  latest.current = { commit, scrubTo, fractionAt, pageAt };

  /** Put the pill under the current page button. With `animate` the pill glides from where it last rested; while a glide is still running the pill is retargeted from its live position. */
  const placePill = (animate: boolean) => {
    const list = pagesRef.current;
    const pill = pillRef.current;
    const active = list?.querySelector('[data-page][aria-current="page"]');
    if (!list || !pill || !(active instanceof HTMLElement)) return;
    const to = { left: active.offsetLeft, width: active.offsetWidth };
    const from = pillBox.current;
    pillBox.current = to;
    const running = pillAnim.current && pillAnim.current.playState === "running" ? pillAnim.current : null;
    let start = from;
    if (running) {
      const style = getComputedStyle(pill);
      const matrix = /matrix\(([^)]+)\)/.exec(style.transform);
      const parts = matrix?.[1]?.split(",") ?? [];
      const tx = Number.parseFloat(parts[4] ?? "");
      const width = Number.parseFloat(style.width);
      if (Number.isFinite(tx) && Number.isFinite(width)) start = { left: tx, width };
      running.cancel();
    }
    pill.style.transform = `translateX(${to.left}px)`;
    pill.style.width = `${to.width}px`;
    if (animate) pill.dataset.direction = from ? (to.left > from.left ? "forward" : to.left < from.left ? "backward" : "none") : "none";
    if (!start || reducedRef.current || typeof pill.animate !== "function") return;
    if (!animate && !running) return;
    if (Math.abs(start.left - to.left) < 0.5 && Math.abs(start.width - to.width) < 0.5) return;
    pillAnim.current = pill.animate(
      [{ transform: `translateX(${start.left}px)`, width: `${start.width}px` }, { transform: `translateX(${to.left}px)`, width: `${to.width}px` }],
      { duration: running && !animate ? 160 : FLIP_MS, easing: FLIP_EASE },
    );
  };
  const placeRef = React.useRef(placePill);
  placeRef.current = placePill;

  React.useLayoutEffect(() => { prevPage.current = page; }, [page]);
  React.useLayoutEffect(() => { placePill(true); }, [page, itemsKey, size]);

  React.useLayoutEffect(() => {
    const list = pagesRef.current;
    const track = trackRef.current;
    if (track) setTrackWidth(track.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === track) setTrackWidth(entry.contentRect.width);
        else placeRef.current(false);
      }
    });
    if (list) observer.observe(list);
    if (track) observer.observe(track);
    return () => observer.disconnect();
  }, [showTrack]);

  React.useLayoutEffect(() => {
    const tip = tipRef.current;
    if (!tip) return;
    const visible = tip.offsetWidth;
    tipAnim.current?.cancel();
    const natural = tip.offsetWidth;
    if (natural !== tipWidth) setTipWidth(natural);
    const previous = tipPrevWidth.current;
    tipPrevWidth.current = natural;
    if (!previous || Math.abs(visible - natural) < 0.5 || reduced || typeof tip.animate !== "function") return;
    tipAnim.current = tip.animate([{ width: `${visible}px` }, { width: `${natural}px` }], { duration: TIP_MS, easing: EASE });
  }, [tipText, reduced]);

  const detachRef = React.useRef(() => {});
  const listenForDrag = () => {
    detachRef.current();
    const move = (event: PointerEvent) => {
      const current = dragRef.current;
      if (!current || event.pointerId !== current.pointerId) return;
      const fraction = latest.current.fractionAt(event.clientX - current.left, current.width);
      setDrag({ fraction });
      latest.current.scrubTo(fraction);
    };
    const release = (event: PointerEvent) => {
      const current = dragRef.current;
      if (!current || event.pointerId !== current.pointerId) return;
      detachRef.current();
      dragRef.current = null;
      setDrag(null);
      setLinger(true);
      window.clearTimeout(lingerTimer.current);
      lingerTimer.current = window.setTimeout(() => setLinger(false), 150);
      if (event.type === "pointerup") latest.current.commit(latest.current.pageAt(latest.current.fractionAt(event.clientX - current.left, current.width)));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    detachRef.current = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      detachRef.current = () => {};
    };
  };
  React.useEffect(() => () => detachRef.current(), []);

  React.useLayoutEffect(() => {
    const wrap = jumpRef.current;
    if (!jump || !wrap) return;
    const input = inputRef.current;
    const glyph = wrap.querySelector("[data-jump-glyph]");
    const can = !reduced && typeof wrap.animate === "function";
    if (jump.phase === "open") {
      input?.focus({ preventScroll: true });
      if (!can) return;
      wrap.animate([{ width: `${jump.from}px` }, { width: `${S.jump}px` }], { duration: 180, easing: EASE });
      input?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }], { duration: 180, fill: "backwards" });
      if (glyph instanceof HTMLElement) glyph.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: "forwards" });
      return;
    }
    if (!can) { setJump(null); return; }
    const close = wrap.animate([{ width: `${S.jump}px` }, { width: `${jump.from}px` }], { duration: 150, easing: EASE, fill: "forwards" });
    input?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 80, fill: "forwards" });
    if (glyph instanceof HTMLElement) glyph.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, fill: "forwards" });
    close.onfinish = () => setJump((current) => (current && current.phase === "closing" ? null : current));
    return () => { close.onfinish = null; };
  }, [jump?.key, jump?.phase]);

  React.useLayoutEffect(() => {
    if (jump || !pendingFocus.current) return;
    const want = pendingFocus.current;
    pendingFocus.current = "";
    const target = want === "page" ? pagesRef.current?.querySelector('[data-page][aria-current="page"]') : pagesRef.current?.querySelector("[data-ellipsis]");
    if (target instanceof HTMLElement) { pointerFocus.current = true; target.focus({ preventScroll: true }); pointerFocus.current = false; }
  }, [jump, page]);

  React.useEffect(() => () => { window.clearTimeout(announceTimer.current); window.clearTimeout(lingerTimer.current); }, []);

  const openJump = (key: "start-ellipsis" | "end-ellipsis", from: number) => {
    if (jumpState.current) return;
    setJump({ key, phase: "open", from });
  };
  const closeJump = (immediate: boolean) => {
    const current = jumpState.current;
    if (!current || current.phase === "closing") return;
    if (immediate) { jumpState.current = null; setJump(null); return; }
    setJump({ ...current, phase: "closing" });
  };
  const shake = () => {
    const wrap = jumpRef.current;
    if (wrap && !reduced && typeof wrap.animate === "function") {
      wrap.animate([{ transform: "translateX(0)" }, { transform: "translateX(-3px)" }, { transform: "translateX(3px)" }, { transform: "translateX(-2px)" }, { transform: "translateX(0)" }], { duration: 240, easing: "ease-out" });
    }
    inputRef.current?.select();
  };

  const onTrackPointerDown = (event: React.PointerEvent) => {
    if (count <= 1) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const wrap = trackRef.current;
    if (!wrap) return;
    event.preventDefault();
    const box = wrap.getBoundingClientRect();
    if (event.isTrusted) {
      pointerFocus.current = true;
      thumbRef.current?.focus({ preventScroll: true });
      pointerFocus.current = false;
    }
    try { wrap.setPointerCapture(event.pointerId); } catch { /* synthetic pointers cannot be captured */ }
    dragRef.current = { pointerId: event.pointerId, left: box.left, width: box.width };
    listenForDrag();
    lastScrub.current = page;
    const fraction = fractionAt(event.clientX - box.left, box.width);
    setHoverX(null);
    setDrag({ fraction });
    scrubTo(fraction);
  };

  const onTrackPointerMove = (event: React.PointerEvent) => {
    if (dragRef.current || event.pointerType === "touch" || count <= 1) return;
    const wrap = trackRef.current;
    if (!wrap) return;
    setHoverX(event.clientX - wrap.getBoundingClientRect().left);
  };

  const onThumbKeyDown = (event: React.KeyboardEvent) => {
    if (count <= 1) return;
    let next = page;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = page + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = page - 1;
    else if (event.key === "PageUp") next = page + keyStep;
    else if (event.key === "PageDown") next = page - keyStep;
    else if (event.key === "Home") next = 1;
    else if (event.key === "End") next = count;
    else return;
    event.preventDefault();
    commit(next);
  };

  const thumbTransition = reduced ? "none" : drag ? "scale 150ms ease, box-shadow 150ms ease" : `left ${SNAP_MS}ms ${EASE}, scale 150ms ease, box-shadow 150ms ease`;

  return (
    <nav
      {...rest}
      ref={(node) => { navRef.current = node; if (typeof ref === "function") ref(node); else if (ref) (ref as { current: HTMLElement | null }).current = node; }}
      aria-label={labels.pagination}
      data-slot="scrub-pagination"
      data-size={size}
      data-page={page}
      data-count={count}
      data-scrub={drag ? livePage : ""}
      data-dragging={drag ? "true" : "false"}
      data-jump={jump ? `${jump.key}:${jump.phase}` : ""}
      onPointerDownCapture={(event) => { onInteractionStart?.(event); onPointerDownCapture?.(event); }}
      onKeyDownCapture={(event) => { onInteractionStart?.(event); onKeyDownCapture?.(event); }}
      className={`w-full ${className}`}
    >
      <div data-row className={`flex w-full flex-nowrap items-center ${size === "sm" ? "gap-1.5" : "gap-2"}`}>
        <button
          type="button"
          data-prev
          disabled={page <= 1}
          onClick={() => commit(page - 1)}
          className={`inline-flex shrink-0 items-center rounded-md font-medium text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none ${S.nav}`}
        >
          <ChevronLeft aria-hidden="true" className={S.icon} />
          {labels.previous}
        </button>
        <div ref={pagesRef} data-pages className="relative inline-flex shrink-0 items-center gap-1">
          <span ref={pillRef} data-pill aria-hidden="true" className={`pointer-events-none absolute top-0 left-0 w-0 rounded-md bg-primary shadow-sm will-change-transform ${S.h}`} />
          {items.map((item, index) => {
            if (typeof item === "number") {
              const active = item === page;
              return (
                <button
                  key={index}
                  type="button"
                  data-page={item}
                  aria-label={labels.page(item)}
                  aria-current={active ? "page" : undefined}
                  onClick={() => commit(item)}
                  className={`relative z-10 inline-flex shrink-0 items-center justify-center rounded-md font-medium tabular-nums outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none ${S.button} ${active ? "text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <Roll text={String(item)} up={up} reduced={reduced} duration={FLIP_MS} />
                </button>
              );
            }
            if (jump && jump.key === item) {
              return (
                <span
                  key={index}
                  ref={jumpRef}
                  data-jump-field={item}
                  data-phase={jump.phase}
                  style={{ width: S.jump }}
                  className={`relative z-10 inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-background ring-1 ring-border transition-shadow focus-within:ring-2 focus-within:ring-ring ${S.h}`}
                >
                  <span data-jump-glyph aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground">…</span>
                  <input
                    ref={inputRef}
                    data-jump-input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={String(count).length}
                    aria-label={labels.jumpTo}
                    placeholder={String(page)}
                    className={`h-full w-full bg-transparent text-center font-medium tabular-nums text-foreground outline-none placeholder:text-muted-foreground/50 ${size === "sm" ? "text-xs" : "text-[13px]"}`}
                    onInput={(event) => { const field = event.currentTarget; const digits = field.value.replace(/\D/g, ""); if (digits !== field.value) field.value = digits; }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        const value = Number.parseInt(event.currentTarget.value, 10);
                        if (!Number.isFinite(value)) { shake(); return; }
                        pendingFocus.current = event.isTrusted ? "page" : "";
                        closeJump(true);
                        commit(value);
                      } else if (event.key === "Escape") {
                        event.preventDefault();
                        pendingFocus.current = event.isTrusted ? "ellipsis" : "";
                        closeJump(false);
                      }
                    }}
                    onBlur={(event) => {
                      const next = event.relatedTarget;
                      const inside = next instanceof Node && !!navRef.current?.contains(next);
                      closeJump(inside);
                    }}
                  />
                </span>
              );
            }
            return (
              <button
                key={index}
                type="button"
                data-ellipsis={item}
                aria-label={labels.jumpTo}
                onClick={(event) => openJump(item, event.currentTarget.offsetWidth || S.px)}
                className={`relative z-10 inline-flex shrink-0 items-center justify-center rounded-md font-medium text-muted-foreground outline-none transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none ${S.button}`}
              >
                <Roll text="…" up={up} reduced={reduced} duration={FLIP_MS} />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          data-next
          disabled={page >= count}
          onClick={() => commit(page + 1)}
          className={`inline-flex shrink-0 items-center rounded-md font-medium text-muted-foreground outline-none transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none ${S.nav}`}
        >
          {labels.next}
          <ChevronRight aria-hidden="true" className={S.icon} />
        </button>
        {showSummary && (
          <span data-summary className={`ml-auto inline-flex shrink-0 items-end gap-1 whitespace-nowrap tabular-nums text-muted-foreground ${S.summary}`}>
            <Odometer text={String(page)} reduced={reduced} duration={200} className="font-medium text-foreground" />
            <span className="leading-none">/ {count}</span>
          </span>
        )}
      </div>
      {showTrack && (
        <div
          ref={trackRef}
          data-track-wrap
          data-dragging={drag ? "true" : "false"}
          onPointerDown={onTrackPointerDown}
          onPointerMove={onTrackPointerMove}
          onPointerLeave={() => { if (!dragRef.current) setHoverX(null); }}
          className="relative mt-7 h-5 w-full touch-none select-none"
        >
          <div data-track aria-hidden="true" className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground/10" />
          <div data-fill aria-hidden="true" className="absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full bg-primary/30" style={{ width: thumbX }} />
          {ticks.map((value) => (
            <span key={value} data-tick={value} aria-hidden="true" className="absolute top-1/2 size-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" style={{ left: HALF + fractionOf(value) * travel }} />
          ))}
          <div
            ref={thumbRef}
            data-thumb
            data-grabbed={drag ? "true" : "false"}
            role="slider"
            tabIndex={count > 1 ? 0 : -1}
            aria-label={labels.scrub}
            aria-orientation="horizontal"
            aria-valuemin={1}
            aria-valuemax={count}
            aria-valuenow={livePage}
            aria-valuetext={labels.valueText(livePage, count)}
            aria-disabled={count <= 1 || undefined}
            onKeyDown={onThumbKeyDown}
            onFocus={() => { if (!pointerFocus.current) setFocused(true); }}
            onBlur={() => setFocused(false)}
            style={{ left: thumbX, width: SCRUB_THUMB_WIDTH, transition: thumbTransition }}
            className="absolute top-1/2 z-10 h-3.5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-background shadow-sm ring-1 ring-border outline-none hover:ring-foreground/30 focus-visible:ring-2 focus-visible:ring-ring data-[grabbed=true]:scale-110 data-[grabbed=true]:cursor-grabbing data-[grabbed=true]:shadow-md data-[grabbed=true]:ring-foreground/40 dark:bg-foreground dark:ring-foreground/20 dark:hover:ring-foreground/60"
          />
          <span
            data-tooltip-arrow
            aria-hidden="true"
            className="pointer-events-none absolute bottom-full z-20 mb-[3px] size-2 -translate-x-1/2 rotate-45 bg-foreground transition-opacity duration-150 motion-reduce:transition-none"
            style={{ left: tipAnchor, opacity: tipOpen ? 1 : 0 }}
          />
          <div
            ref={tipRef}
            data-tooltip
            data-open={tipOpen ? "true" : "false"}
            aria-hidden="true"
            style={{ left: tipLeft }}
            className="pointer-events-none absolute bottom-full z-20 mb-1 -translate-x-1/2 overflow-hidden rounded-md bg-foreground px-2 py-1 text-[11px] leading-none font-medium whitespace-nowrap text-background shadow-md transition-[opacity,translate] duration-150 ease-out data-[open=false]:translate-y-1 data-[open=false]:opacity-0 motion-reduce:transition-none"
          >
            <Odometer text={tipText} reduced={reduced} duration={TIP_MS} />
          </div>
        </div>
      )}
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announce}</p>
    </nav>
  );
}

export default ScrubPagination;
