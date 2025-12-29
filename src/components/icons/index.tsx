import React from "react";

type SVGProps = React.SVGProps<SVGSVGElement>;

export const Icon = ({ children, className = "h-4 w-4", ...props }: SVGProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);

export const Calendar = (props: SVGProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Icon>
);

export const Plus = (props: SVGProps) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const Trash2 = (props: SVGProps) => (
  <Icon {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
);

export const Edit2 = (props: SVGProps) => (
  <Icon {...props}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7 21l-4 1 1-4L17 3z" />
  </Icon>
);

export const Check = (props: SVGProps) => (
  <Icon {...props}>
    <path d="M20 6L9 17l-5-5" />
  </Icon>
);

export const X = (props: SVGProps) => (
  <Icon {...props}>
    <path d="M18 6L6 18M6 6l12 12" />
  </Icon>
);

export const Flame = (props: SVGProps) => (
  <Icon {...props}>
    <path d="M8.5 14.5C6 13 6 9.5 8 7.5c1-1 1-2.5 3-3.5 2 1 3 2 3 4 0 4-3 8-7.5 6z" />
  </Icon>
);

export const TrendingUp = (props: SVGProps) => (
  <Icon {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </Icon>
);

export const ChevronLeft = (props: SVGProps) => (
  <Icon {...props}>
    <path d="M15 18L9 12l6-6" />
  </Icon>
);

export const ChevronRight = (props: SVGProps) => (
  <Icon {...props}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);

export const LogOut = (props: SVGProps) => (
  <Icon {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </Icon>
);

export const Mail = (props: SVGProps) => (
  <Icon {...props}>
    <path d="M3 8l9 6 9-6" />
    <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
  </Icon>
);

export const Lock = (props: SVGProps) => (
  <Icon {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Icon>
);

export const ArrowRight = (props: SVGProps) => (
  <Icon {...props}>
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </Icon>
);

export const Loader2 = (props: SVGProps) => (
  <svg className={props.className || "h-6 w-6"} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

export default {};
