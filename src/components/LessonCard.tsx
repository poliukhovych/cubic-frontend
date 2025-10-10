// src/components/LessonCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { slugify } from "@/lib/slug";
import { BookOpen, Video } from "lucide-react";
import type { Lesson } from "@/types/schedule";

interface Props {
  lesson: Lesson;
  isToday?: boolean;
  userRole: "student" | "teacher";
  subjectId?: string; // For teacher view, we need to pass the subjectId
}

const LessonCard: React.FC<Props> = ({ lesson, isToday = false, userRole, subjectId }) => {
  // Determine subject URL based on user role
  const subjectUrl = 
    userRole === "student"
      ? `/student/subject/${slugify(lesson.subject)}`
      : `/teacher/subject/${encodeURIComponent(subjectId || "")}`;

  return (
    <div 
      className={`glass glass-card p-4 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${
        isToday ? "border-primary/20" : ""
      }`}
    >
      {/* Time and location info */}
      <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
        <span className="font-medium">
          {lesson.time.start} — {lesson.time.end}
        </span>
        <span className="opacity-60">•</span>
        <span>{lesson.location || "—"}</span>
      </div>
      
      {/* Subject name */}
      <div className="font-medium text-foreground mb-2">{lesson.subject}</div>
      
      {/* Group info */}
      <div className="text-sm text-muted-foreground mb-3">
        {lesson.group.name}
        {lesson.group.subgroup ? `/${lesson.group.subgroup}` : ""}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-2">
        {lesson.meetingUrl && (
          <a
            href={lesson.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-primary/15 text-primary transition-all duration-200 hover:bg-primary/25"
          >
            <Video className="w-3 h-3" /> Відеопара
          </a>
        )}
        
        <Link
          to={subjectUrl}
          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-muted/20 text-muted-foreground transition-all duration-200 hover:bg-muted/30"
        >
          <BookOpen className="w-3 h-3" /> Сторінка предмету
        </Link>
      </div>
    </div>
  );
};

export default LessonCard;