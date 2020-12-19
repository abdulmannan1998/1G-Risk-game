import React from "react";
import invert from "invert-color";

class Country {
    constructor(id, d, textCoordinates, color) {
        this.id = id;
        this.d = d;
        this.textCoordinates = textCoordinates;
        this.numberOfTroops = 0;
        this.occupyingPlayerId = "";
        this.color = color;
        this.defaultColor = color;
    }

    getId() {
        return this.id;
    }

    getNumberOfTroops() {
        return this.numberOfTroops;
    }
    setNumberOfTroops(numberOfTroops) {
        this.numberOfTroops = numberOfTroops;
    }

    getOccupyingPlayerId() {
        return this.occupyingPlayerId;
    }
    setOccupyingPlayer(player) {
        this.occupyingPlayerId = player.id;
        this.setColor(player.color);
    }

    getColor() {
        return this.color;
    }
    setColor(color) {
        this.color = color;
    }

    verifyTroops() {
        if (this.numberOfTroops < 0) {
            this.numberOfTroops = 0;
        }
    }

    setDefaultColor() {
        this.setColor(this.defaultColor);
    }

    getView() {
        const text = React.createElement("text", {
            x: this.textCoordinates[0],
            y: this.textCoordinates[1],
            fontFamily: "Verdana",
            fontSize: "15",
            fill: "white",
            style: { pointerEvents: "none", fill: invert(this.color, true), userSelect: "none" },
            children: this.numberOfTroops,
        });
        const path = React.createElement("path", {
            id: this.id,
            d: this.d,
            stroke: invert(this.color, true),
            strokeMiterlimit: "4.32165",
            style: { cursor: "pointer", fill: this.color },
        });
        const g = React.createElement("g", null, path, text);

        return g;
    }
}

export default Country;
