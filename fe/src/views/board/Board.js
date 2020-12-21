import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from "reactstrap";
import styled from "styled-components";
import { connect } from "react-redux";
import { withAlert } from "react-alert";
import "react-sliding-pane/dist/react-sliding-pane.css";
import fire from "../../firebase";
import Map from "./map/Map";
import { COUNTRIES } from "../../config/gameConstants";
import Player from "./Player";
import PlayerTurnDecider from "./PlayerTurnDecider";
import TroopsGiver from "./TroopsGiver";
import CardDeck from "./CardDeck";
import CardTrader from "./CardTrader";
import { InitialDeployment, TurnsDeployment } from "./DeploymentStrategy";
import DeploymentContext from "./DeploymentContext";
import ContinentsTroopTable from "./ContinentsTroopTable";
import CardSlidingPane from "./CardSlidingPane";
import "./index.css";

class Board extends Component {
    // Double Click Listener Globals
    timer = undefined;
    delay = 200;
    prevent = false;

    constructor(props) {
        super(props);
        this.state = {
            players: [],
            selectedCountryId: "",
            countryToAttackOrManeuverTo: "",
            initialSetupPhase: true,
            turnsPhase: false,
            attackOrSkipTurnPhase: false,
            numOfAttackerTroops: 0,
            numOfDefenderTroops: 0,
            numOfTroopsToMove: 0,
            attackState: false,
            maneuverState: false,
            tradeCardsState: false,
            validity: false,
            showCards: false,
            clickedCardNumber: undefined,
            currentPlayerSelectedCards: [],
            showSaveModal: false,
            gameName: "",
            cardsTrade: false,
        };

        this.initializeGamePlay();
    }

    initializeGamePlay = () => {
        if (this.props.history.location.state.savedGame) {
            var gameData = this.props.history.location.state.savedGame.gameData;
            this.allPlayers = [];
            this.initializePlayers(gameData);
            this.map = new Map(this.allPlayers, gameData);
        } else {
            this.allPlayers = [];
            this.initializePlayers();
            this.map = new Map(this.allPlayers);
        }
        this.countryIds = Object.values(COUNTRIES).map(
            (country) => country.value
        );
        this.playerTurnDecider = new PlayerTurnDecider(this.allPlayers);
        if (!this.props.history.location.state.savedGame) {
            this.allPlayers[0].setIsPlayerTurn(true);
        }
        this.troopsGiver = new TroopsGiver(
            this.map.getCountries(),
            this.map.getContinents()
        );

        this.cardsDeck = new CardDeck();
        this.cardsTrader = new CardTrader();

        this.getAsJson = this.getAsJson.bind(this);
        this.saveGame = this.saveGame.bind(this);
        this.toggleSaveGameModal = this.toggleSaveGameModal.bind(this);

        this.deploymentStrategy = new DeploymentContext(new InitialDeployment());
    }

    componentDidMount() {
        document.addEventListener("click", this.onClickListener);
        document.addEventListener("dblclick", this.onDoubleClickListener);
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.onClickListener);
        document.removeEventListener("dblclick", this.onDoubleClickListener);
    }

    render() {
        const { selectedCountryId, showCards, currentPlayerSelectedCards } = this.state;

        if (!this.allPlayers) return null;

        const playerCards = this.playerTurnDecider.getCurrentPlayerInfo().getCards() || [];

        return (
            <BoardContainer>
                <CardSlidingPane 
                    title={this.playerTurnDecider.getCurrentPlayerInfo().getName() + " Cards"}
                    showCards={showCards}
                    onClose={() => this.setState({ showCards: false, tradeCard: false })}
                    playerCards={playerCards}
                    onCardClick={this.onCardClickHandler}
                    onTradeButtonClick={this.tradeCard}
                    currentPlayerSelectedCards={currentPlayerSelectedCards}
                />
                <CardContainer><StyledCardsIcon onClick={() => this.setState({ showCards: !showCards, tradeCard: true, }) } /></CardContainer>
                <ContinentsTroopTable />
                <MapContainer>
                    <InnerContainer>{this.allPlayers.map((player) => player.getView())}</InnerContainer>
                    {this.map.getView()}
                    {selectedCountryId ? <span>{COUNTRIES[selectedCountryId].name} </span> : null}
                    {this.attackInputFieldsRenderer()}
                    {this.attackButtonRenderer()}
                    {this.maneuverInputFieldsRenderer()}
                    {this.endTurnButtonRenderer()}
                </MapContainer>
                {this.saveGameButtonsRenderer()}
            </BoardContainer>
        );
    }

    // Attack Territory Caller
    attackTerritory = () => {
        const { alert } = this.props;
        const { countryToAttackOrManeuverTo, selectedCountryId, numOfAttackerTroops, numOfDefenderTroops } = this.state;
        const result = this.map.attackTerritory(countryToAttackOrManeuverTo, selectedCountryId, numOfAttackerTroops, numOfDefenderTroops);
        if (typeof result === "object") {
            if (result.won && result.message === "TERRITORY_OCCUPIED") {
                alert.success(this.playerTurnDecider.getCurrentPlayerInfo().getName() + " won.");
                const card = this.cardsDeck.getCard();
                if (card) {
                    const currentPlayerId = this.playerTurnDecider.getCurrentPlayerInfo().getId();
                    for (let i = 0; i < this.allPlayers.length; i++) {
                        if (this.allPlayers[i].getId() === currentPlayerId) {
                            this.allPlayers[i].addCard(card);
                            break;
                        }
                    }
                    alert.success(this.playerTurnDecider.getCurrentPlayerInfo().getName() +" received a card.");
                } else {
                    alert.error("No cards left to give.");
                }
            } else {
                alert.show(this.playerTurnDecider.getCurrentPlayerInfo().getName() + " lost.");
            }
        }
    }

    // Troop Deployment Methods
    deployInitialTroops = () => {
        const { alert } = this.props;
        const { selectedCountryId } = this.state;

        if (this.deploymentStrategy.deployTroops(this.map, this.playerTurnDecider, selectedCountryId, this.troopsGiver, this.cardsDeck, alert, (newState) => this.setState(newState))) {
            this.forceUpdate();
            this.deploymentStrategy.setStrategy(new TurnsDeployment());
        }        
    };

    deployTurnTroops = () => {
        const { alert } = this.props;
        const { selectedCountryId } = this.state;
        this.deploymentStrategy.deployTroops(this.map, this.playerTurnDecider, selectedCountryId, this.troopsGiver, this.cardsDeck, alert, (newState) => this.setState(newState));
    };

    // Card Trade Method
    onCardClickHandler = (card) => {
        const { currentPlayerSelectedCards } = this.state;
        for (let i = 0; i < currentPlayerSelectedCards.length; i++) {
            if (
                JSON.stringify(currentPlayerSelectedCards[i]) ===
                JSON.stringify(card)
            ) {
                return false;
            }
        }
        currentPlayerSelectedCards.push(card);
        this.setState({ currentPlayerSelectedCards: currentPlayerSelectedCards });
    };

    tradeCard = () => {
        const { currentPlayerSelectedCards } = this.state;
        const currentPlayer = this.playerTurnDecider.getCurrentPlayerInfo();
        if (currentPlayer.getNoOfCards() >= 3) {
            this.cardsTrader.setNoOfPreviousTrades(
                currentPlayer.getNumOfCardTrades()
            );
            let tempTroops = currentPlayer.getRemainingTroops();
            currentPlayer.setRemainingTroops(
                currentPlayer.getRemainingTroops() +
                    this.cardsTrader.tradeCards(currentPlayerSelectedCards)
            );
            if (currentPlayer.getRemainingTroops() > tempTroops) {
                currentPlayer.setNumOfCardTrades(
                    currentPlayer.getNumOfCardTrades() + 1
                );
                currentPlayer.removeCards(currentPlayerSelectedCards);
                tempTroops = 0;
                this.setState({ cardsTrade: true });
                this.forceUpdate();
            }
        }
        if (currentPlayer.getNoOfCards() < 5) {
            this.setState({ showCards: true });
        }
    };

    initializePlayers = (gameData = null) => {
        if (gameData) {
            const { players } = gameData;
            players.forEach((playerJson) => {
                let player = new Player(
                    playerJson.name,
                    playerJson.id,
                    playerJson.remainingTroops,
                    playerJson.color,
                    playerJson.isPlayerTurn,
                    playerJson.playerTurnNumber
                );
                player.setDiceRoll(players.length);
                this.allPlayers.push(player);
            });
        } else {
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
        }
        this.allPlayers = this.allPlayers.sort(
            (a, b) => b.getDiceRoll() - a.getDiceRoll()
        );
    };
 
    // Only called when turns phase is started
    endTurnForPlayer = (shouldValidatePlayerTroops) => {
        if (this.playerTurnDecider.endTurnForPlayer(shouldValidatePlayerTroops)) {
            this.troopsGiver.giveTroopsToPlayer(this.playerTurnDecider.getPlayerWithTurn());
            this.setState({
                attackOrSkipTurnPhase: false,
                turnsPhase: true,
                attackState: false,
                maneuverState: false,
            });
            this.forceUpdate();
        }
    };

    // Click Listeners
    onClickListener = (e) => {
        this.timer = setTimeout(() => {
            if (!this.prevent) {
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
            }
            this.prevent = false;
        }, this.delay);
    };

    onDoubleClickListener = (e) => {
        const { showCards, initialSetupPhase, turnsPhase, attackOrSkipTurnPhase, cardsTrade } = this.state;

        clearTimeout(this.timer);
        this.prevent = true;
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
        if (turnsPhase && isCountryValid && !showCards) {
            this.setState({ selectedCountryId: id }, () => {
                this.map.setSelectedCountry(id);
                this.deployTurnTroops();
            });
            this.forceUpdate();
            return;
        }

        if (cardsTrade) {
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

    // Renderers 
    endTurnButtonRenderer = () => {
        const { initialSetupPhase } = this.state;

        const remainingPlayerTroops =  this.playerTurnDecider.getCurrentPlayerInfo().getRemainingTroops();
        if (!initialSetupPhase && remainingPlayerTroops === 0) {
            return <EndButton onClick={() => this.endTurnForPlayer(true)}>End Turn</EndButton>;
        }
        return null;
    }

    maneuverInputFieldsRenderer = () => {
        const { maneuverState, numOfAttackerTroops, numOfDefenderTroops, selectedCountryId, countryToAttackOrManeuverTo } = this.state;
        if (maneuverState) {
            return (
                <>
                    <AttackerTroopsInput
                        value={this.state.numOfAttackerTroops}
                        onChange={(e) =>
                            this.validateInput(e, "numOfAttackerTroops")
                        }
                    />
                    <ActionButton onClick={() => {
                            this.map.attackTerritory(selectedCountryId, countryToAttackOrManeuverTo, numOfAttackerTroops, numOfDefenderTroops);
                        }}
                    >Maneuver</ActionButton>
            </>
            );
        }
        return null;
    }

    attackButtonRenderer = () => {
        const { initialSetupPhase } = this.state;

        const remainingPlayerTroops =  this.playerTurnDecider.getCurrentPlayerInfo().getRemainingTroops();
        if (!initialSetupPhase && remainingPlayerTroops === 0) {
            return <ActionButton onClick={this.attackTerritory}>Attack</ActionButton>
        }
        return null;
    }

    attackInputFieldsRenderer = () => {
        const { numOfAttackerTroops, numOfDefenderTroops, attackState } = this.state;
        return (
            <>
                <AttackerTroopsInput value={numOfAttackerTroops} onChange={(e) => this.validateInput(e, "numOfAttackerTroops")}
                    style={{ zIndex: attackState ? "1000" : "-1" }}
                />
                <DefenderTroopsInput value={numOfDefenderTroops} onChange={(e) => this.validateInput(e, "numOfDefenderTroops") }
                    style={{ zIndex: attackState ? "1000" : "-1" }}
                />
            </>
        );
    }

    saveGameButtonsRenderer = () => {
        const { showSaveModal } = this.state;
        return (
            <div>
                <SaveGameButton color="danger" onClick={this.toggleSaveGameModal}>Save Game</SaveGameButton>
                <Modal isOpen={showSaveModal} toggle={this.toggleSaveGameModal}>
                    <ModalHeader toggle={this.toggleSaveGameModal}>
                        Save Current Game
                    </ModalHeader>
                    <ModalBody>
                        <Input placeholder="Game Name" rows={5} onChange={(e) => this.setState({ gameName: e.target.value })} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.saveGame}>Save</Button>
                        <Button color="secondary" onClick={this.toggleSaveGameModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }

    // Save Game Logic Methods
    getAsJson() {
        var result = {};
        result.players = this.allPlayers;
        result.map = this.map.getAsJson();
        return result;
    }

    async saveGame() {
        const { gameName } = this.state;
        this.toggleSaveGameModal();
        if (!this.props.currentUser) return;
        const userRef = fire
            .firestore()
            .doc(`users/${this.props.currentUser.uid}`);
        var gameData = {};
        var savedGameName = "game-" + gameName;
        gameData[savedGameName] = JSON.parse(JSON.stringify(this.getAsJson()));
        userRef.set(gameData, { merge: true }).catch((error) => {
            console.error("Error saving game", error);
        });
    }

    async loadGame(gameName) {
        if (!this.props.currentUser) return;
        const userRef = fire
            .firestore()
            .doc(`users/${this.props.currentUser.uid}`);
        var data = await userRef.get();
        data = data.data();
        var savedGameName = "game-" + gameName;
        return data[savedGameName];
    }

    toggleSaveGameModal() {
        this.setState({ showSaveModal: !this.state.showSaveModal });
    }

    // Validator Methods
    validateInput = (e, inputType) => {
        const { alert } = this.props;
        const val = e.target.value;
        if (isNaN(val)) {
            alert.error("Invalid Input.");
            return;
        }
        this.setState({ [inputType]: val });
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


const SaveGameButton = styled(Button)`
    position: absolute;
    right: 10px;
    top: 110px;
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
    height: 130vh;
`;

const InnerContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding-bottom: 18px;
`;

const mapStateToProps = (state) => ({
    currentUser: state.currentUser || {},
});

export default withAlert()(connect(mapStateToProps)(Board));
