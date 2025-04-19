import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Brain, Book, Users, BarChart2, Calendar, MessageSquare } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  classroom: string;
  progress: number;
}

interface ParentDashboardProps {
  children?: Child[];
}

const ParentDashboard: React.FC<ParentDashboardProps> = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for test user data
    const testUser = localStorage.getItem('testUser');
    if (testUser) {
      const userData = JSON.parse(testUser);
      if (userData.children) {
        setChildren(userData.children);
      }
      setLoading(false);
      return;
    }

    // In a real app, you would fetch the children data from the database
    // For now, we'll use mock data
    const mockChildren: Child[] = [
      { id: 'c1', name: 'John Doe', classroom: 'Math101', progress: 80 },
      { id: 'c2', name: 'Aayan Ali ', classroom: 'Science202', progress: 90 }
    ];
    setChildren(mockChildren);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  localStorage.removeItem('testUser');
                  window.location.href = '/';
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6">
            {/* Children List */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Your Children</h2>
              <div className="space-y-4">
                {children.map((child) => (
                  <div key={child.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{child.name}</h3>
                        <p className="text-gray-600">Classroom: {child.classroom}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Progress</p>
                          <p className="text-lg font-semibold">{child.progress}%</p>
                        </div>
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${child.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700">Recent Assignments</h4>
                        <ul className="mt-2 space-y-1">
                          <li className="text-sm text-gray-600">Math Homework - 95%</li>
                          <li className="text-sm text-gray-600">Science Project - 88%</li>
                          <li className="text-sm text-gray-600">English Essay - 92%</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700">Attendance</h4>
                        <p className="mt-2 text-sm text-gray-600">Present: 95%</p>
                        <p className="text-sm text-gray-600">Absent: 2 days</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Progress */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Average Grades</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Math</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Science</span>
                      <span className="font-medium">90%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">English</span>
                      <span className="font-medium">88%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">History</span>
                      <span className="font-medium">82%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Attendance Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Days</span>
                      <span className="font-medium">180</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Present</span>
                      <span className="font-medium">175</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Absent</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attendance Rate</span>
                      <span className="font-medium">97%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard; 
