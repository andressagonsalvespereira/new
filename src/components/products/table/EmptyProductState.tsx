
import React from 'react';

const EmptyProductState = () => {
  return (
    <div className="text-center py-10 bg-gray-50 rounded-lg">
      <p className="text-gray-500 mb-4">No products found</p>
      <p className="text-sm text-gray-400">Click "Add Product" to get started</p>
    </div>
  );
};

export default EmptyProductState;
