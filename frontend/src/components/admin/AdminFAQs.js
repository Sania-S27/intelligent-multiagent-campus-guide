import React, { useState, useEffect } from 'react';
import { createFAQ, getUnansweredQuestions } from '../../api';

const AdminFAQs = ({ showMessage }) => {
  // State for the FAQ form
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  
  // State for AI-logged questions
  const [unanswered, setUnanswered] = useState([]);

  useEffect(() => {
    loadUnansweredQuestions();
  }, []);

  const loadUnansweredQuestions = async () => {
    try {
      const res = await getUnansweredQuestions();
      setUnanswered(res.data);
    } catch (err) {
      console.error("Failed to load unanswered questions", err);
    }
  };

  // Handle FAQ form submission
  const handleFAQSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFAQ({ 
        question: faqQuestion, 
        answer: faqAnswer 
      });
      showMessage('FAQ created successfully!');
      setFaqQuestion('');
      setFaqAnswer('');
      loadUnansweredQuestions(); // Refresh the list
    } catch (err) {
      showMessage('Failed to create FAQ.', true);
    }
  };

  const handleAddToFAQ = (questionText) => {
    setFaqQuestion(questionText);
  };

  return (
    <div>
      {/* "TOP UNANSWERED QUESTIONS" PANEL */}
      <div className="admin-form" style={{background: '#e6f7ff', borderColor: '#b3e0ff'}}>
        <h3>Top Unanswered Questions (from supportChat)</h3>
        <p>These are the most common questions your assistant couldn't answer. Click "Add to FAQ" to pre-fill the form below.</p>
        
        {unanswered.length === 0 && <p>No unanswered questions found.</p>}
        
        {unanswered.map(q => (
          <div key={q.id} className="item-card" style={{border: '1px solid #d6e9ff'}}>
            <p><strong>{q.question_text}</strong></p>
            <p style={{color: '#555', fontSize: '0.9rem'}}>
              Asked: <strong>{q.ask_count}</strong> time(s)
            </p>
            <button 
              type="button"
              className="nav-button" 
              style={{background: '#007bff', width: 'auto'}}
              onClick={() => handleAddToFAQ(q.question_text)}
            >
              Add to FAQ
            </button>
          </div>
        ))}
      </div>

      {/* "Create FAQ" Form */}
      <form onSubmit={handleFAQSubmit} className="admin-form" style={{marginTop: '2rem'}}>
        <h3>Create New FAQ</h3>
        <label>Question</label>
        <input 
          type="text" 
          placeholder="e.g., What are the library timings?" 
          value={faqQuestion} // This is now pre-filled
          onChange={(e) => setFaqQuestion(e.target.value)} 
          required 
        />
        <label>Answer</label>
        <textarea 
          placeholder="The library is open from 8am to 8pm..." 
          value={faqAnswer} 
          onChange={(e) => setFaqAnswer(e.target.value)} 
          rows={4} 
          required
        />
        <button type="submit" className="nav-button" style={{ background: '#28a745' }}>Add FAQ</button>
      </form>
    </div>
  );
};

export default AdminFAQs;