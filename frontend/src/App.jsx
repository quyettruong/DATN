import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;
