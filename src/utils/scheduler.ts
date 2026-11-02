import {
  SubjectTask,
  ScheduleSlot,
  ScheduleResult,
  Priority,
  QuestionFormat,
  QuestionDifficultyLevel,
} from '../types/schedule';
import {
  parseTimeToMinutes,
  formatMinutesTo12h,
  formatMinutesTo24h,
  calculateWindowMinutes,
  getEnglishDateFormatted,
} from './timeUtils';

// Priority sorting weight: higher gets scheduled earlier and gets more weight
const PRIORITY_ORDER: Record<Priority, number> = {
  very_high: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// Simple and refreshing break activity suggestions
const BREAK_ACTIVITIES = [
  '☕ اشرب كوب ماء أو مشروب دافئ',
  '🧘 خذ نفساً عميقاً واسترح بهدوء',
  '🚶 قوم اتمشى قليلاً وتمدد خفيف',
  '👁️ ريّح عينيك بعيداً عن الشاشة',
  '✨ استراحة قصيرة لتصفية ذهنك',
  '🍎 وجبة خفيفة ومياه لإنعاش طاقتك',
];

/**
 * Computes exact break time for a given study session according to the cognitive load reference table:
 *  - 30 دقيقة مذاكرة -> 10 دقائق استراحة
 *  - 45 دقيقة مذاكرة -> 15 دقيقة استراحة
 *  - 60 دقيقة مذاكرة -> 20 دقيقة استراحة
 *  - 90 دقيقة مذاكرة -> 25 دقيقة استراحة
 *  - ساعتين (120 دقيقة) مذاكرة -> 30 دقيقة استراحة
 *  - 3 ساعات (180 دقيقة فأكثر) مذاكرة -> 45 دقيقة استراحة
 */
export function getBreakDurationForStudy(studyMinutes: number): number {
  if (studyMinutes <= 35) {
    return 10;
  }
  if (studyMinutes <= 52) {
    return 15;
  }
  if (studyMinutes <= 75) {
    return 20;
  }
  if (studyMinutes <= 105) {
    return 25;
  }
  if (studyMinutes <= 150) {
    return 30;
  }
  return 45;
}

/**
 * Cognitive science estimation for solving questions based on Sweller's Cognitive Load Theory
 * and human prefrontal cortex working memory dynamics:
 *
 * Formats:
 * - 'mcq': Multiple Choice (الاختياري)
 *   - easy: 1.0 min/Q (direct factual recognition, low extraneous load)
 *   - medium: 1.5 min/Q (conceptual application, distractor elimination)
 *   - hard: 2.2 min/Q (multi-step deductive synthesis)
 *   - unspecified: 1.5 min/Q (balanced cognitive baseline)
 *
 * - 'essay': Written Response (المقالي)
 *   - easy: 2.0 min/Q (short definitions, direct explanation)
 *   - medium: 3.2 min/Q (structured analytical paragraphs, working steps)
 *   - hard: 4.8 min/Q (deep analytical proof, complex synthesis)
 *   - unspecified: 3.0 min/Q (balanced cognitive baseline for essay)
 *
 * Fatigue Law:
 * - Continuous solving over 50 questions causes prefrontal cortex exhaustion.
 * - If questions > 50, strictly partition into blocks of <= 50 questions
 *   separated by a cognitive restoration break to protect working memory.
 */
export function calculateScientificQuestionTime(
  questionsCount: number,
  format: QuestionFormat = 'mcq',
  difficultyLevel: QuestionDifficultyLevel = 'unspecified'
) {
  const q = Math.max(1, Math.min(1000, questionsCount || 1));
  let baseRate = 1.5;

  if (format === 'mcq') {
    switch (difficultyLevel) {
      case 'easy':
        baseRate = 1.0;
        break;
      case 'medium':
        baseRate = 1.5;
        break;
      case 'hard':
        baseRate = 2.2;
        break;
      case 'unspecified':
      default:
        baseRate = 1.5;
        break;
    }
  } else {
    // essay
    switch (difficultyLevel) {
      case 'easy':
        baseRate = 2.0;
        break;
      case 'medium':
        baseRate = 3.2;
        break;
      case 'hard':
        baseRate = 4.8;
        break;
      case 'unspecified':
      default:
        baseRate = 3.0;
        break;
    }
  }

  // Prefrontal cortex fatigue curve (+3.5% latency every 15 questions after 15)
  const fatigueFactor = 1 + Math.max(0, Math.floor(q / 15) - 1) * 0.035;
  const effectiveRate = Math.round(baseRate * fatigueFactor * 10) / 10;
  const totalMinutes = Math.max(10, Math.round(q * effectiveRate));

  const requiresBreak = q > 50;
  const partsCount = requiresBreak ? Math.ceil(q / 50) : 1;
  const questionsPerPart: number[] = [];

  if (partsCount > 1) {
    const basePerPart = Math.floor(q / partsCount);
    let rem = q % partsCount;
    for (let p = 0; p < partsCount; p++) {
      questionsPerPart.push(basePerPart + (rem > 0 ? 1 : 0));
      if (rem > 0) rem--;
    }
  } else {
    questionsPerPart.push(q);
  }

  const avgPartMinutes = Math.round(totalMinutes / partsCount);
  const recommendedBreakMinutes = getBreakDurationForStudy(avgPartMinutes);

  const formatTextAr = format === 'mcq' ? 'اختياري (MCQ)' : 'مقالي';
  const levelTextAr =
    difficultyLevel === 'easy'
      ? 'سهل'
      : difficultyLevel === 'medium'
      ? 'متوسط'
      : difficultyLevel === 'hard'
      ? 'صعب'
      : 'تلقائي';

  const cognitiveNoteAr = requiresBreak
    ? `تم تقسيم الـ ${q} سؤال إلى ${partsCount} جلسات مناسبة مع استراحة (${recommendedBreakMinutes} دقيقة) لتستمر بتركيز ونشاط.`
    : `جلسة حل أسئلة ${formatTextAr} (${levelTextAr}) بوقت مدروس ومناسب.`;

  const cognitiveNoteEn = requiresBreak
    ? `Divided ${q} questions into ${partsCount} balanced sessions with a ${recommendedBreakMinutes}m break.`
    : `Solving session for ${format.toUpperCase()} (${difficultyLevel}).`;

  return {
    totalMinutes,
    minutesPerQuestion: effectiveRate,
    partsCount,
    questionsPerPart,
    requiresBreak,
    recommendedBreakMinutes,
    cognitiveNoteAr,
    cognitiveNoteEn,
  };
}

export function generateQuantumSchedule(
  startTime: string,
  endTime: string,
  tasks: SubjectTask[]
): ScheduleResult {
  const windowMinutes = calculateWindowMinutes(startTime, endTime);
  const startMinuteBase = parseTimeToMinutes(startTime);

  if (windowMinutes <= 0 || tasks.length === 0) {
    return {
      generatedAt: Date.now(),
      dateFormatted: getEnglishDateFormatted(),
      startTimeStr: formatMinutesTo12h(startMinuteBase),
      endTimeStr: formatMinutesTo12h(startMinuteBase + windowMinutes),
      totalAvailableMinutes: windowMinutes,
      totalStudyMinutes: 0,
      totalBreakMinutes: 0,
      taskCount: 0,
      slots: [],
      overflowWarning: false,
      utilizationPercent: 0,
    };
  }

  // 1. Sort tasks primarily by priority (Very High first, then High, Medium, Low)
  // Secondary by creation or order
  const sortedTasks = [...tasks].sort((a, b) => {
    const diff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    if (diff !== 0) return diff;
    return a.createdAt - b.createdAt;
  });

  // 2. Break down tasks into planned study segments
  interface PlannedSegment {
    subjectId: string;
    title: string;
    subtitle: string;
    priority: Priority;
    contentType: SubjectTask['contentType'];
    durationMinutes: number;
    isSplitPart?: boolean;
    partIndex?: number;
    totalParts?: number;
    questionsCount?: number;
    questionFormat?: QuestionFormat;
    questionDifficultyLevel?: QuestionDifficultyLevel;
    isPracticeTask?: boolean;
  }

  const plannedSegments: PlannedSegment[] = [];

  for (const task of sortedTasks) {
    if (task.contentType === 'video' && (task.videoDurationMinutes || 0) > 0) {
      const vidMinutes = task.videoDurationMinutes!;
      // Allow single sessions up to 95 minutes intact (so 60m or 90m videos match the reference table)
      if (vidMinutes <= 95) {
        plannedSegments.push({
          subjectId: task.id,
          title: task.name,
          subtitle: task.topic ? `${task.topic} · Video (${vidMinutes}m)` : `Video Lecture (${vidMinutes}m)`,
          priority: task.priority,
          contentType: 'video',
          durationMinutes: vidMinutes,
        });
      } else {
        // Split longer videos (e.g. >95 min) into balanced chunks of ~60m or ~90m
        const partsCount = Math.ceil(vidMinutes / 80);
        const basePart = Math.floor(vidMinutes / partsCount);
        let rem = vidMinutes % partsCount;

        for (let i = 0; i < partsCount; i++) {
          const partDuration = basePart + (rem > 0 ? 1 : 0);
          if (rem > 0) rem--;
          plannedSegments.push({
            subjectId: task.id,
            title: task.name,
            subtitle: `${task.topic ? `${task.topic} · ` : ''}Video Part ${i + 1}/${partsCount} (${partDuration}m)`,
            priority: task.priority,
            contentType: 'video',
            durationMinutes: partDuration,
            isSplitPart: true,
            partIndex: i + 1,
            totalParts: partsCount,
          });
        }
      }
    } else if (task.contentType === 'practice') {
      const qCount = task.questionsCount || 0;
      const format = task.questionFormat || 'mcq';
      const level = task.questionDifficultyLevel || 'unspecified';
      const sci = calculateScientificQuestionTime(qCount > 0 ? qCount : 20, format, level);

      const totalTargetMinutes = sci.totalMinutes;

      const formatLabelAr = format === 'mcq' ? 'اختياري MCQ' : 'مقالي';
      const levelLabelAr =
        level === 'easy'
          ? 'سهل'
          : level === 'medium'
          ? 'متوسط'
          : level === 'hard'
          ? 'صعب'
          : '';

      const detailBadge = `${formatLabelAr}${levelLabelAr ? ` (${levelLabelAr})` : ''}`;

      // Neuroscience Rule: If questions count > 50, strictly split into blocks of <= 50 questions
      // separated by a restorative cognitive break to protect working memory from depletion!
      if (qCount > 50) {
        const partsCount = sci.partsCount;
        const qParts = sci.questionsPerPart;

        for (let p = 0; p < partsCount; p++) {
          const partQ = qParts[p];
          const partDuration = Math.max(15, Math.round((partQ / qCount) * totalTargetMinutes));

          plannedSegments.push({
            subjectId: task.id,
            title: task.name,
            subtitle: `${task.topic ? `${task.topic} · ` : ''}الجزء ${p + 1}/${partsCount}: حل ${partQ} سؤال ${detailBadge} (${partDuration} دقيقة)`,
            priority: task.priority,
            contentType: 'practice',
            durationMinutes: partDuration,
            isSplitPart: true,
            partIndex: p + 1,
            totalParts: partsCount,
            questionsCount: partQ,
            questionFormat: format,
            questionDifficultyLevel: level,
            isPracticeTask: true,
          });
        }
      } else {
        const typeLabel = qCount > 0 ? `حل ${qCount} سؤال ${detailBadge} (${totalTargetMinutes} دقيقة)` : `حل أسئلة ${detailBadge}`;
        plannedSegments.push({
          subjectId: task.id,
          title: task.name,
          subtitle: task.topic ? `${task.topic} · ${typeLabel}` : typeLabel,
          priority: task.priority,
          contentType: 'practice',
          durationMinutes: totalTargetMinutes,
          questionsCount: qCount > 0 ? qCount : undefined,
          questionFormat: format,
          questionDifficultyLevel: level,
          isPracticeTask: true,
        });
      }
    } else {
      // General study or revision
      let idealMinutes = 45;
      if (task.targetDurationMinutes && task.targetDurationMinutes > 0) {
        idealMinutes = task.targetDurationMinutes;
      } else {
        if (task.priority === 'very_high') idealMinutes = 60;
        else if (task.priority === 'high') idealMinutes = 45;
        else if (task.priority === 'medium') idealMinutes = 30;
        else idealMinutes = 30;
      }

      const typeLabel = task.contentType === 'revision' ? 'مراجعة وتثبيت' : 'مذاكرة وفهم';

      plannedSegments.push({
        subjectId: task.id,
        title: task.name,
        subtitle: task.topic ? `${task.topic} · ${typeLabel}` : typeLabel,
        priority: task.priority,
        contentType: task.contentType,
        durationMinutes: idealMinutes,
      });
    }
  }

  // 3. Assemble schedule slots with dynamic breaks into the available window
  let currentMinute = startMinuteBase;
  const windowEndMinute = startMinuteBase + windowMinutes;
  const slots: ScheduleSlot[] = [];
  let totalStudyMinutes = 0;
  let totalBreakMinutes = 0;
  let overflowWarning = false;
  let scheduledTasksSet = new Set<string>();

  // Determine standard break length based on window size:
  // For tight windows (< 120m), 5m break; for standard (>= 120m), 10m break
  const standardBreakMinutes = windowMinutes >= 180 ? 10 : 7;

  let missingMinutes = 0;
  const unscheduledTasksSummary: string[] = [];

  for (let i = 0; i < plannedSegments.length; i++) {
    const seg = plannedSegments[i];
    const remainingWindow = windowEndMinute - currentMinute;

    // If remaining time is less than minimal session threshold (15 minutes), remaining segments overflow
    if (remainingWindow < 15) {
      overflowWarning = true;
      for (let j = i; j < plannedSegments.length; j++) {
        const unSeg = plannedSegments[j];
        const unBreak = getBreakDurationForStudy(unSeg.durationMinutes);
        missingMinutes += unSeg.durationMinutes + (j < plannedSegments.length - 1 ? unBreak : 0);
        unscheduledTasksSummary.push(`${unSeg.title} (${unSeg.subtitle})`);
      }
      break;
    }

    // Determine actual duration for this segment
    let actualDuration = seg.durationMinutes;
    let wasTruncated = false;

    // Check if fitting this segment and a subsequent break exceeds remaining window
    if (actualDuration > remainingWindow) {
      // If task can fit partially (at least 20 min), scale it to fit remaining window
      if (remainingWindow >= 20) {
        const lostMinutes = actualDuration - remainingWindow;
        actualDuration = remainingWindow;
        wasTruncated = true;
        overflowWarning = true;
        missingMinutes += lostMinutes;
        unscheduledTasksSummary.push(`${seg.title} (متبقي ${lostMinutes} دقيقة من ${seg.subtitle})`);
      } else {
        overflowWarning = true;
        for (let j = i; j < plannedSegments.length; j++) {
          const unSeg = plannedSegments[j];
          const unBreak = getBreakDurationForStudy(unSeg.durationMinutes);
          missingMinutes += unSeg.durationMinutes + (j < plannedSegments.length - 1 ? unBreak : 0);
          unscheduledTasksSummary.push(`${unSeg.title} (${unSeg.subtitle})`);
        }
        break;
      }
    }

    const slotStartMin = currentMinute;
    const slotEndMin = slotStartMin + actualDuration;

    const displaySubtitle = wasTruncated
      ? `${seg.subtitle} (تم تقليصها إلى ${actualDuration} دقيقة لانتهاء الوقت المحدد)`
      : seg.subtitle;

    slots.push({
      id: `slot-study-${seg.subjectId}-${i}`,
      type: 'study',
      subjectId: seg.subjectId,
      title: seg.title,
      subtitle: displaySubtitle,
      priority: seg.priority,
      contentType: seg.contentType,
      questionsCount: seg.questionsCount,
      questionFormat: seg.questionFormat,
      questionDifficultyLevel: seg.questionDifficultyLevel,
      startTime: formatMinutesTo12h(slotStartMin),
      endTime: formatMinutesTo12h(slotEndMin),
      startMinutes: slotStartMin,
      endMinutes: slotEndMin,
      durationMinutes: actualDuration,
      isCompleted: false,
    });

    totalStudyMinutes += actualDuration;
    currentMinute = slotEndMin;
    scheduledTasksSet.add(seg.subjectId);

    // If there are more segments to schedule and sufficient time left, insert a dynamic break
    const timeLeft = windowEndMinute - currentMinute;
    const isLastSegment = i === plannedSegments.length - 1;

    if (!isLastSegment && timeLeft >= 10) {
      // Dynamic break strictly calculated from reference table:
      // 30m -> 10m | 45m -> 15m | 60m -> 20m | 90m -> 25m | 2h -> 30m | 3h -> 45m
      const idealBreakMinutes = getBreakDurationForStudy(actualDuration);

      // Fit within remaining time while preserving required break duration
      const breakDuration = timeLeft >= idealBreakMinutes + 15
        ? idealBreakMinutes
        : Math.min(idealBreakMinutes, Math.max(5, timeLeft - 15));

      if (breakDuration >= 5) {
        const breakStartMin = currentMinute;
        const breakEndMin = breakStartMin + breakDuration;
        const breakActivity = BREAK_ACTIVITIES[slots.length % BREAK_ACTIVITIES.length];

        const isCognitiveQuestionBreak = seg.isPracticeTask && (seg.questionsCount || 0) > 0;
        const breakTitle = '☕ وقت استراحة وراحة';
        const breakSubtitle = isCognitiveQuestionBreak
          ? `استراحة ${breakDuration} دقيقة بعد حل ${seg.questionsCount} سؤال لتستعيد كامل طاقتك ونشاطك`
          : `${breakActivity} (${breakDuration} دقيقة)`;

        slots.push({
          id: `slot-break-${i}`,
          type: 'break',
          title: breakTitle,
          subtitle: breakSubtitle,
          startTime: formatMinutesTo12h(breakStartMin),
          endTime: formatMinutesTo12h(breakEndMin),
          startMinutes: breakStartMin,
          endMinutes: breakEndMin,
          durationMinutes: breakDuration,
          isCompleted: false,
        });

        totalBreakMinutes += breakDuration;
        currentMinute = breakEndMin;
      }
    }
  }

  // If there are unscheduled tasks, mark overflow
  if (scheduledTasksSet.size < tasks.length) {
    overflowWarning = true;
  }

  // Calculate suggested new end time if overflow occurred
  let suggestedEndTime24h: string | undefined;
  let suggestedEndTime12h: string | undefined;

  if (overflowWarning) {
    if (missingMinutes <= 0) {
      // Fallback: estimate from unscheduled tasks directly
      for (const t of tasks) {
        if (!scheduledTasksSet.has(t.id)) {
          const dur = t.videoDurationMinutes || t.targetDurationMinutes || 45;
          missingMinutes += dur + getBreakDurationForStudy(dur);
          unscheduledTasksSummary.push(`${t.name} (${dur} دقيقة)`);
        }
      }
    }
    const totalRequiredWindow = windowMinutes + Math.max(30, missingMinutes);
    const suggestedEndMinute = startMinuteBase + totalRequiredWindow;
    suggestedEndTime24h = formatMinutesTo24h(suggestedEndMinute);
    suggestedEndTime12h = formatMinutesTo12h(suggestedEndMinute);
  }

  const overflowMessage = overflowWarning
    ? `الوقت المتاح في النافذة لا يكفي لإنهاء كافة المواد والراحات المضافة. تم ترتيب المواد حسب الأولوية القصوى.`
    : undefined;

  const totalUsed = totalStudyMinutes + totalBreakMinutes;
  const utilizationPercent = Math.min(100, Math.round((totalUsed / windowMinutes) * 100));

  return {
    generatedAt: Date.now(),
    dateFormatted: getEnglishDateFormatted(),
    startTimeStr: formatMinutesTo12h(startMinuteBase),
    endTimeStr: formatMinutesTo12h(windowEndMinute),
    totalAvailableMinutes: windowMinutes,
    totalStudyMinutes,
    totalBreakMinutes,
    taskCount: scheduledTasksSet.size,
    slots,
    overflowWarning,
    overflowMessage,
    missingMinutes: missingMinutes > 0 ? missingMinutes : undefined,
    suggestedEndTime24h,
    suggestedEndTime12h,
    unscheduledTasksSummary: unscheduledTasksSummary.length > 0 ? unscheduledTasksSummary : undefined,
    utilizationPercent,
  };
}

/**
 * Ensures any previously generated or cached schedules do not contain complex jargon,
 * translating phrases like "لتفريغ الذاكرة المؤقتة" to clear, friendly Arabic.
 */
export function sanitizeScheduleResult(res: ScheduleResult | null | undefined): ScheduleResult | null {
  if (!res) return null;
  const clean = (str?: string): string => {
    if (!str) return '';
    return str
      .replace(/لتفريغ الذاكرة المؤقتة/g, 'لتستعيد كامل طاقتك ونشاطك')
      .replace(/تفريغ الذاكرة/g, 'تصفية ذهنك واستعادة نشاطك')
      .replace(/الذاكرة المؤقتة/g, 'النشاط والتركيز');
  };

  return {
    ...res,
    overflowMessage: res.overflowMessage ? clean(res.overflowMessage) : undefined,
    slots: (res.slots || []).map((slot) => ({
      ...slot,
      title: clean(slot.title),
      subtitle: clean(slot.subtitle),
    })),
  };
}
