import {useEffect, useState} from "react";

export default function ModelList({models, apiCallHelper, setModels, handleNotification,
                                  setAreYouSureFunction, setAreYouSureMessage, setIsAreYouSure,
                                  editModels, activateAreYouSure}) {

    const [newDescription, setNewDescription] = useState({
        attributeValue: "",
        name: "",
        attribute: "description",
    });

    const modelList = models.map((model) => {
        return (
            <div className="model-list__wrapper">
                <div className={"model-list__item"}>
                    <div className={"model-list__item-header"}>
                        <p className={"model-list__name"}>{model.name}</p>
                        <p className={"model-list__status"} style={{
                            color: model.status === "failed" ? "var(--danger)" : model.status === "pulling" ? "orange" : "var(--success)"
                        }}>{model.status}</p>
                    </div>
                    {editModels ?
                        <input type={"text"} className={"model-list__description"} value={
                            newDescription?.name === model.name
                                ? newDescription.attributeValue
                                : (model.description)
                        } placeholder={"Description"} onFocus={() => {
                            setNewDescription((prev) => {
                                return {...prev, attributeValue: model.description, name: model.name}
                            });
                        }} onChange={(e) => {
                            const attributeValue = e.target.value;
                            setNewDescription((prev) => {
                                return {...prev, attributeValue: attributeValue}
                            });
                        }}></input>
                        :
                        <p className={"model-list__description"}>{model.description ? model.description : "No Description"}</p>
                    }
                </div>
                {editModels && <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "10px",
                    marginLeft: "10px", padding: "35px 0 0 0"}}>
                    <button style={{padding: "10px 15px", fontSize: "16px"}} className={"general-button danger-button"}
                            onClick={() => {
                                activateAreYouSure(`delete ${model.name}`, () => async () => {
                                    const resData = await apiCallHelper("model/delete", "DELETE", null, model)
                                    if (!resData.success) {
                                        handleNotification("error", "Failed to delete model")
                                        return
                                    }
                                    setModels((prev) => {
                                        return prev.filter((m) => m.name !== model.name)
                                    })
                                })
                            }}>x
                    </button>
                    <button className={"general-button success-button"} style={{fontSize: "16px", padding: "10px"}} onClick={() => {
                        try {
                            activateAreYouSure("change the description", () => async () => {
                                const resData = await apiCallHelper("model/patch", "PATCH", null, newDescription)
                                if (!resData.success) {
                                    handleNotification("error", "Failed to update model")
                                }
                            })
                        } catch (e) {
                            handleNotification("error", `Failed to update model, Error: ${e}`)
                            return
                        }
                        setNewDescription((prev) => {
                            return {...prev, attributeValue: "", name: ""}
                        })
                        setModels((prev) => {
                            return prev.map((m) => m.name === model.name ? {...m, description: newDescription.attributeValue} : m)
                        })
                    }}>Save</button>
                </div>}
            </div>
        )
    })
    return (
        <>
            <h2>Your Models</h2>
            <div className="model-list__container">
                    {modelList}
            </div>
        </>

    )
}