import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f8f9fa; /* 明るい背景 */
    color: #212529; /* 基本的なテキストカラー */
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 500; /* Apple風の少し細めの見出し */
    color: #1d1d1f; /* Apple風の濃いグレー */
  }

  a {
    color: #007aff; /* Appleのプライマリブルー */
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }
`;
