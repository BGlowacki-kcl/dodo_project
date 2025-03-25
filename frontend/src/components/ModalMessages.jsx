import React from "react";

const ModalMessages = ({ show, onClose, message, onConfirm, confirmText, cancelText }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="text-lg font-semibold mb-4">{message}</p>
        <div className="flex justify-center space-x-4">
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {confirmText || "Confirm"}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {cancelText || "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalMessages;
