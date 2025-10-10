import React from "react";
import Select from "react-select";

const primary500 = "#4098ab";
const primary900 = "#4097ab7a";

const customStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "40px",
    borderRadius: "8px",
    padding: "0 4px",
    fontSize: "14px",
    borderColor: state.isFocused ? primary900 : primary500,
    boxShadow: primary900, 
    "&:hover": {
      borderColor: primary900,
    },
    outline: "none",
    backgroundColor: "white",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 100,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? primary500 // hover
      : state.isSelected
        ? primary900 // selected
        : "white",
    color: state.isFocused || state.isSelected ? "white" : "black",
    fontSize: "14px",
    cursor: "pointer",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9CA3AF", 
  }),
  singleValue: (base) => ({
    ...base,
    color: "#6B7280", 
  }),
  container: (base) => ({
    ...base,
    outline: "none",
  }),
  valueContainer: (base) => ({
    ...base,
    outline: "none",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    color: primary500,
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? primary900 : primary500,
    "&:hover": { color: primary900 },
  }),
};

const CustomSelect = ({ options, value, onChange, placeholder, ...props }) => {
  return (
    <Select
      {...props}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      styles={customStyles}
      classNamePrefix="custom-select"
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary25: primary500,
          primary50: primary500,
          primary75: primary900,
          primary: primary900,
        },
      })}
    />
  );
};

export default CustomSelect;
