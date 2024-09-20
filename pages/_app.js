import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../styles/globals.css';
import { Provider } from 'react-redux';
import { store } from '@/toolkit/store';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
      <Component {...pageProps} />
      </Provider>
    </QueryClientProvider>
  );
}

export default MyApp;
