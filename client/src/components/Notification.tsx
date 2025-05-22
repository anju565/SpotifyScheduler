interface NotificationProps {
  show: boolean;
  icon: string;
  title: string;
  message: string;
  bgColor: string;
}

export default function Notification({ show, icon, title, message, bgColor }: NotificationProps) {
  if (!show) return null;
  
  return (
    <div className={`toast ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center`}>
      <span className="material-icons mr-2">{icon}</span>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm opacity-90">{message}</div>
      </div>
    </div>
  );
}
