import { FaMapMarkedAlt, FaLanguage, FaHotel, FaPlaneDeparture, FaRobot } from "react-icons/fa";

const services = [
  { title: "AI Travel Itinerary", icon: <FaMapMarkedAlt />, description: "Plan your trips efficiently with AI-generated itineraries based on your preferences." },
  { title: "Real-time Translation", icon: <FaLanguage />, description: "Break language barriers with instant AI-powered translations." },
  { title: "Hotel Recommendations", icon: <FaHotel />, description: "Get the best hotel recommendations tailored to your budget and preferences." },
  { title: "Flight Assistance", icon: <FaPlaneDeparture />, description: "Find the best flights and track your schedules effortlessly." },
  { title: "AI Travel Agent", icon: <FaRobot />, description: "Chat with our AI travel agent to solve any travel issues in real-time!" },
];

const Services = () => {
  return (
    <div className="py-16 bg-gradient-to-r from-red-500 to-red-700 text-white text-center">
      <h2 className="text-4xl font-bold mb-6">AI-Powered Travel Services</h2>
      <p className="text-lg max-w-3xl mx-auto mb-10">
        Experience the future of travel with our AI-powered assistant. Get instant translations, itinerary planning, and seamless navigation!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6">
        {services.map((service, index) => (
          <div key={index} className="bg-white text-gray-900 rounded-lg shadow-md p-6 hover:shadow-lg transform hover:scale-105 transition-all">
            <div className="text-4xl text-red-500 mb-4">{service.icon}</div>
            <h3 className="text-xl font-bold mb-2">{service.title}</h3>
            <p className="text-gray-700">{service.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <a href="/chatbot">
          <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-gray-200 transition-all">
            Chat with Our AI Travel Agent
          </button>
        </a>
      </div>
    </div>
  );
};

export default Services;