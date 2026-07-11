import {useState} from "react";
import ModelList from "./ModelList.jsx";

export default function Models() {

    const [addModel, setAddModel] = useState("");
    const [addModelDescription, setAddModelDescription] = useState("");

    async function AddModel(e) {
        e.preventDefault();
        if (!addModel || !addModelDescription) {
            console.log("Mak sure all fields are entered!!!")
            return;
        }
        console.log("Added model " + JSON.stringify({
            name: addModel,
            description: addModelDescription,
        }, null, 2));
    }

    return (
        <div className="models-container">
            <div className="models-header">
                <h1>Models</h1>
                <p>The models available to use are currently only ollama free models</p>
            </div>
            <form onSubmit={(e) => AddModel(e)}>
                <h2>Add models</h2>
                    <div className="form-text__input-field">
                        <label>Model name</label>
                        <input type={"text"} placeholder={addModel} onChange={(e) => {
                            setAddModel(e.target.value);
                        }}></input>
                    </div>
                    <p className={"form-field__note"}>Please use ollama.com to find models</p>

                    <div className="form-text__input-field">
                        <label>Model description</label>
                        <textarea className={"form-textarea"} placeholder={addModelDescription} onChange={(e) => {
                            setAddModelDescription(e.target.value);
                        }}/>
                    </div>
                    <p className={"form-field__note"}>This is a simple description to allow you to know what the model is used for</p>
                <div className={"form-action-buttons"}>
                    <button className={"general-button success-button"} onClick={() => {

                    }}>Add</button>
                </div>
            </form>
            <ModelList />

        </div>
    )
}