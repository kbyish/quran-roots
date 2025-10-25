// 01356  1  -- not valid
//03    1230  -- not valid

// 01234578  403 -- valid 
// 023478  53 -- valid
// 0378  70 -- valid


//let keys = ['01234578', '023478', '0378'];
let keys = ['023478', '0378'];
const apiURLBase = 'https://tafsir.app/get_word.php?src=quran-roots&w=';


let arrayOfObjects = [];
arrayOfObjects.push({ id: 1, name: 'A' });
arrayOfObjects.push({ id: 2, name: 'B' });
arrayOfObjects.push({ id: 3, name: 'C' });
console.log('Array of Objects:', arrayOfObjects.length);
arrayOfObjects = [];
arrayOfObjects.push({ id: 4, name: 'D' });
console.log('Array of Objects after reset:', arrayOfObjects.length);




let allRootsWordsdetails = [];
for (let i = 0; i < keys.length; i++) {
  getAllRootswords(keys[i]);
  allRootsWordsdetails = [];
}

function getAllRootswords(rootKey) {
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
        if (data[key] == rootKey) {
          counter++;
          const arabicText = key;
          const encodedText = encodeURIComponent(arabicText);
          let apiUrl = apiURLBase + encodedText;
          //console.log('key = :', key, 'value=', data[key], 'arabicText=', arabicText, 'encodedText=', encodedText);

          let response = await fetchData(apiUrl, arabicText);
          //console.log('response:', response);
          if (response) {
            // Process the response if needed
            let resultObj = getDatafromHtml(response.data, arabicText);
            allRootsWordsdetails.push(resultObj);
          }

          //console.log('getAllRootswords(): Processed root:', arabicText);
        }
      }

    }// end for

    await saveObjTofile(allRootsWordsdetails, './resultData/' + rootKey + '.json');
    console.log('Total roots processed:', counter);
    console.log('Total object:', allRootsWordsdetails.length);
    allRootsWordsdetails = [];
    allRootsWordsdetails.length = 0;

    console.log('------------------------------------------------------------');
  });// file read
}

async function fetchData(apiUrl, arabicText) {

  try {
    // Make the initial fetch request and await the response headers
    const response = await fetch(apiUrl);


    //const data = await response.json();
    return await response.json();
    // console.log('API Response:', data);



  } catch (error) {

    console.error('Error fetching data:', error);
  }
}


function getDatafromHtml(htmlData, rootWord = '') {

  let rootObject =
  {
    root: '', details: []
  };

  rootObject.root = rootWord;

  const jsdom = require("jsdom");
  const dom = new jsdom.JSDOM(htmlData);

  const h3Elements = dom.window.document.querySelectorAll("h3");
  h3Elements.forEach(element => {
    rootObject.details.push({ type: element.textContent.trim(), locs: [] });
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
        rootObject.details[mainCounter].locs.push({
          w: firstTdValue,
          l: convertArabicNumbersToEnglish(secondTdValue).replace(/\u00A0/g, " ").replace(/\s/g, '')
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
async function saveObjTofile(obj, filename) {
  const fs = require('fs');
  fs.writeFileSync(filename, JSON.stringify(obj, null, 2));
}