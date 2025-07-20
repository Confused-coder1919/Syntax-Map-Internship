import React, { useState } from 'react';
import './CollapsibleIframe.css'

const CollapsibleIframe = ({ src }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  let className = isCollapsed ? 'red-button' : '';

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div>
      <button className={className} onClick={toggleCollapse}>
        {isCollapsed ? 'Click here to start the exam' : 'Collapse'}
      </button>
      {!isCollapsed && <iframe width="100%" height="500px" src={src} title="Collapsible Iframe" />}
    </div>
  );
};

export default CollapsibleIframe;
