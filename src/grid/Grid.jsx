import styled, { css } from 'styled-components'
import { GRID } from './config.js'

export const Grid = styled.div`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(${GRID.COLUMNS}, 1fr);
  column-gap: ${GRID.GAP}px;
  row-gap: ${GRID.ROW_GAP};
  width: 100%;
  max-width: ${props => (props.$fullBleed ? '100%' : `min(${GRID.MAX_WIDTH}px, 100%)`)};
  margin: 0 auto;
  padding: ${props => (props.$fullBleed ? '0' : `0 ${GRID.PADDING}px`)};
  overflow-wrap: break-word;

  @media ${GRID.MEDIA_TABLET} {
    grid-template-columns: repeat(${GRID.COLUMNS_TABLET}, 1fr);
    column-gap: ${GRID.GAP_TABLET};
    row-gap: ${GRID.ROW_GAP_TABLET};
    padding: ${props => (props.$fullBleed ? '0' : `0 ${GRID.PADDING_TABLET}px`)};
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-template-columns: repeat(${GRID.COLUMNS_MOBILE}, 1fr);
    padding: ${props => (props.$fullBleed ? '0' : `0 ${GRID.PADDING_MOBILE}px`)};
    column-gap: ${GRID.GAP_MOBILE};
    row-gap: ${GRID.ROW_GAP_MOBILE};
  }
`

const colValue = (start, span, end, defaultSpan) => {
  const s = start ?? 1
  if (end != null) return `${s} / ${end}`
  return `${s} / span ${span ?? defaultSpan}`
}

export const GridCell = styled.div`
  box-sizing: border-box;
  min-width: 0;

  --gc-start: ${p => p.$start ?? 1};
  --gc-span: ${p => p.$span ?? GRID.COLUMNS};
  grid-column: ${p => colValue(p.$start, p.$span, p.$end, GRID.COLUMNS)};

  ${p => {
    if (p.$rowStart == null && p.$rowSpan == null && p.$rowEnd == null) return ''
    const s = p.$rowStart ?? 1
    if (p.$rowEnd != null) return css`grid-row: ${s} / ${p.$rowEnd};`
    const span = p.$rowSpan ?? 1
    return css`grid-row: ${s} / span ${span};`
  }}

  ${p => p.$alignSelf ? css`align-self: ${p.$alignSelf};` : ''}

  ${p => p.$subgrid && css`
    display: grid;
    grid-template-columns: subgrid;
  `}

  @media ${GRID.MEDIA_TABLET} {
    grid-column: ${p => {
      const has = p.$startTablet != null || p.$spanTablet != null || p.$endTablet != null
      if (!has) return colValue(p.$start, p.$span, p.$end, GRID.COLUMNS_TABLET)
      return colValue(p.$startTablet, p.$spanTablet, p.$endTablet, GRID.COLUMNS_TABLET)
    }};
  }

  @media ${GRID.MEDIA_MOBILE} {
    grid-column: ${p => {
      const has = p.$startMobile != null || p.$spanMobile != null || p.$endMobile != null
      if (!has) return '1 / -1'
      return colValue(p.$startMobile, p.$spanMobile, p.$endMobile, GRID.COLUMNS_MOBILE)
    }};
  }
`

export const GridSpan4 = styled(GridCell).attrs(p => ({
  $span: p.$span ?? 4,
  $spanMobile: p.$spanMobile ?? GRID.COLUMNS_MOBILE,
}))``

export const GridSpan6 = styled(GridCell).attrs(p => ({
  $span: p.$span ?? 6,
  $spanMobile: p.$spanMobile ?? GRID.COLUMNS_MOBILE,
}))``

export const GridSpan8 = styled(GridCell).attrs(p => ({
  $span: p.$span ?? 8,
  $spanMobile: p.$spanMobile ?? GRID.COLUMNS_MOBILE,
}))``

export const GridSpan12 = styled(GridCell).attrs(p => ({
  $span: p.$span ?? 12,
  $spanMobile: p.$spanMobile ?? GRID.COLUMNS_MOBILE,
}))``

export { GRID } from './config.js'
