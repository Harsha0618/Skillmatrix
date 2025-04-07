import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center max-w-4xl px-4">
        {/* Main Heading */}
        <h1 className="text-5xl font-bold text-purple-600 mb-6 animate-fade-in">
          Welcome to <span className="text-pink-600">SkillMatrix</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl text-gray-700 mb-8 animate-fade-in delay-100">
          Your ultimate companion for mastering interviews and landing your dream job.
        </p>

        {/* Key Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in delay-200">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-purple-600 mb-3">For Candidates</h2>
            <p className="text-gray-700">
              Practice with tailored interview questions, improve your skills, and gain confidence to ace your next interview.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-pink-600 mb-3">For HRs</h2>
            <p className="text-gray-700">
              Streamline your hiring process with skill-based assessments and find the best talent for your organization.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-purple-600 mb-3">For Everyone</h2>
            <p className="text-gray-700">
              Whether you're preparing for an interview or hiring, SkillMatrix has the tools you need to succeed.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="animate-fade-in delay-300">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-700 mb-6">
            Join thousands of candidates and HR professionals who trust SkillMatrix for their interview preparation and hiring needs.
          </p>
          <div className="space-x-4">
            <a
              href="/signup"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all duration-300"
            >
              Sign Up Now
            </a>
            <a
              href="/login"
              className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-all duration-300"
            >
              Log In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;