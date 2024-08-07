import { ChangeEvent, useRef } from "react";

interface Option {
  value: string;
  text: string;
}

interface FormDropdownProps {
  label: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  control: string;
  options: Option[];
  required?: boolean;
}

const FormDropdown: React.FC<FormDropdownProps> = ({
  label,
  onChange,
  control,
  options,
  required = false,
}) => {
  const isActive = useRef(control != undefined);
  // console.log("Form Dropdown", isActive.current);

  return (
    <div
      className={`relative mt-3 w-80 rounded border-[1px] bg-black pr-2 ${required ? "required" : ""}`}
    >
      <label
        className={`form-label absolute bg-black text-gray-300 ${isActive.current ? "active" : "unactive"}`}
      >
        {label + (required ? " *" : "")}
      </label>
      <select
        className="z-10 w-full select-none rounded bg-black py-2 pl-2 outline-none"
        defaultValue={control}
        onChange={onChange}
      >
        <option value=""></option>
        {options.map(({ value, text }) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormDropdown;
