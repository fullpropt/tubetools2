import { useState, useEffect } from "react";
import { X, Megaphone } from "lucide-react";

const ANNOUNCEMENT_KEY = "tubetools_announcement_v1_dismissed";

interface AnnouncementBannerProps {
  id: string;
  message: string;
  type?: "info" | "warning" | "success";
}

export default function AnnouncementBanner({ 
  id, 
  message, 
  type = "info" 
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this announcement
    const dismissed = localStorage.getItem(`${ANNOUNCEMENT_KEY}_${id}`);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, [id]);

  const handleDismiss = () => {
    localStorage.setItem(`${ANNOUNCEMENT_KEY}_${id}`, "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const bgColors = {
    info: "bg-blue-600",
    warning: "bg-amber-500",
    success: "bg-green-600",
  };

  return (
    <div className={`${bgColors[type]} text-white py-3 px-4 relative`}>
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Megaphone className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
