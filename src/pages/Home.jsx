import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Grid, GridCell, GRID } from "../grid";
import {
  fetchAllChannelContents,
  findBlockByTitleInChannel,
  findChannelByTitle,
  imageUrlFromBlock,
  textFromBlock,
  useArenaRefresh,
} from "../arena";
import Sidebar from "../components/Sidebar.jsx";

const PROJECT_TITLE_PREFIX = "‡";

const ProjectRow = styled(GridCell)`
  min-width: 0;
  cursor: pointer;
  visibility: ${(p) => (p.$hidden ? "hidden" : "visible")};

  @media ${GRID.MEDIA_TABLET} {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  @media ${GRID.MEDIA_MOBILE} {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const ThumbnailFrame = styled.div`
  aspect-ratio: 4 / 3;
  width: 100%;
  overflow: hidden;
  background: #e8e8e8;
`;

const ThumbnailImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.85);

  @media ${GRID.MEDIA_TABLET} {
    padding: max(${GRID.PADDING_TABLET}px, env(safe-area-inset-top, 0px))
      max(${GRID.PADDING_TABLET}px, env(safe-area-inset-right, 0px))
      max(${GRID.PADDING_TABLET}px, env(safe-area-inset-bottom, 0px))
      max(${GRID.PADDING_TABLET}px, env(safe-area-inset-left, 0px));
  }

  @media ${GRID.MEDIA_MOBILE} {
    padding: max(${GRID.PADDING_MOBILE}px, env(safe-area-inset-top, 0px))
      max(${GRID.PADDING_MOBILE}px, env(safe-area-inset-right, 0px))
      max(${GRID.PADDING_MOBILE}px, env(safe-area-inset-bottom, 0px))
      max(${GRID.PADDING_MOBILE}px, env(safe-area-inset-left, 0px));
    align-items: center;
  }
`;

const GalleryScroll = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  align-items: center;
  gap: ${GRID.GAP}px;
  padding: 0 ${GRID.PADDING}px;
  height: 70vh;
  max-height: 70vh;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media ${GRID.MEDIA_TABLET} {
    gap: ${GRID.GAP_TABLET};
    padding: 0;
    height: min(65vh, calc(100dvh - 2 * ${GRID.PADDING_TABLET}px));
    max-height: min(65vh, calc(100dvh - 2 * ${GRID.PADDING_TABLET}px));
  }

  @media ${GRID.MEDIA_MOBILE} {
    gap: ${GRID.GAP_MOBILE};
    padding: 0;
    height: min(52dvh, calc(100dvh - 2 * ${GRID.PADDING_MOBILE}px));
    max-height: min(52dvh, calc(100dvh - 2 * ${GRID.PADDING_MOBILE}px));
  }
`;

const GalleryImg = styled.img`
  height: 100%;
  width: auto;
  display: block;
  object-fit: contain;
  flex-shrink: 0;

  @media ${GRID.MEDIA_TABLET} {
    max-width: min(90vw, 100%);
    max-height: 100%;
  }

  @media ${GRID.MEDIA_MOBILE} {
    max-width: min(85vw, 100%);
    max-height: 100%;
  }
`;

const MetaDesktop = styled(GridCell)`
  @media ${GRID.MEDIA_TABLET} {
    display: none;
  }
  @media ${GRID.MEDIA_MOBILE} {
    display: none;
  }
`;

const YearKeywordsStacked = styled(GridCell)`
  display: none;
  @media ${GRID.MEDIA_TABLET} {
    display: block;
  }
  @media ${GRID.MEDIA_MOBILE} {
    display: block;
  }
`;

const DescriptionCell = styled(GridCell)`
  @media ${GRID.MEDIA_MOBILE} {
    margin-bottom: calc(${GRID.ROW_GAP_MOBILE} * 3.5);
  }
`;

function parseKeywords(block) {
  const raw = textFromBlock(block);
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isProjectChannel(ch) {
  return typeof ch.title === "string" && ch.title.startsWith(PROJECT_TITLE_PREFIX);
}

function stripProjectPrefix(title) {
  if (!title) return "";
  if (title.startsWith(PROJECT_TITLE_PREFIX)) {
    return title.slice(PROJECT_TITLE_PREFIX.length).trim();
  }
  return title.trim();
}

async function loadProjects(skipCache) {
  const layoutChannel = await findChannelByTitle("Layout", undefined, { skipCache });
  if (!layoutChannel) return [];
  const contents = await fetchAllChannelContents(layoutChannel.slug, { skipCache });
  const projectChannels = contents.filter(
    (item) => item.type === "Channel" && isProjectChannel(item),
  );

  const rows = await Promise.all(
    projectChannels.map(async (ch) => {
      const opts = { skipCache };
      const [thumbBlock, yearBlock, keywordsBlock, descriptionBlock] =
        await Promise.all([
          findBlockByTitleInChannel(ch.slug, "thumbnail", opts),
          findBlockByTitleInChannel(ch.slug, "Year", opts),
          findBlockByTitleInChannel(ch.slug, "keywords", opts),
          findBlockByTitleInChannel(ch.slug, "description", opts),
        ]);

      return {
        id: ch.id,
        slug: ch.slug,
        title: stripProjectPrefix(ch.title),
        thumbnailUrl: imageUrlFromBlock(thumbBlock),
        year: textFromBlock(yearBlock),
        keywords: parseKeywords(keywordsBlock),
        keywordsDisplay: parseKeywords(keywordsBlock).join(", "),
        description: textFromBlock(descriptionBlock),
      };
    }),
  );

  return rows;
}

function collectUniqueKeywords(projects) {
  const set = new Set();
  for (const p of projects) {
    for (const k of p.keywords) {
      set.add(k);
    }
  }
  return [...set].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

function formatYearKeywordsLine(year, keywordsDisplay) {
  return [year, keywordsDisplay].filter(Boolean).join(" / ");
}

function Home({ onReady }) {
  const refreshKey = useArenaRefresh();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const imagesCacheRef = useRef({});

  useEffect(() => {
    let cancelled = false;
    const skipCache = refreshKey > 0;
    if (skipCache) imagesCacheRef.current = {};
    Promise.resolve()
      .then(() => {
        if (cancelled) return null;
        setError(null);
        return loadProjects(skipCache);
      })
      .then((data) => {
        if (data != null && !cancelled) setProjects(data);
        if (!cancelled) onReady?.();
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load projects.");
        if (!cancelled) onReady?.();
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const closeGallery = useCallback(() => {
    setExpandedId(null);
    setGalleryImages([]);
  }, []);

  useEffect(() => {
    if (expandedId == null) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeGallery();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedId, closeGallery]);

  const handleProjectClick = useCallback(
    async (project) => {
      if (expandedId === project.id) {
        closeGallery();
        return;
      }

      setExpandedId(project.id);

      if (imagesCacheRef.current[project.id]) {
        setGalleryImages(imagesCacheRef.current[project.id]);
        return;
      }

      setGalleryLoading(true);
      try {
        const contents = await fetchAllChannelContents(project.slug);
        const images = contents
          .filter((item) => item.type === "Image" || item.type === "Media")
          .map((item) => ({
            id: item.id,
            url: imageUrlFromBlock(item),
            title: item.title || "",
          }))
          .filter((img) => img.url);

        imagesCacheRef.current[project.id] = images;
        setGalleryImages(images);
      } catch {
        setGalleryImages([]);
      } finally {
        setGalleryLoading(false);
      }
    },
    [expandedId, closeGallery],
  );

  const [activeKeywords, setActiveKeywords] = useState(new Set());

  const toggleKeyword = useCallback((kw) => {
    setActiveKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(kw)) next.delete(kw);
      else next.add(kw);
      return next;
    });
  }, []);

  const indexKeywords = useMemo(
    () => collectUniqueKeywords(projects),
    [projects],
  );

  return (
    <>
      <Sidebar
        keywords={indexKeywords}
        activeKeywords={activeKeywords}
        onKeywordClick={toggleKeyword}
      />
      <Grid style={{ paddingTop: `${GRID.PADDING}px` }}>
        {error && (
          <GridCell $start={3} $span={10}>
            <p>{error}</p>
          </GridCell>
        )}

        {!error &&
          projects.map((p) => {
            const hidden =
              activeKeywords.size > 0 &&
              !p.keywords.some((kw) => activeKeywords.has(kw));
            return (
              <ProjectRow
                key={p.id}
                $start={3}
                $span={10}
                $subgrid
                $hidden={hidden}
                onClick={hidden ? undefined : () => handleProjectClick(p)}
              >
                <GridCell $start={1} $span={2} $alignSelf="start">
                  <ThumbnailFrame>
                    {p.thumbnailUrl ? (
                      <ThumbnailImg src={p.thumbnailUrl} alt="" />
                    ) : null}
                  </ThumbnailFrame>
                </GridCell>
                <GridCell $start={3} $span={2} $alignSelf="start">{p.title}</GridCell>
                <YearKeywordsStacked $start={3} $span={8} $alignSelf="start">
                  {formatYearKeywordsLine(p.year, p.keywordsDisplay)}
                </YearKeywordsStacked>
                <MetaDesktop $start={5} $span={1} $alignSelf="start">{p.year}</MetaDesktop>
                <MetaDesktop $start={6} $span={2} $alignSelf="start">{p.keywordsDisplay}</MetaDesktop>
                <DescriptionCell $start={8} $span={3} $alignSelf="start">{p.description}</DescriptionCell>
              </ProjectRow>
            );
          })}
      </Grid>

      {expandedId != null && (
        <Overlay onClick={closeGallery}>
          <GalleryScroll onClick={(e) => e.stopPropagation()}>
            {galleryLoading && <span>Loading…</span>}
            {!galleryLoading &&
              galleryImages.map((img) => (
                <GalleryImg
                  key={img.id}
                  src={img.url}
                  alt={img.title}
                />
              ))}
          </GalleryScroll>
        </Overlay>
      )}
    </>
  );
}

export default Home;
