import {useEffect, useState} from "react";
import ModelList from "./ModelList.jsx";

export default function Models({models, apiCallHelper, progress, setProgress, status, setStatus, isModelPulling,
                                   setIsModelPulling, currentPullingModel, setCurrentPullingModel,
                                   setModels, handleNotification, setAreYouSureFunction, setAreYouSureMessage,
                                   setIsAreYouSure, activateAreYouSure, api_url}) {


    const [addModel, setAddModel] = useState("");
    const [addModelDescription, setAddModelDescription] = useState("");
    const [editModels, setEditModels] = useState(false);


    useEffect(() => {
        console.log(JSON.stringify("STATUS: " + status));
        console.log("PROGRESS: " + JSON.stringify(progress));
    }, [status, progress])

    function modelExists(model) {
        if (models.some(m => m.name === model)) {
            if (isModelPulling) {
                return true;
            }
            handleNotification("error", "Model already exists");
            return true
        }
        return false
    }

    function getActivePulling(model) {
        setIsModelPulling(true);
        // set, don't toggle
        const es = new EventSource(`${api_url}/ollama/pull/progress/${encodeURIComponent(model)}`);
        es.onmessage = (ev) => {
            const s = JSON.parse(ev.data);
            if (s.error) { es.close(); setIsModelPulling(false); return; }
            if (s.total && s.completed) setProgress({ completed: s.completed, total: s.total });
            setStatus(s.status);

            if (s.state === "done") {
                es.close();
                setIsModelPulling(false);
            }
        };
        es.onerror = () => { es.close(); setIsModelPulling(false); };
        return () => {
            setCurrentPullingModel(null)
            setModels(models.map((m) => {
                es?.close()
                if (m.name !== model) {
                    return m;
                }
                return {...m, status: "installed"};
            }))
        }
    }

    async function pullModel(e) {
        if (e) e.preventDefault();
        const model = {name: addModel, description: addModelDescription}
        if (modelExists(model?.name)) return;
        if (!model) return;
        await apiCallHelper("ollama/pull", "POST", null, { name: model.name, description: model.description });
        getActivePulling(model?.name)
    }

    useEffect(() => {
        if (!currentPullingModel) return
        async function getPulling() {
            if (modelExists(currentPullingModel.name)) return;
            setModels((prevModels) => [{
                name: currentPullingModel.name, description: currentPullingModel.description, status: "pulling",
            }, ...prevModels]);
            getActivePulling(currentPullingModel.name);   // this opens the EventSource — that's all you need
        }
        if (!isModelPulling) {
            if (modelExists(currentPullingModel.name)) return;
        }
        getPulling()
    }, [models.length]);

    return (
        <div className="page-container">
            <div className="page-header">
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
            <ModelList models={models} apiCallHelper={apiCallHelper} setModels={setModels}
                       handleNotification={handleNotification} setAreYouSureMessage={setAreYouSureMessage}
                       setAreYouSureFunction={setAreYouSureFunction} setIsAreYouSure={setIsAreYouSure}
                       editModels={editModels} activateAreYouSure={activateAreYouSure}/>
            <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-end",
                        alignItems: "center", gap: "20px", marginTop: "10px"}}>
                <button className={editModels ? "general-button danger-button"  : "general-button success-button"}  onClick={() => {
                    setEditModels(prevState => !prevState);
                }}>{editModels ? "Close" : "Edit"}</button>
            </div>

        </div>
    )
}