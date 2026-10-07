import React from "react";

interface FaviconProps {
  domain: string;
  alt: string;
  className?: string;
}

const Favicon: React.FC<FaviconProps> = ({ domain, alt, className = "w-6 h-6" }) => (
  <img
    src={domain === "classroom.google.com" 
      ? "https://ssl.gstatic.com/classroom/logo_square_rounded.svg"
      : `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    }
    alt={alt}
    className={`${className} rounded-sm`}
    loading="lazy"
    onError={(e) => {
      // Fallback до загального логотипу Google Classroom
      (e.target as HTMLImageElement).src = "https://ssl.gstatic.com/classroom/favicon.png";
    }}
  />
);

interface ClassroomIconProps {
  href: string;
  className?: string;
  title?: string;
}

export const ClassroomIcon: React.FC<ClassroomIconProps> = ({ 
  href, 
  className = "w-6 h-6", 
  title = "Відкрити в Google Classroom" 
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-accent/50 hover:scale-110 transition-all duration-200 cursor-pointer"
      title={title}
      aria-label={title}
    >
      <Favicon domain="classroom.google.com" alt="Google Classroom" className={className} />
    </a>
  );
};