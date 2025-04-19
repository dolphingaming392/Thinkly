import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentCodeEntry: React.FC = () => {
  const navigate = useNavigate();
  const [classroomId, setClassroomId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!classroomId.trim()) {
      setError('Please enter a classroom ID');
      return;
    }

    // Store classroom ID in localStorage
    localStorage.setItem('classroomId', classroomId);
    
    // Navigate to student dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Enter Classroom Code
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="classroomId" className="sr-only">
                Classroom ID
              </label>
              <input
                id="classroomId"
                name="classroomId"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Classroom ID"
                value={classroomId}
                onChange={(e) => setClassroomId(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Join Classroom
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentCodeEntry; 
