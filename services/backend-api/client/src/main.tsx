import './utils/setupSentry';
import './utils/i18n';
import React from 'react';
import ReactDOM from 'react-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import App from './App';
import theme from './utils/theme';
import setupMockBrowserWorker from './mocks/browser';
import { ForceDarkMode } from './components/ForceDarkMode';
import { GenericErrorBoundary } from './components/GenericErrorBoundary';

async function prepare() {
  if (import.meta.env.MODE === 'development-mockapi') {
    return setupMockBrowserWorker().then((worker) => worker.start());
  }

  return Promise.resolve();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      // Invalidate cache after 30 minutes
      staleTime: 1000 * 60 * 30,
    },
  },
});

prepare().then(() => {
  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <ChakraProvider>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools />
            <ForceDarkMode>
              <GenericErrorBoundary>
                <App />
              </GenericErrorBoundary>
            </ForceDarkMode>
          </QueryClientProvider>
        </ChakraProvider>
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root'),
  );
});
