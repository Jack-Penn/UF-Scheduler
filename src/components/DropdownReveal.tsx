"use client";

import { ReactNode, useState } from "react";

type Props = {
  header: ReactNode;
  children: ReactNode;
};
export const DropdownReveal = ({ header, children }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="relative">
        {header}{" "}
        <p
          className={`absolute bottom-1 right-1 text-center ${isExpanded ? "rotate-90" : "-rotate-90"}`}
        >
          {">"}
        </p>
      </div>
      {isExpanded && children}
    </div>
  );
};
