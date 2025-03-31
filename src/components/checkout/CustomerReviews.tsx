
import React from 'react';

const CustomerReviews = () => {
  return (
    <div className="mt-6 px-2">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
          <img 
            src="https://randomuser.me/api/portraits/women/44.jpg" 
            alt="User" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <p className="font-medium text-sm">Fernanda dos Santos</p>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm mb-4">
        Ótima loja, entreguei o produto rápido e correto, realmente entregou o que prometeu
      </p>
      
      <div className="border-t border-gray-200 pt-3">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
            <img 
              src="https://randomuser.me/api/portraits/men/32.jpg" 
              alt="User" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <p className="font-medium text-sm">Carlos Nascimento</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm mb-4">
          Excelente produto! Os tênis vieram perfeitos, bem embalados. Amei!
        </p>
      </div>
    </div>
  );
};

export default CustomerReviews;
