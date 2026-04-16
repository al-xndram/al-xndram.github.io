import styled from "styled-components";
import { GRID } from "../grid";
import { useFontTheme } from "../context/FontThemeContext.jsx";

const SidebarWrapper = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  width: calc((2 / ${GRID.COLUMNS}) * min(${GRID.MAX_WIDTH}px, 100vw - ${GRID.PADDING * 2}px) + ${GRID.PADDING}px);
  height: 100vh;
  padding: ${GRID.PADDING}px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  z-index: 10;

  @media ${GRID.MEDIA_TABLET} {
    width: calc((2 / ${GRID.COLUMNS_TABLET}) * (100vw - ${GRID.PADDING_TABLET * 2}px) + ${GRID.PADDING_TABLET}px);
    padding: ${GRID.PADDING_TABLET}px;
  }

  @media ${GRID.MEDIA_MOBILE} {
    position: relative;
    width: 100%;
    height: auto;
    padding: ${GRID.PADDING_MOBILE}px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: ${GRID.GAP_MOBILE};
    align-items: start;
  }
`;

const SidebarPrimary = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;

  @media ${GRID.MEDIA_MOBILE} {
    grid-column: 1;
  }
`;

const SidebarSecondary = styled.div`
  flex-shrink: 0;
  margin-top: auto;
  display: flex;
  flex-direction: column;

  @media ${GRID.MEDIA_MOBILE} {
    margin-top: 0;
    grid-column: 2;
  }
`;

const SidebarTop = styled.div`
  flex-shrink: 0;
`;

const IndexList = styled.ul`
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
  flex-shrink: 0;

  @media ${GRID.MEDIA_MOBILE} {
    margin-top: 1.5rem;
  }
`;

const KeywordItem = styled.li`
  cursor: pointer;
  text-decoration: ${(p) => (p.$active ? "underline" : "none")};
`;

const FontToggle = styled.button`
  display: block;
  margin: 0 0 1.5rem;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
`;

function sortKeywordsAlphabetically(list) {
  return [...list].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

function Sidebar({ keywords = [], activeKeywords = new Set(), onKeywordClick }) {
  const sortedKeywords = sortKeywordsAlphabetically(keywords);
  const { useSerif, toggleFont } = useFontTheme();

  return (
    <SidebarWrapper>
      <SidebarPrimary>
        <SidebarTop>
          <p>Alex(andra) Maftei</p>
        </SidebarTop>
        <IndexList>
          {sortedKeywords.map((kw) => (
            <KeywordItem
              key={kw}
              $active={activeKeywords.has(kw)}
              onClick={() => onKeywordClick?.(kw)}
            >
              {kw}
            </KeywordItem>
          ))}
        </IndexList>
      </SidebarPrimary>
      <SidebarSecondary>
        <FontToggle
          type="button"
          onClick={toggleFont}
          aria-label={
            useSerif
              ? "Switch to sans-serif (Arial)"
              : "Switch to serif (Times New Roman)"
          }
        >
          {useSerif ? "serif" : "sans"}
        </FontToggle>
        <p>Curriculum Vitae</p>
        <p>Contact</p>
      </SidebarSecondary>
    </SidebarWrapper>
  );
}

export default Sidebar;
