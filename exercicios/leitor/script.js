let words = []
let index = 0
let timer = null
let paused = false
let speed = 300
let readingMode = false
let exampleTexts = []
let lastExampleIndex = -1

function startReading(){
    const text = document.getElementById("textInput").value.trim()
    if(text === ""){
        alert("Insira um texto para iniciar a leitura.")
        return
    }

    words = text.split(/\s+/)
    index = 0

    const wpm = parseInt(document.getElementById("speedInput").value)
    speed = 60000 / wpm

    readingMode = true

    const editor = document.getElementById("editorContainer")
    editor.classList.add("hidden")
    editor.classList.remove("overlay")

    document.getElementById("controlPanel").classList.remove("hidden")
    document.getElementById("speedPanel").classList.remove("hidden")

    updateSpeedLabel()

    paused = false
    showWord()
    restartTimer()
}

function restartTimer(){
    if(timer) clearInterval(timer)
    timer = setInterval(nextWord, speed)
}

function showWord(){
    if(index < 0) index = 0
    if(index >= words.length) index = words.length - 1

    const word = words[index]
    const display = document.getElementById("wordDisplay")

    display.textContent = word

    if(word.length > 12){
        display.style.fontSize = 'clamp(24px,6vw,48px)'
    }else{
        display.style.fontSize = 'clamp(36px,8vw,72px)'
    }

    document.getElementById("progress").textContent =
        (index + 1) + " / " + words.length
}

function nextWord(){
    if(paused) return

    index++

    if(index >= words.length){
        clearInterval(timer)
        return
    }

    showWord()

    let delay = speed

    if(/[.,;:!?]$/.test(words[index])){
        delay = speed * 2
    }

    clearInterval(timer)
    timer = setInterval(nextWord, delay)
}

function togglePlay(){
    if(!readingMode) return

    paused = !paused

    document.getElementById("playBtn").textContent =
        paused ? "⏯️" : "⏸️"
}

function back1(){ index--; showWord() }
function forward1(){ index++; showWord() }
function back10(){ index -= 10; showWord() }
function forward10(){ index += 10; showWord() }

function changeSpeed(delta){
    let wpm = Math.round(60000 / speed)

    wpm += delta

    if(wpm < 60) wpm = 60

    speed = 60000 / wpm

    updateSpeedLabel()

    restartTimer()
}

function updateSpeedLabel(){
    const wpm = Math.round(60000 / speed)

    document.getElementById("speedValue").textContent =
        wpm + " WPM"
}

function showEditor(){
    readingMode = false

    const editor = document.getElementById("editorContainer")

    editor.classList.remove("hidden")
    editor.classList.add("overlay")

    document.getElementById("controlPanel").classList.add("hidden")
    document.getElementById("speedPanel").classList.add("hidden")
}

document.addEventListener("keydown", function(e){

    if(!readingMode) return

    switch(e.code){

        case "Space":
            e.preventDefault()
            togglePlay()
        break

        case "ArrowRight":
            forward1()
        break

        case "ArrowLeft":
            back1()
        break

        case "ArrowUp":
            changeSpeed(10)
        break

        case "ArrowDown":
            changeSpeed(-10)
        break
    }
})

function fillExampleText(){

    if(exampleTexts.length === 0){
        console.log("Exemplos ainda não carregados")
        return
    }

    let randomIndex

    do{
        randomIndex = Math.floor(Math.random()*exampleTexts.length)
    }
    while(randomIndex === lastExampleIndex)

    lastExampleIndex = randomIndex

    document.getElementById("textInput").value =
        exampleTexts[randomIndex]
}

function clearText(){
    document.getElementById("textInput").value = ""
}

async function loadExamples(){

    try{

        const response = await fetch("texto.json")

        const data = await response.json()

        exampleTexts = data.texts

    }
    catch(error){

        console.error("Erro ao carregar exemplos:", error)

    }
}

loadExamples()

/* DETECTAR MUDANÇA DE ORIENTAÇÃO */

window.addEventListener("resize", handleOrientation)

function handleOrientation(){

    const orientation =
        window.innerWidth > window.innerHeight
        ? "landscape"
        : "portrait"

    document.body.dataset.orientation = orientation
}

handleOrientation()