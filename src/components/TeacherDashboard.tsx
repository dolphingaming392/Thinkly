import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Brain, Book, Users, BarChart2, Calendar, MessageSquare } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  progress: number;
  lastActive: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

const TeacherDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Check for test user data
    const testUser = localStorage.getItem('testUser');
    if (testUser) {
      const userData = JSON.parse(testUser);
      if (userData.students) {
        setStudents(userData.students);
      }
      setLoading(false);
      return;
    }

    // In a real app, you would fetch the students data from the database
    // For now, we'll use mock data
    const mockStudents: Student[] = [
      { id: 's1', name: 'John Doe', progress: 80, lastActive: '2 hours ago' },
      { id: 's2', name: 'Jane Smith', progress: 90, lastActive: '1 hour ago' },
      { id: 's3', name: 'Mike Johnson', progress: 75, lastActive: '3 hours ago' }
    ];
    setStudents(mockStudents);

    // Mock chat messages
    const mockMessages: Message[] = [
      { id: 'm1', sender: 'John Doe', content: 'Can you explain the homework?', timestamp: '2 hours ago' },
      { id: 'm2', sender: 'You', content: 'Sure, what part do you need help with?', timestamp: '1 hour ago' },
      { id: 'm3', sender: 'Jane Smith', content: 'I finished the assignment early!', timestamp: '30 minutes ago' },
      { id: 'm4', sender: 'You', content: 'Great job, Jane!', timestamp: '20 minutes ago' }
    ];
    setMessages(mockMessages);

    setLoading(false);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: newMessage,
      timestamp: 'Just now'
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class Overview */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Class Overview | Math101</h2>
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{student.name}</h3>
                        <p className="text-sm text-gray-600">Last active: {student.lastActive}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Progress</p>
                          <p className="text-lg font-semibold">{student.progress}%</p>
                        </div>
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700">Recent Assignments</h4>
                        <ul className="mt-2 space-y-1">
                          <li className="text-sm text-gray-600">Math Quiz - 85%</li>
                          <li className="text-sm text-gray-600">Science Project - 90%</li>
                          <li className="text-sm text-gray-600">English Essay - 88%</li>
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

            {/* Class Chat */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Class Chat</h2>
              <div className="h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'You'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="font-medium">{message.sender}</p>
                        <p className="mt-1">{message.content}</p>
                        <p className="text-xs mt-2 opacity-70">{message.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard; 
