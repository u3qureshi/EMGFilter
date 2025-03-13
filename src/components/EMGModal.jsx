import { useState } from "react";
import { ModalTab, ModalTabs } from "./ModalTabs";
import "./emg-modal.css";
import CurrentGroups from "./CurrentGroups";
import NewGroup from "./NewGroup";

const EMGModal = () => {
    const [modalStatus, setModalStatus] = useState(false);
    
    return (
        <div className="form-reveal relative w-full group max-w-5xl mx-auto">
            <div className="hover-item flex justify-center items-center border border-m-blue-300 rounded-sm py-1.5 h-auto cursor-pointer" onClick={() => setModalStatus(!modalStatus)}>
                <span className="icon-double-arrow-down text-m-blue-400 text-sm leading-none block"></span>
            </div>
            <div className={`modal-container shadow-lg hidden group-hover:grid absolute z-10 w-full ${modalStatus && "active"}`}>
                <div className="expand-modal w-full bg-white">
                    <div className="w-full py-6 px-4 shadow-2xl">
                        <ModalTabs>
                            <ModalTab title="Set EMG Groups">
                                <div className="tab-content pt-6">
                                    <CurrentGroups />
                                </div>
                            </ModalTab>
                            <ModalTab title="Create New Group">
                                <div className="tab-content pt-6">
                                    <NewGroup />
                                </div>
                            </ModalTab>
                        </ModalTabs>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EMGModal;