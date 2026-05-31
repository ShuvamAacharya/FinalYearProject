export const INSTRUCTOR_ELIGIBILITY = {
  minQuizzes: 3,
  minAverageScore: 80,
} as const;

export interface PerformanceMetricsLike {
  totalQuizzesTaken?: number;
  averageScore?: number;
}

export function meetsInstructorRequirements(pm?: PerformanceMetricsLike | null) {
  if (!pm) return false;
  return (
    (pm.totalQuizzesTaken ?? 0) >= INSTRUCTOR_ELIGIBILITY.minQuizzes &&
    (pm.averageScore ?? 0) >= INSTRUCTOR_ELIGIBILITY.minAverageScore
  );
}

export function getEligibilityProgress(pm?: PerformanceMetricsLike | null) {
  const quizzes = pm?.totalQuizzesTaken ?? 0;
  const avg = pm?.averageScore ?? 0;
  return {
    quizzesMet: quizzes >= INSTRUCTOR_ELIGIBILITY.minQuizzes,
    scoreMet: avg >= INSTRUCTOR_ELIGIBILITY.minAverageScore,
    quizzes,
    averageScore: avg,
    quizProgress: Math.min(100, (quizzes / INSTRUCTOR_ELIGIBILITY.minQuizzes) * 100),
    scoreProgress: Math.min(100, (avg / INSTRUCTOR_ELIGIBILITY.minAverageScore) * 100),
  };
}
