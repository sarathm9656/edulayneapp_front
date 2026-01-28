import React, { useState, useEffect } from "react";
import { FaTrophy, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdQuiz } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";

const QuizResultsViewer = ({ studentId, courseId }) => {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState(null);
    const [detailedResult, setDetailedResult] = useState(null);

    useEffect(() => {
        if (studentId) {
            fetchResults();
        }
    }, [studentId, courseId]);

    const fetchResults = async () => {
        try {
            setIsLoading(true);
            const params = { student_id: studentId };
            if (courseId) params.course_id = courseId;

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/quizzes/results`,
                {
                    params,
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setResults(response.data.data || []);
            }
        } catch (error) {
            toast.error("Failed to fetch quiz results");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDetailedResult = async (resultId) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/quizzes/result/${resultId}`,
                { withCredentials: true }
            );

            if (response.data.success) {
                setDetailedResult(response.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch result details");
        }
    };

    const handleViewDetails = (result) => {
        setSelectedResult(result);
        fetchDetailedResult(result._id);
    };

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (selectedResult && detailedResult) {
        return (
            <div className="quiz-results-detail">
                <button
                    className="btn btn-link text-muted mb-3 text-decoration-none"
                    onClick={() => {
                        setSelectedResult(null);
                        setDetailedResult(null);
                    }}
                >
                    ← Back to Results
                </button>

                <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className={`card-header text-white p-4 ${selectedResult.passed ? "bg-success" : "bg-danger"}`}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h5 className="mb-1 fw-bold">{selectedResult.quiz_id?.title}</h5>
                                <p className="mb-0 opacity-90">{selectedResult.quiz_id?.description}</p>
                            </div>
                            <div className="text-end">
                                <div className="h2 mb-0 fw-bold">{selectedResult.percentage}%</div>
                                <small className="opacity-90">
                                    {selectedResult.total_score} / {selectedResult.max_score} points
                                </small>
                            </div>
                        </div>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-3 mb-4">
                            <div className="col-md-3">
                                <div className="text-center p-3 bg-light rounded-3">
                                    <FaTrophy className={`fs-3 mb-2 ${selectedResult.passed ? "text-success" : "text-muted"}`} />
                                    <div className="small text-muted">Status</div>
                                    <div className="fw-bold">{selectedResult.passed ? "Passed" : "Failed"}</div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="text-center p-3 bg-light rounded-3">
                                    <FaClock className="fs-3 mb-2 text-primary" />
                                    <div className="small text-muted">Time Taken</div>
                                    <div className="fw-bold">{selectedResult.time_taken_minutes} min</div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="text-center p-3 bg-light rounded-3">
                                    <MdQuiz className="fs-3 mb-2 text-info" />
                                    <div className="small text-muted">Attempt</div>
                                    <div className="fw-bold">#{selectedResult.attempt_number}</div>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="text-center p-3 bg-light rounded-3">
                                    <div className="fs-3 mb-2">📅</div>
                                    <div className="small text-muted">Date</div>
                                    <div className="fw-bold small">
                                        {new Date(selectedResult.completed_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h6 className="fw-bold mb-3">Question Review</h6>
                        <div className="d-flex flex-column gap-3">
                            {detailedResult.detailed_answers?.map((answer, index) => (
                                <div key={answer._id} className="card border-0 shadow-sm">
                                    <div className="card-body p-3">
                                        <div className="d-flex align-items-start gap-3">
                                            <div
                                                className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${answer.is_correct ? "bg-success text-white" : "bg-danger text-white"
                                                    }`}
                                                style={{ width: "36px", height: "36px", minWidth: "36px" }}
                                            >
                                                {answer.is_correct ? <FaCheckCircle /> : <FaTimesCircle />}
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="fw-bold mb-2">
                                                    Question {index + 1}: {answer.question?.question_text}
                                                </h6>
                                                <div className="d-flex flex-column gap-2">
                                                    {answer.options?.map((option) => {
                                                        const isSelected = option._id === answer.selected_option_id;
                                                        const isCorrect = option.is_correct;

                                                        return (
                                                            <div
                                                                key={option._id}
                                                                className={`p-2 rounded-3 ${isCorrect
                                                                        ? "bg-success bg-opacity-10 border border-success"
                                                                        : isSelected
                                                                            ? "bg-danger bg-opacity-10 border border-danger"
                                                                            : "bg-light"
                                                                    }`}
                                                            >
                                                                <div className="d-flex align-items-center gap-2">
                                                                    {isCorrect && <FaCheckCircle className="text-success" />}
                                                                    {isSelected && !isCorrect && <FaTimesCircle className="text-danger" />}
                                                                    <span className={isCorrect ? "fw-bold text-success" : isSelected ? "text-danger" : ""}>
                                                                        {option.option_text}
                                                                    </span>
                                                                    {isCorrect && <span className="badge bg-success ms-auto">Correct Answer</span>}
                                                                    {isSelected && !isCorrect && <span className="badge bg-danger ms-auto">Your Answer</span>}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-2 small text-muted">
                                                    Points: {answer.points_earned} / {answer.question?.score}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-results-list">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h5 className="mb-0 fw-bold">Quiz Results</h5>
                <button className="btn btn-sm btn-outline-primary" onClick={fetchResults}>
                    Refresh
                </button>
            </div>

            {results.length === 0 ? (
                <div className="text-center py-5">
                    <MdQuiz className="text-muted mb-3" style={{ fontSize: "4rem", opacity: 0.3 }} />
                    <h6 className="fw-bold text-dark">No Quiz Results</h6>
                    <p className="text-muted">You haven't taken any quizzes yet</p>
                </div>
            ) : (
                <div className="row g-3">
                    {results.map((result) => (
                        <div key={result._id} className="col-md-6">
                            <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                                <div className={`card-header text-white p-3 ${result.passed ? "bg-success" : "bg-danger"}`}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2">
                                            {result.passed ? <FaCheckCircle /> : <FaTimesCircle />}
                                            <span className="fw-bold">{result.passed ? "Passed" : "Failed"}</span>
                                        </div>
                                        <span className="badge bg-white bg-opacity-20">
                                            Attempt #{result.attempt_number}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body p-3">
                                    <h6 className="fw-bold mb-2">{result.quiz_id?.title}</h6>
                                    <p className="small text-muted mb-3">{result.quiz_id?.description}</p>

                                    <div className="row g-2 mb-3">
                                        <div className="col-6">
                                            <div className="small text-muted">Score</div>
                                            <div className="fw-bold">
                                                {result.total_score} / {result.max_score}
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="small text-muted">Percentage</div>
                                            <div className="fw-bold">{result.percentage}%</div>
                                        </div>
                                        <div className="col-6">
                                            <div className="small text-muted">Time</div>
                                            <div className="fw-bold">{result.time_taken_minutes} min</div>
                                        </div>
                                        <div className="col-6">
                                            <div className="small text-muted">Date</div>
                                            <div className="fw-bold small">
                                                {new Date(result.completed_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-sm btn-outline-primary w-100 fw-bold"
                                        onClick={() => handleViewDetails(result)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizResultsViewer;
