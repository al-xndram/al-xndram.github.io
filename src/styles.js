import { createGlobalStyle, css } from "styled-components";

export const sansMain = css`
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.85rem;
  line-height: 1.35;
  font-weight: 400;
  color: #000;
`;

export const serifMain = css`
  font-family: "Times New Roman", Times, serif;
  font-size: 0.9rem;
  line-height: 1.25;
  font-weight: 400;
  color: #000;
`;

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    overflow-x: hidden;
  }

  body {
    ${({ theme }) => theme.bodyFont}
  }

  img {
    width: 100%;
  }
`;

export default GlobalStyle;
