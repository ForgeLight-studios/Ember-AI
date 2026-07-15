import {useEffect, useState} from "react";
import ModelList from "./ModelList.jsx";

export default function Models({models, status, progress, pullModel, isModelPulling}) {


    const [addModel, setAddModel] = useState("");
    const [addModelDescription, setAddModelDescription] = useState("");

    useEffect(() => {
        console.log(JSON.stringify("STATUS: " + status));
        console.log("PROGRESS: " + JSON.stringify(progress));
    }, [status, progress])

    return (
        <div className="models-container">
            <div className="models-header">
                <h1>Models</h1>
                <p>The models available to use are currently only ollama free models</p>
            </div>
            <form onSubmit={(e) => pullModel(e, setAddModelDescription, setAddModel, addModel, addModelDescription)}>
                <h2>Add models</h2>
                    <div className="form-text__input-field">
                        <label>Model name</label>
                        <input type={"text"} value={addModel} onChange={(e) => {
                            setAddModel(e.target.value);
                        }}></input>
                    </div>
                    <p className={"form-field__note"}>Please use ollama.com to find models</p>

                    <div className="form-text__input-field">
                        <label>Model description</label>
                        <textarea className={"form-textarea"} value={addModelDescription} onChange={(e) => {
                            setAddModelDescription(e.target.value);
                        }}/>
                    </div>
                    <p className={"form-field__note"}>This is a simple description to allow you to know what the model is used for</p>
                <div className={"form-action-buttons"}>
                    <button className={"general-button success-button"} onClick={() => {

                    }}>Add</button>
                </div>
            </form>
            <div className={isModelPulling ? "model-status-on" : "model-status-off"}>
                <p className={"model-status_header"}>Pulling status</p>
                <p className={"model-status_text"}>{status}</p>
                <div className={"progress-bar_wrapper"}>
                    <div className={"progress-bar"}     style={isModelPulling ? { width: `${((progress.completed / 10000000) / (progress.total / 10000000)) * 100}%` } : {}}></div>
                </div>
            </div>
            <ModelList models={models}/>
        </div>
    )
}