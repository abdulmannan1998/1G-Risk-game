import React, { Component } from "react";
import { Button } from "reactstrap";
import styled from "styled-components";
import { connect } from "react-redux";

import fire from "../../firebase";
import Map from "./map/Map";
import { BREAKPOINTS, COUNTRIES } from "../../config/gameConstants";
import Player from "./Player";
import PlayerTurnDecider from "./PlayerTurnDecider";
import TroopsGiver from "./TroopsGiver";

class Board extends Component {
  timer = undefined;
  delay = 200;
  prevent = false;

  constructor(props) {
    super(props);

    this.state = {
      players: [],
      selectedCountryId: "",
      initialSetupPhase: true,
      turnsPhase: false,
      numOfAttackerTroops: 0,
      numOfDefenderTroops: 0,
      numOfTroopsToMove: 0,
      attackOrSkipTurnPhase: false,
      attackState: false,
      maneuverState: false,
      validity: false,
      countryToAttackOrManeuverTo: "",
    };
    this.allPlayers = [];
    this.initializePlayers();
    this.map = new Map(this.allPlayers);
    this.countryIds = Object.values(COUNTRIES).map((country) => country.value);
    this.playerTurnDecider = new PlayerTurnDecider(this.allPlayers);
    this.allPlayers[0].setIsPlayerTurn(true);
    this.troopsGiver = new TroopsGiver(
      this.map.getCountries(),
      this.map.getContinents()
    );

    this.getAsJson = this.getAsJson.bind(this);
    this.saveGame = this.saveGame.bind(this);
  }

  componentDidMount() {
    document.addEventListener("click", this.onClickListener);
    document.addEventListener("dblclick", this.onDoubleClickListener);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.onClickListener);
    document.removeEventListener("dblclick", this.onDoubleClickListener);
  }

  initializePlayers = () => {
    const { players } = this.props.history.location.state;
    for (let i = 0; i < players.length; i++) {
      this.allPlayers.push(
        new Player(
          players[i].name,
          players[i].id,
          players[i].reservePersonel,
          players[i].color,
          false,
          players[i].playerTurnNumber
        )
      );
    }
  };

  getAsJson() {
    var result = {};
    result.players = this.allPlayers;
    result.map = this.map.getAsJson();
    return result;
  }

  async saveGame(gameName) {
    if (!this.props.currentUser) return;
    const userRef = fire.firestore().doc(`users/${this.props.currentUser.uid}`);
    var gameData = {};
    var savedGameName = "game-" + gameName;
    gameData[savedGameName] = JSON.parse(JSON.stringify(this.getAsJson()));
    console.log(gameData);
    userRef.set(gameData, { merge: true }).catch((error) => {
      console.error("Error saving game", error);
    });
  }

  async loadGame(gameName) {
    if (!this.props.currentUser) return;
    const userRef = fire.firestore().doc(`users/${this.props.currentUser.uid}`);
    // var data = await userRef.get()
    var savedGameName = "game-" + gameName;
  }

  render() {
    const {
      attackState,
      maneuverState,
      selectedCountryId,
      countryToAttackOrManeuverTo,
      numOfAttackerTroops,
      numOfDefenderTroops,
      initialSetupPhase,
    } = this.state;
    return (
      <BoardContainer>
        <Table>
          <thead>
            <tr>
              <th>Continent</th>
              <th> +Troops</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Africa</td>
              <td>5</td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <td>Asia</td>
              <td>7</td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <td>Australia</td>
              <td>2</td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <td>Europe</td>
              <td>5</td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <td>North America</td>
              <td>5</td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <td>South America</td>
              <td>2</td>
            </tr>
          </tbody>
        </Table>
        <MapContainer>
          <InnerContainer>
            {this.allPlayers.map((player) => player.getView())}
          </InnerContainer>
          {this.map.getView()}
          {selectedCountryId ? (
            <span>{COUNTRIES[selectedCountryId].name} </span>
          ) : null}
          <AttackerTroopsInput
            value={this.state.numOfAttackerTroops}
            onChange={(e) => this.validateInput(e, "numOfAttackerTroops")}
            style={{ zIndex: attackState ? "1000" : "-1" }}
          />
          <DefenderTroopsInput
            value={this.state.numOfDefenderTroops}
            onChange={(e) => this.validateInput(e, "numOfDefenderTroops")}
            style={{ zIndex: attackState ? "1000" : "-1" }}
          />
          {!initialSetupPhase ? (
            <ActionButton
              onClick={() => {
                this.map.attackTerritory(
                  selectedCountryId,
                  countryToAttackOrManeuverTo,
                  numOfAttackerTroops,
                  numOfDefenderTroops
                );
              }}
            >
              Attack
            </ActionButton>
          ) : null}
          {maneuverState ? (
            <>
              <AttackerTroopsInput
                value={this.state.numOfAttackerTroops}
                onChange={(e) => this.validateInput(e, "numOfAttackerTroops")}
              />
              <ActionButton
                onClick={() => {
                  this.map.attackTerritory(
                    selectedCountryId,
                    countryToAttackOrManeuverTo,
                    numOfAttackerTroops,
                    numOfDefenderTroops
                  );
                }}
              >
                {attackState ? "Attack" : "Maneuver"}{" "}
              </ActionButton>
            </>
          ) : null}
          {!initialSetupPhase ? (
            <EndButton onClick={() => this.endTurnForPlayer(true)}>
              End Turn
            </EndButton>
          ) : null}
        </MapContainer>
      </BoardContainer>
    );
  }

  deployTurnTroops = () => {
    const { selectedCountryId } = this.state;
    if (
      this.map.deployTroop(
        selectedCountryId,
        this.playerTurnDecider.getPlayerWithTurn(),
        1
      )
    ) {
      this.forceUpdate();
    }
    if (
      this.playerTurnDecider.getCurrentPlayerInfo().getRemainingTroops() === 0
    ) {
      // this.map.resetCountryState();
      this.forceUpdate();
      this.setState({
        turnsPhase: false,
        attackOrSkipTurnPhase: true,
        countryToAttackOrManeuverTo: "",
      });
    }
  };

  deployInitialTroops = () => {
    const { selectedCountryId } = this.state;
    if (
      this.map.deployTroop(
        selectedCountryId,
        this.playerTurnDecider.getPlayerWithTurn(),
        1
      )
    ) {
      this.playerTurnDecider.endTurnForPlayer(false);
      if (!this.map.doPlayersHaveTroops()) {
        const currentPlayer = this.playerTurnDecider.getPlayerWithTurn();
        this.troopsGiver.giveTroopsToPlayer(currentPlayer);
        this.setState({ initialSetupPhase: false, turnsPhase: true });
      }
      this.forceUpdate();
    }
  };

  endTurnForPlayer = (shouldValidatePlayerTroops) => {
    this.playerTurnDecider.endTurnForPlayer(shouldValidatePlayerTroops);
    this.troopsGiver.giveTroopsToPlayer(
      this.playerTurnDecider.getPlayerWithTurn()
    );
    this.setState({
      attackOrSkipTurnPhase: false,
      turnsPhase: true,
      attackState: false,
      maneuverState: false,
    });
    this.forceUpdate();
  };

  initializePlayers = () => {
    const { players } = this.props.history.location.state;
    for (let i = 0; i < players.length; i++) {
      let player = new Player(
        players[i].name,
        players[i].id,
        players[i].reservePersonel,
        players[i].color,
        false,
        players[i].playerTurnNumber
      );
      player.setDiceRoll(players.length);
      this.allPlayers.push(player);
    }
    this.allPlayers = this.allPlayers.sort(
      (a, b) => b.getDiceRoll() - a.getDiceRoll()
    );
  };

  onClickListener = (e) => {
    this.timer = setTimeout(() => {
      if (!this.prevent) {
        this.doClickAction(e);
      }
      this.prevent = false;
    }, this.delay);
  };

  onDoubleClickListener = (e) => {
    clearTimeout(this.timer);
    this.prevent = true;
    this.doDoubleClickAction(e);
  };

  doClickAction = (e) => {
    const id = e.target.id;
    const isCountryValid = this.countryIds.includes(id);
    if (isCountryValid) {
      this.setState({ selectedCountryId: id });
      this.map.setSelectedCountry(id);
      this.forceUpdate();
    } else {
      this.setState({ selectedCountryId: "" });
      this.map.resetCountryState();
      this.forceUpdate();
    }
  };

  doDoubleClickAction = (e) => {
    const {
      selectedCountryId,
      initialSetupPhase,
      turnsPhase,
      attackOrSkipTurnPhase,
    } = this.state;
    const id = e.target.id;
    const isCountryValid = this.countryIds.includes(id);

    // Allow initial deployment with double click
    if (initialSetupPhase && isCountryValid) {
      this.setState({ selectedCountryId: id });
      this.map.setSelectedCountry(id);
      this.deployInitialTroops();
      this.forceUpdate();
      return;
    }

    // Allow turn troops deployment
    if (turnsPhase && isCountryValid) {
      this.setState({ selectedCountryId: id }, () => {
        this.map.setSelectedCountry(id);
        this.deployTurnTroops();
      });
      this.forceUpdate();
      return;
    }

    // Allow selecting another country, attacing and manevering
    if (attackOrSkipTurnPhase && isCountryValid) {
      this.setState({ countryToAttackOrManeuverTo: id }, () => {
        const result = this.map.validateInitialMove(
          this.state.selectedCountryId,
          this.state.countryToAttackOrManeuverTo,
          this.playerTurnDecider.getCurrentPlayerInfo()
        );
        this.setState({
          attackState: result === "ATTACK",
          maneuverState: result === "MANEUVER",
          validity: result ? true : false,
        });
      });
      this.forceUpdate();
    }
  };

  validateInput = (e, inputType) => {
    const {
      selectedCountryId,
      countryToAttackOrManeuverTo,
      numOfAttackerTroops,
      numOfDefenderTroops,
    } = this.state;
    const val = e.target.value;
    if (isNaN(val)) {
      console.log("invalid input");
      return;
    }
    this.setState({
      [inputType]: val,
    });
    this.forceUpdate();
  };
}

const CardContainer = styled.div`
  position: absolute;
  display: block;
  left: 0px;
  top: 250px;
  width: fit-content;
  height: fit-content;
`;

const StyledCardsIcon = styled.i`
  display: block;
  background-image: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMyIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNjQgNjQiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNjQgNjQiIHdpZHRoPSI1MTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PHBhdGggZD0ibTQ0IDYyaC00MGMtMS4xMDUgMC0yLS44OTUtMi0ydi01NmMwLTEuMTA1Ljg5NS0yIDItMmg0MGMxLjEwNSAwIDIgLjg5NSAyIDJ2NTZjMCAxLjEwNS0uODk1IDItMiAyeiIgZmlsbD0iIzRkNWQ3YSIvPjxwYXRoIGQ9Im00MCA1OGgtMzJjLTEuMTA1IDAtMi0uODk1LTItMnYtNDhjMC0xLjEwNS44OTUtMiAyLTJoMzJjMS4xMDUgMCAyIC44OTUgMiAydjQ4YzAgMS4xMDUtLjg5NSAyLTIgMnoiIGZpbGw9IiNlN2U0ZGQiLz48cGF0aCBkPSJtMTAgMTBoMjh2NDRoLTI4eiIgZmlsbD0iI2M2NmI2MCIvPjxnIGZpbGw9IiNlNDdjNmUiPjxwYXRoIGQ9Im0xMCAxOS41ODN2Mi44M2wxMi40MTMtMTIuNDEzaC0yLjgzeiIvPjxwYXRoIGQ9Im0xMCAzMC40MTMgMTEuNzA3LTExLjcwNi0xLjQxNS0xLjQxNS0xMC4yOTIgMTAuMjkyeiIvPjxwYXRoIGQ9Im0xMCAzNS41ODN2Mi44M2wyOC0yNy45OTl2LS40MTRoLTIuNDE2eiIvPjxwYXRoIGQ9Im0zOCAxNS41ODQtMjIuNzA5IDIyLjcwNyAxLjQxNSAxLjQxNSAyMS4yOTQtMjEuMjkzeiIvPjxwYXRoIGQ9Im0zOCAyMy41ODQtMjggMjcuOTk5djIuNDE3aC40MTNsMjcuNTg3LTI3LjU4NnoiLz48cGF0aCBkPSJtMTguNDEyIDU0IDE5LjU4OC0xOS41ODd2LTIuODI5bC0yMi40MTggMjIuNDE2eiIvPjxwYXRoIGQ9Im0yMy41ODMgNTRoMi44M2w5LjI5My05LjI5NC0xLjQxNS0xLjQxNXoiLz48cGF0aCBkPSJtMjguNTg0IDEwLTUuMjkzIDUuMjkyIDEuNDE1IDEuNDE1IDYuNzA3LTYuNzA3eiIvPjxwYXRoIGQ9Im0xMCA0Ni40MTMgNC43MDYtNC43MDctMS40MTUtMS40MTUtMy4yOTEgMy4yOTJ6Ii8+PC9nPjxwYXRoIGQ9Im00NiA1NGgxNGMxLjEwNSAwIDItLjg5NSAyLTJ2LTQwYzAtMS4xMDUtLjg5NS0yLTItMmgtMTQiIGZpbGw9IiMyNDMyNDIiLz48cGF0aCBkPSJtNDYgNTBoMTBjMS4xMDUgMCAyLS44OTUgMi0ydi0zMmMwLTEuMTA1LS44OTUtMi0yLTJoLTEwIiBmaWxsPSIjZTdlNGRkIi8+PHBhdGggZD0ibTQ2IDQ2aDh2LTI4aC04IiBmaWxsPSIjYzY2YjYwIi8+PHBhdGggZD0ibTQ2IDQ0LjQxMyA4LTh2LTIuODNsLTggOHoiIGZpbGw9IiNlNDdjNmUiLz48cGF0aCBkPSJtNDYgMjguNDE0IDgtOHYtMi40MTRoLS40MTZsLTcuNTg0IDcuNTg0eiIgZmlsbD0iI2U0N2M2ZSIvPjxwYXRoIGQ9Im00NiAzNS40MTMgOC03Ljk5OXYtMi44M2wtOCA3Ljk5OXoiIGZpbGw9IiNlNDdjNmUiLz48L2c+PC9zdmc+);
  width: 30px;
  height: 30px;
  background-size: 30px 30px;
`;

const ActionButton = styled.button`
  position: absolute;
  right: 10px;
  top: 238px;
  background-color: white;
  color: #1d65a8;
  font-size: 90%;
  border: none;
  border-radius: 5px;
  width: 88px;
  height: 35px;
  outline: none;
  :hover {
    background-color: #1d65a8;
    color: white;
  }
  :focus {
    outline: 0;
  }
`;

const EndButton = styled.button`
  position: absolute;
  right: 10px;
  top: 279px;
  background-color: white;
  color: #f44336;
  font-size: 90%;
  border: none;
  border-radius: 5px;
  width: 88px;
  height: 35px;
  outline: none;
  :hover {
    background-color: #f44336;
    color: white;
  }
  :focus {
    outline: 0;
  }
`;
const AttackerTroopsInput = styled.input`
  position: absolute;
  right: 0px;
  top: 165px;
`;
const DefenderTroopsInput = styled.input`
  position: absolute;
  right: 0px;
  top: 200px;
`;
const MapContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  span {
    padding-top: 5px;
    font-size: xxx-large;
  }
`;

const BoardContainer = styled.div`
  padding-top: 125px;
  display: flex;
  flex-direction: row;
  background-color: #88b6da;
  height: 120vh;
`;
// width: 80%;
//     height: 100%;
//     margin-left: 2%;
//     margin-right: 2%;
//     padding: 25px;
//     border-radius: 25px;
//     background-color: white;
//     justify-content: center;
//     align-items: center;
//     text-align: center;
//     @media (${BREAKPOINTS.sm}) {
//         width: 50%;
//         height: 40%;
//     }
const InnerContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding-bottom: 18px;
`;

// const StyledButton = styled(Button)`
//     width: 10%;
//     margin: 10% 0 0 0;
//     font-size: 90%;
//     font-weight: bold;
//     background-color: #1d65a8;
//     color: white;

//     :hover {
//         box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.24);
//     }

//     :active {
//         transform: translateY(2px);
//     }

//     @media (${BREAKPOINTS.md}) {
//         width: 80%;
//     }

//     @media (${BREAKPOINTS.sm}) {
//         font-size: 50%;
//         width: 100%;
//     }
// `;

const Title = styled.h4`
  font-size: 180%;
  text-align: center;
  margin: 0 0 10% 0;
  @media (${BREAKPOINTS.sm}) {
    font-size: 100%;
    margin: 0 0 2px 0;
    text-align: center;
  }
`;

const Name = styled.h5`
  font-size: 140%;
  text-align: center;
  margin: 0 0 10% 0;
  @media (${BREAKPOINTS.sm}) {
    font-size: 100%;
    margin: 0 0 2px 0;
    text-align: center;
  }
`;

const Table = styled.table`
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 10%;
  margin-right: 10%;
  margin-left: 5%;
  font-size: 90%;
  td,
  th {
    border: 1px solid #ddd;
    padding: 4px;
    text-align: center;
    font-weight: bold;
  }

  th {
    padding-top: 12px;
    padding-bottom: 12px;
    background-color: #8964fe;
    color: white;
  }

  tr {
    background-color: #efefef;
    :hover {
      background-color: lightpink;
    }
  }
`;

const mapStateToProps = (state) => ({
  currentUser: state.currentUser || {},
});

export default connect(mapStateToProps)(Board);
