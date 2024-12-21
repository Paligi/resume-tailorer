import React, { useState } from 'react';

interface Requirements {
  [key: string]: string[];
}

export default function Popup() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requirements, setRequirements] = useState<Requirements>({});

  const handleTailorResume = () => {
    setIsLoading(true);
    chrome.runtime.sendMessage({type: "EXTRACT_AND_TAILOR"}, (response) => {
      setIsLoading(false);
      if (chrome.runtime.lastError) {
        setMessage('Error: ' + chrome.runtime.lastError.message);
      } else if (response?.success === false) {
        setMessage(response.message);
      } else {
        setMessage('Successfully extracted requirements:');
        setRequirements(response.requirements || {});
      }
    });
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="popup-container">
      <div className="flex items-center gap-2 mb-4">
        <img 
          src="icons/icon.jpg"
          alt="Resume Tailorer"
          className="w-8 h-8"
        />
        <h1 className="header-text">Resume Tailorer</h1>
      </div>
      <button 
        onClick={handleTailorResume}
        disabled={isLoading}
        className="button-gradient w-full px-4 py-2.5"
      >
        {isLoading ? 'Processing...' : 'Tailor Resume'}
      </button>
      
      {message && (
        <div className="mt-4">
          <p className="message-text">{message}</p>
          {Object.entries(requirements).length > 0 && (
            <div>
              {Object.entries(requirements).map(([category, skills]) => (
                skills.length > 0 && (
                  <div key={category} className="category-card">
                    <h3 className="category-title">
                      {formatCategory(category)}:
                    </h3>
                    <div>
                      {skills.map((skill) => (
                        <span key={skill} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

