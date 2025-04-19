import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from "./lib/supabase";
import TeacherDashboard from "./components/TeacherDashboard";
import ParentDashboard from "./components/ParentDashboard";
import Auth from "./components/Auth";
import { StudentDashboard } from "./components/StudentDashboard";
import StudentCodeEntry from "./components/StudentCodeEntry";

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const testUser = localStorage.getItem('testUser');
    if (testUser) {
      setUser(JSON.parse(testUser));
      setLoading(false);
      return;
    }

    
    const session = supabase.auth.getSession();
    session.then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={
          user ? (
            user.role === 'teacher' ? <TeacherDashboard /> :
            user.role === 'parent' ? <ParentDashboard /> :
            <StudentDashboard />
          ) : <Navigate to="/auth" />
        } />
        <Route path="/classroom" element={<StudentCodeEntry />} />
      </Routes>
    </div>
  );
};

export default App;
