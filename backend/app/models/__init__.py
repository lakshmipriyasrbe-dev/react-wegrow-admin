from app.models.user import TCUser, TCLogin, TCAuditLog
from app.models.role import TCRole, TCRolePermission
from app.models.company import TCCompany, TCBank, TCPaymentMode
from app.models.staff import TCStaff, TCStaffLeaveRequest, TCAttendance, TCDailyReport
from app.models.course import TCCourse, TCCourseEnquiry, TCEnquiryFollowup, TCCourseClosure, TCPamphletRegistration, TCOffer
from app.models.enrollment import TCEnrollment, TCEnrollmentInternship
from app.models.payment import TCPayment, TCInstallment, TCInstallmentFollowupAssign, TCInstallmentFollowupHistory, TCInstallmentReminderHistory
from app.models.student import TCStudentAttendance, TCStudentDailyReport, TCStudentReport, TCStudentTask, TCStudentPerformance, TCStudentFeedback
from app.models.common import TCExpenseCategory, TCExpenseEntry, TCPayroll, TCEventCategory, TCEvent, TCTask, TCTaskComment, TCQuestion, TCQuestionSet, TCTestAttempt, TCTestAnswer
