import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';

import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Company from '../pages/Company';
import Roles from '../pages/Roles';
import Users from '../pages/Users';
import Staff from '../pages/Staff';
import Courses from '../pages/Courses';
import Enquiries from '../pages/Enquiries';
import Enrollments from '../pages/Enrollments';
import Payments from '../pages/Payments';
import Attendance from '../pages/Attendance';
import Leaves from '../pages/Leaves';
import Payroll from '../pages/Payroll';
import Expenses from '../pages/Expenses';
import Tasks from '../pages/Tasks';
import Feedback from '../pages/Feedback';
import Events from '../pages/Events';
import Questions from '../pages/Questions';
import Reports from '../pages/Reports';
import Campaigns from '../pages/Campaigns';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/index.php" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dashboard.php" element={<Dashboard />} />
        <Route path="director_dashboard.php" element={<Dashboard />} />
        
        {/* Master Routes with both clean and .php aliases */}
        <Route path="company" element={<Company />} />
        <Route path="company.php" element={<Company />} />
        <Route path="role" element={<Roles />} />
        <Route path="role.php" element={<Roles />} />
        <Route path="roles" element={<Roles />} />
        <Route path="roles.php" element={<Roles />} />
        <Route path="users" element={<Users />} />
        <Route path="users.php" element={<Users />} />
        <Route path="staff" element={<Staff />} />
        <Route path="staff.php" element={<Staff />} />
        <Route path="course" element={<Courses />} />
        <Route path="course.php" element={<Courses />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses.php" element={<Courses />} />
        <Route path="event_category.php" element={<Events />} />
        <Route path="event-categories" element={<Events />} />
        <Route path="event" element={<Events />} />
        <Route path="event.php" element={<Events />} />
        <Route path="events" element={<Events />} />
        <Route path="questions" element={<Questions />} />
        <Route path="questions.php" element={<Questions />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="tasks.php" element={<Tasks />} />

        {/* Enquiry Routes */}
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="course_enquiry.php" element={<Enquiries />} />
        <Route path="other_enquiry.php" element={<Enquiries />} />
        <Route path="enquiry-followup" element={<Enquiries />} />
        <Route path="enquiry_followup.php" element={<Enquiries />} />
        <Route path="pamphlet-registration" element={<Enquiries />} />
        <Route path="pamphlet_registration.php" element={<Enquiries />} />

        {/* Enrollment Routes */}
        <Route path="enrollments" element={<Enrollments isInternship={false} />} />
        <Route path="enrollment.php" element={<Enrollments isInternship={false} />} />
        <Route path="enrollments-internship" element={<Enrollments isInternship={true} />} />
        <Route path="enrollment_internship.php" element={<Enrollments isInternship={true} />} />
        <Route path="student-performance" element={<Enrollments isInternship={false} />} />
        <Route path="student_performance.php" element={<Enrollments isInternship={false} />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="student_feedback.php" element={<Feedback />} />
        <Route path="feedback-review" element={<Feedback />} />
        <Route path="feedback_review.php" element={<Feedback />} />
        <Route path="course-closure" element={<Enrollments isInternship={false} />} />
        <Route path="course_closure.php" element={<Enrollments isInternship={false} />} />
        <Route path="offers" element={<Courses />} />
        <Route path="offer.php" element={<Courses />} />

        {/* Staff Management */}
        <Route path="attendance" element={<Attendance />} />
        <Route path="attendance.php" element={<Attendance />} />
        <Route path="attendance-staff" element={<Attendance />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="payroll.php" element={<Payroll />} />

        {/* Payments & Fees */}
        <Route path="payment-modes" element={<Expenses />} />
        <Route path="payment_mode.php" element={<Expenses />} />
        <Route path="banks" element={<Company />} />
        <Route path="bank.php" element={<Company />} />
        <Route path="payments" element={<Payments />} />
        <Route path="receipt.php" element={<Payments />} />
        <Route path="installment-followup" element={<Payments />} />
        <Route path="installment_followup.php" element={<Payments />} />

        {/* Expense */}
        <Route path="expense-categories" element={<Expenses />} />
        <Route path="expense_category.php" element={<Expenses />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="expense_entry.php" element={<Expenses />} />

        {/* HR & Leaves */}
        <Route path="leaves" element={<Leaves />} />
        <Route path="leave_approval.php" element={<Leaves />} />

        {/* Communication */}
        <Route path="installment-reminders" element={<Payments />} />
        <Route path="installment_reminders.php" element={<Payments />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="campaign.php" element={<Campaigns />} />

        {/* Reports */}
        <Route path="reports/*" element={<Reports />} />
        <Route path="report_enrollment.php" element={<Reports />} />
        <Route path="report_payments.php" element={<Reports />} />
        <Route path="report_attendance.php" element={<Reports />} />
        <Route path="report_payroll.php" element={<Reports />} />
        <Route path="report_expense.php" element={<Reports />} />
        <Route path="report_gst_invoice.php" element={<Reports />} />

        {/* Student & Account Hub */}
        <Route path="attendance-student" element={<Attendance />} />
        <Route path="student_attendance.php" element={<Attendance />} />
        <Route path="student-tasks" element={<Tasks />} />
        <Route path="student_tasks.php" element={<Tasks />} />
        <Route path="daily-report" element={<Tasks />} />
        <Route path="daily_report.php" element={<Tasks />} />
        <Route path="profile" element={<Staff />} />
        <Route path="student_profile.php" element={<Staff />} />
        <Route path="apply-leave" element={<Leaves />} />
        <Route path="apply_leave.php" element={<Leaves />} />
        <Route path="leave-history" element={<Leaves />} />
        <Route path="leave_history.php" element={<Leaves />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
