import React, { useState, useEffect } from "react";
import {
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon as SaveIcon,
  XMarkIcon as XIcon,
  ShareIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import swal from "sweetalert";
import { API_BASE_URL } from "../../config";

const MyExamples = () => {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [tenses, setTenses] = useState([]);
  const [newExample, setNewExample] = useState({
    sentence: "",
    tense_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [exampleToShare, setExampleToShare] = useState(null);
  const [teacherEmail, setTeacherEmail] = useState("");
  const [sharingStatus, setSharingStatus] = useState("idle");

  useEffect(() => {
    fetchTenses();
    fetchUserExamples();
  }, []);

  const fetchTenses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tense`, {
        headers: {
          Authorization: localStorage.getItem("jstoken"),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tenses: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.tenses) {
        setTenses(data.tenses);
      }
    } catch (err) {
      console.error("Failed to load tenses:", err);
      setError("Failed to load tenses. Some features may be limited.");
    }
  };

  const fetchUserExamples = async () => {
    console.log("Fetching user examples...");
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/user/examples`, {
        headers: {
          Authorization: localStorage.getItem("jstoken"),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch examples: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.examples) {
        setExamples(data.examples);
      } else {
        setExamples([]);
      }
    } catch (err) {
      console.error("Failed to load user examples:", err);
      setError("Failed to load your examples. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getTenseName = (tenseId) => {
    const tense = tenses.find((t) => t.tense_id === tenseId);
    return tense ? tense.tense_name : "Unknown Tense";
  };

  const handleDelete = async (id) => {
    const willDelete = await swal({
      title: "Are you sure?",
      text: "Are you sure you want to delete this example?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });

    if (!willDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/examples/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("jstoken"),
        },
      });
      const data = await response.json();
      console.log(data);
      swal("Success", "Example deleted successfully", "success");
      setExamples(examples.filter((example) => example.example_id !== id));
    } catch (err) {
      console.error("Error deleting example:", err);
      swal("Error", "Failed to delete example", "error");
    }
  };

  const handleEdit = (example) => {
    console.log("Editing example:", example);
    setEditingId(example.example_id);
    setEditText(example.example_text);
  };

  const saveEdit = async () => {
    if (!editText.trim()) {
      swal("Error", "Example cannot be empty", "error");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/user/examples/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("jstoken"),
          },
          body: JSON.stringify({ sentence: editText }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update example: ${response.status}`);
      }

      setExamples(
        examples.map((ex) =>
          ex.id === editingId ? { ...ex, sentence: editText } : ex
        )
      );

      swal("Success", "Example updated successfully", "success");
      cancelEdit();
      fetchUserExamples();
    } catch (err) {
      console.error("Error updating example:", err);
      swal("Error", "Failed to update example", "error");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExample((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newExample.sentence.trim()) {
      swal("Error", "Example sentence cannot be empty", "error");
      return;
    }

    if (!newExample.tense_id) {
      swal("Error", "Please select a tense", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/user/examples`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("jstoken"),
        },
        body: JSON.stringify({
          sentence: newExample.sentence,
          tense_id: newExample.tense_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add example: ${response.status}`);
      }
      const data = await response.json();

      // Add the new example to state with returned ID
      // setExamples([
      //   {
      //     id: data.id,
      //     sentence: newExample.sentence,
      //     tense_id: newExample.tense_id,
      //     created_at: new Date().toISOString()
      //   },
      //   ...examples
      // ]);
      await fetchUserExamples();
      // Reset form
      setNewExample({
        sentence: "",
        tense_id: "",
      });

      swal("Success", "Example added successfully", "success");
    } catch (err) {
      console.error("Error adding example:", err);
      swal("Error", "Failed to add example", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openShareModal = (example) => {
    setExampleToShare(example);
    setShareModalOpen(true);
    setTeacherEmail("");
    setSharingStatus("idle");
  };

  const handleShare = async (e) => {
    e.preventDefault();

    if (!teacherEmail.trim()) {
      swal("Error", "Please enter teacher's email", "error");
      return;
    }

    try {
      setSharingStatus("sharing");

      const response = await fetch(
        `${API_BASE_URL}/user/examples/${exampleToShare.example_id}/share`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("jstoken"),
          },
          body: JSON.stringify({ teacherEmail }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to share example: ${response.status}`);
      }

      setSharingStatus("shared");
      swal("Success", "Example shared with teacher successfully", "success");
    } catch (err) {
      console.log("Error sharing example:", err);
      console.error("Error sharing example:", err);
      setSharingStatus("error");
      swal("Error", "Failed to share example with teacher", "error");
    }
  };

  if (loading && examples.length === 0) {
    return (
      <div className="py-8 px-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error && examples.length === 0) {
    return (
      <div className="py-8 px-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }
  console.log(examples);

  return (
    <div className="space-y-6">
      {/* Add new example form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Add New Example
        </h3>

        <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-md shadow-sm">
          {/* Tense Dropdown */}
          <div>
            <label
              htmlFor="tense_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Tense
            </label>
            <select
              id="tense_id"
              name="tense_id"
              value={newExample.tense_id}
              onChange={handleInputChange}
              className="p-2 mt-1 block w-full rounded-md border border-gray-300 bg-white shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              required
            >
              <option value="">-- Select a tense --</option>
              {tenses.map((tense) => (
                <option key={tense.tense_id} value={tense.tense_id}>
                  {tense.tense_name}
                </option>
              ))}
            </select>
          </div>

          {/* Sentence Textarea */}
          <div>
            <label
              htmlFor="sentence"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Example Sentence
            </label>
            <textarea
              id="sentence"
              name="sentence"
              value={newExample.sentence}
              onChange={handleInputChange}
              rows="3"
              className="py-2 px-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              placeholder="Enter your example sentence..."
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </>
              ) : (
                "Add Example"
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">My Examples</h3>
        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {examples.length} {examples.length === 1 ? "Example" : "Examples"}
        </span>
      </div>

      {examples.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">
            You haven't created any examples yet. Add your first example above!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {examples.map((example) => (
            <div
              key={example.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4">
                {editingId === example.example_id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      rows="3"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        <XIcon className="mr-1.5 h-4 w-4 text-gray-500" />
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        <SaveIcon className="mr-1.5 h-4 w-4 text-white" />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getTenseName(example.tense_id)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(example.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {!example.teacher_reviewed && (
                          <button
                            onClick={() => openShareModal(example)}
                            className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                            title="Share with teacher"
                          >
                            <ShareIcon className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleEdit(example)}
                          className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                          title="Edit example"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(example.example_id)}
                          className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-500 focus:outline-none"
                          title="Delete example"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-800">
                      Example : {example.example_text}
                    </p>
                    {example.teacher_reviewed && example.teacher_feedback && (
                      <p className="text-red-500 mt-2">
                        Feedback: {example.teacher_feedback}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && exampleToShare && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      Share Example with Teacher
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        This will share your example with your teacher for
                        feedback:
                      </p>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-700">
                          {exampleToShare.sentence}
                        </p>
                      </div>

                      {sharingStatus === "shared" ? (
                        <div className="mt-4 flex items-center justify-center text-green-600">
                          <CheckIcon className="h-6 w-6 mr-2" />
                          <span>Successfully shared!</span>
                        </div>
                      ) : (
                        <form onSubmit={handleShare} className="mt-4">
                          <div>
                            <label
                              htmlFor="teacherEmail"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Teacher's Email
                            </label>
                            <input
                              type="email"
                              name="teacherEmail"
                              id="teacherEmail"
                              value={teacherEmail}
                              onChange={(e) => setTeacherEmail(e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                              placeholder="teacher@example.com"
                              required
                            />
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {sharingStatus === "shared" ? (
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShareModalOpen(false)}
                  >
                    Close
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm ${
                        sharingStatus === "sharing"
                          ? "opacity-70 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={handleShare}
                      disabled={sharingStatus === "sharing"}
                    >
                      {sharingStatus === "sharing" ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Sharing...
                        </>
                      ) : (
                        "Share"
                      )}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShareModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyExamples;
