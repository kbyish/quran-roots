const { json } = require("stream/consumers");

console.log('test');
const arabicText = 'عرف';
const encodedText = encodeURIComponent(arabicText);
let apiUrl = 'https://tafsir.app/get_word.php?src=quran-roots&w=' + encodedText;
console.log(apiUrl);

//final result array
let allRootsWordsdetails = [];

fetch(apiUrl)
  .then(response => {
    // Check if the network response was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Parse the JSON response into a JavaScript object
    return response.json();
  })
  .then(data => {
    // Process the retrieved data
    //console.log('Data from API:', data);
    // You can now use 'data' to update your UI or perform other actions
    processData(data, arabicText);
  })
  .catch(error => {
    // Handle any errors that occurred during the fetch operation
    console.error('Error fetching data:', error);
  });


function processData(data, rootWord) {
  let resultObj = getDatafromHtml(data.data, rootWord);
  allRootsWordsdetails.push(resultObj);
  saveObjTofile(allRootsWordsdetails, './resultData/' + rootWord + '.json');
}

function getDatafromHtml(htmlData, rootWord = '') {

  let rootObject =
  {
    root: '', count: 0, details: []
  };


  rootObject.root = rootWord;

  const jsdom = require("jsdom");
  const dom = new jsdom.JSDOM(htmlData);

  const h3Elements = dom.window.document.querySelectorAll("h3");
  h3Elements.forEach(element => {
    rootObject.details.push({ type: element.textContent.trim(), count: 0, locations: [] });
  });

  const allTables = dom.window.document.querySelectorAll("table"); //const allTables = document.querySelectorAll('table');

  let mainCounter = 0;
  allTables.forEach(table => {
    const tableRows = table.querySelectorAll('tr');


    tableRows.forEach(row => {
      const firstTd = row.querySelector('td:first-child');
      const secondTd = row.querySelector('td:nth-child(2)');


      // let firstTdValue = firstTd ? firstTd.textContent.trim() : null;

      let firstTdValue = null;
      if (firstTd && (bId = firstTd.querySelector('b'))) {
        firstTdValue = bId.textContent.trim();
      }

      let secondTdValue = secondTd ? secondTd.textContent.trim() : null;

      if (firstTdValue && secondTdValue) {
        rootObject.details[mainCounter].locations.push({
          word: firstTdValue,
          location: convertArabicNumbersToEnglish(secondTdValue).replace(/\u00A0/g, " ")
        });
      }

    });
    mainCounter++;

  });
  return rootObject;
}

function convertArabicNumbersToEnglish(text) {
  const arabicToEnglishMap = {
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9'
  };
  return text.replace(/[٠-٩]/g, match => arabicToEnglishMap[match]);
}

//saveObjTofile(rootArray, 'output.json');
function saveObjTofile(obj, filename) {
  const fs = require('fs');
  fs.writeFileSync(filename, JSON.stringify(obj, null, 2));
}