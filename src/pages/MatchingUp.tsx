import React from 'react';
import OrangeButton from '../components/OrangeButton';
import image from '../resources/image.png'


const Matched: React.FC = () => {
  return (
    <div className="bg-white flex flex-col items-center justify-center h-screen">
        <img className='w-[300px] md:w-[421px] mb-5' src={image}/>
        <div className={`font-magilio text-heading`}>atching Up...</div>
    </div>
  );
};

export default Matched;
