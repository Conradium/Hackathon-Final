import { FaMapMarkedAlt, FaLanguage, FaHotel } from "react-icons/fa"

const services = [
  {
    title: "Pathfinding",
    icon: <FaMapMarkedAlt />,
    description: "Easily locate nearby points of interest within Katsuōji Temple.",
  },
  {
    title: "AI Chatbot",
    icon: <FaLanguage />,
    description: "Take pictures and receive translations, together with explanations. Or direction.",
  },
  { title: "Object Identification", icon: <FaHotel />, description: "Identify unique landmarks with their facts by pointing your camera at it." },
]

const Services = () => {
  return (
    <div className="py-16 bg-gradient-to-r from-red-500 to-red-700 text-white text-center">
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
    </div>
  )
}

export default Services

