import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { GlobalStyles } from './styles/GlobalStyles';
import { ThemeProvider } from 'styled-components'; // 必要であれば

// React Query Client
const queryClient = new QueryClient();

// Styled Componentsのテーマ (任意)
const theme = {
  colors: {
    primary: '#007aff',
    background: '#f8f9fa',
    text: '#212529',
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {' '}
        {/* ThemeProviderでテーマを適用 */}
        <GlobalStyles />
        <App />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
