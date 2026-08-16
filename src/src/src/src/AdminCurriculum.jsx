import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export default function AdminCurriculum() {
  const [courses, setCourses] = useState([]);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [department, setDepartment] = useState('Computing');
  const [semester, setSemester] = useState('Semester I');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      setCourses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!courseCode || !courseName) {
      alert("Please enter both Course Code and Course Name.");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'courses'), {
        courseCode,
        courseName,
        department,
        semester,
        createdAt: serverTimestamp()
      });
      setCourseCode('');
      setCourseName('');
      fetchCourses();
      alert("Course added successfully to curriculum!");
    } catch (err) {
      alert("Error adding course: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this course?")) {
      try {
        await deleteDoc(doc(db, 'courses', id));
        fetchCourses();
      } catch (err) {
        alert("Error deleting course: " + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-2">Curriculum Management</h3>
        <p className="text-gray-400 text-sm mb-6">Add and configure official academic modules and programs.</p>

        <form onSubmit={handleAddCourse} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Course Code</label>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g., CS101"
                className="w-full rounded-lg bg-gray-950 border border-gray-800 px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Course Name</label>
              <input
                type="text"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Intro to Software Engineering"
                className="w-full rounded-lg bg-gray-950 border border-gray-800 px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-lg bg-gray-950 border border-gray-800 px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="Computing">Computing & Technology</option>
                <option value="Business">Business & Management</option>
                <option value="Health">Health Sciences</option>
                <option value="Education">Humanities & Education</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-lg bg-gray-950 border border-gray-800 px-4 py-2.5 text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="Semester I">Semester I</option>
                <option value="Semester II">Semester II</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-500 hover:bg-yellow-400 font-semibold text-gray-950 py-3 rounded-lg transition-all shadow-lg shadow-yellow-500/10"
          >
            {submitting ? 'Adding Course...' : 'Add Course to Curriculum'}
          </button>
        </form>
      </div>

      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
        <h4 className="text-lg font-bold text-white mb-4">Active Modules</h4>
        {loading ? (
          <div className="text-center py-6 text-yellow-500 text-sm">Loading curriculum...</div>
        ) : courses.length === 0 ? (
          <p className="text-gray-400 text-sm">No modules added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {courses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-950/50">
                    <td className="py-3 px-4 font-mono text-yellow-500 font-medium">{course.courseCode}</td>
                    <td className="py-3 px-4 text-white font-medium">{course.courseName}</td>
                    <td className="py-3 px-4 text-gray-300">{course.department}</td>
                    <td className="py-3 px-4 text-gray-300">{course.semester}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-semibold px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
