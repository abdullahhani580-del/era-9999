export type Priority = 'very_high' | 'high' | 'medium' | 'low';

export type ContentType = 'video' | 'study' | 'practice' | 'revision';

export type QuestionDifficulty = 'quick' | 'standard' | 'complex';

export type QuestionFormat = 'mcq' | 'essay';

export type QuestionDifficultyLevel = 'easy' | 'medium' | 'hard' | 'unspecified';

export interface SubjectTask {
  id: string;
  name: string;
  priority: Priority;
  contentType: ContentType;
  videoDurationFormatted?: string; // e.g. "01:35:00"
  videoDurationMinutes?: number; // total minutes
  questionsCount?: number; // Number of questions to solve for practice tasks
  questionFormat?: QuestionFormat; // 'mcq' | 'essay'
  questionDifficultyLevel?: QuestionDifficultyLevel; // 'easy' | 'medium' | 'hard' | 'unspecified'
  questionDifficulty?: QuestionDifficulty; // Legacy difficulty level
  targetDurationMinutes?: number; // Desired study duration (e.g. 30, 45, 60, 90, 120, 180)
  topic?: string; // e.g. "Lecture 1", "Chapter 4"
  createdAt: number;
}

export interface ScheduleSlot {
  id: string;
  type: 'study' | 'break';
  subjectId?: string;
  title: string;
  subtitle?: string;
  priority?: Priority;
  contentType?: ContentType;
  questionsCount?: number;
  questionFormat?: QuestionFormat;
  questionDifficultyLevel?: QuestionDifficultyLevel;
  startTime: string; // "06:00 PM"
  endTime: string; // "06:50 PM"
  startMinutes: number; // minutes from 0:00 of day 1
  endMinutes: number;
  durationMinutes: number;
  isCompleted?: boolean;
}

export interface ScheduleResult {
  generatedAt: number;
  dateFormatted: string;
  startTimeStr: string;
  endTimeStr: string;
  totalAvailableMinutes: number;
  totalStudyMinutes: number;
  totalBreakMinutes: number;
  taskCount: number;
  slots: ScheduleSlot[];
  overflowWarning?: boolean;
  overflowMessage?: string;
  missingMinutes?: number;
  suggestedEndTime24h?: string;
  suggestedEndTime12h?: string;
  unscheduledTasksSummary?: string[];
  utilizationPercent: number;
}

export interface TimeWindow {
  startTime: string; // e.g. "18:00"
  endTime: string; // e.g. "00:00"
}
