import { createContext, useContext, useState } from "react";

const ComplaintContext = createContext();

export const ComplaintProvider = ({ children }) => {

    const [complaints, setComplaints] = useState([]);

    return (
        <ComplaintContext.Provider
            value={{
                complaints,
                setComplaints
            }}
        >
            {children}
        </ComplaintContext.Provider>
    );
};

export const useComplaints = () => {
    return useContext(ComplaintContext);
};