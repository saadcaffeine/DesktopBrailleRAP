import { useState, useContext } from 'react';
import AppContext from "./AppContext";



let key = 0;

const InputText = (props) => {
  const [Message, setMessage] = useState(props.initialvalue);
  const handleClickButton = () => {
    if (props.callback)
      props.callback(Message);
  }

  return (
    <>

      <input type="text" defaultValue={props.initialvalue} onChange={(e) => setMessage(e.target.value)} key={props.key} />
      <p>&nbsp;</p>
      <button onClick={handleClickButton} className='pure-button'>
        {props.label}
      </button>
    </>
  );
}

const AddText = () => {
  const { GetImportText, GetPaperCanvas, Selected } = useContext(AppContext);

  const handleAddButton = (val) => {
    let f = GetImportText();
    if (f) {
      f(val);
    }
  }
  const handleEditButton = (val) => {
    if (Selected) {
      if (Selected.className === 'PointText') {
        Selected.content = val;
      }
    }
  }
  let f = GetPaperCanvas();
  key = key + 1;
  if (f) {
    let selected = Selected;

    if (selected && selected.className === "PointText") {
      return (
        <>
          <h1>Modification d'une ligne de texte</h1>
          <div>
            <InputText
              initialvalue={Selected.content}
              callback={handleEditButton}
              label={'Modifier'}
              key={key} />
          </div>
        </>
      );
    }
  }
  return (
    <>
      <h1>Ajout d'une ligne de texte</h1>

      <div>
        <InputText
          initialvalue={'Nouveau'}
          callback={handleAddButton}
          label={'Ajouter'}
          key={key} />
      </div>
    </>
  );
};

export default AddText;