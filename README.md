# Videogames Script for Obsidian's Quickadd plugin

## Demo

![igdbDemo](https://user-images.githubusercontent.com/52013479/150051838-f68e23c2-2a3a-43e3-a25c-d6d8f4ba6830.gif)

## Description

This script allows you to easily insert a videogame note into your Obsidian vault using [Quickadd plugin](https://github.com/chhoumann/quickadd) by @chhoumann. **Now also works on Mobile (make sure you use latest QuickAdd) !**

We use IGDB api to get the videogame information.

This script needs a **client id** and **client secret** for IGDB API that you can get [here](https://api-docs.igdb.com/#about). Steps to obtain **client id** and **client secret** are detailed [below](#how-to-obtain-client-id-and-secret).

## Disclaimer

The script and this tutorial are based on [Macro_MovieAndSeriesScript.md](https://github.com/chhoumann/quickadd/blob/master/docs/Examples/Macro_MovieAndSeriesScript.md) by @chhoumann.

**Please never run a script that you don't understand. I cannot and will not be liable for any damage caused by the use of this script. Regularly make a backup of your Obsidian's vault !**

## How to obtain client ID and secret

1. Sign-in to this website : <https://dev.twitch.tv/login>.
2. Click on "Applications" :
![1](https://user-images.githubusercontent.com/52013479/151679962-4f510da2-bdb4-49d0-82f9-baaacb7bb4f6.png)
3. Click on "Register your application" :
![2](https://user-images.githubusercontent.com/52013479/151679974-093dc027-3d17-4ba4-8225-44f6eb5a7262.png)
4. In "Name", choose a name you want. In "OAuth Redirect URLs", write `http://localhost`. In "category", choose "Application Integration". Finally, click on "Create" :
![3](https://user-images.githubusercontent.com/52013479/151680007-4a96a8df-d6a2-483f-bab6-0f5454d909af.png)
5. Click on manage :
![4](https://user-images.githubusercontent.com/52013479/151680012-2d453d2b-6e1a-4e1e-8feb-2c6067f9cdfd.png)
6. Here are your `client id` and `client secret` ! To generate `client secret`, click on `new secret` (and copy it, it will disappear !) :
![5](https://user-images.githubusercontent.com/52013479/151680023-a243939d-b208-4a25-a256-a4bc49092a95.png)
7. Keep your `client id` and `client secret`, they will be needed in the steps [below](#installation).

## Installation

![igdbInstall](https://user-images.githubusercontent.com/52013479/150051891-f9330609-8521-402a-97f1-3288bb4186f3.gif)

0. Make sure you use latest QuickAdd version (at least 0.5.1) !
1. Save the [script](https://github.com/Elaws/script_videogames_quickAdd/releases) to your vault somewhere. Make sure it is saved as a JavaScript file, meaning that it has the `.js` at the end.
2. Create a new template in your designated templates folder. Example template is provided below.
3. Open the Macro Manager by opening the QuickAdd plugin settings and clicking `Manage Macros`.
4. Create a new Macro - you decide what to name it.
5. Add the user script to the command list.
6. Add a new Template step to the macro. This will be what creates the note in your vault. Settings are as follows:
    1. Set the template path to the template you created.
    2. Enable File Name Format and use `{{VALUE:fileName}}` as the file name format. You can specify this however you like. The `fileName` value is the name of videogame without illegal file name characters.
    3. The remaining settings are for you to specify depending on your needs.
7. Click on the cog icon to the right of the script step to configure the script settings. This should allow you to enter the API client id and client secret you got from IGDB. **Please make sure no accidental spaces are inserted before or after API `client id` or `client secret` !**
8. Go back out to your QuickAdd main menu and add a new Macro choice. Again, you decide the name. This is what activates the macro.
9. Attach the Macro to the Macro Choice you just created. Do so by clicking the cog ⚙ icon and selecting it.

You can now use the macro to create notes with videogame information in your vault !

## Template variables definitions

Please find here a definition of the possible variables to be used in your template. Simply write `{{VALUE:<variable name>}}` in your template, and replace `<variable name>` by the desired video game data.

| Variable | Description |
|:--------:|:------------|
| `name` | The title of the game. |
| `fileName` | Title of the game without illegal characters. Possibly used in template configuration to name your file. |
| `developerName` | Name of the development studio. If the game was developed by several companies, then the variable contains a list of company names surrounded by quotes. |
| `publisherName` | Name of the publisher. If the game was published by several companies, then the variable contains a list of company names surrounded by quotes. |
| `genres` | A list of genres for this game, formatted as "genre1", "genre2" etc. |
| `gameModes` | A list of game modes for this game, formatted as "gameMode1", "gameMode2" etc. |
| `cover` | A poster of the videogame (if available) |
| `release` | The year the game was released (if available) |
| `url` | URL to the IGDB page of the game. |
| `storyline` | A short description of a games story |
| `platforms` | A list of platforms this game was released on, formatted as "platform1", "platform2" etc. |
| `platformAbbreviations` | A list of platform name abbreviations from `platforms` variable. |
| `series` | The series the game belongs to. |
| `category` | The category of this game. E.g. main game, DLC, mod, remake, remaster, port, bundle etc. |
| `aggregatedRating` | Rating based on external critic scores |
| `aggregatedRatingCount` | Number of external critic scores |
| `dlcs` | DLCs for this game. |
| `expandedGames` | Expanded games of this game. |
| `expansions` | Expansions of this game. |
| **Age ratings** ||
| `ESRB` | Entertainment Software Rating Board rating (United States) |
| `PEGI` | Pan-European Game Information rating (European Union) |
| `CERO` | Computer Entertainment Rating Organization rating |
| `USK` | Unterhaltungssoftware Selbstkontrolle rating |
| `GRAC` | Game Rating and Administration Committee rating (Japan) |
| `CLASS_IND` | Classificação Indicativa rating (Brazil) |
| `ACB` | Australian Classification Board rating (Australia) |
| **Custom variables** | *not from IGDB* |
| `status` | Game completion status: todo, wip (work in progress) or done. |
