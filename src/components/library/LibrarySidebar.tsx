import type { CaptureTag } from "../../types";

export type SmartViewId = "all" | "today" | "week" | "review" | "failed";

export type LibraryView =
  | { kind: "smart"; id: SmartViewId }
  | { kind: "list"; id: string }
  | { kind: "tag"; id: CaptureTag };

interface Props {
  view: LibraryView;
  onView: (view: LibraryView) => void;
  smartCounts: Record<SmartViewId, number>;
  lists: { name: string; count: number }[];
  tagCounts: Map<CaptureTag, number>;
  integrations: { id: string; label: string; connected: boolean }[];
}

const SMART_VIEWS: { id: SmartViewId; label: string }[] = [
  { id: "all", label: "All captures" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "review", label: "Pending review" },
  { id: "failed", label: "Sync failed" },
];

const TAGS: { id: CaptureTag; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "personal", label: "Personal" },
  { id: "idea", label: "Idea" },
  { id: "untagged", label: "Untagged" },
];

export default function LibrarySidebar({
  view,
  onView,
  smartCounts,
  lists,
  tagCounts,
  integrations,
}: Props) {
  return (
    <aside className="library-sidebar">
      <section className="library-nav-group">
        <h3 className="label-micro">Views</h3>
        <ul className="library-nav-list">
          {SMART_VIEWS.map((item) => {
            const active =
              view.kind === "smart" && view.id === item.id;
            const count = smartCounts[item.id];
            const tone =
              item.id === "failed" && count > 0
                ? "danger"
                : item.id === "review" && count > 0
                  ? "warn"
                  : undefined;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className="library-nav-row"
                  data-active={active ? "true" : undefined}
                  data-tone={tone}
                  onClick={() => onView({ kind: "smart", id: item.id })}
                >
                  <span className="library-nav-label">{item.label}</span>
                  <span className="library-nav-count tabular">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {lists.length > 0 ? (
        <section className="library-nav-group">
          <h3 className="label-micro">Lists</h3>
          <ul className="library-nav-list">
            {lists.map((list) => {
              const active = view.kind === "list" && view.id === list.name;
              return (
                <li key={list.name}>
                  <button
                    type="button"
                    className="library-nav-row"
                    data-active={active ? "true" : undefined}
                    onClick={() => onView({ kind: "list", id: list.name })}
                  >
                    <span className="library-nav-label">{list.name}</span>
                    <span className="library-nav-count tabular">{list.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="library-nav-group">
        <h3 className="label-micro">Tags</h3>
        <div className="library-tag-cloud">
          {TAGS.map((tag) => {
            const count = tagCounts.get(tag.id) ?? 0;
            const active = view.kind === "tag" && view.id === tag.id;
            return (
              <button
                key={tag.id}
                type="button"
                className="library-tag-chip"
                data-active={active ? "true" : undefined}
                data-tag={tag.id}
                onClick={() => onView({ kind: "tag", id: tag.id })}
                disabled={count === 0}
              >
                <span>{tag.label}</span>
                <span className="library-tag-chip-count tabular">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="library-nav-group">
        <h3 className="label-micro">Destinations</h3>
        <ul className="library-dest-list">
          {integrations.map((item) => (
            <li key={item.id}>
              <span className="library-dest-row">
                <span
                  className="library-dest-dot"
                  data-status={item.connected ? "ok" : "off"}
                />
                <span className="library-dest-label">{item.label}</span>
                <span className="library-dest-status">
                  {item.connected ? "Connected" : "Not set up"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
