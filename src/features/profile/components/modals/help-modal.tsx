import { Modal } from "@/components/ui/modal";
import { colors } from "@/config/brand";

const HELP_ITEMS = [
  { title: "Adding a book", body: "Tap Add Book, search by title, and select a match — or enter details manually." },
  {
    title: "Tracking what you own",
    body: "Set a book's ownership to Have It, Lent Out, Given Away, or No Longer Have It from its detail page.",
  },
  {
    title: "Your reading digest",
    body: "The Digest tab shows what you've finished, what's in progress, and a month-by-month view.",
  },
] as const;

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <h3 className="text-base font-semibold mb-3" style={{ color: colors.navy }}>Help &amp; Support</h3>
      <div className="space-y-3">
        {HELP_ITEMS.map((it) => (
          <div key={it.title}>
            <p className="text-sm font-medium" style={{ color: colors.navy }}>{it.title}</p>
            <p className="text-xs mt-0.5" style={{ color: colors.muted }}>{it.body}</p>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl py-2.5 text-sm font-semibold text-white mt-5"
        style={{ background: colors.navy }}
      >
        Close
      </button>
    </Modal>
  );
}
