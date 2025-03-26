/**
 * ModalMessages.jsx
 *
 * Redesigned modal with a professional look.
 * - Includes a centered layout with a header, message, and buttons.
 * - Buttons are styled and positioned for better usability.
 */

import React from "react";

const ModalMessages = ({ show, onClose, message, onConfirm, confirmText, cancelText }) => {
  // ----------------------------- Render -----------------------------
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
        {/* Modal Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Confirmation</h2>
        </div>

        {/* Modal Message */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm">{message}</p>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {cancelText || "Cancel"}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {confirmText || "Confirm"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalMessages;