import React from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../config";
import {
    PlusIcon,
    SpeakerWaveIcon,
    PauseIcon,
    PlayIcon,
    StopIcon,
    PhotoIcon,
    DocumentTextIcon,
    TrashIcon,
    ArrowDownTrayIcon
} from "@heroicons/react/24/outline";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

// localStorage key for guest notes
const GUEST_NOTES_STORAGE_KEY = 'syntaxmap_guest_notes';

class Notepad extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            exemples: [],
            newSentence: '',
            newImage: null,
            audio: null,
            currentAudioIndex: null,
            showDeleteConfirm: null,
            isLoading: true,
            error: null,
            isLoggedIn: Boolean(localStorage.getItem('jstoken')) && localStorage.getItem("user_role") < 4,
        };
        this.fileInputRef = React.createRef();
    }

    componentDidMount() {
        this.fetchNotes();
    }

    fetchNotes = () => {
        const { isLoggedIn } = this.state;

        this.setState({ isLoading: true, error: null });

        // If user is logged in, fetch from server
        if (isLoggedIn) {
            // Use the backendUrl prop passed from parent, or fallback to config

            fetch(`${API_BASE_URL}/userupload`, {
                headers: {
                    "Authorization": localStorage.getItem('jstoken'),
                    "Content-type": "application/json; charset=UTF-8"
                }
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`API responded with status: ${res.status}`);
                    }
                    return res.json();
                })
                .then((res) => {
                    console.log("notes-----------", res);
                    
                    if (res && res.userUploads) {
                        const tmp = res.userUploads.map(upload => ({
                            id: upload.id_upload || Math.random().toString(36).substring(2, 9),
                            sentence: upload.sentence,
                            image: upload.img || null,
                            date: upload.created_at || new Date().toISOString()
                        }));
                        this.setState({ exemples: tmp, isLoading: false });
                    } else {
                        this.setState({ exemples: [], isLoading: false });
                    }
                })
                .catch(err => {
                    console.error("Error fetching notes:", err);
                    this.setState({
                        error: "Failed to load notes. Please refresh the page.",
                        isLoading: false
                    });
                });
        } else {
            if (localStorage.getItem("user_role") == 4) {
                // For guest users, load from localStorage
                try {
                    const storedNotes = localStorage.getItem(GUEST_NOTES_STORAGE_KEY);
                    const notes = storedNotes ? JSON.parse(storedNotes) : [];
                    this.setState({ exemples: notes, isLoading: false });
                } catch (err) {
                    console.error("Error loading guest notes from localStorage:", err);
                    this.setState({
                        error: "Failed to load your notes from browser storage.",
                        isLoading: false,
                        exemples: []
                    });
                }

            }

        }
    }

    handleInputChange = (e) => {
        this.setState({ newSentence: e.target.value });
    }

    handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            this.setState({ newImage: e.target.files[0] });
        }
    }

    handleAddSentence = (e) => {
        e.preventDefault();
        const { newSentence, newImage, isLoggedIn } = this.state;

        if (!newSentence.trim()) {
            return;
        }

        this.setState({ isSubmitting: true });

        // For logged-in users, save to server
        if (isLoggedIn) {
            // Use the backendUrl prop passed from parent, or fallback to config

            // Prepare form data for file upload
            let requestBody;
            let headers = {
                "Authorization": localStorage.getItem('jstoken')
            };

            if (newImage) {
                const formData = new FormData();
                formData.append('sentence', newSentence);
                formData.append('image', newImage);

                requestBody = formData;
                // No Content-Type header for FormData
            } else {
                requestBody = JSON.stringify({ sentence: newSentence });
                headers["Content-Type"] = "application/json";
            }
            fetch(`${API_BASE_URL}/userupload`, {
                method: "POST",
                body: requestBody,
                headers: headers
            })

                .then(res => {
                    if (!res.ok) {
                        throw new Error(`API responded with status: ${res.status}`);
                    }
                    return res.json();
                })

                .then(response => {
                    console.log("Note added successfully:", response);

                    // Add the new note to state
                    const newNote = {
                        id: Math.random().toString(36).substring(2, 9),
                        sentence: newSentence,
                        image: newImage ? URL.createObjectURL(newImage) : null,
                        date: new Date().toISOString()
                    };

                    this.setState(prevState => ({
                        exemples: [newNote, ...prevState.exemples],
                        newSentence: '',
                        newImage: null,
                        isSubmitting: false
                    }));

                    if (this.fileInputRef.current) {
                        this.fileInputRef.current.value = "";
                    }

                    // Refresh notes to get server-generated IDs etc.
                    this.fetchNotes();

                    // Call parent's refresh method if available
                    if (this.props.refreshNotes) {
                        this.props.refreshNotes();
                    }
                })
                .catch(err => {
                    console.error("Error adding note:", err);
                    this.setState({
                        error: "Failed to add note. Please try again.",
                        isSubmitting: false
                    });
                });
        } else {
            if (localStorage.getItem("user_role") == 4) {
                try {
                    const newNote = {
                        id: Math.random().toString(36).substring(2, 9),
                        sentence: newSentence,
                        image: newImage ? URL.createObjectURL(newImage) : null,
                        date: new Date().toISOString()
                    };

                    // Get existing notes from localStorage
                    const storedNotes = localStorage.getItem(GUEST_NOTES_STORAGE_KEY);
                    const existingNotes = storedNotes ? JSON.parse(storedNotes) : [];

                    // Add new note at the beginning
                    const updatedNotes = [newNote, ...existingNotes];

                    // Save back to localStorage
                    localStorage.setItem(GUEST_NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));

                    // Update state
                    this.setState({
                        exemples: updatedNotes,
                        newSentence: '',
                        newImage: null,
                        isSubmitting: false
                    });

                    if (this.fileInputRef.current) {
                        this.fileInputRef.current.value = "";
                    }
                } catch (err) {
                    console.error("Error saving guest note to localStorage:", err);
                    this.setState({
                        error: "Failed to save note to browser storage.",
                        isSubmitting: false
                    });
                }

            }
            // For guest users, save to localStorage

        }
    }

    handlePlay = (sentence, index) => {
        if (!('speechSynthesis' in window)) {
            console.error("Speech synthesis not supported");
            return;
        }

        window.speechSynthesis.cancel(); // Stop any ongoing speech

        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.onend = () => {
            this.setState({ currentAudioIndex: null, audio: null });
        };

        this.setState({
            audio: utterance,
            currentAudioIndex: index
        });

        window.speechSynthesis.speak(utterance);
    }

    handlePause = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
        }
    }

    handleResume = () => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    }

    handleStop = () => {
        window.speechSynthesis.cancel();
        this.setState({ currentAudioIndex: null, audio: null });
    }

    handleConfirmDelete = (index) => {
        this.setState({ showDeleteConfirm: index });
    }

    handleDeleteNote = (index) => {
        const { isLoggedIn, exemples } = this.state;
        const noteId = exemples[index].id;
        if (isLoggedIn) {
            // Delete from server for logged-in users

            fetch(`${API_BASE_URL}/userupload/${noteId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": localStorage.getItem('jstoken'),
                    "Content-type": "application/json; charset=UTF-8"
                }
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`API responded with status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(() => {
                    // Remove from local state
                    this.setState(prevState => ({
                        exemples: prevState.exemples.filter((_, i) => i !== index),
                        showDeleteConfirm: null
                    }));

                    // Refresh parent component's note list
                    if (this.props.refreshNotes) {
                        this.props.refreshNotes();
                    }
                })
                .catch(err => {
                    console.error("Error deleting note:", err);
                    alert("Failed to delete note. Please try again.");
                    this.setState({ showDeleteConfirm: null });
                });
        } else {
            // Delete from localStorage for guest users
            if (localStorage.getItem("user_role") == 4) {
                try {
                    // Get existing notes
                    const updatedNotes = [...exemples];
                    updatedNotes.splice(index, 1);

                    // Save back to localStorage
                    localStorage.setItem(GUEST_NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));

                    // Update state
                    this.setState({
                        exemples: updatedNotes,
                        showDeleteConfirm: null
                    });
                } catch (err) {
                    console.error("Error deleting note from localStorage:", err);
                    alert("Failed to delete note. Please try again.");
                    this.setState({ showDeleteConfirm: null });
                }

            }
        }
    }

    cancelDelete = () => {
        this.setState({ showDeleteConfirm: null });
    }

    exportNotes = () => {
        const { exemples } = this.state;

        try {
            // Format notes as JSON
            const notesData = JSON.stringify(exemples, null, 2);

            // Create a blob with the data
            const blob = new Blob([notesData], { type: 'application/json' });

            // Create a download URL
            const url = URL.createObjectURL(blob);

            // Create temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = `syntaxmap_notes_${new Date().toISOString().slice(0, 10)}.json`;

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Release the URL
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error exporting notes:", err);
            alert("Failed to export notes. Please try again.");
        }
    }

    exportNotesAsTxt = () => {
        const { exemples } = this.state;

        try {
            // Format notes as text
            let textContent = "SyntaxMap Notes\n\n";

            exemples.forEach((note, index) => {
                const date = new Date(note.date).toLocaleString();
                textContent += `--- Note ${index + 1} (${date}) ---\n`;
                textContent += note.sentence + "\n\n";
            });

            // Create a blob with the data
            const blob = new Blob([textContent], { type: 'text/plain' });

            // Create a download URL
            const url = URL.createObjectURL(blob);

            // Create temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = `syntaxmap_notes_${new Date().toISOString().slice(0, 10)}.txt`;

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Release the URL
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error exporting notes as text:", err);
            alert("Failed to export notes as text. Please try again.");
        }
    }

    render() {
        const {
            exemples,
            newSentence,
            newImage,
            currentAudioIndex,
            showDeleteConfirm,
            isLoading,
            error,
            isSubmitting,
            isLoggedIn
        } = this.state;

        return (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <DocumentTextIcon className="h-5 w-5 text-orange-500 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-800">
                                Personal Notes
                                {!isLoggedIn && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Guest Mode</span>}
                            </h2>
                        </div>

                        <div className="flex items-center space-x-3">
                            {exemples.length > 0 && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={this.exportNotesAsTxt}
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                                        title="Export as text file"
                                    >
                                        <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                                        Export .txt
                                    </button>
                                    <button
                                        onClick={this.exportNotes}
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                                        title="Export as JSON file"
                                    >
                                        <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                                        Export .json
                                    </button>
                                </div>
                            )}

                            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {exemples.length} {exemples.length === 1 ? 'Note' : 'Notes'}
                            </span>
                        </div>
                    </div>

                    {!isLoggedIn && (
                        <p className="mt-2 text-xs text-gray-600">
                            You're using notepad in guest mode. Your notes are saved in this browser only.
                        </p>
                    )}
                </div>

                {/* Add new note form */}
                <div className="px-6 py-4 border-b border-gray-200 bg-white">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={this.handleAddSentence} className="space-y-4">
                        <div>
                            <label htmlFor="newSentence" className="block text-sm font-medium text-gray-700 mb-1">
                                Add New Note
                            </label>
                            <textarea
                                id="newSentence"
                                value={newSentence}
                                onChange={this.handleInputChange}
                                placeholder="Write your note here..."
                                rows="4"
                                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <div className="w-full sm:w-auto">
                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => this.fileInputRef.current.click()}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <PhotoIcon className="h-4 w-4 mr-1 text-gray-500" />
                                        {newImage ? 'Change Image' : 'Add Image'}
                                    </button>
                                    {newImage && (
                                        <span className="text-xs text-gray-500 truncate max-w-[200px]">
                                            {newImage.name}
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={this.fileInputRef}
                                    accept="image/*"
                                    onChange={this.handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!newSentence.trim() || isSubmitting}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="h-4 w-4 mr-1" />
                                        Save Note
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Notes list */}
                <div className="px-6 py-4 overflow-auto max-h-[500px]">
                    {isLoading ? (
                        <div className="text-center py-6">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
                            <p className="mt-2 text-gray-500 text-sm">Loading notes...</p>
                        </div>
                    ) : exemples.length === 0 ? (
                        <div className="text-center py-8">
                            <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No notes yet. Add your first note above!</p>
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid gap-4 grid-cols-1"
                        >
                            {exemples.map((item, index) => (
                                <motion.div
                                    key={item.id || index}
                                    variants={itemVariants}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 relative"
                                >
                                    {showDeleteConfirm === index ? (
                                        <div className="absolute inset-0 bg-white bg-opacity-90 z-10 flex flex-col items-center justify-center space-y-3 p-4 rounded-lg">
                                            <p className="text-sm text-gray-700 text-center font-medium">Are you sure you want to delete this note?</p>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => this.handleDeleteNote(index)}
                                                    className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={this.cancelDelete}
                                                    className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs text-gray-500">
                                            {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <button
                                            onClick={() => this.handleConfirmDelete(index)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete note"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <p className="text-gray-800 mb-3 whitespace-pre-wrap">{item.sentence}</p>
                                    {item.image && !isLoggedIn && (
                                        <div className="mb-3">
                                            <img
                                                src={item.image}
                                                alt="Note attachment"
                                                className="rounded-md max-h-40 object-cover"
                                            />
                                        </div>
                                    )}
                                    {item.image && isLoggedIn && (
                                        <div className="mb-3">
                                            <img
                                                src={`${API_BASE_URL}${item.image}`}
                                                alt="Note attachment"
                                                className="rounded-md max-h-40 object-cover"
                                            />
                                        </div>
                                    )}



                                    <div className="flex space-x-2">
                                        {currentAudioIndex === index ? (
                                            <>
                                                <button
                                                    onClick={this.handlePause}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600"
                                                >
                                                    <PauseIcon className="h-3 w-3 mr-1" />
                                                    Pause
                                                </button>
                                                <button
                                                    onClick={this.handleResume}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-green-500 hover:bg-green-600"
                                                >
                                                    <PlayIcon className="h-3 w-3 mr-1" />
                                                    Resume
                                                </button>
                                                <button
                                                    onClick={this.handleStop}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-red-500 hover:bg-red-600"
                                                >
                                                    <StopIcon className="h-3 w-3 mr-1" />
                                                    Stop
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => this.handlePlay(item.sentence, index)}
                                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
                                            >
                                                <SpeakerWaveIcon className="h-3 w-3 mr-1" />
                                                Listen
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }
}

export default Notepad;