import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("Admin");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchAllUsers();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:5000/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.role !== 'admin') {
        navigate('/dashboard');
      }
      setUserName(response.data.name);
    } catch (error) {
      console.error('Error fetching user data:', error);
      navigate('/login');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:5000/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar isDashboard={true} userName={userName} handleLogout={handleLogout} />
      </div>

      <div className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-600 mb-4 sm:mb-6">Admin Dashboard</h1>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm sm:text-base">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saved Questions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.skills && user.skills.length > 0 ? (
                            user.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">No skills</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {user.saved_questions ? user.saved_questions.length : 0} questions
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full z-30">
        <Footer />
      </div>
    </div>
  );
};

export default AdminDashboard; 