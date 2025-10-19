//const { json } = require("stream/consumers");

let allRootsWordsdetails = [];
const apiURLBase = 'https://tafsir.app/get_word.php?src=quran-roots&w=';
getAllRootswords();
function getAllRootswords() {
  const fs = require('fs');
  const filePath = './RealData/allRoots.json';
  fs.readFile(filePath, async function (error, content) {
    if (error) {
      console.log('Error reading file:', error);
      return;
    }
    var data = JSON.parse(content);
    let counter = 0;
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        // 0346 has no data
        // 034 has no data 1600
        // 01234578  has  403- has data  
        // 023478  has 53 -- has data
        if (data[key] == "023478") {
          const arabicText = key;
          const arabicTextc = 'عرف';
          const encodedText = encodeURIComponent(arabicText);
          let apiUrl = apiURLBase + encodedText;
          console.log('key = :', key, 'value=', data[key], 'arabicText=', arabicText, 'encodedText=', encodedText);
          if (! await fetchData(apiUrl, arabicText)) {
            console.log('API call failed for root word:', key, 'value=', data[key]);
          }
          else{
            console.log('Data allRootsWordsdetails =', allRootsWordsdetails);
          }
          counter++;
        }
      }
      
    }// end for

    saveObjTofile(allRootsWordsdetails, './resultData/finals.json');
    console.log('Total roots processed:', counter);
    console.log('------------------------------------------------------------');
  });// file read
}

async function fetchData(apiUrl, arabicText) {
  let apiCallStatus = true;
  try {
    // Make the initial fetch request and await the response headers
    const response = await fetch(apiUrl);

    // Check if the response was successful (e.g., status code 200-299)
    if (!response.ok) {
      apiCallStatus = false;
      //throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Await the parsing of the response body (e.g., as JSON)
    const data = await response.json();
    // console.log('API Response:', data);
    let resultObj = getDatafromHtml(data.data, arabicText);
    allRootsWordsdetails.push(resultObj);

    console.log('fetchData():resultObj =', resultObj);
    // Now 'data' contains the parsed response from the API
    //console.log('API Response:', data);

  } catch (error) {
    apiCallStatus = false;
    console.error('Error fetching data:', error);
  }
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