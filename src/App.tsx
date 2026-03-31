/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import About from './pages/About';
import ProjectDetails from './pages/ProjectDetails';
import Admin from './pages/Admin';
import AIChatBot from './components/AIChatBot';
import CustomCursor from './components/CustomCursor';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-bg-dark text-white cursor-none">
          <Toaster position="top-right" richColors />
          <CustomCursor />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:category" element={<Projects />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <AIChatBot />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
