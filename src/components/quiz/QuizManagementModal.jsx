import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash, FaEdit, FaSave } from "react-icons/fa";
import { MdQuiz, MdCheckCircle } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";

const QuizManagementModal = ({ isOpen, onClose, courseId, moduleId, courseName, moduleName }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [view, setView] = useState("list"); // list, create, edit, questions
    const [isLoading, setIsLoading] = useState(false);

    const [quizForm, setQuizForm] = useState({
        title: "",
        description: "",
        pass_percentage: 70,
        time_limit_minutes: 30,
        attempts_allowed: 3,
    });

    const [questionForm, setQuestionForm] = useState({
        question_text: "",
        question_type: "mcq",
        score: 1,
        options: [
            { option_text: "", is_correct: false },
            { option_text: "", is_correct: false },
            { option_text: "", is_correct: false },
            { option_text: "", is_correct: false },
        ],
    });

    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        if (isOpen && moduleId) {
            fetchQuizzes();
        }
    }, [isOpen, moduleId]);

    const fetchQuizzes = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/quizzes`,
                {
                    params: { course_id: courseId, module_id: moduleId },
                    withCredentials: true,
                }
            );
            if (response.data.success) {
                setQuizzes(response.data.data || []);
            }
        } catch (error) {
            if (error.response?.status !== 404) {
                toast.error("Failed to fetch quizzes");
            }
            setQuizzes([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/quizzes`,
                {
                    ...quizForm,
                    course_id: courseId,
                    module_id: moduleId,
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                toast.success("Quiz created successfully!");
                setSelectedQuiz(response.data.data);
                setView("questions");
                fetchQuizzes();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create quiz");
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();

        // Validation
        if (!questionForm.question_text.trim()) {
            toast.error("Please enter a question");
            return;
        }

        const correctCount = questionForm.options.filter(opt => opt.is_correct).length;
        if (correctCount !== 1) {
            toast.error("Please select exactly one correct answer");
            return;
        }

        const emptyOptions = questionForm.options.filter(opt => !opt.option_text.trim());
        if (emptyOptions.length > 0) {
            toast.error("Please fill all option fields");
            return;
        }

        try {
            // Create question
            const questionResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/quizzes/question`,
                {
                    quiz_id: selectedQuiz._id,
                    question_text: questionForm.question_text,
                    question_type: questionForm.question_type,
                    score: questionForm.score,
                },
                { withCredentials: true }
            );

            if (questionResponse.data.success) {
                // Add options
                const optionsResponse = await axios.post(
                    `${import.meta.env.VITE_API_URL}/quizzes/options`,
                    {
                        question_id: questionResponse.data.data._id,
                        options: questionForm.options,
                    },
                    { withCredentials: true }
                );

                if (optionsResponse.data.success) {
                    toast.success("Question added successfully!");
                    setQuestions([...questions, questionResponse.data.data]);
                    // Reset form
                    setQuestionForm({
                        question_text: "",
                        question_type: "mcq",
                        score: 1,
                        options: [
                            { option_text: "", is_correct: false },
                            { option_text: "", is_correct: false },
                            { option_text: "", is_correct: false },
                            { option_text: "", is_correct: false },
                        ],
                    });
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add question");
        }
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...questionForm.options];
        if (field === "is_correct" && value) {
            // Uncheck all other options
            newOptions.forEach((opt, i) => {
                opt.is_correct = i === index;
            });
        } else {
            newOptions[index][field] = value;
        }
        setQuestionForm({ ...questionForm, options: newOptions });
    };

    const handleViewQuestions = async (quiz) => {
        setSelectedQuiz(quiz);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/quizzes/${quiz._id}`,
                { withCredentials: true }
            );
            if (response.data.success) {
                setQuestions(response.data.data || []);
            }
        } catch (error) {
            toast.error("Failed to fetch questions");
        }
        setView("questions");
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
            <div className="modal-container" style={{ background: "#fff", width: "95%", maxWidth: "1000px", maxHeight: "90vh", borderRadius: "24px", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", overflow: "hidden" }}>

                {/* Header */}
                <div className="modal-header" style={{ background: "#fff", padding: "1.5rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0" }}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-soft-primary p-2 rounded-3" style={{ background: "#eef2ff" }}>
                            <MdQuiz className="text-primary fs-4" />
                        </div>
                        <div>
                            <h5 className="mb-0 fw-bold">Quiz Management</h5>
                            <small className="text-muted">{moduleName} - {courseName}</small>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn-close" aria-label="Close"></button>
                </div>

                {/* Body */}
                <div className="modal-body" style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
                    {view === "list" && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h6 className="mb-0 fw-bold">All Quizzes</h6>
                                <button
                                    className="btn btn-primary px-4 fw-bold rounded-3"
                                    style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none" }}
                                    onClick={() => setView("create")}
                                >
                                    <FaPlus className="me-2" /> Create Quiz
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : quizzes.length === 0 ? (
                                <div className="text-center py-5">
                                    <MdQuiz className="text-muted mb-3" style={{ fontSize: "4rem", opacity: 0.3 }} />
                                    <h6 className="fw-bold text-dark">No Quizzes Yet</h6>
                                    <p className="text-muted">Create your first quiz to get started</p>
                                </div>
                            ) : (
                                <div className="row g-3">
                                    {quizzes.map((quiz) => (
                                        <div key={quiz._id} className="col-md-6">
                                            <div className="card border-0 shadow-sm rounded-4 h-100">
                                                <div className="card-body p-4">
                                                    <h6 className="fw-bold text-dark mb-2">{quiz.title}</h6>
                                                    <p className="small text-muted mb-3">{quiz.description}</p>
                                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                                        <span className="badge bg-light text-dark border px-2 py-1 small">
                                                            Pass: {quiz.pass_percentage}%
                                                        </span>
                                                        <span className="badge bg-light text-dark border px-2 py-1 small">
                                                            Time: {quiz.time_limit_minutes} min
                                                        </span>
                                                        <span className="badge bg-light text-dark border px-2 py-1 small">
                                                            Attempts: {quiz.attempts_allowed}
                                                        </span>
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-primary w-100 fw-bold"
                                                        onClick={() => handleViewQuestions(quiz)}
                                                    >
                                                        Manage Questions
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {view === "create" && (
                        <div>
                            <button className="btn btn-link text-muted mb-3 text-decoration-none" onClick={() => setView("list")}>
                                ← Back to List
                            </button>
                            <h6 className="fw-bold mb-4">Create New Quiz</h6>
                            <form onSubmit={handleCreateQuiz}>
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Quiz Title *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={quizForm.title}
                                            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                                            required
                                            placeholder="e.g. Chess Opening Principles Quiz"
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Pass Percentage *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            max="100"
                                            value={quizForm.pass_percentage}
                                            onChange={(e) => setQuizForm({ ...quizForm, pass_percentage: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Description *</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={quizForm.description}
                                            onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                                            required
                                            placeholder="Describe what this quiz covers..."
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Time Limit (minutes) *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            value={quizForm.time_limit_minutes}
                                            onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted text-uppercase">Attempts Allowed *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            value={quizForm.attempts_allowed}
                                            onChange={(e) => setQuizForm({ ...quizForm, attempts_allowed: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <button type="submit" className="btn btn-primary px-5 fw-bold" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none" }}>
                                            Create Quiz & Add Questions
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {view === "questions" && selectedQuiz && (
                        <div>
                            <button className="btn btn-link text-muted mb-3 text-decoration-none" onClick={() => { setView("list"); setSelectedQuiz(null); }}>
                                ← Back to Quizzes
                            </button>
                            <div className="mb-4 p-3 bg-light rounded-3">
                                <h6 className="fw-bold mb-1">{selectedQuiz.title}</h6>
                                <p className="small text-muted mb-0">{selectedQuiz.description}</p>
                            </div>

                            <h6 className="fw-bold mb-3">Add Question</h6>
                            <form onSubmit={handleAddQuestion} className="mb-5">
                                <div className="row g-3">
                                    <div className="col-md-8">
                                        <label className="form-label small fw-bold text-muted">Question *</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            value={questionForm.question_text}
                                            onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                                            placeholder="Enter your question here..."
                                            required
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small fw-bold text-muted">Type</label>
                                        <select
                                            className="form-select"
                                            value={questionForm.question_type}
                                            onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })}
                                        >
                                            <option value="mcq">MCQ</option>
                                            <option value="true_false">True/False</option>
                                        </select>
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small fw-bold text-muted">Points</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            value={questionForm.score}
                                            onChange={(e) => setQuestionForm({ ...questionForm, score: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted mb-2">Options (Select the correct answer)</label>
                                        {questionForm.options.map((option, index) => (
                                            <div key={index} className="input-group mb-2">
                                                <div className="input-group-text bg-white">
                                                    <input
                                                        type="radio"
                                                        name="correct_option"
                                                        checked={option.is_correct}
                                                        onChange={(e) => handleOptionChange(index, "is_correct", e.target.checked)}
                                                        className="form-check-input mt-0"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder={`Option ${index + 1}`}
                                                    value={option.option_text}
                                                    onChange={(e) => handleOptionChange(index, "option_text", e.target.value)}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="col-12">
                                        <button type="submit" className="btn btn-success px-4 fw-bold">
                                            <FaPlus className="me-2" /> Add Question
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <h6 className="fw-bold mb-3">Questions ({questions.length})</h6>
                            {questions.length === 0 ? (
                                <div className="text-center py-4 border-2 border-dashed rounded-3">
                                    <p className="text-muted mb-0">No questions added yet</p>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    {questions.map((q, index) => (
                                        <div key={q._id} className="card border-0 shadow-sm">
                                            <div className="card-body p-3">
                                                <div className="d-flex align-items-start gap-3">
                                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "32px", height: "32px", minWidth: "32px" }}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <p className="mb-2 fw-medium">{q.question_text}</p>
                                                        {q.options && q.options.length > 0 && (
                                                            <div className="d-flex flex-column gap-1">
                                                                {q.options.map((opt, optIndex) => (
                                                                    <div key={opt._id} className="d-flex align-items-center gap-2 small">
                                                                        {opt.is_correct ? (
                                                                            <MdCheckCircle className="text-success" />
                                                                        ) : (
                                                                            <span className="text-muted">○</span>
                                                                        )}
                                                                        <span className={opt.is_correct ? "text-success fw-bold" : "text-muted"}>
                                                                            {opt.option_text}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="badge bg-light text-dark border">{q.score} pts</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="modal-footer" style={{ background: "#fff", padding: "1.25rem 2rem", borderTop: "1px solid #e2e8f0" }}>
                    <button className="btn btn-light px-4 fw-bold" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>

            <style>{`
        .bg-soft-primary { background: #eef2ff !important; }
        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.1);
          border-color: #667eea;
        }
      `}</style>
        </div>
    );
};

export default QuizManagementModal;
