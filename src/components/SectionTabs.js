"use client";

import { useState } from "react";

const SectionTabs = ({ tabs, tabLabels }) => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <div>
      <div className="inline-block rounded border-[1px] border-white">
        {tabLabels.map((label, i) => (
          <button
            key={label}
            className={`py-1 px-4 border-x-[1px] border-dashed min-w-[90px] text-center text-lg font-light border-white ${
              tabIndex == i && "button-active"
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
