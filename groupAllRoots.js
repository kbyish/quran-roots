// 01356  1  -- not valid
// 03 1230  -- not valid
// 36 402  -- not valid
// 0346  559 -- valid
// 034  1665
// 0348  12 
// 3 3046
//6 7846
// 8
//34
//036 


// 01234578  403 -- valid 
// 023478  53 -- valid
// 0378  70 -- valid
// 27 12 
//34578  1  
//2478 11 
// 02345678  11
// 0234578  345
//0378  70
//0134578 23



get();
function get() {
  const fs = require('fs');
  const filePath = './RealData/allRoots.json';
  let arr = [{ num: "", words: [] }];
  fs.readFile(filePath, async function (error, content) {
    if (error) {
      console.log('Error reading file:', error);
      return;
    }
    var data = await JSON.parse(content);
    console.log('Total keys in file:', Object.keys(data).length);
    console.log('Total keys in file:', Object.keys(data).length);
    let counter = 0;
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        //console.log('Processing key:', key, 'with root number:', data[key]);
        isNewKey = true;
        for (let i = 0; i < arr.length; i++) {
          // console.log('Comparing with existing root number:', arr[i].num);
          if (data[key] == arr[i].num) {
            //console.log('Adding word:', key, 'to existing root number:', data[key]);
            isNewKey = false;
            arr[i].words.push(key);
          }
        }// end for i
        if (isNewKey) {
          arr.push({ num: data[key], words: [key] });
        }

      }// end if
    }// end for key
    console.log('Total root numbers grouped:', arr.length);
    //await saveObjTofile(arr, './resultData/allRoots_grouped.json');

    console.log('------------------------------------------------------------');
    let rootsHasdata = [];
    let rootsWithoutdata = [];

    const apiURLBase = 'https://tafsir.app/get_word.php?src=quran-roots&w=';
    const maxWordsToCheck = 1;
    let responseData = {}, response = {};
    for (let i = 0; i < arr.length; i++) {
      let maxWords = arr[i].words.length < maxWordsToCheck ? arr[i].words.length : maxWordsToCheck;
      for (let j = 0; j < maxWords; j++) {
        const encodedText = encodeURIComponent(arr[i].words[j]);
        let apiUrl = apiURLBase + encodedText;
        try {
           response = await fetch(apiUrl);
           responseData = await response.json();
        } catch (error) {
          console.error('Error fetching API:', error);
          console.error(arr[i].num, 'Word:', arr[i].words[j]);
          console.log('--------------------------------------------------');
        }
        //console.log ('response =', response ,'responseData =', responseData);

        if (response.ok && response.status === 200 && responseData.data != "") {
          rootsHasdata.push(arr[i]);

          console.log('API call successful for Root number:', arr[i].num, 'Word:', arr[i].words[j]);
          //console.log('responseData:', JSON.stringify( responseData.data).substring(0,20));
          console.log('--------------------------------------------------');
        }
        else {
          rootsWithoutdata.push(arr[i]);
          console.log('API call failed for Root number:', arr[i].num, 'Word:', arr[i].words[j]);
          //console.log('responseData =', responseData.data);
          console.log('--------------------------------------------------');
        }
      }
    }
    console.log('--------------------------------------------------');
    console.log('--------------------------------------------------');
    console.log('rootsHasdata =', rootsHasdata);
    console.log('rootsWithoutdata =', rootsWithoutdata);

    await saveObjTofile(rootsHasdata, './resultData/rootsHasdata.json');
     await saveObjTofile(rootsWithoutdata, './resultData/rootsWithoutdata.json');

  }); // file read
}


//saveObjTofile(rootArray, 'output.json');
async function saveObjTofile(obj, filename) {
  const fs = require('fs');
  fs.writeFileSync(filename, JSON.stringify(obj, null, 2));
}