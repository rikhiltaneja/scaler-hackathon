import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import HomePage from './pages/HomePage';
import VisitDetailPage from './pages/VisitDetailPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="visits/:id" element={<VisitDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
