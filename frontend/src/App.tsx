import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ComplexesPage from './pages/ComplexesPage';
import ComplexFormPage from './pages/ComplexFormPage';
import ComplexDetailPage from './pages/ComplexDetailPage';
// import ComplexDetailPage from './pages/ComplexDetailPage'; // 将来的に
// import ComplexFormPage from './pages/ComplexFormPage'; // 将来的に

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ComplexesPage />} />
        <Route path="/complexes/new" element={<ComplexFormPage />} />
        <Route path="/complexes/:complexId" element={<ComplexDetailPage />} />
        {/* 他のルートもここに追加 */}
        {/* <Route path="/complexes/:id/edit" element={<ComplexFormPage mode="edit" />} /> */}
        {/* <Route path="/complexes/:id" element={<ComplexDetailPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
