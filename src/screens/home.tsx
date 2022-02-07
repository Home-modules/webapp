import React from "react";
import { handleError, sendRequest } from "../comms/request";
import { IntermittentableButton } from "../ui/button";

export default function HomePage() {
    return (
        <main id="home">
            <h1>Home</h1>
            <IntermittentableButton 
                onClick={()=> 
                    sendRequest({
                        "type": "empty"
                    })
                }
                onCatch={handleError}
                primary
            >
                Send an empty req
            </IntermittentableButton>
        </main>
    )
}