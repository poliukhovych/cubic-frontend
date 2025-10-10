// Aurora.tsx
import React from "react";

const Aurora: React.FC = () => (
  <div className="aurora" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
    <div className="aurora-container">
      <span className="aurora__blob aurora__blob--1" />
      <span className="aurora__blob aurora__blob--2" />
      <span className="aurora__blob aurora__blob--3" />
      <span className="aurora__blob aurora__blob--4" />
      <span className="aurora__blob aurora__blob--5" />
      <span className="aurora__blob aurora__blob--6" />
      <span className="aurora__blob aurora__blob--7" />
      <span className="aurora__blob aurora__blob--8" />
    </div>
  </div>
);

export default Aurora;
