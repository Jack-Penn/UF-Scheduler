import { ChangeEvent, useState } from "react";

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

const FormDropdown: React.FC<FormDropdownProps> = ({ label, onChange, control, options, required = false }) => {
  // const [value, setValue] = useState<string>(defaultOptionIndex !== undefined ? options[defaultOptionIndex].value : "");
  const [isActive, setIsActive] = useState<boolean>(control != undefined);

  return (
    <div className={`bg-black border-[1px] rounded relative mt-3 pr-2 w-80 ${required ? "required" : ""}`}>
      <label className={`absolute bg-black form-label text-gray-300 ${isActive ? "active" : "unactive"}`}>
        {label + (required ? " *" : "")}
      </label>
      <select
        className="bg-black pl-2 py-2 rounded select-none w-full outline-none z-10"
        defaultValue={control}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
          setIsActive(event.target.value !== "");
          onChange(event);
        }}
        onFocus={() => {
          setIsActive(true);
        }}
        onBlur={() => {
          if (control === "") setIsActive(false);
        }}
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
