
import React from 'react';

export interface ProductDetailsType {
  name: string;
  price: number;
  description: string;
  image: string;
}

// This component doesn't render anything but provides a central place to define product details
export const getProductDetails = (): ProductDetailsType => {
  return {
    name: "Caneleira Gold",
    price: 59.90,
    description: 'Proteção premium para suas pernas',
    image: '/lovable-uploads/1664640d-4609-448d-9936-1d17bb6ed55a.png'
  };
};
