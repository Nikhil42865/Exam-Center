import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

interface AlertProps {
  type?: "info" | "success" | "warning" | "danger";
  message: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type = "info", message, className = "" }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={18} />;
      case "warning":
        return <AlertTriangle size={18} />;
      case "danger":
        return <AlertCircle size={18} />;
      case "info":
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className={`alert alert-${type} ${className}`} role="alert">
      <span style={{ display: "inline-flex", marginTop: "2px" }}>{getIcon()}</span>
      <div style={{ flex: 1 }}>{message}</div>
    </div>
  );
};
