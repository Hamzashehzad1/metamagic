import * as React from "react";

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="30"
      height="36"
      viewBox="2 1 26 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15 1.125L2.25 10.125V25.875L15 34.125L27.75 25.875V10.125L15 1.125ZM15 28.5L6.75 22.875V13.125L15 7.5L23.25 13.125V22.875L15 28.5Z"
        fill="url(#logo-gradient)"
      />
      <path
        d="M17.5312 11.25L15 9.46875L12.4688 11.25L13.2188 8.4375L11.0625 6.5625L13.9688 6.32812L15 3.5625L16.0312 6.32812L18.9375 6.5625L16.7812 8.4375L17.5312 11.25Z"
        fill="hsl(var(--accent))"
      />
      <defs>
        <linearGradient
          id="logo-gradient"
          x1="15"
          y1="1.125"
          x2="15"
          y2="34.125"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="hsl(var(--primary))" />
          <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
        </linearGradient>
      </defs>
    </svg>
  );
}
