#!/usr/bin/env node

// Help output
const HELP =
"bible --help"
+ "\nusage: bible [options]"
+ "\n"
+ "\nRead the Holy Bible using a NPM application."
+ "\n"
+ "\noptions:"
+ "\n  --v, --version          print the version"
+ "\n  --lang, --language      set the Bible language"
+ "\n  --ref, --reference      the verse references that you want to read"
+ "\n  --onlyVerses            prevent showing additional output"
+ "\n  --s, --search           get the verses that match to the string or"
+ "\n                          regular expression provided"
+ "\n  --rc, --resultColor     set the result color when searching something"
+ "\n  --help                  print this output"
+ "\n"
+ "\nDocumentation can be found at https://github.com/BibleJS/BibleApp";

// Constants
const HOME_DIRECTORY = process.env[
    process.platform == "win32" ? "USERPROFILE" : "HOME"
];

// Dependencies
var Bible = require("bible.js")
  , Couleurs = require("couleurs")
  , Yargs = require("yargs").usage(HELP)
  , argv = Yargs.argv
  , language = argv.lang || argv.language
  , reference = argv.reference || argv.ref
  , search = argv.s || argv.search
  , searchResultColor = (argv.rc || argv.resultColor || "255, 0, 0").split(",")
  , config = require(HOME_DIRECTORY + "/.bible-config")
  , Box = require("cli-box")
  , OS = require("os")
  ;

// Set cli-box defaults
Box.defaults.marks = {
    nw: "╔"
  , n:  "══"
  , ne: "╗"
  , e:  "║"
  , se: "╝"
  , s:  "══"
  , sw: "╚"
  , w:  "║"
  , b: "░░"
};

// Parse result color
for (var i = 0; i < 3; ++i) {

    if (!searchResultColor[i]) {
        return console.log(
            "Invalid result color. Please provide a string in this format:"
          + "'r, g, b'. Example: --resultColor '255, 0, 0'"
        );
    }

    searchResultColor[i] = parseInt(searchResultColor[i])
}

// Show version
if (argv.v || argv.version) {
    return console.log("Bible.js v" + require("./package").version);
}

// Show help
if (argv.help || !language || (!reference && !search)) {
    return console.log(Yargs.help());
}

// Output
if (!argv.onlyVerses) {
    if (reference) {
        console.log("You are reading " + reference);
    }

    if (search) {
        console.log("You are searching " + search);
    }

    console.log("----------------");
}

/**
 * printOutput
 * This function is called when the response from the
 * search or get request comes
 *
 * @param {Error} err An error that ocured while fetching the verses.
 * @param {Array} verses The verses array that was returned by bible.js module.
 * @return {undefined} Returns undefined
 */
function printOutput (err, verses) {

    // Handle error
    if (err) {
        console.log("Error: ", err);
        return;
    }

    // No verses
    if (!verses || !verses.length) {
        console.log("Verses not found");
    }

    var output = "";
    // Output each verse
    for (var i in verses) {

        // get the current verse and its reference
        var cVerse = verses[i]
          , cVerseRef = cVerse.bookname + " " + cVerse.chapter + ":" + cVerse.verse
          , referenceBox = new Box("20x10", cVerseRef);
          ;

        if (search) {
            cVerse.text = cVerse.text.replace (
                new RegExp (search, "g")
              , search.rgb(searchResultColor)
            );
        }

        debugger;
        if (argv.onlyVerses) {
            output += cVerse.text + OS.EOL;
        } else {
            output += referenceBox.toString()
        }
    }

    // Output
    if (!argv.onlyVerses) {
        console.log("----------------");
    }
}

// Init submodules
Bible.init(config, function (err) {

    if (err) { throw err; }

    // Create Bible instance
    var bibleIns = new Bible({language: language});

    // Get the verses
    if (reference) {
        bibleIns.get(reference, printOutput);
    }

    // Search verses
    if (search) {
        bibleIns.search(search, printOutput);
    }
});
