import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import AdminCurriculum from './AdminCurriculum';
import AssignmentUpload from './AssignmentUpload';
import AttendanceTracker from './AttendanceTracker';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-yellow-500 font-medium">
        Loading Sunningdale E-Campus...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-white tracking-wider">SUNNINGDALE UNIVERSITY</h1>
            <p className="text-xs uppercase tracking-widest text-yellow-500 font-semibold">E-Campus Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Campus Email / ID</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. SUN/2026/001@sunningdale.ecampus.edu"
                className="w-full rounded-lg bg-gray-950 border border-gray-800 px-4 py-3 text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg bg-gray-950 border border-gray-800 px-4 py-3 text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-400 font-bold text-gray-950 py-3 rounded-lg transition-all shadow-lg shadow-yellow-500/10"
            >
              Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center font-black text-gray-950 text-xl">
            SU
          </div>
          <div>
            <h2 className="font-bold text-white text-sm sm:text-base">Sunningdale E-Campus</h2>
            <p className="text-xs text-yellow-500">{userData?.role ? userData.role.toUpperCase() : 'STUDENT'} PORTAL</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-all border border-gray-700"
        >
          Sign Out
        </button>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        <div className="flex space-x-2 border-b border-gray-800 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-yellow-500 text-gray-950 font-bold' : 'text-gray-400 hover:text-white bg-gray-900'
            }`}
          >
            Dashboard
          </button>
          {userData?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'curriculum' ? 'bg-yellow-500 text-gray-950 font-bold' : 'text-gray-400 hover:text-white bg-gray-900'
              }`}
            >
              Curriculum Management
            </button>
          )}
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'assignments' ? 'bg-yellow-500 text-gray-950 font-bold' : 'text-gray-400 hover:text-white bg-gray-900'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'attendance' ? 'bg-yellow-500 text-gray-950 font-bold' : 'text-gray-400 hover:text-white bg-gray-900'
            }`}
          >
            Attendance
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-900 to-gray-950 p-8 rounded-2xl border border-gray-800 shadow-xl space-y-3">
              <h3 className="text-2xl font-black text-white">Welcome back, {userData?.fullName || 'Scholar'}!</h3>
              <p className="text-gray-400 text-sm max-w-2xl">
                Access your course materials, upload coursework assignments, and track your daily lecture registers across the Sunningdale academic network.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'curriculum' && <AdminCurriculum />}
        {activeTab === 'assignments' && <AssignmentUpload />}
        {activeTab === 'attendance' && <AttendanceTracker user={userData} />}
      </main>
    </div>
  );
}
