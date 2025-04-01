
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CardSubmitButtonProps {
  isLoading: boolean;
  isSubmitting: boolean;
  buttonText: string;
  buttonStyle: React.CSSProperties;
}

const CardSubmitButton = ({ 
  isLoading, 
  isSubmitting, 
  buttonText, 
  buttonStyle 
}: CardSubmitButtonProps) => {
  // Local state for preventing multiple clicks
  const [wasClicked, setWasClicked] = useState(false);
  
  // Combined state to determine if button should be disabled
  const isDisabled = isLoading || isSubmitting || wasClicked;

  // Debug logs to trace button states
  useEffect(() => {
    console.log("CardSubmitButton render state:", { isLoading, isSubmitting, wasClicked, isDisabled });
  }, [isLoading, isSubmitting, wasClicked, isDisabled]);

  // Reset wasClicked when component unmounts or when isSubmitting changes to false
  useEffect(() => {
    console.log("Button state changed:", { isSubmitting, wasClicked });
    
    if (!isSubmitting && wasClicked) {
      // Delay to prevent immediate re-clicking
      const timeout = setTimeout(() => {
        console.log("Resetting wasClicked state after timeout");
        setWasClicked(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [isSubmitting, wasClicked]);

  // Function to handle button click and prevent multiple submissions
  const handleButtonClick = (e: React.MouseEvent) => {
    console.log("Card payment button clicked", { isDisabled, wasClicked, isSubmitting, isLoading });
    
    if (!isDisabled) {
      console.log("Card payment button click being processed - submitting form");
      setWasClicked(true);
      
      // Don't prevent default or stop propagation - let the form submission happen
      // This just prevents multiple clicks
    }
  };

  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isDisabled}
      style={buttonStyle}
      onClick={handleButtonClick}
      data-submitting={isSubmitting ? "true" : "false"}
      data-wasclicked={wasClicked ? "true" : "false"}
      data-loading={isLoading ? "true" : "false"}
    >
      {isLoading || isSubmitting ? (
        <div className="w-full">
          <div className="flex items-center justify-center mb-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span>Processando pagamento...</span>
          <Progress value={65} className="h-1 mt-2" />
        </div>
      ) : (
        <span className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          {buttonText}
        </span>
      )}
    </Button>
  );
};

export default CardSubmitButton;
