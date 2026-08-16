import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function AttendanceTracker({ user }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [status, setStatus] = useState('Present');
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const coursesSnap = await getDocs(collection(db, 'courses'));
      setCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const attendanceSnap = await getDocs(collection(db, 'attendance'));
      setAttendanceLogs(attendanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      alert("Please select a course module.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'attendance'), {
        courseId: selectedCourse,
        studentName: user?.fullName || 'Student',
        studentEmail: user?.email || '',
        status,
        createdAt: serverTimestamp()
      });
      setSelectedCourse('');
      fetchData();
      alert("Attendance logged successfully!");
    } catch (err) {
      alert("Error logging attendance: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-2">Lecture Attendance Register</h3>
        <p className="text-gray-400 text-sm mb-6">Mark your daily presence for active campus or virtual lecture sessions.</p>

        <form onSubmit={handleMarkAttendance} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Select Lecture Module</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
                className="w-full rounded-lg bg-gray-950 border border-gray-800 px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="">-- Choose Module --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg bg-gray-950 border border-gray-800 px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-500 hover:bg-yellow-400 font-semibold text-gray-950 py-3 rounded-lg transition-all shadow-lg shadow-yellow-500/10"
          >
            {submitting ? 'Submitting Register...' : 'Check In / Mark Attendance'}
          </button>
        </form>
      </div>

      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
        <h4 className="text-lg font-bold text-white mb-4">Attendance Logs</h4>
        {loading ? (
          <div className="text-center py-6 text-yellow-500 text-sm">Loading attendance records...</div>
        ) : attendanceLogs.length === 0 ? (
          <p className="text-gray-400 text-sm">No attendance records logged yet.</p>
        ) : (
          <div className="space-y-3">
            {attendanceLogs.map(log => (
              <div key={log.id} className="p-4 bg-gray-950 rounded-xl border border-gray-800 flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-white">{log.studentName}</h5>
                  <p className="text-xs text-gray-400">{log.studentEmail}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
