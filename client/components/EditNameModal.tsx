import { useState } from "react";
import { Edit2, X, Check, Loader } from "lucide-react";
import { apiPost } from "@/lib/api-client";

interface EditNameModalProps {
  currentName: string;
  onNameUpdated: (newName: string) => void;
}

export default function EditNameModal({ currentName, onNameUpdated }: EditNameModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setNewName(currentName);
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setError("");
    setSuccess(false);
  };

  const handleSave = async () => {
    setError("");
    setSuccess(false);

    // Validation
    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (newName.trim() === currentName) {
      setError("Please enter a different name");
      return;
    }

    if (newName.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (newName.trim().length > 50) {
      setError("Name must be less than 50 characters");
      return;
    }

    try {
      setLoading(true);
      await apiPost("/auth/update-name", {
        name: newName.trim(),
      });

      setSuccess(true);
      onNameUpdated(newName.trim());

      // Close modal after 1.5 seconds
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSave();
    }
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <>
      {/* Edit Button */}
      <button
        onClick={handleOpen}
        className="ml-2 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors inline-flex items-center justify-center"
        title="Edit name"
      >
        <Edit2 className="h-4 w-4" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Modal */}
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Name</h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-500 hover:text-gray-700 disabled:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800">Name updated successfully!</p>
              </div>
            )}

            {/* Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                placeholder="Enter your name"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                {newName.length}/50 characters
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
