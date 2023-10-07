const notice = (msg) => new Notice(msg, 5000);
const log = (msg) => console.log(msg);

const API_URL = "https://api.igdb.com/v4/games";
const AUTH_URL = "https://id.twitch.tv/oauth2/token";
const GRANT_TYPE = "client_credentials";

const API_CLIENT_ID_OPTION ="IGDB API Client ID"
const API_CLIENT_SECRET_OPTION ="IGDB API Client secret" 

var userData = {igdbToken: ""};
var AUTH_TOKEN;

module.exports = {
  entry: start,
  settings: {
    name: "Videogames Script",
    author: "Elaws and BrOleg5",
    options: {
      [API_CLIENT_ID_OPTION]: {
        type: "text",
        defaultValue: "",
        placeholder: "IGDB API Client ID",
      },
      [API_CLIENT_SECRET_OPTION]:{
        type: "text",
        defaultValue: "",
        placeholder: "IGDB API Client secret",
      },
    },
  },
};

let QuickAdd;
let Settings;
let savePath;

async function start(params, settings) {
	QuickAdd = params;
	Settings = settings;

	var relativePath = QuickAdd.app.vault.configDir;
	savePath = QuickAdd.obsidian.normalizePath(`${relativePath}/igdbToken.json`);

	// Retrieve saved token or create and save one (in Obsidian's system directory as igdbToken.json)
	// Token is generated from client ID and client secret, and lasts 2 months. 
	// Token is refreshed when request fails because of invalid token (every two months)
	await readAuthToken();

	const query = await QuickAdd.quickAddApi.inputPrompt(
		"Enter videogame title: ", "The Darkness"
	);
	if (!query) {
		notice("No query entered.");
		throw new Error("No query entered.");
	}

	const searchResults = await getByQuery(query);
	
	const selectedGame = await QuickAdd.quickAddApi.suggester(
		searchResults.map(formatTitleForSuggestion),
		searchResults
	);
	if (!selectedGame) {
		notice("No choice selected.");
		throw new Error("No choice selected.");
	}
	
	if(selectedGame.involved_companies)
	{
		var developers = (selectedGame.involved_companies).filter(element => element.developer);
		var publishers = (selectedGame.involved_companies).filter(element => element.publisher);
	}

	const rating_dict = processAgeRating(selectedGame.age_ratings);

	const STATUS_ARR = ["todo", "done", "wip"];
	const myStatus = await QuickAdd.quickAddApi.suggester(
		STATUS_ARR,
		STATUS_ARR
	);
	if (!myStatus) {
		notice("No choice selected.");
		throw new Error("No choice selected.");
	}

	QuickAdd.variables = {
		name: selectedGame.name,
		fileName: replaceIllegalFileNameCharactersInString(selectedGame.name),
		// Each genre comes in {ID, NAME} pair. Here, get rid of ID to keep NAME only.
		// POST request to IGDB in apiGet(query) uses IGDB API's expander syntax
		// (see : https://api-docs.igdb.com/#expander)
		genres: `${selectedGame.genres ? formatList((selectedGame.genres)
			.map(item => item.name)) : ""}`,
		gameModes: `${selectedGame.game_modes ? formatList((selectedGame.game_modes)
			.map(item => item.name)) : ""}`,
		// Developer and publisher names
		developerName: `${developers ? formatList(developers
			.map(developer => developer.company.name)) : ""}`,
		publisherName: `${publishers ? formatList(publishers
			.map(publisher => publisher.company.name)) : ""}`,
		// For possible image size options, see : https://api-docs.igdb.com/#images
		cover: `${selectedGame.cover ? "https:" + (selectedGame.cover.url)
			.replace("thumb", "cover_big") : ""}`,
		// Release date is given as UNIX timestamp.
		release: `${selectedGame.first_release_date ?
			(new Date((selectedGame.first_release_date*1000))).getFullYear() : ""}`,
		// A short description of the game.
		storyline: `${selectedGame.storyline ?
			(selectedGame.storyline).replace(/\r?\n|\r/g, " ") : ""}`,
		// Platforms
		platforms: `${selectedGame.platforms ? formatList((selectedGame.platforms)
			.map(item => item.name)) : ""}`,
		platformAbbreviations: `${selectedGame.platforms ? formatList((selectedGame.platforms)
			.map(item => item.abbreviation)) : ""}`,
		url: selectedGame.url,
		ESRB: `${"ESRB" in rating_dict ? rating_dict["ESRB"] : ""}`,
		PEGI: `${"PEGI" in rating_dict ? rating_dict["PEGI"] : ""}`,
		CERO: `${"CERO" in rating_dict ? rating_dict["CERO"] : ""}`,
		USK: `${"USK" in rating_dict ? rating_dict["USK"] : ""}`,
		GRAC: `${"GRAC" in rating_dict ? rating_dict["GRAC"] : ""}`,
		CLASS_IND: `${"CLASS_IND" in rating_dict ? rating_dict["CLASS_IND"] : ""}`,
		ACB: `${"ACB" in rating_dict ? rating_dict["ACB"] : ""}`,
		status: myStatus
	};
}

function formatTitleForSuggestion(resultItem) {
	return `${resultItem.name} (${
		resultItem.platforms ? formatListWithoutQuotes((resultItem.platforms)
		.map(item => item.name)) : ""} | ${
		(new Date((resultItem.first_release_date)*1000)).getFullYear()
	})`;
}

async function getByQuery(query) {

    const searchResults = await apiGet(query);

	if(searchResults.message)
    {
      await refreshAuthToken();
      return await getByQuery(query);
    }

    if (searchResults.length == 0) {	
      notice("No results found.");
      throw new Error("No results found.");
    }

    return searchResults;
}

function formatList(list) {
	if (list.length === 0 || list[0] == "N/A") return " ";
	if (list.length === 1) return `${list[0]}`;

	return list.map((item) => `\"${item.trim()}\"`).join(", ");
}

function formatListWithoutQuotes(list) {
	if (list.length === 0 || list[0] == "N/A") return "";
	if (list.length === 1) return `${list[0]}`;

	return list.map((item) => `${item.trim()}`).join(", ");
}

function replaceIllegalFileNameCharactersInString(string) {
	return string.replace(/[\\,#%&\{\}\/*<>$\":@.]*/g, "");
}

async function readAuthToken(){

	if(await QuickAdd.app.vault.adapter.exists(savePath))
	{ 
		userData = JSON.parse(await QuickAdd.app.vault.adapter.read(savePath));
		AUTH_TOKEN = userData.igdbToken;
	} 
	else {
		await refreshAuthToken();
	}
}

async function refreshAuthToken(){

	const authResults = await getAuthentified();

	if(!authResults.access_token){
		notice("Auth token refresh failed.");
    	throw new Error("Auth token refresh failed.");
	} else {
		AUTH_TOKEN = authResults.access_token;
		userData.igdbToken = authResults.access_token;
		await QuickAdd.app.vault.adapter.write(savePath, JSON.stringify(userData));
	}
}

async function getAuthentified() {
	let finalURL = new URL(AUTH_URL);

	finalURL.searchParams.append("client_id", Settings[API_CLIENT_ID_OPTION]);
	finalURL.searchParams.append("client_secret", Settings[API_CLIENT_SECRET_OPTION]);
	finalURL.searchParams.append("grant_type", GRANT_TYPE);
	
	const res = await request({
		url: finalURL.href,
		method: 'POST',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json'
		}	
	})
	return JSON.parse(res);
}

async function apiGet(query) {

	try {
		const res = await request({
			url: API_URL, 
			method: 'POST',
			cache: 'no-cache',
			headers: {
				'Client-ID': Settings[API_CLIENT_ID_OPTION],
				'Authorization': "Bearer " + AUTH_TOKEN 
			},
			// The understand syntax of request to IGDB API, read the following :
			// https://api-docs.igdb.com/#examples
			// https://api-docs.igdb.com/#game
			// https://api-docs.igdb.com/#expander
			body: "fields name, first_release_date, involved_companies.developer, " +
				"involved_companies.publisher, involved_companies.company.name, " +
				"url, cover.url, genres.name, " +
				"game_modes.name, storyline, platforms.name, platforms.abbreviation, " +
				"age_ratings.category, age_ratings.rating; " + 
				"search \"" + query + "\"; limit 25;"
		})
		
		return JSON.parse(res);
	} catch (error) {
		await refreshAuthToken();
		return await getByQuery(query);
	}
}

function processAgeRating(age_ratings) {
	const category = ["ESRB", "PEGI", "CERO", "USK", "GRAC", "CLASS_IND", "ACB"];
	const rating = ["3", "7", "12", "16", "18", "RP", "EC", "E", "E10", "T", "M", "AO", "A",
		"B", "C", "D", "Z", "0", "6", "12", "16", "18", "ALL", "12", "15", "18", "TESTING",
		"L", "10", "12", "14", "16", "18", "G", "PG", "M", "MA15+", "R18+", "RC"];
	var rating_dict = {};
	for(let i = 0; i < age_ratings.length; i++) {
		rating_dict[category[age_ratings[i].category-1]] = rating[age_ratings[i].rating-1];
	}
	return rating_dict;
}