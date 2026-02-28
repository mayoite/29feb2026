export interface CategoryApiItem {
  id: string;
  name: string;
  count?: number;
}

export interface GroupedCategory {
  groupId: string;
  groupLabel: string;
  items: Array<CategoryApiItem & { href: string }>;
}

export const NAV_CATEGORY_GROUP_ORDER = [
  "seating",
  "workspaces",
  "tables",
  "storage",
  "specialty",
] as const;

export const NAV_CATEGORY_GROUPS: Record<
  (typeof NAV_CATEGORY_GROUP_ORDER)[number],
  { label: string; ids: string[] }
> = {
  seating: {
    label: "Seating",
    ids: ["chairs-mesh", "chairs-others", "soft-seating", "cafe-seating"],
  },
  workspaces: {
    label: "Workspaces",
    ids: ["workstations", "desks-cabin-tables"],
  },
  tables: {
    label: "Tables",
    ids: ["meeting-conference-tables"],
  },
  storage: {
    label: "Storage",
    ids: ["storages"],
  },
  specialty: {
    label: "Specialty",
    ids: ["education", "others-1", "others-2"],
  },
};

const CATEGORY_TO_GROUP = new Map<string, (typeof NAV_CATEGORY_GROUP_ORDER)[number]>();

for (const groupId of NAV_CATEGORY_GROUP_ORDER) {
  for (const categoryId of NAV_CATEGORY_GROUPS[groupId].ids) {
    CATEGORY_TO_GROUP.set(categoryId, groupId);
  }
}

export function groupCategories(categories: CategoryApiItem[]): GroupedCategory[] {
  const grouped = new Map<(typeof NAV_CATEGORY_GROUP_ORDER)[number], CategoryApiItem[]>();

  for (const groupId of NAV_CATEGORY_GROUP_ORDER) {
    grouped.set(groupId, []);
  }

  for (const item of categories) {
    const groupId = CATEGORY_TO_GROUP.get(item.id);
    if (!groupId) continue;
    grouped.get(groupId)?.push(item);
  }

  return NAV_CATEGORY_GROUP_ORDER.map((groupId) => {
    const orderedIds = NAV_CATEGORY_GROUPS[groupId].ids;
    const items = (grouped.get(groupId) || [])
      .sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id))
      .map((item) => ({
        ...item,
        href: `/products/${item.id}`,
      }));

    return {
      groupId,
      groupLabel: NAV_CATEGORY_GROUPS[groupId].label,
      items,
    };
  }).filter((group) => group.items.length > 0);
}

export const NAV_PRIMARY_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products", hasMega: true },
  { label: "Solutions", href: "/solutions" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const NAV_RESOURCE_LINKS = [
  { label: "Sustainability", href: "/sustainability" },
  { label: "Downloads", href: "/downloads" },
] as const;

