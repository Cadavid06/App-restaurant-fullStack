import React, { useState, useRef, useEffect } from "react";

export function Select({ value, onChange, children, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (newValue) => {
    onChange(newValue);
    setOpen(false);
  };

  const selectedLabel = React.Children.toArray(children).find(
    (child) => child.props.value === value
  )?.props.children;

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-300 bg-white text-left rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      >
        {selectedLabel || placeholder || "Seleccionar..."}
      </button>
      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md">
          {React.Children.map(children, (child) =>
            React.cloneElement(child, {
              onSelect: handleSelect,
            })
          )}
        </div>
      )}
    </div>
  );
}

export function SelectItem({ value, children, onSelect }) {
  return (
    <div
      onClick={() => onSelect(value)}
      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
    >
      {children}
    </div>
  );
}
