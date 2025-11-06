import React from 'react';

const RocketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.7-3.29s-.31-2.01-.7-2.7z"/>
    <path d="m15 5 3 3"/>
    <path d="M9 13c-3 3 2 8 2 8s5-5 8-2c3-3-1-10-1-10s-7 4-10 1"/>
  </svg>
);

export default RocketIcon;
