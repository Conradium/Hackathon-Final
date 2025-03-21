import { useEffect } from "react";

const destinations = [
  { name: "富士山 (Mount Fuji)", img: "/images/mount-fuji.jpg" }, // ✅ Correct public path
  { name: "東京 (Tokyo)", img: "/images/tokyo.jpg" },
  { name: "京都 (Kyoto)", img: "/images/kyoto.jpg" },
];

const TopDestinations = () => {
  useEffect(() => {
    console.log("✅ Checking image paths:", destinations.map(d => d.img));
  }, []);

  return (
    <div className="py-12 bg-secondary text-text-dark">
      <h2 className="text-4xl font-bold text-center mb-8">人気の目的地</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6">
        {destinations.map((place, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg shadow-lg transition-all transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <img 
              src={place.img} 
              alt={place.name} 
              className="w-full h-64 object-cover opacity-90 hover:opacity-100 border-2 border-transparent hover:border-primary transition-all duration-300"
              onError={(e) => { 
                console.error(`❌ Image not found: ${place.img}`); 
                e.currentTarget.src = "/images/placeholder.jpg"; 
              }} 
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-2xl font-bold">
              {place.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopDestinations;
