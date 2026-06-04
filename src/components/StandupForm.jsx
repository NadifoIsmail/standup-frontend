import React, { useState } from 'react';
import { createStandup } from '../services/standupService';

const StandupForm = ({ onPostSuccess }) => {
  const [form, setForm] = useState({
    author: '',
    yesterday: '',
    today: '',
    blockers: '',
    has_blocker: false,
    file: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setForm({ ...form, file });
      
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!form.author.trim()) {
      setError('Please enter your name.');
      setSubmitting(false);
      return;
    }
    if (!form.yesterday.trim() || !form.today.trim()) {
      setError('Please fill in both yesterday and today fields.');
      setSubmitting(false);
      return;
    }
    
    // Check 1: Blocker checkbox checked but no description
    if (form.has_blocker && !form.blockers.trim()) {
      setError('You checked "Has blocker" but did not describe the blocker. Please add blocker details.');
      setSubmitting(false);
      return;
    }
    
    // Check 2: Blocker description written but checkbox not checked
    if (form.blockers.trim() && !form.has_blocker) {
      setError('You described a blocker but did not check "Has blocker". Please check the box or remove the blocker description.');
      setSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('author', form.author);
    data.append('yesterday', form.yesterday);
    data.append('today', form.today);
    data.append('blockers', form.blockers);
    data.append('has_blocker', form.has_blocker);
    if (form.file) data.append('file', form.file);

    try {
      await createStandup(data);
      setForm({
        author: '',
        yesterday: '',
        today: '',
        blockers: '',
        has_blocker: false,
        file: null,
      });
      setImagePreview(null);
      if (onPostSuccess) onPostSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post standup.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Your Name</label>
            <input
              type="text"
              className="form-control"
              name="author"
              value={form.author}
              onChange={handleChange}
              placeholder=""
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">What did you do yesterday?</label>
            <textarea
              className="form-control"
              rows="3"
              name="yesterday"
              value={form.yesterday}
              onChange={handleChange}
              placeholder="List your key contributions and completed tasks"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">What are you doing today?</label>
            <textarea
              className="form-control"
              rows="3"
              name="today"
              value={form.today}
              onChange={handleChange}
              placeholder="Outline your focus for the next few hours"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Are there any blockers?</label>
            <textarea
              className="form-control"
              rows="2"
              name="blockers"
              value={form.blockers}
              onChange={handleChange}
              placeholder="Identify issues early to get help"
            />
          </div>

          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              name="has_blocker"
              checked={form.has_blocker}
              onChange={handleChange}
              id="hasBlockerCheck"
            />
            <label className="form-check-label" htmlFor="hasBlockerCheck">
              Has blocker
            </label>
          </div>

          {/* File Upload with Preview */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Attach image/screenshot</label>
            <input
              type="file"
              className="form-control"
              onChange={handleChange}
              accept="image/*"
            />
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }}
                />
              </div>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button type="submit" className="btn btn-primary w-100 py-2" disabled={submitting}>
            {submitting ? 'Posting...' : 'Submit Standup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StandupForm;