import * as React from "react";

export function Tabs({ children, value, defaultValue, onValueChange }) {
  const [activeValue, setActiveValue] = React.useState(defaultValue || value);

  // Sincroniza con cambios externos
  React.useEffect(() => {
    if (value !== undefined) setActiveValue(value);
  }, [value]);

  const handleChange = (newValue) => {
    setActiveValue(newValue);
    if (onValueChange) onValueChange(newValue);
  };

  const tabs = React.Children.map(children, (child) => {
    if (child.type.displayName === "TabsList") {
      return React.cloneElement(child, {
        activeValue,
        setActiveValue: handleChange,
      });
    }
    if (child.props.value === activeValue) return child;
    return null;
  });

  return <div>{tabs}</div>;
}

export function TabsList({ children, activeValue, setActiveValue }) {
  return (
    <div className="flex gap-2 md:gap-4 mb-4 flex-wrap justify-start">
      {" "}
      {/* ✅ Gap y wrap adaptativo */}
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { activeValue, setActiveValue })
      )}
    </div>
  );
}
TabsList.displayName = "TabsList";

export function TabsTrigger({ children, value, activeValue, setActiveValue }) {
  const isActive = value === activeValue;
  return (
    <button
      type="button"
      onClick={() => setActiveValue(value)}
      className={`px-3 md:px-4 py-2 rounded-lg border transition-all text-sm md:text-base ${
        isActive
          ? "border-gray-900 bg-gray-100 text-gray-900"
          : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
      }`} // ✅ Estilos adaptativos
    >
      {children}
    </button>
  );
}
TabsTrigger.displayName = "TabsTrigger";

export function TabsContent({ children }) {
  return <div className="mt-4 md:mt-6">{children}</div>;
  {
    /* ✅ Margen adaptativo */
  }
}
TabsContent.displayName = "TabsContent";
