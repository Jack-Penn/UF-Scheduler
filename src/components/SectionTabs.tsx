"use client";
import { useState, ReactNode } from "react";

interface SectionTabsProps {
  tabs: ReactNode[];
  tabLabels: string[];
}

const SectionTabs: React.FC<SectionTabsProps> = ({ tabs, tabLabels }) => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <div>
      <div className="inline-block rounded border-[1px] border-white">
        {tabLabels.map((label, i) => (
          <button
            key={label}
            className={`min-w-[90px] border-x-[1px] border-dashed border-white px-4 py-1 text-center text-lg font-light ${
              tabIndex === i ? "button-active" : ""
            }`}
            onClick={() => setTabIndex(i)}
          >
            {label}
          </button>
        ))}
      </div>
      <div>{tabs[tabIndex]}</div>
    </div>
  );
};

export default SectionTabs;
