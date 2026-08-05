interface Props {
  name: string;
  onRestart: () => void;
}

export default function Results({ name, onRestart }: Props) {
  return (
    <section style={{textAlign: "center"}} className="panel">
      <h1>Thank You, {name}</h1>
      <div style={{ textAlign: "center" }}>
        <button className="btn-primary" onClick={onRestart}>
          Start a New Session
        </button>
      </div>
    </section>
  );
}
