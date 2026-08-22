// import type { UIType } from "../types";
import type { Step } from "../App";
interface Props {
  goForth: (step: Step) => void;
  goBack: (step: Step) => void;
  //   setStep: React.Dispatch<React.SetStateAction<"setup" | "results">>
}

export default function RadioTour({ goBack, goForth }: Props) {
  // const frnd: string[] = ['hello'];
  // function handleNext(){
  //     onStart("matrix", frnd);
  // }
  function handleback() {
    goBack("matrix");
  }
  function handleforth() {
    goForth("radio");
  }
  return (
    <section className="panel tour-panel">
      <h1>How Radio Comparison Works</h1>

      <p className="lede">
        Before starting, watch this short demonstration explaining how pairwise
        comparison works in the AHP matrix.
      </p>

      <div className="video-wrapper">
        <img src="/Radio.png" />
      </div>

      <div className="tour-info">
        <h3>How to Read the Radio</h3>
        {/* <h4>Integer Values</h4>
        <p >For Integer values the weight is calculated from row criteria to column criteria.</p> */}
        <table className="tour-table">
          <thead>
            <tr>
              <th>Selected Cell (Row to Col)</th>
              <th>Selected Values</th>
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
                <b>Social-Environment</b>
              </td>
              <td>
                <b>Social, 5</b>
              </td>
              <td>
                Social is <b>Strongly preferred</b> than Environment.
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
                <b>Social-Economical</b>
              </td>
              <td>
                <b>Social, 1</b>
              </td>
              <td>
                Social is <b>Equally preferred</b> as Economical.
              </td>
            </tr>
            <tr>
              <td>
                <b>Environment-Economical</b>
              </td>
              <td>
                <b>Economical, 5</b>
              </td>
              <td>
                Economical is <b>Strongly preferred</b> than Environment.
              </td>
            </tr>
            

            {/* <tr>
              <td>
                <b>1/2</b>
              </td>
              <td>
                Column criterion is <b>2× more important</b>.
              </td>
            </tr> */}

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
        
      </div>
      <div>
        <h3>Note:</h3>
        <p style={{ lineHeight: 2 }} className="fineprint">
          When the cell value is a fraction the priority works otherway (i.e)
          Column to Row. Read the table example above for more clarification.
        </p>
      </div>

      <div className="btn-row">
        <button className="btn-ghost" onClick={handleback}>
          ⬅ Back
        </button>
        <button className="btn-primary" onClick={handleforth}>
          Start Comparison →
        </button>
      </div>
    </section>
  );
}
