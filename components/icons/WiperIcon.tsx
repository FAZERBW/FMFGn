
import React from 'react';

const WiperIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22V8" />
    <path d="M2 12l5.09-3.41" />
    <path d="m12 8-5.09-3.41" />
    <path d="M12 8l5.09-3.41" />
    <path d="M22 12l-5.09-3.41" />
  </svg>
);

export default WiperIcon;
