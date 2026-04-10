// components/ScrollToTopButton.jsx
import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa"; // Optional: For using an arrow icon
import { useLocation } from "react-router-dom"; // Import useLocation from react-router-dom

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation(); // Get the current location

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    // Add scroll event listener
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      // Clean up the scroll event listener
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  useEffect(() => {
    // Scroll to top when the location changes
    scrollToTop();
  }, [location]); // Depend on location

  return (
    <div className="scroll-to-top">
      {isVisible && (
        <button onClick={scrollToTop} className="scroll-to-top-button">
          <FaArrowUp /> {/* Optional: You can use an icon or text */}
        </button>
      )}
    </div>
  );
};

export default ScrollToTopButton;
