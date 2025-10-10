import React from "react";

type Props = {
  onExportAll: () => void;
  onExportCourse: () => void;
  onExportLevel: () => void;
  className?: string;
};

const ExportButtons: React.FC<Props> = ({
  onExportAll,
  onExportCourse,
  onExportLevel,
  className,
}) => (
  <div className={`grid gap-3 sm:grid-cols-3 ${className ?? ""}`}>
    <button className="btn py-3 rounded-2xl hover-shadow" onClick={onExportAll}>
      Експортувати весь розклад
    </button>
    <button className="btn py-3 rounded-2xl hover-shadow" onClick={onExportCourse}>
      Експортувати розклад курсу
    </button>
    <button className="btn py-3 rounded-2xl hover-shadow" onClick={onExportLevel}>
      Експортувати розклад бакалаврів / магістрів
    </button>
  </div>
);

export default ExportButtons;
