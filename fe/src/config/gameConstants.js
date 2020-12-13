export const NUMBER_OF_CARDS_IN_DECK = 42;

export const COUNTRIES = {
    Afghanistan: { name: "Afghanistan", value: "AFGHANISTAN" },
    Alaska: { name: "Alaska", value: "ALASKA" },
    Alberta: { name: "Alberta", value: "ALBERTA" },
    Argentina: { name: "Argentina", value: "ARGENTINA" },
    Brazil: { name: "Brazil", value: "BRAZIL" },
    Central_Africa: { name: "Central Africa", value: "CENTRAL_AFRICA" },
    Central_America: { name: "Central America", value: "CENTRAL_AMERICA" },
    China: { name: "China", value: "CHINA" },
    East_Africa: { name: "East Africa", value: "EAST_AFRICA" },
    Eastern_Australia: { name: "Eastern Australia", value: "EASTERN_AUSTRALIA" },
    Eastern_Canada: { name: "Eastern Canada", value: "EASTERN_CANADA" },
    Eastern_United_States: { name: "Eastern United States", value: "EASTERN_UNITED_STATES" },
    Egypt: { name: "Egypt", value: "EGYPT" },
    Great_Britain: { name: "Great Britain", value: "GREAT_BRITAIN" },
    Greenland: { name: "Greenland", value: "GREENLAND" },
    Iceland: { name: "Iceland", value: "ICELAND" },
    India: { name: "India", value: "INDIA" },
    Indonesia: { name: "Indonesia", value: "INDONESIA" },
    Irkutsk: { name: "Irkutsk", value: "IRKUTSK" },
    Japan: { name: "Japan", value: "JAPAN" },
    Kamchatka: { name: "Kamchatka", value: "KAMCHATKA" },
    Madagascar: { name: "Madagascar", value: "MADAGASCAR" },
    Middle_East: { name: "Middle East", value: "MIDDLE_EAST" },
    Mongolia: { name: "Mongolia", value: "MONGOLIA" },
    New_Guinea: { name: "New Guinea", value: "NEW_GUINEA" },
    North_Africa: { name: "North Africa", value: "NORTH_AFRICA" },
    Northern_Europe: { name: "Northern Europe", value: "NORTHERN_EUROPE" },
    Northwest_Territory: { name: "Northwest Territory", value: "NORTHWEST_TERRITORY" },
    Ontario: { name: "Ontario", value: "ONTARIO" },
    Peru: { name: "Peru", value: "PERU" },
    Rusia: { name: "Rusia", value: "RUSIA" },
    Scandinavia: { name: "Scandinavia", value: "SCANDINAVIA" },
    Siberia: { name: "Siberia", value: "SIBERIA" },
    South_Africa: { name: "South Africa", value: "SOUTH_AFRICA" },
    Southeast_Asia: { name: "Southeast Asia", value: "SOUTHEAST_ASIA" },
    Southern_Europe: { name: "Southern Europe", value: "SOUTHERN_EUROPE" },
    Ural: { name: "Ural", value: "URAL" },
    Venezuela: { name: "Venezuela", value: "VENEZUELA" },
    Western_Australia: { name: "Western Australia", value: "WESTERN_AUSTRALIA" },
    Western_Europe: { name: "Western Europe", value: "WESTERN_EUROPE" },
    Western_United_States: { name: "Western United States", value: "WESTERN_UNITED_STATES" },
    Yakutsk: { name: "Yakutsk", value: "YAKUTSK" },
};

export const TROOP_TYPES = {
    Infantry: { name: "INFANTRY", troopSize: 1 },
    Cavalry: { name: "CAVALRY", troopSize: 5 },
    Artillery: { name: "ARTILLERY", troopSize: 10 }
};

export const CARDS = [
    { country: COUNTRIES.Afghanistan.name, troop: TROOP_TYPES.Cavalry.name },
    { country: COUNTRIES.Alaska.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.Alberta.name, troop: TROOP_TYPES.Cavalry.name },
    { country: COUNTRIES.Argentina.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.Brazil.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.Central_Africa.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.Central_America.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.China.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.East_Africa.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.Eastern_Australia.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.Eastern_Canada.name, troop: TROOP_TYPES.Cavalry.name },
    { country: COUNTRIES.Eastern_United_States.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.Egypt.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.Great_Britain.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.Greenland.name, troop: TROOP_TYPES.Cavalry.name },
    { country: COUNTRIES.Iceland.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.India.name, troop: TROOP_TYPES.Cavalry.name },
    { country: COUNTRIES.Indonesia.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.Irkutsk.name, troop: TROOP_TYPES.Cavalry.name },
    { country: COUNTRIES.Japan.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.Kamchatka.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.Madagascar.name, troop: TROOP_TYPES.Cavalry.name },
    { country: COUNTRIES.Middle_East.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.Mongolia.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.New_Guinea.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.North_Africa.name, troop: TROOP_TYPES.Cavalry.name },
    { country: COUNTRIES.Northern_Europe.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.Northwest_Territory.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.Ontario.name, troop: TROOP_TYPES.Cavalry.name },
    { country: COUNTRIES.Peru.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.Rusia.name, troop: TROOP_TYPES.Cavalry.name },
    { country: COUNTRIES.Scandinavia.name, troop: TROOP_TYPES.Cavalry.name },
    { country: COUNTRIES.Siberia.name, troop: TROOP_TYPES.Cavalry.name },
    { country: COUNTRIES.South_Africa.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.Southeast_Asia.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.Southern_Europe.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.Ural.name, troop: TROOP_TYPES.Cavalry.name },
    { country: COUNTRIES.Venezuela.name, troop: TROOP_TYPES.Infantry.name },
    { country: COUNTRIES.Western_Australia.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.Western_Europe.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.Western_United_States.name, troop: TROOP_TYPES.Artillery.name },
    { country: COUNTRIES.Yakutsk.name, troop: TROOP_TYPES.Cavalry.name }
]