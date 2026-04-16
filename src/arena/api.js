import { fetchArena, getGroupSlug } from "./client.js";

// ─── Group ───────────────────────────────────────────────

export async function getGroup(slug = getGroupSlug(), { skipCache } = {}) {
  return fetchArena(`/groups/${encodeURIComponent(slug)}`, { skipCache });
}

export async function getGroupContents(
  slug = getGroupSlug(),
  { page = 1, per = 24, type, sort, skipCache } = {},
) {
  return fetchArena(`/groups/${encodeURIComponent(slug)}/contents`, {
    params: { page, per, type, sort },
    skipCache,
  });
}

export async function fetchAllGroupContents(
  slug = getGroupSlug(),
  { type, sort, skipCache } = {},
) {
  let page = 1;
  const per = 100;
  let all = [];

  while (true) {
    const res = await getGroupContents(slug, {
      page,
      per,
      type,
      sort,
      skipCache,
    });
    all = all.concat(res.data);
    if (!res.meta.has_more_pages) break;
    page++;
  }

  return all;
}

export async function getGroupChannels(
  slug = getGroupSlug(),
  { skipCache } = {},
) {
  return fetchAllGroupContents(slug, { type: "Channel", skipCache });
}

// ─── Channel (scoped to group) ───────────────────────────

export async function getChannel(idOrSlug, { skipCache } = {}) {
  return fetchArena(`/channels/${encodeURIComponent(idOrSlug)}`, { skipCache });
}

export async function getChannelContents(
  idOrSlug,
  { page = 1, per = 24, sort, skipCache } = {},
) {
  return fetchArena(`/channels/${encodeURIComponent(idOrSlug)}/contents`, {
    params: { page, per, sort },
    skipCache,
  });
}

export async function fetchAllChannelContents(
  idOrSlug,
  { sort, skipCache } = {},
) {
  let page = 1;
  const per = 100;
  let all = [];

  while (true) {
    const res = await getChannelContents(idOrSlug, {
      page,
      per,
      sort,
      skipCache,
    });
    all = all.concat(res.data);
    if (!res.meta.has_more_pages) break;
    page++;
  }

  return all;
}

// ─── Block ───────────────────────────────────────────────

export async function getBlock(id, { skipCache } = {}) {
  return fetchArena(`/blocks/${encodeURIComponent(id)}`, { skipCache });
}

// ─── Finders (group-scoped) ──────────────────────────────
// All finders start from the group so we never accidentally
// reach outside the project's Are.na group.

export async function findChannelByTitle(
  title,
  groupSlug = getGroupSlug(),
  { skipCache } = {},
) {
  const channels = await getGroupChannels(groupSlug, { skipCache });
  return channels.find((ch) => ch.title?.toLowerCase() === title.toLowerCase());
}

export async function findChannelsByTitle(
  title,
  groupSlug = getGroupSlug(),
  { skipCache } = {},
) {
  const channels = await getGroupChannels(groupSlug, { skipCache });
  return channels.filter(
    (ch) => ch.title?.toLowerCase() === title.toLowerCase(),
  );
}

export async function findBlockByTitle(
  title,
  channelTitle,
  groupSlug = getGroupSlug(),
  { skipCache } = {},
) {
  const channel = await findChannelByTitle(channelTitle, groupSlug, {
    skipCache,
  });
  if (!channel) return null;
  const items = await fetchAllChannelContents(channel.slug, { skipCache });
  return items.find(
    (item) =>
      item.base_type === "Block" &&
      item.title?.toLowerCase() === title.toLowerCase(),
  );
}

/** Find a block by title within a channel (by slug or id). Use when you already have the channel. */
export async function findBlockByTitleInChannel(
  channelSlugOrId,
  blockTitle,
  { skipCache } = {},
) {
  const items = await fetchAllChannelContents(channelSlugOrId, { skipCache });
  return items.find(
    (item) =>
      item.type !== "Channel" &&
      item.title?.toLowerCase() === blockTitle.toLowerCase(),
  );
}

export async function findBlocksByType(
  type,
  channelTitle,
  groupSlug = getGroupSlug(),
  { skipCache } = {},
) {
  const channel = await findChannelByTitle(channelTitle, groupSlug, {
    skipCache,
  });
  if (!channel) return [];
  const items = await fetchAllChannelContents(channel.slug, { skipCache });
  return items.filter((item) => item.type === type);
}

export async function getChannelContentsByTitle(
  channelTitle,
  groupSlug = getGroupSlug(),
  { skipCache } = {},
) {
  const channel = await findChannelByTitle(channelTitle, groupSlug, {
    skipCache,
  });
  if (!channel) return [];
  return fetchAllChannelContents(channel.slug, { skipCache });
}

// ─── Prefetch ────────────────────────────────────────────
// Kick off all page-level channel fetches in parallel so
// navigating between pages is instant.
//
// Replace these with your own page channel titles.

const PAGE_CHANNELS = [
  // "Page / Home",
  // "Page / About",
];

export function prefetchAll() {
  if (PAGE_CHANNELS.length === 0) return;

  const channelsReady = fetchAllGroupContents(getGroupSlug(), {
    type: "Channel",
  });

  channelsReady
    .then((channels) => {
      const lower = (s) => s.toLowerCase();
      PAGE_CHANNELS.forEach((title) => {
        const ch = channels.find((c) => lower(c.title ?? "") === lower(title));
        if (ch) fetchAllChannelContents(ch.slug);
      });
    })
    .catch(() => {
      /* pages will retry on mount */
    });
}

// Start immediately at module load time
prefetchAll();

// ─── Block helpers ───────────────────────────────────────

export function textFromBlock(block) {
  if (!block) return "";
  const c = block.content;
  if (typeof c === "string") return c.trim();
  if (c && typeof c === "object") {
    if (typeof c.plain === "string") return c.plain.trim();
    if (typeof c.markdown === "string") return c.markdown.trim();
  }
  return "";
}

export function imageUrlFromBlock(block) {
  if (!block) return null;
  const img = block.image;
  if (typeof img === "string" && /^https?:/i.test(img)) return img;
  if (img && typeof img === "object") {
    const url =
      img.src ??
      img.large?.src ??
      img.medium?.src ??
      img.small?.src ??
      img.square?.src ??
      img.display?.url ??
      img.original?.url ??
      img.url ??
      null;
    if (url) return url;
  }
  const sourceUrl = block.source?.url;
  if (typeof sourceUrl === "string" && /^https?:/i.test(sourceUrl)) {
    return sourceUrl;
  }
  return null;
}
