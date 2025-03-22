/**
 * Notification Context
 * Provides global notification functionality throughout the application
 */
import React, { createContext, useState, useContext } from "react";
import { Snackbar, Alert } from "@mui/material";

// Create context for notifications
const NotificationContext = createContext();

/**
 * Default notification timeout in milliseconds
 */
const NOTIFICATION_TIMEOUT = 3000;

/**
 * Notification provider component that wraps the application
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - Child components
 * @returns {JSX.Element} - Provider component with notification handling
 */
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(getDefaultNotificationState());
  
  /**
   * Shows a notification message with specified severity
   * @param {string} message - Notification message to display
   * @param {string} severity - Severity level (info, success, warning, error)
   */
  const showNotification = (message, severity = "info") => {
    setNotification({ open: true, message, severity });
    scheduleNotificationDismissal();
  };

  /**
   * Schedules automatic dismissal of notification after timeout
   */
  const scheduleNotificationDismissal = () => {
    setTimeout(() => {
      closeNotification();
    }, NOTIFICATION_TIMEOUT);
  };

  /**
   * Closes the current notification
   */
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
      <Snackbar
        open={notification.open}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={closeNotification}
      >
        <Alert severity={notification.severity} variant="filled">
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

/**
 * Returns the default notification state
 * @returns {Object} - Default notification state
 */
function getDefaultNotificationState() {
  return {
    open: false,
    message: "",
    severity: "info",
  };
}

/**
 * Custom hook to use the notification context
 * @returns {Function} - Function to show notifications
 */
export const useNotification = () => useContext(NotificationContext);