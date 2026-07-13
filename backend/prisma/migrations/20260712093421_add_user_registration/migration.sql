-- CreateIndex
CREATE INDEX "assignment_submissions_assignmentId_idx" ON "assignment_submissions"("assignmentId");

-- CreateIndex
CREATE INDEX "assignment_submissions_status_idx" ON "assignment_submissions"("status");

-- CreateIndex
CREATE INDEX "assignment_submissions_submittedAt_idx" ON "assignment_submissions"("submittedAt");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "certificates_learnerId_idx" ON "certificates"("learnerId");

-- CreateIndex
CREATE INDEX "certificates_courseId_idx" ON "certificates"("courseId");

-- CreateIndex
CREATE INDEX "course_trainers_courseId_trainerId_idx" ON "course_trainers"("courseId", "trainerId");

-- CreateIndex
CREATE INDEX "courses_createdById_idx" ON "courses"("createdById");

-- CreateIndex
CREATE INDEX "courses_status_department_idx" ON "courses"("status", "department");

-- CreateIndex
CREATE INDEX "courses_createdById_status_idx" ON "courses"("createdById", "status");

-- CreateIndex
CREATE INDEX "enrollments_learnerId_idx" ON "enrollments"("learnerId");

-- CreateIndex
CREATE INDEX "enrollments_status_courseId_idx" ON "enrollments"("status", "courseId");

-- CreateIndex
CREATE INDEX "enrollments_status_learnerId_idx" ON "enrollments"("status", "learnerId");

-- CreateIndex
CREATE INDEX "enrollments_enrolledAt_idx" ON "enrollments"("enrolledAt");

-- CreateIndex
CREATE INDEX "enrollments_completedAt_idx" ON "enrollments"("completedAt");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "progress_lessonId_idx" ON "progress"("lessonId");

-- CreateIndex
CREATE INDEX "progress_completed_learnerId_idx" ON "progress"("completed", "learnerId");

-- CreateIndex
CREATE INDEX "quiz_submissions_quizId_learnerId_idx" ON "quiz_submissions"("quizId", "learnerId");

-- CreateIndex
CREATE INDEX "quiz_submissions_passed_idx" ON "quiz_submissions"("passed");

-- CreateIndex
CREATE INDEX "quiz_submissions_submittedAt_idx" ON "quiz_submissions"("submittedAt");

-- CreateIndex
CREATE INDEX "users_role_isActive_idx" ON "users"("role", "isActive");

-- CreateIndex
CREATE INDEX "users_createdByAdminId_idx" ON "users"("createdByAdminId");
