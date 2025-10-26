const keys = [
  "27",
  "01234578",
  "0378",
  "023478",
  "34578",
  "2478",
  "02345678",
  "0234578",
  "02378",
  "3478",
  "012345678",
  "1247",
  "01357",
  "78",
  "013457",
  "4578",
  "03478",
  "67",
  "0124578",
  "17",
  "0134578",
  "01234567",
  "278",
  "347",
  "0123478",
  "012478",
  "47",
  "1234578",
  "0134678",
  "023578",
  "0347",
  "034578",
  "037",
  "478",
  "7",
  "0123457",
  "03578",
  "12578",
  "013478",
  "4678",
  "237",
  "02347",
  "2345678",
  "124578",
  "1278",
  "01235678",
  "178",
  "02357",
  "014578",
  "134578",
  "378",
  "23478",
  "578",
  "12478",
  "01345678",
  "37",
  "24578",
  "0123578",
  "0237",
  "078",
  "34678",
  "2378",
  "678",
  "024578",
  "023457",
  "1578",
  "0234678",
  "123578",
  "567",
  "01257",
  "57",
  "012357",
  "14578",
  "23578",
  "145678",
  "0345678",
  "023678",
  "345678",
  "3467",
  "0278",
  "0245678",
  "01234678",
  "034678",
  "2357",
  "367",
  "01457",
  "2578",
  "012567",
  "014567",
  "02578",
  "013578",
  "0234567",
  "0235678",
  "167",
  "013467",
  "0135678",
  "157",
  "0147",
  "01347",
  "45678",
  "035678",
  "01578",
  "01378",
  "067",
  "0137",
  "1567",
  "1478",
  "0357",
  "0247",
  "457",
  "013567",
  "14678",
  "01467",
  "1467",
  "5678",
  "234578",
  "12345678",
  "023467",
  "057",
  "123457",
  "012378",
  "0678",
  "01245678",
  "13467",
  "3578",
  "0134567",
  "14567"
]


const apiURLBase = 'https://tafsir.app/get_word.php?src=quran-roots&w=';

let allRootsWordsdetails = [];
for (let i = 0; i < keys.length; i++) {
  console.log('Finished processing root key:', keys[i]);
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

      if (counter == 10) break;

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