import React, { useState, useEffect } from 'react';
import { getFAQs } from '../api'; 

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await getFAQs(searchTerm);
        setFaqs(response.data);
      } catch (err) {
        console.error('Failed to fetch FAQs', err);
      }
    };
    
    const timerId = setTimeout(() => {
      fetchFAQs();
    }, 500);
    
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  return (
    <div>
      {/* Correct Title */}
      <h2 style={{ color: 'var(--gradient-end)', borderBottom: '2px solid var(--primary-color)', paddingBottom: '10px' }}>
        Frequently Asked Questions
      </h2>
      
      <input
        type="text"
        placeholder="Search questions..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <div className="item-list">
        {faqs.length > 0 ? (
          faqs.map(faq => (
            <div key={faq.id} className="item-card">
              {/* Display Question and Answer */}
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))
        ) : (
          <p>No FAQs found.</p>
        )}
      </div>
    </div>
  );
};

export default FAQ;