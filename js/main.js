const COMBAT_TAG = "combat";
const LIGHT_BLUE = "#4646fc";
const DARK_BLUE = "#00008b";
const LIGHT_COMBAT = "#b84747";
const DARK_COMBAT = "#5b0202";

var currentPlayingObj = null;

function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

function generateNewConfig() {
    var out = [];
    files.forEach(sing => {
        console.log(sing);
        var obj = {
            "file": sing,
            "tags": [],
            "displayName": sing
        }
        out.push(obj)
    })
    downloadObjectAsJson(out, "config");
}

function percentage(partialValue, totalValue) {
    return (100 * partialValue) / totalValue;
}

function currentTimeStamp(current) {
    return Math.round(current * 10) / 10; //round to 1 decimal place
}

function stopPlayWithConfig(obj) {
    document.getElementById(obj.file).pause();
    document.getElementById(obj.file).currentTime = 0;
    if (obj.tags.includes(COMBAT_TAG)) {
        document.getElementById(`${obj.file}-block`).style.backgroundColor = LIGHT_COMBAT;
    } else {
        document.getElementById(`${obj.file}-block`).style.backgroundColor = LIGHT_BLUE;
    }
}

function pausePlayWithConfig(obj) {
    document.getElementById(obj.file).pause();
    if (obj.tags.includes(COMBAT_TAG)) {
        document.getElementById(`${obj.file}-block`).style.backgroundColor = LIGHT_COMBAT;
    } else {
        document.getElementById(`${obj.file}-block`).style.backgroundColor = LIGHT_BLUE;
    }
}

function upVolume(id) {
    if (parseFloat(document.getElementById(id).volume) < 1) {
        var vol = document.getElementById(id).volume;
        currentVolume = Math.round((vol + 0.1) * 10) / 10;
        document.getElementById(id).volume = currentVolume;
        document.getElementById(id + "-vol").innerHTML = currentVolume;
    }
}

function downVolume(id) {
    if (parseFloat(document.getElementById(id).volume) > 0) {
        var vol = document.getElementById(id).volume;
        currentVolume = Math.round((vol - 0.1) * 10) / 10;
        document.getElementById(id).volume = currentVolume;
        document.getElementById(id + "-vol").innerHTML = currentVolume;
    }
}


function playFuncWithConfig(obj) {
    currentPlayingObj = obj;
    document.getElementById("audio-top").innerHTML = currentPlayingObj.file;
    document.getElementById(obj.file).play();
    document.getElementById(obj.file).addEventListener('timeupdate', (timeObj) => {
        document.getElementById(`${obj.file}-time`).innerHTML = `${percentage(document.getElementById(obj.file).currentTime, document.getElementById(obj.file).duration).toFixed(0)}% (${currentTimeStamp(document.getElementById(obj.file).currentTime)})`;
    })
    if (obj.tags.includes(COMBAT_TAG)) {
        document.getElementById(`${obj.file}-block`).style.backgroundColor = DARK_COMBAT;
    } else {
        document.getElementById(`${obj.file}-block`).style.backgroundColor = DARK_BLUE;
    }
    config.forEach(file => {
        if (file.file != obj.file) {
            document.getElementById(file.file).pause();
            if (file.tags.includes(COMBAT_TAG)) {
                document.getElementById(`${file.file}-block`).style.backgroundColor = LIGHT_COMBAT;
            } else {
                document.getElementById(`${file.file}-block`).style.backgroundColor = LIGHT_BLUE;
            }
        }
    });
}

function loadSingleAudioBlock(configObject) {
    let backColour = LIGHT_BLUE;
    if (configObject.tags.includes(COMBAT_TAG)) {
        backColour = LIGHT_COMBAT;
    }

    var tags = "<div class='audio-tags'>";
    configObject.tags.forEach(tag => {
        tags += `${tag}, `;
    })
    tags += "</div>";

    let block = createElementFromHTML(`
        <div class="audio-block" id="${configObject.file}-block" style="background-color: ${backColour}">
            <div class="progress-bar" id="${configObject.file}-progress"></div>
            <p class="audio-label"><span id="${configObject.file}-status" class="statusDiv"></span>${configObject.displayName}</p>
            ${tags}
            <p class="audio-time" id="${configObject.file}-time"></p>
            <p class="audio-vol" id="${configObject.file}-vol"></p>
            <div class="button-div">
                <button id="${configObject.file}-pause" class="audio-pause audio-control-button">P</button>
                <button id="${configObject.file}-up" class="audio-up audio-control-button">^</button>
                <button id="${configObject.file}-down" class="audio-down audio-control-button">v</button>
                <button id="${configObject.file}-reset" class="audio-reset audio-control-button">x</button>
            </div>
            <audio id="${configObject.file}" class="audio-player" src="audio/${configObject.file}.mp3" type="mp3"></audio>
        </div>
        `)

    document.getElementById("audio-container").appendChild(block);

    document.getElementById(`${configObject.file}-block`).addEventListener('click', () => {
        playFuncWithConfig(configObject);
    });

    document.getElementById(`${configObject.file}-pause`).addEventListener('click', e => {
        pausePlayWithConfig(configObject);
        clearTimeout(timer);
        e.stopPropagation();
    });

    document.getElementById(`${configObject.file}-up`).addEventListener('click', e => {
        upVolume(configObject.file);
        e.stopPropagation();
    });

    document.getElementById(`${configObject.file}-down`).addEventListener('click', e => {
        downVolume(configObject.file);
        e.stopPropagation();
    });

    document.getElementById(`${configObject.file}-reset`).addEventListener('click', e => {
        stopPlayWithConfig(configObject);
        e.stopPropagation();
    });

    //AUDIO ELEMENT
    document.getElementById(configObject.file).addEventListener('canplaythrough', () => {
        document.getElementById(`${configObject.file}-status`).style.backgroundColor = "lightGreen";
    });

    //AUDIO ELEMENT
    document.getElementById(configObject.file).addEventListener("ended", () => {
        document.getElementById(currentPlayingObj.file).play();
        playFuncWithConfig(currentPlayingObj);
    });

    //AUDIO ELEMENT
    document.getElementById(configObject.file).addEventListener('playing', event => {
        advanceProgressBar(event.target.duration, document.getElementById(configObject.file), configObject.file);
    });

}
var timer;
var percentages = {};
function advanceProgressBar(duration, element, id) {
    var progress = document.getElementById(`${id}-progress`);
    increment = 10 / duration
    percentages.id = Math.min(increment * element.currentTime * 10, 100);
    progress.style.width = percentages.id + '%';
    startTimer(duration, element, id);
}

function startTimer(duration, element, id) {
    if (percentages.id < 100) {  
        timer = setTimeout(function () { advanceProgressBar(duration, element, id) }, 100);
    } else {
        clearTimeout(timer);
    }
}

function loaded() {
    if (config) {
        document.getElementById("config-missing").style.display = "none";
        config.forEach(obj => {
            loadSingleAudioBlock(obj, "test");
        });
    }
}