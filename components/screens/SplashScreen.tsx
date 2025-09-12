import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const slideData = [
  { image: 'images/slide1.svg', alt: 'Gradient 1' },
  { image: 'images/slide2.svg', alt: 'Gradient 2' },
  { image: 'images/slide3.svg', alt: 'Gradient 3' },
  { image: 'images/slide4.svg', alt: 'Gradient 4' }
];

const SplashScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slideData.length);
    }, 4000); // Change image every 4 seconds

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handleStart = () => {
    navigate('/onboarding');
  };

  return (
    <div className="relative h-full w-full flex flex-col justify-end text-white overflow-hidden">
      {slideData.map((slide, index) => (
         <img
            key={slide.image}
            src={slide.image}
            alt={slide.alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
      ))}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      
      <div className="relative z-10 p-8 flex flex-col items-center text-center">
        <h1 className="text-5xl font-extrabold text-primary-content mb-3 drop-shadow-lg" style={{fontFamily: 'sans-serif'}}>Lingo Mingle</h1>
        <p className="text-lg text-primary-content/90 mb-8 drop-shadow-md" style={{fontFamily: 'sans-serif'}}>Connect with your partner through the beautiful journey of language.</p>
        
        <div className="w-full max-w-xs">
           <Button onClick={handleStart} variant="primary">
             Start
           </Button>
        </div>

        <div className="flex justify-center space-x-2 mt-6">
          {slideData.map((_, index) => (
            <div
              key={index}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
