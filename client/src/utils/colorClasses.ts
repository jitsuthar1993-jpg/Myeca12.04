// Utility to handle dynamic Tailwind color classes
// Tailwind CSS requires class names to be complete strings at build time

export const getColorClasses = (color: string) => {
  const colorMap: Record<string, {
    border: string;
    borderSoft: string;
    bg: string;
    text: string;
    textSoft: string;
    textDark: string;
    textLight: string;
  }> = {
    blue: {
      border: "border-l-blue-500",
      borderSoft: "border-blue-300",
      bg: "bg-blue-100",
      text: "text-blue-600",
      textSoft: "text-blue-500",
      textDark: "text-blue-900",
      textLight: "text-blue-700"
    },
    green: {
      border: "border-l-green-500",
      borderSoft: "border-green-300",
      bg: "bg-green-100",
      text: "text-green-600",
      textSoft: "text-green-500",
      textDark: "text-green-900",
      textLight: "text-green-700"
    },
    emerald: {
      border: "border-l-emerald-500",
      borderSoft: "border-emerald-300",
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      textSoft: "text-emerald-500",
      textDark: "text-emerald-900",
      textLight: "text-emerald-700"
    },
    red: {
      border: "border-l-red-500",
      borderSoft: "border-red-300",
      bg: "bg-red-100",
      text: "text-red-600",
      textSoft: "text-red-500",
      textDark: "text-red-900",
      textLight: "text-red-700"
    },
    orange: {
      border: "border-l-orange-500",
      borderSoft: "border-orange-300",
      bg: "bg-orange-100",
      text: "text-orange-600",
      textSoft: "text-orange-500",
      textDark: "text-orange-900",
      textLight: "text-orange-700"
    },
    yellow: {
      border: "border-l-yellow-500",
      borderSoft: "border-yellow-300",
      bg: "bg-yellow-100",
      text: "text-yellow-600",
      textSoft: "text-yellow-500",
      textDark: "text-yellow-900",
      textLight: "text-yellow-700"
    },
    purple: {
      border: "border-l-purple-500",
      borderSoft: "border-purple-300",
      bg: "bg-purple-100",
      text: "text-purple-600",
      textSoft: "text-purple-500",
      textDark: "text-purple-900",
      textLight: "text-purple-700"
    },
    indigo: {
      border: "border-l-indigo-500",
      borderSoft: "border-indigo-300",
      bg: "bg-indigo-100",
      text: "text-indigo-600",
      textSoft: "text-indigo-500",
      textDark: "text-indigo-900",
      textLight: "text-indigo-700"
    },
    pink: {
      border: "border-l-pink-500",
      borderSoft: "border-pink-300",
      bg: "bg-pink-100",
      text: "text-pink-600",
      textSoft: "text-pink-500",
      textDark: "text-pink-900",
      textLight: "text-pink-700"
    },
    teal: {
      border: "border-l-teal-500",
      borderSoft: "border-teal-300",
      bg: "bg-teal-100",
      text: "text-teal-600",
      textSoft: "text-teal-500",
      textDark: "text-teal-900",
      textLight: "text-teal-700"
    },
    gray: {
      border: "border-l-gray-500",
      borderSoft: "border-slate-300",
      bg: "bg-slate-100",
      text: "text-slate-600",
      textSoft: "text-slate-500",
      textDark: "text-slate-900",
      textLight: "text-slate-700"
    }
  };

  return colorMap[color] || colorMap.gray;
};

export const getBgColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    indigo: "bg-indigo-500",
    pink: "bg-pink-500",
    teal: "bg-teal-500",
    gray: "bg-slate-500"
  };
  return colorMap[color] || "bg-slate-500";
};

export const getGradientColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    emerald: "from-emerald-500 to-emerald-600",
    red: "from-red-500 to-red-600",
    orange: "from-orange-500 to-orange-600",
    yellow: "from-yellow-500 to-yellow-600",
    purple: "from-purple-500 to-purple-600",
    indigo: "from-indigo-500 to-indigo-600",
    pink: "from-pink-500 to-pink-600",
    teal: "from-teal-500 to-teal-600",
    gray: "from-slate-500 to-slate-600"
  };
  return colorMap[color] || "from-slate-500 to-slate-600";
};
