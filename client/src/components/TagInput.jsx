import { useState } from 'react';

// Small chip-style input for array fields (symptoms, medications) that
// also works fine if the values arrive already-populated from the LLM.
export default function TagInput({ label, values, onChange, placeholder }) {
  const [draft, setDraft] = useState('');

  function addTag() {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  }

  function removeTag(index) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <label className="field">
      {label}
      <div className="tag-input">
        {values.map((v, i) => (
          <span className="tag" key={`${v}-${i}`}>
            {v}
            <button type="button" onClick={() => removeTag(i)} aria-label={`Remove ${v}`}>
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={placeholder}
        />
      </div>
    </label>
  );
}
