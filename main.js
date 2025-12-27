const SpeechParts = ["noun", "verb", "adjective", "adverb", "pronoun", "preposition", "conjunction", "interjection", "exclamation", "article", "determiner", "propernoun", "abbreviation"];

let LikedWords = [];
let history = [];
let currentPage = "main";
let displayingState = false;

class Memory {
  static setFavorites(words) {
    localStorage.setItem("Favorites", JSON.stringify(words));
  }

  static getFavorites() {
    if (localStorage.getItem("Favorites") !== null) {
      LikedWords = JSON.parse(localStorage.getItem("Favorites"));
    }
  }

  static setHistory(words) {
    localStorage.setItem("History", JSON.stringify(words));
  }

  static getHistory() {
    if (localStorage.getItem("History") !== null) {
      history = JSON.parse(localStorage.getItem("History"));
    }
  }

  // static resetStorage() {
  //   let list = [];
  //   localStorage.setItem('list', JSON.stringify(list));
  // }
}

document.addEventListener("DOMContentLoaded", () => {
  Memory.getFavorites();
  Memory.getHistory();
  // loadHistory();
  // loadFavorites();
  bttEventDelegation();

  document.getElementById("search_btt").addEventListener("click", (e) => {
    e.preventDefault();
    if (!displayingState) {
      if (document.getElementById("search_text").value) {
        handleWord();
      } else {
        alert("Please type a word.");
      }
    }
  });
});

window.addEventListener("scroll", function () {
  if (window.scrollY > 50) {
    document.body.classList.add("scrolled");
  } else {
    document.body.classList.remove("scrolled");
  }
});

class Word {
  constructor(data) {
    this.data = data;
    this.word = this.getWord(data);
    this.phonetics = this.getPhonetics(data);
    // this.nouns = this.getNouns(data);
    // this.verbs = this.getVerbs(data);
    // this.adjes = this.getAdjes(data);
    this.speechParts = this.getPartOfSpeech(data);
  }

  getWord(data) {
    return data[0].word.charAt(0).toUpperCase() + data[0].word.slice(1);
  }

  getPhonetics(data) {
    const arr = [];
    for (let key in data) {
      for (let key1 in data[key].phonetics) {
        arr.push({ text: data[key].phonetics[key1].text, audio: data[key].phonetics[key1].audio });
      }
    }

    return arraySorter(arr.map((el) => (!el.audio || el.audio === "" || !el.text || el.text === "" ? excluder(el) : el)));

    // return arraySorter(arr.map(el => el.audio === "" ? excludeAudio(el) : el));
  }

  // getNouns(data) {
  //     const nouns = [];
  //     for (let key in data) {
  //         for (let key1 in data[key].meanings) {
  //             if (data[key].meanings[key1].partOfSpeech == "noun") {
  //                 data[key].meanings[key1].definitions.forEach(el => {
  //                     const excludeKeys = ["antonyms", "synonyms"];
  //                     const filteredArray = Object.entries(el).filter(([key]) => !excludeKeys.includes(key));
  //                     const filteredObj = Object.fromEntries(filteredArray);
  //                     nouns.push(filteredObj);
  //                 })
  //             }
  //         }
  //     }

  //     return nouns;
  // }

  // getVerbs(data) {
  //     const verbs = [];
  //     for (let key in data) {
  //         for (let key1 in data[key].meanings) {
  //             if (data[key].meanings[key1].partOfSpeech == "verb") {
  //                 data[key].meanings[key1].definitions.forEach(el => {
  //                     const excludeKeys = ["antonyms", "synonyms"];
  //                     const filteredArray = Object.entries(el).filter(([key]) => !excludeKeys.includes(key));
  //                     const filteredObj = Object.fromEntries(filteredArray);
  //                     verbs.push(filteredObj);
  //                 })
  //             }
  //         }
  //     }

  //     return verbs;
  // }

  // getAdjes(data) {
  //     const adjes = [];
  //     for (let key in data) {
  //         for (let key1 in data[key].meanings) {
  //             if (data[key].meanings[key1].partOfSpeech == "adjective") {
  //                 data[key].meanings[key1].definitions.forEach(el => {
  //                     const excludeKeys = ["antonyms", "synonyms"];
  //                     const filteredArray = Object.entries(el).filter(([key]) => !excludeKeys.includes(key));
  //                     const filteredObj = Object.fromEntries(filteredArray);
  //                     adjes.push(filteredObj);
  //                 })
  //             }
  //         }
  //     }

  //     return adjes;
  // }

  getPartOfSpeech(data) {
    const obj = {};
    for (let key in data) {
      for (let key1 in data[key].meanings) {
        SpeechParts.forEach((el) => {
          if (data[key].meanings[key1].partOfSpeech == `${el}`) {
            const arr = [];
            data[key].meanings[key1].definitions.forEach((el) => {
              const excludeKeys = ["antonyms", "synonyms"];
              const filteredArray = Object.entries(el).filter(([key]) => !excludeKeys.includes(key));
              const filteredObj = Object.fromEntries(filteredArray);
              arr.push(filteredObj);
            });
            const PartName = el;
            obj[PartName] = obj[PartName] || [];
            arr.forEach((element) => obj[PartName].push(element));
          }
        });
      }
    }

    return obj;
  }
}

function arraySorter(arr) {
  let map = {};

  arr.forEach((item) => {
    if (map[item.text]) {
      let existing = map[item.text];
      let lastValue = Object.values(existing).pop();
      if (item.audio && item.audio !== "" && item.audio !== lastValue) {
        let newKey = `audio${Object.keys(existing).length}`;
        existing[newKey] = item.audio;
      }
    } else if (map[item.audio]) {
      let existing = map[item.audio];
      let lastValue = Object.values(existing).pop();
      if (item.audio && item.audio !== "" && item.audio !== lastValue) {
        let newKey = `audio${Object.keys(existing).length}`;
        existing[newKey] = item.audio;
      }
    } else {
      if (item.text && item.text !== "") {
        map[item.text] = { ...item };
      } else if (item.audio && item.audio !== "") {
        map[item.audio] = { ...item };
      }
    }
  });

  return Object.values(map);
}

function excluder(el) {
  let excludeKeys = [];
  if (!el.audio || el.audio === "") {
    excludeKeys.push("audio");
  } else if (!el.text || el.text === "") {
    excludeKeys.push("text");
  }
  const filteredArray = Object.entries(el).filter(([key]) => !excludeKeys.includes(key));
  const filteredObj = Object.fromEntries(filteredArray);
  return filteredObj;
}

async function handleWord() {
  displayingState = true;
  const word = document.getElementById("search_text").value.trim();
  const data = await fetchInfo(word);
  if (data !== undefined) {
    const wordInst = new Word(data);
    const wrapper = document.getElementById("wordWrap");
    wrapper.innerHTML = ``;
    const full_wrapper = document.getElementById("wordInfo");
    if (!full_wrapper.classList.contains("none")) {
      full_wrapper.classList.add("none");
    }
    // setInterval(displayWordInfo(wordInst), 10000);
    displayWordInfo(wordInst);
    // console.log(wordInst.phonetics);
    // console.log(wordInst.speechParts);
  }
}

async function handleReadyWord(word, span_id) {
  document.getElementById(span_id).onclick = null;
  // word = word.trim().split('. ').splice(1).toString();
  // console.log(word);
  const data = await fetchInfo(word);
  if (data !== undefined) {
    const wordInst = new Word(data);
    const wrapper = document.getElementById("wordWrap");
    wrapper.innerHTML = ``;
    const full_wrapper = document.getElementById("wordInfo");
    if (!full_wrapper.classList.contains("none")) {
      full_wrapper.classList.add("none");
    }
    // setInterval(displayWordInfo(wordInst), 10000);
    showMain();
    displayWordInfo(wordInst, span_id);
    // console.log(wordInst.phonetics);
    // console.log(wordInst.speechParts);
  }
}

async function fetchInfo(word) {
  const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      alert(`Word not found: ${word}`);
      throw new Error(`Word not found: ${word}`);
      displayingState = false;
    }
    const data = await response.json();
    // console.log(data);

    return data;
  } catch (error) {
    displayingState = false;
    console.error("Error fetching word info:", error.message);
  }
}

let i = 1;

function displayWordInfo(word, span_id) {
  setTimeout(() => {
    if (history.includes(word.word)) {
      history.splice(history.indexOf(word.word), 1);
      history.push(word.word);
      Memory.setHistory(history);
      // loadHistory();
    } else {
      history.push(word.word);
      Memory.setHistory(history);
      // loadHistory();
    }
    // console.log(history);
    let likedState = false;
    document.getElementById("search_text").value = "";
    const wrapper = document.getElementById("wordWrap");
    const h3 = document.createElement("h3");
    h3.classList.add("word");
    h3.innerHTML = `${word.word}`;
    h3.innerHTML += `<button class="like_btt" id="like_btt" title="Add to Favorites"><i id="like_icon" class="fa-regular fa-heart"></i></button>`;
    wrapper.appendChild(h3);
    const likeButton = document.getElementById("like_btt");
    const icon = document.getElementById("like_icon");
    if (LikedWords.includes(word.word)) {
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
      likedState = true;
    }
    const h6 = document.createElement("h6");
    h6.classList.add("phonetics");
    h6.innerHTML = `Phonetics:<span class="short-space"></span>`;
    if (word.phonetics.length == 0) {
      h6.innerHTML += `unavailable`;
    }

    word.phonetics.forEach((el) => {
      if (el.text) {
        h6.innerHTML += `${el.text}`;
        if (Object.keys(el).length == 1) {
          h6.innerHTML += `<button class="audio_btt" title="Pronunciation not available"><i class="fa-solid fa-volume-xmark"></i></button>`;
        }
      }

      let audios = [];

      for (let key in el) {
        if (key !== "text") {
          if (Object.keys(el).length == 1) {
            h6.innerHTML += `[no transcription]`;
          }
          // console.log("ffff" + el[key]);
          if (!audios.includes(el[key])) {
            const PronunciationName = extractPronunciation(el[key]);
            h6.innerHTML += `<audio id="pronounceAudio${i}" src=${el[key]}></audio>
                                    <button class="audio_btt" title="Listen to pronunciation: ${PronunciationName}" onclick="playAudio(pronounceAudio${i})"><i class="fa-solid fa-volume-high"></i></button>`;

            audios.push(el[key]);
          }
        }

        i++;
      }

      h6.innerHTML += `<span class="space"></span>`;
    });

    const LineWrapper = document.getElementById("lines-wrap");
    LineWrapper.innerHTML = `<div class="definition-line"><span>definitions</span></div>`;
    SpeechParts.forEach((part) => {
      for (let key in word.speechParts) {
        if (part == key) {
          let defNumber = 1;
          LineWrapper.innerHTML += `<div class="pos-line" id="pos-line_${part}"><span>${part}</span></div><section class="verbs definitions none" id="${part}s"></section>`;
          word.speechParts[part].forEach((def) => {
            if (def.example) {
              document.getElementById(
                part + "s"
              ).innerHTML += `<h6 class="definition">${defNumber}. ${def.definition}<br><span class="example">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;example: ${def.example}</span></h6>`;
            } else {
              document.getElementById(part + "s").innerHTML += `<h6 class="definition">${defNumber}. ${def.definition}</h6>`;
            }
            defNumber++;
          });
        }
      }
    });

    wrapper.appendChild(h6);

    if (!likedState) {
      likeButton.addEventListener("mouseenter", entering);
      function entering() {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
      }

      likeButton.addEventListener("mouseleave", leaving);
      function leaving() {
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
      }
    }
    // likeButton.addEventListener('mouseenter', entering);
    // function entering() {
    //     icon.classList.remove('fa-regular');
    //     icon.classList.add('fa-solid');
    // }

    // likeButton.addEventListener('mouseleave', leaving);
    // function leaving() {
    //     icon.classList.remove('fa-solid');
    //     icon.classList.add('fa-regular');
    // }

    likeButton.addEventListener("click", () => {
      if (!likedState) {
        likeButton.removeEventListener("mouseenter", entering);
        likeButton.removeEventListener("mouseleave", leaving);
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
        likeButton.title = "Remove from Favorites";
        if (!LikedWords.includes(word.word)) LikedWords.push(word.word);
        Memory.setFavorites(LikedWords);
        // loadFavorites();
        likedState = true;
      } else if (likedState) {
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
        likeButton.addEventListener("mouseenter", entering);
        likeButton.addEventListener("mouseleave", leaving);
        likeButton.title = "Add to Favorites";
        if (LikedWords.includes(word.word)) LikedWords.splice(LikedWords.indexOf(word.word), 1);
        Memory.setFavorites(LikedWords);
        // loadFavorites();
        likedState = false;
      }
    });

    const posLines = document.querySelectorAll(".pos-line");
    posLines.forEach((line) => {
      line.addEventListener("click", () => {
        const id = line.id;
        const match = id.match(/_(.*)$/);
        const clearID = match[1];
        // console.log(clearID);
        document.getElementById(`${clearID}s`).classList.toggle("none");
        document.getElementById(`${clearID}s`).classList.toggle("visible");
      });
    });

    const full_wrapper = document.getElementById("wordInfo");
    if (full_wrapper.classList.contains("none")) full_wrapper.classList.remove("none");

    if (document.getElementById(span_id)) document.getElementById(span_id).setAttribute("onclick", "handleReadyWord(this.innerText, this.id)");
    displayingState = false;
  }, 100);
  // let likedState = false;
  // document.getElementById('search_text').value = '';
  // const wrapper = document.getElementById('wordWrap');
  // const h3 = document.createElement('h3');
  // h3.classList.add('word');
  // h3.innerHTML = `${word.word}`;
  // h3.innerHTML += `<button class="like_btt" id="like_btt" title="Add to Favorites"><i id="like_icon" class="fa-regular fa-heart"></i></button>`;
  // wrapper.appendChild(h3);
  // const likeButton = document.getElementById('like_btt');
  // const icon = document.getElementById('like_icon');
  // if (LikedWords.includes(word.word)) {
  //     icon.classList.remove('fa-regular');
  //     icon.classList.add('fa-solid');
  //     likedState = true;
  // }
  // const h6 = document.createElement('h6');
  // h6.classList.add('phonetics');
  // h6.innerHTML = `Phonetics:<span class="short-space"></span>`;
  // if (word.phonetics.length == 0) {
  //     h6.innerHTML += `unavailable`;
  // }

  // let i = 1;
  // word.phonetics.forEach(el => {
  //     if (el.text) {
  //         h6.innerHTML += `${el.text}`;
  //         if (Object.keys(el).length == 1) {
  //             h6.innerHTML += `<button class="audio_btt" title="Pronunciation not available"><i class="fa-solid fa-volume-xmark"></i></button>`;
  //         }
  //     }

  //     for (let key in el) {
  //         if (key !== "text") {
  //             if (Object.keys(el).length == 1) {
  //                 h6.innerHTML += `[no transcription]`;
  //             }
  //             const PronunciationName = extractPronunciation(el[key]);
  //             h6.innerHTML += `<audio id="pronounceAudio${i}" src=${el[key]}></audio>
  //                         <button class="audio_btt" title="Listen to pronunciation: ${PronunciationName}" onclick="document.getElementById('pronounceAudio${i}').play()"><i class="fa-solid fa-volume-high"></i></button>`;
  //         }

  //         i++;
  //     }

  //     h6.innerHTML += `<span class="space"></span>`;
  // })

  // const LineWrapper = document.getElementById('lines-wrap');
  // LineWrapper.innerHTML = `<div class="definition-line"><span>definitions</span></div>`;
  // SpeechParts.forEach(part => {
  //     for (let key in word.speechParts) {
  //         if (part == key) {
  //             let defNumber = 1;
  //             LineWrapper.innerHTML += `<div class="pos-line" id="pos-line_${part}"><span>${part}</span></div><section class="verbs definitions none" id="${part}s"></section>`;
  //             word.speechParts[part].forEach(def => {
  //                 if (def.example) {
  //                     document.getElementById(part + "s").innerHTML += `<h6 class="definition">${defNumber}. ${def.definition}<br><span class="example">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;example: ${def.example}</span></h6>`;
  //                 } else {
  //                     document.getElementById(part + "s").innerHTML += `<h6 class="definition">${defNumber}. ${def.definition}</h6>`;
  //                 }
  //                 defNumber++;
  //             })
  //         }
  //     }
  // })

  // wrapper.appendChild(h6);

  // if (!likedState) {
  //     likeButton.addEventListener('mouseenter', entering);
  //     function entering() {
  //         icon.classList.remove('fa-regular');
  //         icon.classList.add('fa-solid');
  //     }

  //     likeButton.addEventListener('mouseleave', leaving);
  //     function leaving() {
  //         icon.classList.remove('fa-solid');
  //         icon.classList.add('fa-regular');
  //     }
  // }
  // // likeButton.addEventListener('mouseenter', entering);
  // // function entering() {
  // //     icon.classList.remove('fa-regular');
  // //     icon.classList.add('fa-solid');
  // // }

  // // likeButton.addEventListener('mouseleave', leaving);
  // // function leaving() {
  // //     icon.classList.remove('fa-solid');
  // //     icon.classList.add('fa-regular');
  // // }

  // likeButton.addEventListener('click', () => {
  //     if (!likedState) {
  //         likeButton.removeEventListener('mouseenter', entering);
  //         likeButton.removeEventListener('mouseleave', leaving);
  //         icon.classList.remove('fa-regular');
  //         icon.classList.add('fa-solid');
  //         likeButton.title = "Remove from Favorites";
  //         if (!LikedWords.includes(word.word)) LikedWords.push(word.word);
  //         Memory.setFavorites(LikedWords);
  //         likedState = true;
  //     } else if (likedState) {
  //         icon.classList.remove('fa-solid');
  //         icon.classList.add('fa-regular');
  //         likeButton.addEventListener('mouseenter', entering);
  //         likeButton.addEventListener('mouseleave', leaving);
  //         likeButton.title = "Add to Favorites";
  //         if (LikedWords.includes(word.word)) LikedWords.splice(LikedWords.indexOf(word.word), 1);
  //         Memory.setFavorites(LikedWords);
  //         likedState = false;
  //     }
  // })

  // const posLines = document.querySelectorAll('.pos-line');
  //   posLines.forEach(line => {
  //     line.addEventListener('click', () => {
  //         const id = line.id;
  //         const match = id.match(/_(.*)$/);
  //         const clearID = match[1];
  //         console.log(clearID);
  //         document.getElementById(`${clearID}s`).classList.toggle('none');
  //         document.getElementById(`${clearID}s`).classList.toggle('visible');
  //     })
  //   })
}

let audioPlayState = false;
function playAudio(id) {
  if (audioPlayState !== true) {
    // console.log(document.getElementById(id.id));
    document.getElementById(id.id).play();
    audioPlayState = true;
  }

  document.getElementById(id.id).addEventListener("ended", () => (audioPlayState = false));
}

function extractPronunciation(url) {
  const match = url.match(/\/en\/(.*?)\.mp3/);
  return match ? match[1] : null;
}

function showMain() {
  if (currentPage !== "main") {
    if (currentPage == "history") {
      const history = document.getElementById("history-wrap");
      history.classList.remove("visible");
      history.classList.add("none");
    }
    if (currentPage == "favorites") {
      const favorites = document.getElementById("favorites-wrap");
      favorites.classList.remove("visible");
      favorites.classList.add("none");
    }
    const wrapper = document.getElementById("wordInfo");
    wrapper.classList.add("none");
    document.getElementById("search_text").value = "";
    const main = document.getElementById("main");
    main.classList.remove("none");
    currentPage = "main";
  }
}
function showHistory() {
  if (currentPage !== "history") {
    if (currentPage == "main") {
      const main = document.getElementById("main");
      main.classList.add("none");
    }
    if (currentPage == "favorites") {
      const favorites = document.getElementById("favorites-wrap");
      favorites.classList.remove("visible");
      favorites.classList.add("none");
    }
    loadHistory();
    const history = document.getElementById("history-wrap");
    history.classList.remove("none");
    history.classList.add("visible");
    currentPage = "history";
  }
}
function showFavorites() {
  if (currentPage !== "favorites") {
    if (currentPage == "history") {
      const history = document.getElementById("history-wrap");
      history.classList.remove("visible");
      history.classList.add("none");
    }
    if (currentPage == "main") {
      const main = document.getElementById("main");
      main.classList.add("none");
    }
    loadFavorites();
    const favorites = document.getElementById("favorites-wrap");
    favorites.classList.remove("none");
    favorites.classList.add("visible");
    currentPage = "favorites";
  }
}

function loadHistory() {
  let wordCount = 1;
  const wrapper = document.getElementById("history");
  wrapper.innerHTML = ``;
  history
    .slice()
    .reverse()
    .forEach((el) => {
      wrapper.innerHTML += `<h5 class="historyH5" id="${wordCount}">${wordCount}. <span class="favorite-word" id="history-span-${wordCount}" onclick="handleReadyWord(this.innerText, this.id)">${el}</span></h5>`;
      // h3.innerHTML += `<button class="like_btt" id="like_btt" title="Add to Favorites"><i id="like_icon" class="fa-regular fa-heart"></i></button>`;
      wordCount++;
    });
}

function loadFavorites() {
  let wordCount = 1;
  const wrapper = document.getElementById("favorites");
  wrapper.innerHTML = ``;
  let html = "";

  LikedWords.slice()
    .reverse()
    .forEach((el) => {
      html += `
        <h5 class="favorite" id="h5-${wordCount}">${wordCount}. 
            <span id="span-${wordCount}" class="favorite-word" ID="${wordCount}" onclick="handleReadyWord(this.innerText, this.id)">${el}</span>
            <button class="like_btt_small" id="like_btt_small-${wordCount}" ID="${wordCount}" data-liked-state="true" title="Remove from Favorites">
            <i id="like_icon-${wordCount}" class="fa-solid fa-heart icon_small" ID="${wordCount}"></i>
            </button>
        </h5>
        `;
      wordCount++;
    });

  wrapper.innerHTML = html;
  // document.getElementById(`like_btt_small-${wordCount - 1}`).setAttribute("likedState", "true");
  // const parent = document.querySelector('.favorite');
  // console.log(parent.childNodes[0].textContent.trim().split('. ').splice(1));
  // const btt = document.querySelector('.like_btt_small');
  // console.log(btt.parentElement)
  // bttEventDelegation();

  // LikedWords.slice().reverse().forEach(el => {
  //     let likedState = true;

  //     document.getElementById(`like_btt_small-${wordCount1}`).addEventListener('click', () => {
  //         if (!likedState) {
  //             document.getElementById(`like_btt_small-${wordCount1}`).removeEventListener('mouseenter', entering);
  //             document.getElementById(`like_btt_small-${wordCount1}`).removeEventListener('mouseleave', leaving);
  //             document.getElementById(`like_icon-${wordCount1}`).classList.remove('fa-regular');
  //             document.getElementById(`like_icon-${wordCount1}`).classList.add('fa-solid');
  //             document.getElementById(`like_btt_small-${wordCount1}`).title = "Remove from Favorites";
  //             if (!LikedWords.includes(el)) LikedWords.push(el);
  //             Memory.setFavorites(LikedWords);
  //             likedState = true;
  //         } else if (likedState) {
  //             console.log('works');
  //             document.getElementById(`like_icon-${wordCount1}`).classList.remove('fa-solid');
  //             document.getElementById(`like_icon-${wordCount1}`).classList.add('fa-regular');
  //             document.getElementById(`like_btt_small-${wordCount1}`).addEventListener('mouseenter', entering);
  //             document.getElementById(`like_btt_small-${wordCount1}`).addEventListener('mouseleave', leaving);
  //             document.getElementById(`like_btt_small-${wordCount1}`).title = "Add to Favorites";
  //             if (LikedWords.includes(el)) LikedWords.splice(LikedWords.indexOf(el), 1);
  //             Memory.setFavorites(LikedWords);
  //             likedState = false;
  //         }
  //     })

  //     if (!likedState) {
  //         document.getElementById(`like_btt_small-${wordCount1}`).addEventListener('mouseenter', entering);
  //         function entering() {
  //             document.getElementById(`like_icon-${wordCount1}`).classList.remove('fa-regular');
  //             document.getElementById(`like_icon-${wordCount1}`).classList.add('fa-solid');
  //         }

  //         document.getElementById(`like_btt_small-${wordCount1}`).addEventListener('mouseleave', leaving);
  //         function leaving() {
  //             document.getElementById(`like_icon-${wordCount1}`).classList.remove('fa-solid');
  //             document.getElementById(`like_icon-${wordCount1}`).classList.add('fa-regular');
  //         }
  //     }
  //     wordCount1++;
  // })
}

// wrapper.innerHTML += `<h5 class="favorite-word">${wordCount}. ${el}&nbsp;&nbsp;&nbsp;(<button class="like_btt_small" id="like_btt_small-${wordCount}" title="Add to Favorites"><i id="like_icon-${wordCount}" class="fa-solid fa-heart"></i></button>&nbsp;&nbsp;)</h5>`;
// MAINwrapper.innerHTML += `<h5 class="favorite-word">${wordCount}. ${el}<button class="like_btt_small" id="like_btt_small-${wordCount}" title="Remove from Favorites"><i id="like_icon-${wordCount}" class="fa-solid fa-heart icon_small"></i></button></h5>`;

// const likeButton = document.getElementById(`like_btt_small-${wordCount}`);
// const icon = document.getElementById(`like_icon-${wordCount}`);

// function bttEventDelegation() {
//     // const favoriteWords = document.querySelectorAll('.favorite-word');
//     // favoriteWords.forEach(el =>)
//     document.getElementById('favorites').addEventListener('click', (e) => {
//         console.log(e.target);
//         const button = e.target.closest(".like_btt_small");
//         button.likedState = true;
//         // if (!button) console.log(e.target.childNodes);
//         if (button) {
//             // if (document.getElementById(button.id).querySelector('i').classList.contains('fa-solid')) {
//             //     button.likedState = true;
//             // } else {
//             //     button.likedState = false;
//             // }

//             if (!button.likedState) {
//                 document.getElementById(button.id).addEventListener('mouseenter', entering);
//                 function entering() {
//                     document.getElementById(button.id).querySelector('i').classList.remove('fa-regular');
//                     document.getElementById(button.id).querySelector('i').classList.add('fa-solid');
//                 }

//                 document.getElementById(button.id).addEventListener('mouseleave', leaving);
//                 function leaving() {
//                     document.getElementById(button.id).querySelector('i').classList.remove('fa-solid');
//                     document.getElementById(button.id).querySelector('i').classList.add('fa-regular');
//                 }
//             }

//             // console.log(button.parentElement.childNodes[1].innerText);

//             if (!button.likedState) {
//                 document.getElementById(button.id).removeEventListener('mouseenter', entering);
//                 document.getElementById(button.id).removeEventListener('mouseleave', leaving);
//                 document.getElementById(button.id).querySelector('i').classList.remove('fa-regular');
//                 document.getElementById(button.id).querySelector('i').classList.add('fa-solid');
//                 document.getElementById(button.id).title = "Remove from Favorites";
//                 if (!LikedWords.includes(button.parentElement.childNodes[1].innerText)) LikedWords.push(button.parentElement.childNodes[1].innerText);
//                 // console.log(button.parentElement.childNodes[0].classList);
//                 console.log("button add " + LikedWords);
//                 Memory.setFavorites(LikedWords);
//                 button.likedState = true;
//             } else if (button.likedState) {
//                 // console.log(button.parentElement.childNodes[0].textContent.trim().split('. ').splice(1).toString().toString());
//                 // console.log('works');
//                 document.getElementById(button.id).querySelector('i').classList.remove('fa-solid');
//                 document.getElementById(button.id).querySelector('i').classList.add('fa-regular');
//                 document.getElementById(button.id).addEventListener('mouseenter', entering);
//                 document.getElementById(button.id).addEventListener('mouseleave', leaving);
//                 document.getElementById(button.id).title = "Add to Favorites";
//                 // console.log(button.parentElement.childNodes);
//                 // console.log(button.parentElement.childNodes[1].innerText.trim().split('. ').splice(1).toString());
//                 if (LikedWords.includes(button.parentElement.childNodes[1].innerText)) LikedWords.splice(LikedWords.indexOf(button.parentElement.childNodes[1].innerText), 1);
//                 console.log("button delete " + LikedWords);
//                 Memory.setFavorites(LikedWords);
//                 button.likedState = false;
//             }
//         } else {
//             console.log("ID: " + e.target.id);
//             const idParts = e.target.id.split("-");
//             const ID = idParts[idParts.length - 1];
//             const real_button = document.getElementById(`like_btt_small-${ID}`);
//             real_button.likedState = true;
//             // console.log(real_button.parentElement.childNodes[1].innerText);
//             // if (document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.contains('fa-solid')) {
//             //     real_button.likedState = true;
//             // } else {
//             //     real_button.likedState = false;
//             // }

//             if (!real_button.likedState) {
//                 document.getElementById(`like_btt_small-${ID}`).addEventListener('mouseenter', entering);
//                 function entering() {
//                     document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.remove('fa-regular');
//                     document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.add('fa-solid');
//                 }

//                 document.getElementById(`like_btt_small-${ID}`).addEventListener('mouseleave', leaving);
//                 function leaving() {
//                     document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.remove('fa-solid');
//                     document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.add('fa-regular');
//                 }
//             }

//             if (!real_button.likedState) {
//                 document.getElementById(`like_btt_small-${ID}`).removeEventListener('mouseenter', entering);
//                 document.getElementById(`like_btt_small-${ID}`).removeEventListener('mouseleave', leaving);
//                 document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.remove('fa-regular');
//                 document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.add('fa-solid');
//                 document.getElementById(`like_btt_small-${ID}`).title = "Remove from Favorites";
//                 if (!LikedWords.includes(real_button.parentElement.childNodes[1].innerText)) LikedWords.push(real_button.parentElement.childNodes[1].innerText);
//                 console.log("not a button add " + LikedWords);
//                 Memory.setFavorites(LikedWords);
//                 real_button.likedState = true;
//             } else if (real_button.likedState) {
//                 // console.log(real_button.parentElement.childNodes[1].innerText.trim().split('. ').splice(1).toString().toString());
//                 // console.log('works');
//                 document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.remove('fa-solid');
//                 document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.add('fa-regular');
//                 document.getElementById(`like_btt_small-${ID}`).addEventListener('mouseenter', entering);
//                 document.getElementById(`like_btt_small-${ID}`).addEventListener('mouseleave', leaving);
//                 document.getElementById(`like_btt_small-${ID}`).title = "Add to Favorites";
//                 if (LikedWords.includes(real_button.parentElement.childNodes[1].innerText)) LikedWords.splice(LikedWords.indexOf(real_button.parentElement.childNodes[1].innerText), 1);
//                 console.log("not a button delete " + LikedWords);
//                 Memory.setFavorites(LikedWords);
//                 real_button.likedState = false;
//             }
//         }
//     })
// }

function bttEventDelegation() {
  // const favoriteWords = document.querySelectorAll('.favorite-word');
  // favoriteWords.forEach(el =>)
  const favoritesEl = document.getElementById("favorites");
  favoritesEl.removeEventListener("click", onFavoritesClick);
  favoritesEl.addEventListener("click", onFavoritesClick);

  function onFavoritesClick(e) {
    // const button = e.target.closest(".like_btt_small");
    // button.likedState = true;
    // if (!button) console.log(e.target.childNodes);

    const idParts = e.target.id.split("-");
    const ID = idParts[idParts.length - 1];
    const real_button = document.getElementById(`like_btt_small-${ID}`);
    // real_button.likedState = true;
    // real_button.setAttribute("likedState", "true");
    // console.log(real_button.parentElement.childNodes[1].innerText);
    // if (document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.contains('fa-solid')) {
    //     real_button.likedState = true;
    // } else {
    //     real_button.likedState = false;
    // }

    if (e.target.tagName === "BUTTON" || e.target.tagName === "I") {
      if (real_button.getAttribute("data-liked-state") == "false") {
        document.getElementById(`like_btt_small-${ID}`).addEventListener("mouseenter", entering);
        function entering() {
          document.getElementById(`like_btt_small-${ID}`).querySelector("i").classList.remove("fa-regular");
          document.getElementById(`like_btt_small-${ID}`).querySelector("i").classList.add("fa-solid");
        }

        document.getElementById(`like_btt_small-${ID}`).addEventListener("mouseleave", leaving);
        function leaving() {
          document.getElementById(`like_btt_small-${ID}`).querySelector("i").classList.remove("fa-solid");
          document.getElementById(`like_btt_small-${ID}`).querySelector("i").classList.add("fa-regular");
        }
      }

      if (real_button.getAttribute("data-liked-state") == "false") {
        document.getElementById(`like_btt_small-${ID}`).removeEventListener("mouseenter", entering);
        document.getElementById(`like_btt_small-${ID}`).removeEventListener("mouseleave", leaving);
        document.getElementById(`like_btt_small-${ID}`).querySelector("i").classList.remove("fa-regular");
        document.getElementById(`like_btt_small-${ID}`).querySelector("i").classList.add("fa-solid");
        document.getElementById(`like_btt_small-${ID}`).title = "Remove from Favorites";
        if (!LikedWords.includes(real_button.parentElement.childNodes[1].innerText)) LikedWords.push(real_button.parentElement.childNodes[1].innerText);
        real_button.setAttribute("data-liked-state", "true");
        Memory.setFavorites(LikedWords);
      } else if (real_button.getAttribute("data-liked-state") == "true") {
        // console.log(real_button.parentElement.childNodes[1].innerText.trim().split('. ').splice(1).toString().toString());
        // console.log('works');
        document.getElementById(`like_btt_small-${ID}`).querySelector("i").classList.remove("fa-solid");
        document.getElementById(`like_btt_small-${ID}`).querySelector("i").classList.add("fa-regular");
        document.getElementById(`like_btt_small-${ID}`).addEventListener("mouseenter", entering);
        document.getElementById(`like_btt_small-${ID}`).addEventListener("mouseleave", leaving);
        document.getElementById(`like_btt_small-${ID}`).title = "Add to Favorites";
        if (LikedWords.includes(real_button.parentElement.childNodes[1].innerText)) LikedWords.splice(LikedWords.indexOf(real_button.parentElement.childNodes[1].innerText), 1);
        real_button.setAttribute("data-liked-state", "false");
        Memory.setFavorites(LikedWords);
      }
    }
  }

  // document.getElementById('favorites').addEventListener('click', (e) => {
  //     console.log(e.target);
  //     // const button = e.target.closest(".like_btt_small");
  //     // button.likedState = true;
  //     // if (!button) console.log(e.target.childNodes);

  //     console.log("ID: " + e.target.id);
  //     const idParts = e.target.id.split("-");
  //     const ID = idParts[idParts.length - 1];
  //     const real_button = document.getElementById(`like_btt_small-${ID}`);
  //     // real_button.likedState = true;
  //     // real_button.setAttribute("likedState", "true");
  //     // console.log(real_button.parentElement.childNodes[1].innerText);
  //     // if (document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.contains('fa-solid')) {
  //     //     real_button.likedState = true;
  //     // } else {
  //     //     real_button.likedState = false;
  //     // }

  //     if (real_button.getAttribute("data-liked-state") == "false") {
  //         document.getElementById(`like_btt_small-${ID}`).addEventListener('mouseenter', entering);
  //         function entering() {
  //             document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.remove('fa-regular');
  //             document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.add('fa-solid');
  //         }

  //         document.getElementById(`like_btt_small-${ID}`).addEventListener('mouseleave', leaving);
  //         function leaving() {
  //             document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.remove('fa-solid');
  //             document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.add('fa-regular');
  //         }
  //     }

  //     if (real_button.getAttribute("data-liked-state") == "false") {
  //         console.log('works');
  //         document.getElementById(`like_btt_small-${ID}`).removeEventListener('mouseenter', entering);
  //         document.getElementById(`like_btt_small-${ID}`).removeEventListener('mouseleave', leaving);
  //         document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.remove('fa-regular');
  //         document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.add('fa-solid');
  //         document.getElementById(`like_btt_small-${ID}`).title = "Remove from Favorites";
  //         if (!LikedWords.includes(real_button.parentElement.childNodes[1].innerText)) LikedWords.push(real_button.parentElement.childNodes[1].innerText);
  //         console.log("not a button add " + LikedWords);
  //         real_button.setAttribute("data-liked-state", "true");
  //         Memory.setFavorites(LikedWords);
  //     } else if (real_button.getAttribute("data-liked-state") == "true") {
  //         // console.log(real_button.parentElement.childNodes[1].innerText.trim().split('. ').splice(1).toString().toString());
  //         // console.log('works');
  //         document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.remove('fa-solid');
  //         document.getElementById(`like_btt_small-${ID}`).querySelector('i').classList.add('fa-regular');
  //         document.getElementById(`like_btt_small-${ID}`).addEventListener('mouseenter', entering);
  //         document.getElementById(`like_btt_small-${ID}`).addEventListener('mouseleave', leaving);
  //         document.getElementById(`like_btt_small-${ID}`).title = "Add to Favorites";
  //         if (LikedWords.includes(real_button.parentElement.childNodes[1].innerText)) LikedWords.splice(LikedWords.indexOf(real_button.parentElement.childNodes[1].innerText), 1);
  //         console.log("not a button delete " + LikedWords);
  //         real_button.setAttribute("data-liked-state", "false");
  //         Memory.setFavorites(LikedWords);
  //     }
  // })
}
