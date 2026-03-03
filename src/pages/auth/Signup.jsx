import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [signupData, setSignupData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });
  const api_url = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (
      signupData.fname === "" ||
      signupData.lname === "" ||
      signupData.email === "" ||
      signupData.password === ""
    ) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${api_url}/auth/signup`,
        signupData
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white flex h-screen ">
      <div className="flex w-full max-w-6xl  bg-[#fee] ">
        <div className="flex flex-col items-center justify-center w-full">
          <h1 className="text-4xl font-bold">Sign up</h1>
          <p className="text-gray-500 mb-6">
            Create an account to get started...
          </p>
        </div>
      </div>
      <div className="flex w-full">
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold">Sign up</h1>
            <p className="text-gray-500 mb-6">
              Create an account to get started...
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
              <div>
                <label className="font-semibold text-sm " htmlFor="name">
                  First Name
                </label>
                <input
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 rounded-md border border-gray-300 outline-none"
                  type="text"
                  placeholder="Enter Your First Name"
                />
              </div>
              <div>
                <label className="font-semibold text-sm " htmlFor="name">
                  Last Name
                </label>
                <input
                  onChange={handleChange}
                  className="w-full text-sm px-4 py-2 rounded-md border border-gray-300 outline-none"
                  type="text"
                  placeholder="Enter Your Last Name"
                />
              </div>
              <div>
                <label className="font-semibold text-sm " htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full text-sm px-4 py-2 rounded-md border border-gray-300 outline-none"
                  type="email"
                  placeholder="Email"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="font-semibold text-sm " htmlFor="password">
                  Password
                </label>
                <input
                  className="w-full text-sm px-4 py-2 rounded-md border border-gray-300 outline-none"
                  type="password"
                  placeholder="Password"
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" />
                <label className="text-sm" htmlFor="checkbox">
                  I agree to the terms and conditions
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" />
                <label className="text-sm" htmlFor="checkbox">
                  Remember Me
                </label>
              </div>
              <div className="flex items-end justify-end text-blue-600 text-sm gap-2">
                <button>Forgot Password?</button>
              </div>
              <div className="flex items-center justify-center text-sm gap-2">
                <button className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <Link className="" to="/users/login">
                    Login
                  </Link>
                </button>
              </div>
              <button
                className="w-full px-4 py-2 rounded-md bg-blue-500 text-white"
                type="submit"
              >
                Sign up
              </button>
            </form>
            <div className="flex items-center justify-center text-sm gap-2">
              <p> OR </p>
            </div>
            <div className="flex items-center justify-center text-sm gap-2">
              <button className="w-full px-4 py-2 rounded-md bg-red-500 text-white">
                Sign up with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
