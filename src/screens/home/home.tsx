import React from "react";
import { handleError, sendRequest } from "../../hub/request";
import { IntermittentButton } from "../../ui/button";

export default function HomePage() {
    return (
        <main id="home">
            <h1>Home</h1>
            <IntermittentButton 
                onClick={()=> 
                    sendRequest({
                        "type": "empty"
                    })
                }
                onCatch={handleError}
                primary
            >
                Send an empty req
            </IntermittentButton>
        </main>
    )
}