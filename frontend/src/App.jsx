import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import ProjectLayout from "./components/Layout/ProjectLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NewProject from "./pages/NewProject";

import ProjectOverview from "./pages/Project/ProjectOverview";
import Journal from "./pages/Project/Journal";
import JournalEntry from "./pages/Project/JournalEntry";
import BugDiary from "./pages/Project/BugDiary";
import BugEntry from "./pages/Project/BugEntry";
import Architecture from "./pages/Project/Architecture";
import DatabaseSchema from "./pages/Project/DatabaseSchema";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected General Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <NewProject />
              </ProtectedRoute>
            }
          />

          {/* Protected Project Workspace Routes */}
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProjectOverview />} />
            <Route path="journal" element={<Journal />} />
            <Route path="journal/new" element={<JournalEntry />} />
            <Route path="journal/:journalId" element={<JournalEntry />} />
            <Route path="bugs" element={<BugDiary />} />
            <Route path="bugs/new" element={<BugEntry />} />
            <Route path="bugs/:bugId" element={<BugEntry />} />
            <Route path="architecture" element={<Architecture />} />
            <Route path="database-schema" element={<DatabaseSchema />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;