import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Brain, School, Users, Book, Mail } from 'lucide-react';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'teacher' | 'parent' | 'admin'>('student');
  const [error, setError] = useState('');
  const [showAdminRequest, setShowAdminRequest] = useState(false);

  const handleTestLogin = (userRole: 'student' | 'teacher' | 'parent') => {
    const testUser = {
      id: 'test-user',
      name: userRole === 'teacher' ? 'Math101' : userRole === 'parent' ? 'Parent User' : 'Test Student',
      role: userRole,
      classroomId: userRole === 'teacher' ? 'Math101' : 'test-classroom',
      progress: userRole === 'student' ? {
        math: 75,
        science: 60,
        english: 85,
        history: 70
      } : undefined,
      students: userRole === 'teacher' ? [
        { id: 's1', name: 'John Doe', progress: 80 },
        { id: 's2', name: 'Jane Smith', progress: 90 },
        { id: 's3', name: 'Mike Johnson', progress: 75 }
      ] : undefined,
      children: userRole === 'parent' ? [
        { id: 'c1', name: 'John Doe', classroom: 'Math101', progress: 80 },
        { id: 'c2', name: 'Jane Smith', classroom: 'Science101', progress: 90 }
      ] : undefined
    };
    localStorage.setItem('testUser', JSON.stringify(testUser));
    navigate('/dashboard');
  };

  const handleRoleSelect = (selectedRole: 'student' | 'teacher' | 'parent' | 'admin') => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setShowAdminRequest(true);
    } else if (selectedRole === 'student') {
      navigate('/classroom');
    } else if (selectedRole === 'teacher') {
      handleTestLogin('teacher');
    } else if (selectedRole === 'parent') {
      handleTestLogin('parent');
    }
  };

  if (showAdminRequest) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Request Admin Access</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit Request
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Thinkly</h1>
          <p className="text-gray-600 mt-2">Choose your role to continue</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleRoleSelect('student')}
            className={`p-4 rounded-lg border-2 ${
              role === 'student' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
            }`}
          >
            <Book className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-sm font-medium">Student</span>
          </button>
          <button
            onClick={() => handleRoleSelect('teacher')}
            className={`p-4 rounded-lg border-2 ${
              role === 'teacher' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
            }`}
          >
            <School className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-sm font-medium">Teacher</span>
          </button>
          <button
            onClick={() => handleRoleSelect('parent')}
            className={`p-4 rounded-lg border-2 ${
              role === 'parent' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
            }`}
          >
            <Users className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-sm font-medium">Parent</span>
          </button>
          <button
            onClick={() => handleRoleSelect('admin')}
            className="p-4 rounded-lg border-2 border-gray-200"
          >
            <Mail className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <span className="text-sm font-medium">Admin</span>
          </button>
        </div>

        <button
          onClick={() => handleTestLogin('student')}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          TEST (Hackathon)
        </button>
      </div>
    </div>
  );
};

export default Auth; 
