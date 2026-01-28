import React, { useState, useEffect } from "react";
import { FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdQuiz } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";

const QuizTakingModal = ({ isOpen, onClose, quizId, courseId, moduleId, studentId }) => {
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && quizId) {
            fetchQuizData();
        }
    }, [isOpen, quizId]);

    useEffect(() => {
        if (timeLeft > 0 && !result) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && startTime && !result) {
            handleSubmit();
        }
    }, [timeLeft, result]);

    const fetchQuizData = async () => {
        try {
            setIsLoading(true);
            // Fetch quiz details
            const quizResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/quizzes/${quizId}`,
                { withCredentials: true }
            );

            if (quizResponse.data.success) {
                const quizData = quizResponse.data.data;
                setQuestions(quizData);

                // Fetch quiz metadata
                const metaResponse = await axios.get(
                    `${import.meta.env.VITE_API_URL}/quizzes`,
                    {
                        params: { course_id: courseId, module_id: moduleId },
                        withCredentials: true,
                    }
                );

                if (metaResponse.data.success) {
                    const quizMeta = metaResponse.data.data.find(q => q._id === quizId);
                    setQuiz(quizMeta);
                    setTimeLeft(quizMeta.time_limit_minutes * 60);
                    setStartTime(new Date());
                }
            }
        } catch (error) {
            toast.error("Failed to load quiz");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (questionId, optionId, textAnswer = null) => {
        setAnswers({
            ...answers,
            [questionId]: {
                question_id: questionId,
                selected_option_id: optionId,
                text_answer: textAnswer,
            },
        });
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const unanswered = questions.filter(q => !answers[q._id]);
        if (unanswered.length > 0 && timeLeft > 0) {
            if (!window.confirm(`You have ${unanswered.length} unanswered questions. Submit anyway?`)) {
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const timeTaken = Math.ceil((new Date() - startTime) / 60000); // minutes
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/quizzes/submit`,
                {
                    quiz_id: quizId,
                    student_id: studentId,
                    course_id: courseId,
                    module_id: moduleId,
                    answers: Object.values(answers),
                    time_taken_minutes: timeTaken,
                    started_at: startTime,
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                setResult(response.data.data);
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit quiz");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2100 }}>
            <div className="modal-container" style={{ background: "#fff", width: "95%", maxWidth: "900px", maxHeight: "90vh", borderRadius: "24px", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", overflow: "hidden" }}>

                {/* Header */}
                <div className="modal-header" style={{ background: result ? (result.passed ? "#10b981" : "#ef4444") : "#667eea", padding: "1.5rem 2rem", color: "#fff" }}>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                            <MdQuiz className="fs-3" />
                            <div>
                                <h5 className="mb-0 fw-bold">{quiz?.title || "Quiz"}</h5>
                                <small className="opacity-90">{quiz?.description}</small>
                            </div>
                        </div>
                        {!result && (
                            <div className="d-flex align-items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-3">
                                <FaClock />
                                <span className="fw-bold fs-5">{formatTime(timeLeft)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="modal-body" style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
                    {isLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : result ? (
                        <div className="text-center">
                            <div className={`mb-4 ${result.passed ? "text-success" : "text-danger"}`}>
                                {result.passed ? (
                                    <FaCheckCircle style={{ fontSize: "5rem" }} />
                                ) : (
                                    <FaTimesCircle style={{ fontSize: "5rem" }} />
                                )}
                            </div>
                            <h3 className="fw-bold mb-2">{result.passed ? "Congratulations!" : "Not Passed"}</h3>
                            <p className="text-muted mb-4">
                                {result.passed
                                    ? "You have successfully passed this quiz!"
                                    : `You need ${quiz.pass_percentage}% to pass. Try again!`}
                            </p>
                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body p-3">
                                            <div className="small text-muted mb-1">Your Score</div>
                                            <div className="h4 fw-bold mb-0">{result.total_score} / {result.max_score}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body p-3">
                                            <div className="small text-muted mb-1">Percentage</div>
                                            <div className="h4 fw-bold mb-0">{result.percentage}%</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body p-3">
                                            <div className="small text-muted mb-1">Time Taken</div>
                                            <div className="h4 fw-bold mb-0">{result.time_taken_minutes} min</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-primary px-5 py-2 fw-bold" onClick={onClose}>
                                Close
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4 p-3 bg-light rounded-3 border-start border-primary border-4">
                                <div className="row g-2">
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Total Questions</small>
                                        <strong>{questions.length}</strong>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Pass Percentage</small>
                                        <strong>{quiz?.pass_percentage}%</strong>
                                    </div>
                                    <div className="col-md-4">
                                        <small className="text-muted d-block">Answered</small>
                                        <strong>{Object.keys(answers).length} / {questions.length}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex flex-column gap-4">
                                {questions.map((question, index) => (
                                    <div key={question._id} className="card border-0 shadow-sm">
                                        <div className="card-body p-4">
                                            <div className="d-flex align-items-start gap-3 mb-3">
                                                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: "36px", height: "36px", minWidth: "36px" }}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <h6 className="fw-bold mb-2">{question.question_text}</h6>
                                                    <span className="badge bg-light text-dark border small">{question.score} point{question.score > 1 ? "s" : ""}</span>
                                                </div>
                                            </div>

                                            <div className="d-flex flex-column gap-2 ms-5">
                                                {question.options && question.options.map((option) => (
                                                    <div key={option._id} className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name={`question_${question._id}`}
                                                            id={`option_${option._id}`}
                                                            checked={answers[question._id]?.selected_option_id === option._id}
                                                            onChange={() => handleAnswerChange(question._id, option._id)}
                                                        />
                                                        <label className="form-check-label w-100 cursor-pointer" htmlFor={`option_${option._id}`}>
                                                            {option.option_text}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!result && !isLoading && (
                    <div className="modal-footer" style={{ background: "#fff", padding: "1.25rem 2rem", borderTop: "1px solid #e2e8f0" }}>
                        <button className="btn btn-light px-4 fw-bold" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button
                            className="btn btn-success px-5 fw-bold"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Submit Quiz"}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
        .cursor-pointer { cursor: pointer; }
        .form-check-input:checked {
          background-color: #667eea;
          border-color: #667eea;
        }
      `}</style>
        </div>
    );
};

export default QuizTakingModal;
