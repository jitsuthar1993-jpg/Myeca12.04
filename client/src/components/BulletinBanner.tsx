import { motion } from "framer-motion";
import { Clock, AlertTriangle, FileCheck } from "lucide-react";

const BulletinBanner = () => {
  const announcements = [
    {
      id: 1,
      text: "The Due date for ITR filing has been extended to 15th September 2025",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      id: 2,
      text: "ITR 2 - ITR 3 are yet to be provided by Income Tax Department",
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      id: 3,
      text: "ITR Filing LIVE Now",
      icon: FileCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-blue-50 via-white to-blue-50 border-b border-blue-100 shadow-sm"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center space-x-8 overflow-hidden">
          {announcements.map((announcement, index) => {
            const IconComponent = announcement.icon;
            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full ${announcement.bgColor} ${announcement.borderColor} border shadow-sm`}
              >
                <IconComponent className={`h-4 w-4 ${announcement.color}`} />
                <span className={`text-sm font-medium ${announcement.color} whitespace-nowrap`}>
                  {announcement.text}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default BulletinBanner;