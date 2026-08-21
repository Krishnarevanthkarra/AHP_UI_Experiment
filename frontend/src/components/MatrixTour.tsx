import type { UIType } from "../types";
import type { Step } from "../App";
interface Props {
  goBack(step: Step): void;
  goForth(step: Step): void;
}

export default function MatrixTour({ goBack, goForth }: Props) {
  // const frnd: string[] = ['hello'];
  // function handleNext(){
  //     onStart("matrix", frnd);
  // }
  function handleBack() {
    goBack("setup");
  }
  function handleForth() {
    goForth("matrix");
  }
  return (
    <section className="panel tour-panel">
      <h1>How Matrix Comparison Works</h1>

      <p className="lede">
        Before starting, read this short demonstration explaining how pairwise
        comparison works in the AHP matrix.
      </p>

      <div className="video-wrapper">
        <img src="src/assets/Matrix.png" />
      </div>

      <div className="tour-info">
        <h3>How to Read the Matrix</h3>
        {/* <h4>Integer Values</h4>
        <p >For Integer values the weight is calculated from row criteria to column criteria.</p> */}
        <table className="tour-table">
          <thead>
            <tr>
              <th>Selected Cell (Row to Col)</th>
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
                <b>Social-Environment</b>
              </td>
              <td>
                <b>5</b>
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
                <b>Environment-Economic</b>
              </td>
              <td>
                <b>1/5</b>
              </td>
              <td>
                Economic is <b>Strongly preferred</b> than Environment.
              </td>
            </tr>
            <tr>
              <td>
                <b>Social-Economic</b>
              </td>
              <td>
                <b>1</b>
              </td>
              <td>
                Social is <b>Equally preferred</b> as Economic.
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
        <br></br>
        <h3><b>Priority Counts are as Follows</b></h3>

       <p className="fineprint">
          
            <p>1 : Equally preferred</p>
            <p>3 : Moderately preferred</p>
            <p>5 : Strongly preferred</p>
            <p>7 : Very strongly preferred</p>
            <p>9 : Extremely preferred</p>
          </p>
      </div>
      <div>
        <h3>Note:</h3>
        <p style={{lineHeight: 2}} className="fineprint">When the cell value is a fraction the priority works otherway (i.e) Column to Row. Read the table example above for more clarification.</p>
      </div>

      <div className="btn-row">
        <button className="btn-ghost" onClick={handleBack}>
          ⬅ Back
        </button>
        <button className="btn-primary" onClick={handleForth}>
          Start Comparison →
        </button>
      </div>
    </section>
  );
}
