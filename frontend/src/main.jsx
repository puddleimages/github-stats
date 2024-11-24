import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
// import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* <BrowserRouter> */}
        <App />
      {/* </BrowserRouter> */}
    </QueryClientProvider>
  </StrictMode>
);
