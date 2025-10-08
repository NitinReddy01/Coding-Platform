import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ProblemPage } from './pages/ProblemPage';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/problems/1" replace />} />
          <Route path="/problems/:id" element={<ProblemPage />} />
          <Route path="*" element={<Navigate to="/problems/1" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
