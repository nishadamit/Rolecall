import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Organizations from './pages/Organizations';
import Team from './pages/Team';
import Sessions from './pages/Sessions';
import Settings from './pages/Settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetail />} />
      <Route path="/organizations" element={<Organizations />} />
      <Route path="/team" element={<Team />} />
      <Route path="/sessions" element={<Sessions />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;
