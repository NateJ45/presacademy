// Foundation, edit with care
// =============================================================================
// whenLabel — the Events page's date line (extracted 2026-08-26)
// =============================================================================
// Lifted verbatim out of src/pages/events/index.astro when the page moved to
// the builder (Phase 2 of
// docs/superpowers/plans/2026-08-26-page-builder-conversion.md). It lives here
// because BOTH event sections render it (the upcoming grid and the recurring
// list) and two copies would drift.
//
// THIS SITE HAS THREE DATE FORMATTERS AND THEY STAY SEPARATE. They are not
// three copies of one thing:
//   - this one prefers a hand-written schedule label ("First Tuesday, 7pm")
//     over a date, because a recurring rhythm has no single date;
//   - LegalBodyBlock's prints a "last updated" day;
//   - the key-dates block formats a range.
// Merging them would change rendered dates on live pages, which the parity
// harness treats as drift and a reader would notice.
import { formatDate } from '@/lib/format-date';
import { site } from '@/data/site';

// Event starts are datetimes: the label shows the Academy's own day, so an
// evening event does not land on the next day (starter card 98).
export function whenLabel(ev: any): string {
  if (ev?.scheduleLabel) return ev.scheduleLabel;
  if (ev?.start) {
    return formatDate(
      ev.start,
      { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      site.timeZone,
    );
  }
  return '';
}
