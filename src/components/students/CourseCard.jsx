import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { useState } from "react";
import { FaRegBookmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const CourseCard = ({ course }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const navigate = useNavigate();
  return (
    <Card className="mt-6 w-96">
      <CardHeader color="blue-gray" className="relative h-56">
        <img
          src={course.image}
          alt="card-image"
          className="w-full h-full object-cover"
        />
      </CardHeader>
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2 text-center">
          {course.course_title}
        </Typography>
        {/* short description with 100 characters and read more button */}
        <Typography className="text-center">
          {showFullDescription
            ? course.description
            : course.description.slice(0, 100)}
          {/* ON CLICK SHOW FULL DESCRIPTION */}
          <span
            className=" text-blue-500 ml-2 cursor-pointer"
            onClick={() => {
              setShowFullDescription(!showFullDescription);
            }}
          >
            {showFullDescription ? "Read Less" : "Read More"}
          </span>
        </Typography>
      </CardBody>
      {/* CENTERED BUTTON  */}
      <CardFooter className="pt-0 flex justify-center gap-4">
        <Button className="bg-black text-white w-full cursor-pointer hover:bg-gray-800">
          Enroll Now
        </Button>
        <Button
          onClick={() => {
            navigate(`/student/course/${course._id}`);
          }}
          className="bg-black text-white w-full cursor-pointer hover:bg-gray-800"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
