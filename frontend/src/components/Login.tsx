import { FormEvent, useState } from 'react';
import { UserInfo } from '../types';

interface Props {
  onSubmit: (info: UserInfo) => void;
}

export default function Login({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [rollno, setRollno] = useState('');
  const [age, setAge] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const ageNum = parseInt(age, 10);

    if (!name.trim() || !rollno.trim() || !age.trim() || Number.isNaN(ageNum) || ageNum <= 0) {
      setError('Name, roll number, and a valid age are all required.');
      return;
    }
    if (!agreed) {
      setError('You must accept the terms & conditions to continue.');
      return;
    }
    setError('');
    onSubmit({ name: name.trim(), rollno: rollno.trim(), age: ageNum });
  }

  return (
    <section className="panel">
      <h1>Welcome</h1>
      <p className="lede">A few details before you start the comparison. All fields are required.</p>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <label className="form-field">
          Name
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" required />
        </label>

        <label className="form-field">
          Roll No.
          <input value={rollno} onChange={e => setRollno(e.target.value)} placeholder="e.g. 21CS045" required />
        </label>

        <label className="form-field">
          Age
          <input
            type="number"
            min={1}
            max={120}
            value={age}
            onChange={e => setAge(e.target.value)}
            placeholder="e.g. 21"
            required
          />
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} required />
          <span>I agree to the terms &amp; conditions and consent to my responses being recorded for this study.</span>
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary">Continue</button>
      </form>
    </section>
  );
}
