import { FaMapMarkedAlt, FaLanguage, FaHotel } from "react-icons/fa"

const services = [
  {
    title: "Pathfinding",
    icon: <FaMapMarkedAlt />,
    description: "Easily locate nearby points of interest within Katsuōji Temple.",
  },
  {
    title: "Real-time Translation",
    icon: <FaLanguage />,
    description: "Take pictures and receive AI powered translation, together with the explanation.",
  },
  { title: "Tourguide", icon: <FaHotel />, description: "AI powered guide with language of your choice." },
]

const Services = () => {
  return (
    <div className="py-16 bg-gradient-to-r from-red-500 to-red-700 text-white text-center">
      <h2 className="text-4xl font-bold mb-6">AI-Powered Services</h2>
      <p className="text-lg max-w-3xl mx-auto mb-10">
        Experience Katsuōji Temple with AI enhanced services, virtual AI guide, points of interest interactive AI. Ask anything on the go!
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white text-gray-900 rounded-lg shadow-md p-6 hover:shadow-lg transform hover:scale-105 transition-all"
          >
            <div className="text-4xl text-red-500 mb-4">{service.icon}</div>
            <h3 className="text-xl font-bold mb-2">{service.title}</h3>
            <p className="text-gray-700">{service.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <a href="/chatbot">
          <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-gray-200 transition-all">
            Start with our AI agent
          </button>
        </a>
      </div>
    </div>
  )
}

export default Services

