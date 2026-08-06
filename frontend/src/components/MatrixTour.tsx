import type { UIType } from "../types";

interface Props {
  onStart: (type: UIType) => void;
  goBack: () => void;
  //   setStep: React.Dispatch<React.SetStateAction<"setup" | "results">>
}

export default function MatrixTour({ goBack, onStart }: Props) {
  // const frnd: string[] = ['hello'];
  // function handleNext(){
  //     onStart("matrix", frnd);
  // }
  return (
    <section className="panel tour-panel">
      <h1>How Matrix Comparison Works</h1>

      <p className="lede">
        Before starting, watch this short demonstration explaining how pairwise
        comparison works in the AHP matrix.
      </p>

      <div className="video-wrapper">
        <img src="src/assets/Matrix.png" />
      </div>

      <div className="tour-info">
        <h3>How to Read the Matrix</h3>

        <table className="tour-table">
          <thead>
            <tr>
              <th>Selected Value</th>
              <th>Meaning</th>
            </tr>
          </thead>

          <tbody>
            {/* <tr>
              <td>
                <b>9</b>
              </td>
              <td>
                Row criterion is <b>9× more important</b> than the column
                criterion.
              </td>
            </tr> */}

            <tr>
              <td>
                <b>5</b>
              </td>
              <td>
                Row criterion is <b>5× more important</b>.
              </td>
            </tr>

            {/* <tr>
              <td>
                <b>2</b>
              </td>
              <td>
                Row criterion is <b>2× more important</b>.
              </td>
            </tr> */}

            <tr>
              <td>
                <b>1</b>
              </td>
              <td>Both criteria are equally important.</td>
            </tr>

            {/* <tr>
              <td>
                <b>1/2</b>
              </td>
              <td>
                Column criterion is <b>2× more important</b>.
              </td>
            </tr> */}

            <tr>
              <td>
                <b>1/5</b>
              </td>
              <td>
                Column criterion is <b>5× more important</b>.
              </td>
            </tr>

            {/* <tr>
              <td>
                <b>1/9</b>
              </td>
              <td>
                Column criterion is <b>9× more important</b>.
              </td>
            </tr> */}
          </tbody>
        </table>

        <p className="fineprint">
          Example: If you choose <b>2</b> when comparing
          <b> Cost vs Sustainability</b>, it means
          <b> Cost is twice as important as Sustainability</b>.
          <br />
          If you choose <b>1/9</b>, it means
          <b> Sustainability is nine times more important than Cost</b>.
        </p>
      </div>

      <div className="btn-row">
        <button className="btn-ghost" onClick={() => goBack("setup")}>
          ⬅ Back
        </button>
        <button className="btn-primary" onClick={() => onStart("matrix")}>
          Start Comparison →
        </button>
      </div>
    </section>
  );
}
