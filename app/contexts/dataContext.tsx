import { Team } from "@/lib/ums/type";
import { createContext, useContext, useEffect, useState } from "react";
import { TMS_API_PATH } from "../config/setting";
import {toast as hotToast} from "react-hot-toast";

export interface DataContextType {
    //This is for TMS.
    teams: Team[];
    getTeams: () => Promise<Team[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const getTeams = async () => {
    const response = await fetch("/api/ums/systems/get/tms", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    
    const data: Team[] = (await response.json()).data;

    //Error handling for the response value

    return data;
}

export const DataProvider = ({children} : {children: React.ReactNode}) => {
    const [teams, setTeams] = useState<Team[]>([]);
    
    useEffect(() => {
        const fetchTeams = async () => {
            const teamList  = await getTeams();
            setTeams(teamList);
        }

        fetchTeams()
    }, [])

    return (
        <DataContext.Provider value={{teams, getTeams}}>
            {children}
        </DataContext.Provider>
    )
}

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
      throw new Error("useData must be used within a DataProvider");
    }
    return context;
  };