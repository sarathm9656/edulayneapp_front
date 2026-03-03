import React, { useState, useEffect } from "react";
import axios from "axios";

const LessonDisplay = ({ moduleId, index }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLessonContent, setShowLessonContent] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);

  const isYouTube =
    currentLesson?.video_url.includes("youtube.com") ||
    currentLesson?.video_url.includes("youtu.be");
  useEffect(() => {
    const fetchLessonsName = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/lessons/get-lessons-name/${moduleId}`
        );
        console.log(response.data.data, "response.data.data");
        setLessons(response.data.data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchLessonsName();
  }, [moduleId]);
  const fetchLessonContent = async (lessonId, index) => {
    setShowLessonContent(!showLessonContent);
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/lessons/get-lesson-content/${lessonId}`
    );
    console.log(response.data.data, "response.data.data");
    setCurrentLesson(response.data.data);
    await axios.put(
      `${import.meta.env.VITE_API_URL}/modules/update/display-order/${moduleId}`,
      {
        display_order: index,
      }
    );
  };
  const extractYouTubeVideoId = (url) => {
    const regExp =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };
  return (
    <ol type="1" className="flex flex-col gap-2 list-decimal list-outside pl-4">
      {lessons.map((lesson) => (
        <>
          <li
            onClick={() => fetchLessonContent(lesson.id, index)}
            key={lesson.id}
            className="cursor-pointer hover:bg-gray-200 p-2 rounded-md"
          >
            {lesson.lesson_title}
          </li>
          {showLessonContent &&
            currentLesson &&
            currentLesson.lesson_id === lesson.id && (
              <div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-md border border-gray-200">
                <p className="text-lg font-bold">
                  {currentLesson.lesson_title}
                </p>
                <p className="text-sm text-gray-500 italic">
                  {currentLesson.lesson_description}
                </p>
                <div className="flex gap-2">
                  <p className="text-sm text-gray-500">
                    Lesson Duration:{" "}
                    {(currentLesson.lesson_duration / 60).toFixed(2)} hours{" "}
                    {currentLesson.lesson_duration % 60} minutes
                  </p>
                </div>
                {currentLesson.lesson_type === "video" && (
                  <div>
                    {isYouTube ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeVideoId(
                          currentLesson.video_url
                        )}`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full aspect-video"
                      ></iframe>
                    ) : (
                      <video
                        src={currentLesson.video_url}
                        controls
                        className="w-full h-full"
                      />
                    )}
                  </div>
                )}
                {currentLesson.lesson_type === "text" && (
                  <div>
                    <p className="text-sm text-gray-500">
                      {currentLesson.lesson_content}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  {currentLesson.is_preview}
                </p>
                <p className="text-sm text-gray-500">
                  {currentLesson.display_order}
                </p>
                <p className="text-sm text-gray-500">
                  {currentLesson.lesson_type}
                </p>
              </div>
            )}
        </>
      ))}
    </ol>
  );
};

export default LessonDisplay;
