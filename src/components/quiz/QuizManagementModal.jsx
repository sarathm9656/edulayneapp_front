import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash, FaEdit, FaSave, FaChevronLeft } from "react-icons/fa";
import { MdQuiz, MdCheckCircle, MdOutlineQuestionAnswer, MdTimer, MdStars, MdRefresh } from "react-icons/md";
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

                    // Fetch updated questions for the quiz
                    handleViewQuestions(selectedQuiz);

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
        <div className="quiz-mgmt-overlay">
            <div className="quiz-mgmt-container animate-popup">
                {/* Header */}
                <div className="quiz-mgmt-header">
                    <div className="d-flex align-items-center gap-4">
                        <div className="header-icon-box">
                            <MdQuiz />
                        </div>
                        <div>
                            <h4 className="mb-1 fw-bold text-dark">Assessment Studio</h4>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-soft-primary text-primary px-2 py-1 rounded small fw-bold">{moduleName}</span>
                                <span className="text-muted opacity-50 px-1">/</span>
                                <span className="text-muted small fw-medium">{courseName}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="quiz-close-btn" aria-label="Close">
                        <FaTimes />
                    </button>
                </div>

                {/* Body Content */}
                <div className="quiz-mgmt-body">
                    {view === "list" && (
                        <div className="view-list animate-slide-up">
                            <div className="d-flex justify-content-between align-items-center mb-5">
                                <div>
                                    <h5 className="fw-bold text-dark mb-1">Module Quizzes</h5>
                                    <p className="text-muted small mb-0">Manage existing assessments or create new ones.</p>
                                </div>
                                <button
                                    className="btn btn-premium-gradient d-flex align-items-center gap-2"
                                    onClick={() => setView("create")}
                                >
                                    <FaPlus /> <span>New Quiz</span>
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-5">
                                    <div className="premium-spinner"></div>
                                    <p className="mt-3 text-muted fw-medium">Retrieving assessments...</p>
                                </div>
                            ) : quizzes.length === 0 ? (
                                <div className="empty-state-card py-5">
                                    <div className="empty-icon-box mb-4">
                                        <MdQuiz size={64} className="opacity-20" />
                                    </div>
                                    <h5 className="fw-bold text-dark">No Quizzes Found</h5>
                                    <p className="text-muted mb-4">Start by creating a diagnostic or mastery quiz for this section.</p>
                                    <button onClick={() => setView("create")} className="btn btn-primary rounded-pill px-4 fw-bold">
                                        Let's Get Started
                                    </button>
                                </div>
                            ) : (
                                <div className="row g-4">
                                    {quizzes.map((quiz) => (
                                        <div key={quiz._id} className="col-lg-6">
                                            <div className="quiz-premium-card">
                                                <div className="card-header-accent"></div>
                                                <div className="p-4">
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <h6 className="fw-bold text-dark mb-0 fs-5">{quiz.title}</h6>
                                                        <div className="quiz-badge-id">#QZ</div>
                                                    </div>
                                                    <p className="small text-muted mb-4 line-clamp-2">{quiz.description}</p>
                                                    <div className="d-flex gap-3 mb-4">
                                                        <div className="meta-item">
                                                            <MdStars className="text-warning" />
                                                            <span>{quiz.pass_percentage}% Pass</span>
                                                        </div>
                                                        <div className="meta-item">
                                                            <MdTimer className="text-primary" />
                                                            <span>{quiz.time_limit_minutes}m</span>
                                                        </div>
                                                        <div className="meta-item">
                                                            <MdRefresh className="text-success" />
                                                            <span>{quiz.attempts_allowed} Try</span>
                                                        </div>
                                                    </div>
                                                    <div className="d-grid gap-2">
                                                        <button
                                                            className="btn btn-soft-indigo fw-bold rounded-3"
                                                            onClick={() => handleViewQuestions(quiz)}
                                                        >
                                                            Manage Contents & Questions
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {view === "create" && (
                        <div className="view-create animate-slide-up">
                            <button className="btn btn-back mb-4" onClick={() => setView("list")}>
                                <FaChevronLeft /> Back to List
                            </button>
                            <div className="mb-5">
                                <h5 className="fw-bold text-dark mb-1">Create New Assessment</h5>
                                <p className="text-muted small">Define the parameters for your student evaluation.</p>
                            </div>
                            <form onSubmit={handleCreateQuiz} className="quiz-create-form glass-card p-4 rounded-4">
                                <div className="row g-4">
                                    <div className="col-md-12">
                                        <label className="premium-label">Quiz Identity *</label>
                                        <input
                                            type="text"
                                            className="premium-input"
                                            value={quizForm.title}
                                            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                                            required
                                            placeholder="e.g. Master the Endgame Fundamentals"
                                        />
                                    </div>
                                    <div className="col-md-12">
                                        <label className="premium-label">Detailed Guidelines *</label>
                                        <textarea
                                            className="premium-input no-resize"
                                            rows="3"
                                            value={quizForm.description}
                                            onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                                            required
                                            placeholder="Provide instructions or background for this quiz..."
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="premium-label">Pass Threshold (%) *</label>
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                className="form-control premium-input border-end-0"
                                                min="0"
                                                max="100"
                                                value={quizForm.pass_percentage}
                                                onChange={(e) => setQuizForm({ ...quizForm, pass_percentage: parseInt(e.target.value) })}
                                                required
                                            />
                                            <span className="input-group-text premium-addon">%</span>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="premium-label">Time Limitation (min) *</label>
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                className="form-control premium-input border-end-0"
                                                min="1"
                                                value={quizForm.time_limit_minutes}
                                                onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: parseInt(e.target.value) })}
                                                required
                                            />
                                            <span className="input-group-text premium-addon">m</span>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="premium-label">Attempt Quota *</label>
                                        <div className="input-group">
                                            <input
                                                type="number"
                                                className="form-control premium-input border-end-0"
                                                min="1"
                                                value={quizForm.attempts_allowed}
                                                onChange={(e) => setQuizForm({ ...quizForm, attempts_allowed: parseInt(e.target.value) })}
                                                required
                                            />
                                            <span className="input-group-text premium-addon">qty</span>
                                        </div>
                                    </div>
                                    <div className="col-12 text-end mt-5 pt-3 border-top">
                                        <button type="button" className="btn btn-light px-4 me-3 fw-bold rounded-3" onClick={() => setView("list")}>Cancel</button>
                                        <button type="submit" className="btn btn-premium-gradient px-5 fw-bold rounded-3">
                                            Proceed to Question Builder
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {view === "questions" && selectedQuiz && (
                        <div className="view-questions animate-slide-up">
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <button className="btn btn-back" onClick={() => { setView("list"); setSelectedQuiz(null); }}>
                                    <FaChevronLeft /> Exit Builder
                                </button>
                                <div className="quiz-context-card d-flex align-items-center gap-3 px-3 py-2 rounded-pill bg-light border">
                                    <MdStars className="text-warning" />
                                    <span className="fw-bold small text-dark">{selectedQuiz.title}</span>
                                    <span className="badge bg-soft-success text-success rounded-pill fw-bold" style={{ fontSize: '10px' }}>ACTIVE BUILD</span>
                                </div>
                            </div>

                            <div className="row g-5">
                                {/* Left: Form */}
                                <div className="col-lg-5">
                                    <div className="builder-sticky-card glass-card p-4 rounded-4 shadow-lg border-primary border-opacity-10">
                                        <div className="d-flex align-items-center gap-2 mb-4">
                                            <div className="bg-primary p-2 rounded-2 text-white"><MdOutlineQuestionAnswer /></div>
                                            <h6 className="fw-bold text-dark mb-0">Question Architect</h6>
                                        </div>
                                        <form onSubmit={handleAddQuestion}>
                                            <div className="mb-4">
                                                <label className="premium-label">Core Question Context *</label>
                                                <textarea
                                                    className="premium-input font-medium"
                                                    rows="3"
                                                    value={questionForm.question_text}
                                                    onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                                                    placeholder="e.g. Which of these is the most efficient mate with two bishops?"
                                                    required
                                                />
                                            </div>
                                            <div className="row g-3 mb-4">
                                                <div className="col-7">
                                                    <label className="premium-label">Response Type</label>
                                                    <select
                                                        className="premium-input form-select"
                                                        value={questionForm.question_type}
                                                        onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })}
                                                    >
                                                        <option value="mcq">Multiple Choice</option>
                                                        <option value="true_false">True / False</option>
                                                    </select>
                                                </div>
                                                <div className="col-5">
                                                    <label className="premium-label">Points</label>
                                                    <input
                                                        type="number"
                                                        className="premium-input"
                                                        min="1"
                                                        value={questionForm.score}
                                                        onChange={(e) => setQuestionForm({ ...questionForm, score: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            </div>

                                            <label className="premium-label mb-3">Response Options</label>
                                            <div className="options-stack mb-4">
                                                {questionForm.options.map((option, index) => (
                                                    <div key={index} className={`option-input-group mb-3 ${option.is_correct ? 'active-option' : ''}`}>
                                                        <div className="option-check">
                                                            <input
                                                                type="radio"
                                                                name="correct_option"
                                                                id={`opt-${index}`}
                                                                checked={option.is_correct}
                                                                onChange={(e) => handleOptionChange(index, "is_correct", e.target.checked)}
                                                            />
                                                            <label htmlFor={`opt-${index}`}><MdCheckCircle /></label>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="option-text-input"
                                                            placeholder={`Choice #${index + 1}`}
                                                            value={option.option_text}
                                                            onChange={(e) => handleOptionChange(index, "option_text", e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <button type="submit" className="btn btn-indigo w-100 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2">
                                                <FaPlus /> <span>Attach to Quiz</span>
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Right: Question List */}
                                <div className="col-lg-7">
                                    <div className="d-flex align-items-center justify-content-between mb-4">
                                        <h6 className="fw-bold text-dark text-uppercase letter-spacing-1 small">Question Registry ({questions.length})</h6>
                                    </div>
                                    <div className="questions-scroll-area">
                                        {questions.length === 0 ? (
                                            <div className="empty-registry py-5 text-center border-2 border-dashed rounded-4">
                                                <p className="text-muted mb-0">No questions mapped to this quiz yet.</p>
                                            </div>
                                        ) : (
                                            <div className="d-flex flex-column gap-3">
                                                {questions.map((q, index) => (
                                                    <div key={q._id} className="question-registry-card animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                                        <div className="q-card-inner">
                                                            <div className="q-header">
                                                                <div className="q-idx-badge">{index + 1}</div>
                                                                <div className="flex-grow-1">
                                                                    <p className="q-text mb-2">{q.question_text}</p>
                                                                    <div className="q-options-grid">
                                                                        {q.options && q.options.map((opt) => (
                                                                            <div key={opt._id} className={`q-opt-item ${opt.is_correct ? 'is-correct' : ''}`}>
                                                                                <div className="q-opt-marker"></div>
                                                                                <span className="q-opt-label">{opt.option_text}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="q-meta-badges">
                                                                    <span className="badge bg-soft-primary text-primary px-2 py-1 rounded small">{q.score} pts</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="quiz-mgmt-footer">
                    <button className="btn btn-light px-4 fw-bold rounded-3 border h-100" onClick={onClose}>
                        Dismiss
                    </button>
                    <button className="btn btn-dark px-4 fw-bold rounded-3 h-100" onClick={onClose}>
                        Finalize & Close
                    </button>
                </div>
            </div>

            <style>{`
                .quiz-mgmt-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(12px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 20px;
                }
                .quiz-mgmt-container {
                    background: #f8fafc;
                    width: 100%;
                    max-width: 1100px;
                    height: 90vh;
                    border-radius: 32px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    position: relative;
                }
                .quiz-mgmt-header {
                    background: white;
                    padding: 1.5rem 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                }
                .header-icon-box {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
                }
                .quiz-close-btn {
                    background: #f1f5f9;
                    border: none;
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .quiz-close-btn:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                    transform: rotate(90deg);
                }
                .quiz-mgmt-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 3rem;
                }
                .quiz-mgmt-footer {
                    background: white;
                    padding: 1.25rem 3rem;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    border-top: 1px solid rgba(0, 0, 0, 0.05);
                    min-height: 80px;
                }

                /* Inputs & Components */
                .premium-label {
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.75rem;
                    display: block;
                }
                .premium-input {
                    display: block;
                    width: 100%;
                    padding: 0.875rem 1.25rem;
                    font-size: 0.9375rem;
                    color: #1e293b;
                    background-color: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    transition: all 0.2s;
                }
                .premium-input:focus {
                    outline: none;
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
                    background-color: #fff;
                }
                .premium-addon {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-left: 0;
                    border-radius: 0 12px 12px 0;
                    font-weight: 700;
                    color: #94a3b8;
                    padding: 0 1rem;
                }

                .btn-premium-gradient {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    color: white;
                    border: none;
                    padding: 0.875rem 1.75rem;
                    border-radius: 14px;
                    font-weight: 700;
                    box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
                    transition: all 0.3s;
                }
                .btn-premium-gradient:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 25px -5px rgba(79, 70, 229, 0.5);
                    color: white;
                }

                .btn-back {
                    background: transparent;
                    border: none;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0;
                    transition: color 0.2s;
                }
                .btn-back:hover { color: #4f46e5; }

                /* Quiz Cards */
                .quiz-premium-card {
                    background: white;
                    border-radius: 20px;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                    height: 100%;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s;
                    position: relative;
                }
                .quiz-premium-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    border-color: #4f46e5;
                }
                .card-header-accent {
                    height: 6px;
                    background: linear-gradient(90deg, #4f46e5, #7c3aed);
                }
                .quiz-badge-id {
                    font-size: 10px;
                    font-weight: 900;
                    background: #f1f5f9;
                    color: #94a3b8;
                    padding: 2px 8px;
                    border-radius: 6px;
                }
                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #64748b;
                    padding: 4px 10px;
                    background: #f8fafc;
                    border-radius: 8px;
                }
                .btn-soft-indigo {
                    background: #eef2ff;
                    color: #4f46e5;
                    border: 1px solid rgba(79, 70, 229, 0.1);
                    padding: 0.75rem;
                    transition: all 0.2s;
                }
                .btn-soft-indigo:hover {
                    background: #4f46e5;
                    color: white;
                }

                /* Option Inputs */
                .option-input-group {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: white;
                    padding: 8px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    transition: all 0.2s;
                }
                .active-option {
                    border-color: #10b981;
                    background: #f0fdf4;
                }
                .option-check {
                    width: 32px;
                    height: 32px;
                    position: relative;
                }
                .option-check input {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    cursor: pointer;
                    z-index: 2;
                }
                .option-check label {
                    position: absolute;
                    inset: 0;
                    background: #f1f5f9;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: transparent;
                    transition: all 0.2s;
                }
                .option-check input:checked + label {
                    background: #10b981;
                    color: white;
                }
                .option-text-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    padding: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: #1e293b;
                }
                .option-text-input:focus { outline: none; }

                /* Question Registry Cards */
                .question-registry-card {
                    background: white;
                    border-radius: 16px;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                }
                .q-card-inner { padding: 1.25rem; }
                .q-header { display: flex; gap: 1rem; align-items: flex-start; }
                .q-idx-badge {
                    width: 28px;
                    height: 28px;
                    background: #f1f5f9;
                    color: #64748b;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 800;
                    flex-shrink: 0;
                }
                .q-text {
                    font-weight: 600;
                    color: #1e293b;
                    line-height: 1.5;
                    margin-bottom: 1rem;
                }
                .q-options-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }
                .q-opt-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 12px;
                    background: #f8fafc;
                    border-radius: 10px;
                    font-size: 0.75rem;
                }
                .q-opt-marker {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #cbd5e1;
                }
                .q-opt-item.is-correct {
                    background: #f0fdf4;
                    color: #16a34a;
                    font-weight: 700;
                }
                .q-opt-item.is-correct .q-opt-marker { background: #22c55e; }
                .q-opt-label {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Animations */
                .animate-popup { animation: popup 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-slide-in { animation: slideIn 0.4s ease-out both; }
                
                @keyframes popup {
                    from { transform: scale(0.9) translateY(20px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(15px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateX(-15px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .premium-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #e2e8f0;
                    border-top-color: #4f46e5;
                    border-radius: 50%;
                    margin: 0 auto;
                    animation: spin 0.8s linear infinite;
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .letter-spacing-1 { letter-spacing: 0.1rem; }
                
                .btn-indigo {
                    background: #4f46e5;
                    color: white;
                    border: none;
                }
                .btn-indigo:hover {
                    background: #4338ca;
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default QuizManagementModal;
