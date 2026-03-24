const ReadZen = (function(){

let words = []
let index = 0
let timer = null
let isPaused = false

let root, overlay, container, reader, toast

const speedLevels = [
    { name: "Iniciante", wpm: 120 },
    { name: "Respirar", wpm: 180 },
    { name: "Fluir", wpm: 240 },
    { name: "Foco", wpm: 300 },
    { name: "Ritmo", wpm: 380 },
    { name: "Zen", wpm: 460 },
    { name: "Super-Zen", wpm: 540 }
]

let currentLevel = 2
let speed = 60000 / speedLevels[currentLevel].wpm

let exampleTexts = []

function startFromPageDirect(){
    let content = document.querySelector(".rz-content")

    if(!content) return

    let text = content.innerText

    if(!text || text.trim() === "") return

    startReading(text)
}

function init(){
    const heroBtn = document.getElementById("startReadZenHero")
        if(heroBtn){
            heroBtn.addEventListener("click", startFromPageDirect)
        }

    loadTexts()

    const btn = document.getElementById("openReadZen")
    if(btn){
        btn.addEventListener("click", openMenu)
    }
}

async function loadTexts(){
    try{
        const res = await fetch("texto.json")
        const data = await res.json()
        exampleTexts = data.texts || []
    }catch(e){
        console.error("Erro ao carregar textos", e)
    }
}

function createRoot(){
    root = document.createElement("div")
    root.id = "readzen-root"
    document.body.appendChild(root)
}

function injectCSS(){
    if(document.getElementById("readzen-style")) return

    const link = document.createElement("link")
    link.id = "readzen-style"
    link.rel = "stylesheet"
    link.href = "readzen.css"
    document.head.appendChild(link)
}

function createOverlay(){
    overlay = document.createElement("div")
    overlay.id = "readzen-overlay"
    root.appendChild(overlay)
}

function openMenu(){
    if(!root){
        createRoot()
        injectCSS()
        createOverlay()
    }

    overlay.innerHTML = `
        <div id="readzen-menu">

            <div class="rz-header">
                <h2>ReadZen - Como deseja ler?</h2>

                <div class="rz-speed-inline">
                    <button id="menu-speed-down">-</button>
                    <span id="menu-speed-label">${speedLevels[currentLevel].name}</span>
                    <button id="menu-speed-up">+</button>
                </div>
            </div>

            <div class="rz-actions">
                <button data-mode="page">Esta Página</button>
                <button data-mode="example">Texto de Exemplo</button>
                <button data-mode="custom">Texto Personalizado</button>
            </div>

            <button id="closeReadZen">Fechar</button>
        </div>
    `

    setTimeout(showMenuToast, 200)

    overlay.onclick = function(e){

        const mode = e.target.dataset.mode

        if(mode === "page"){
            startReading(getPageText())
        }

        if(mode === "example"){
            if(exampleTexts.length > 0){
                const random = Math.floor(Math.random() * exampleTexts.length)
                startReading(exampleTexts[random])
            }else{
                startReading("Texto de exemplo não carregado.")
            }
        }

        if(mode === "custom"){
            openCustomInput()
        }

        if(e.target.id === "menu-speed-down" && currentLevel > 0){
            currentLevel--
            updateMenuSpeed()
            showMenuToast()
        }

        if(e.target.id === "menu-speed-up" && currentLevel < speedLevels.length - 1){
            currentLevel++
            updateMenuSpeed()
            showMenuToast()
        }

        if(e.target.id === "closeReadZen"){
            destroy()
        }
    }
}

function updateMenuSpeed(){
    const label = document.getElementById("menu-speed-label")
    if(label){
        label.textContent = speedLevels[currentLevel].name
    }
}

function showMenuToast(){
    let toast = document.getElementById("rz-menu-toast")

    if(!toast){
        toast = document.createElement("div")
        toast.id = "rz-menu-toast"
        overlay.appendChild(toast)
    }

    const lvl = speedLevels[currentLevel]
    toast.textContent = `${lvl.name} • ${lvl.wpm} WPM`

    toast.classList.add("show")

    clearTimeout(toast._timer)
    toast._timer = setTimeout(() => {
        toast.classList.remove("show")
    }, 1200)
}

function openCustomInput(){
    overlay.innerHTML = `
        <div id="readzen-input">
            <h2>Digite seu texto</h2>
            <textarea id="rz-text"></textarea>
            <br><br>
            <button id="startCustom">Iniciar</button>
            <button id="backMenu">Voltar</button>
        </div>
    `

    overlay.onclick = function(e){
        if(e.target.id === "startCustom"){
            const text = document.getElementById("rz-text").value
            startReading(text)
        }

        if(e.target.id === "backMenu"){
            openMenu()
        }
    }
}

function getPageText(){
    const content = document.querySelector(".rz-content")
    if(!content) return ""

    const paragraphs = content.querySelectorAll("p")

    let text = ""
    paragraphs.forEach(p => text += p.innerText + " ")

    return text
}

function getDelay(word){
    let base = speed

    const lengthFactor = Math.min(word.length / 5, 2)
    base *= (1 + lengthFactor * 0.3)

    if(/[,]/.test(word)) base *= 1.4
    if(/[.!?]/.test(word)) base *= 2
    if(/[:;]/.test(word)) base *= 1.6

    return base
}

function startReading(text){
    if(!text || text.trim() === "") return

    words = text.split(/\s+/)
    index = 0
    isPaused = false
    updateSpeed()

    overlay.innerHTML = ""

    container = document.createElement("div")
    container.id = "readzen-container"
    overlay.appendChild(container)

    const controls = document.createElement("div")
    controls.id = "readzen-controls"
    controls.innerHTML = `
        <button id="speed-down">-</button>
        <span id="speed-label">${speedLevels[currentLevel].name}</span>
        <button id="speed-up">+</button>
    `
    container.appendChild(controls)

    reader = document.createElement("div")
    reader.id = "readzen-reader"
    container.appendChild(reader)

    toast = document.createElement("div")
    toast.id = "rz-speed-toast"
    container.appendChild(toast)

    controls.onclick = function(e){
        if(e.target.id === "speed-down" && currentLevel > 0){
            currentLevel--
            updateSpeed()
            showToast()
        }

        if(e.target.id === "speed-up" && currentLevel < speedLevels.length - 1){
            currentLevel++
            updateSpeed()
            showToast()
        }
    }

    overlay.onclick = function(e){

        if(e.target.id === "readzen-overlay"){
            destroy()
            return
        }

        if(e.target.id === "readzen-reader"){
            isPaused = !isPaused
            reader.style.opacity = isPaused ? "0.5" : "1"
        }
    }

    document.addEventListener("keydown", handleKeys)

    runReader()
}

function runReader(){
    if(index >= words.length){
        clearTimeout(timer)
        showReplay()
        return
    }

    if(isPaused){
        timer = setTimeout(runReader, 120)
        return
    }

    reader.textContent = words[index]

    reader.classList.remove("rz-pop")
    void reader.offsetWidth
    reader.classList.add("rz-pop")

    const delay = getDelay(words[index])

    index++

    timer = setTimeout(runReader, delay)
}

function showToast(){
    if(!toast) return

    const lvl = speedLevels[currentLevel]
    toast.textContent = `${lvl.name} • ${lvl.wpm} WPM`

    toast.classList.add("show")

    clearTimeout(toast._timer)
    toast._timer = setTimeout(() => {
        toast.classList.remove("show")
    }, 1200)
}

function handleKeys(e){

    if(!reader) return

    switch(e.key){

        case " ":
            e.preventDefault()
            isPaused = !isPaused
            reader.style.opacity = isPaused ? "0.5" : "1"
        break

        case "ArrowUp":
            if(currentLevel < speedLevels.length - 1){
                currentLevel++
                updateSpeed()
                showToast()
            }
        break

        case "ArrowDown":
            if(currentLevel > 0){
                currentLevel--
                updateSpeed()
                showToast()
            }
        break
    }
}

function updateSpeed(){
    speed = 60000 / speedLevels[currentLevel].wpm

    const label = document.getElementById("speed-label")
    if(label){
        label.textContent = speedLevels[currentLevel].name
    }
}

function showReplay(){
    overlay.innerHTML = `
        <div id="readzen-replay">
            <h2>Leitura concluída</h2>
            <button id="replay-btn">Ler novamente</button>
            <br><br>
            <button id="closeReadZen">Fechar</button>
        </div>
    `

    overlay.onclick = function(e){
        if(e.target.id === "replay-btn"){
            startReading(words.join(" "))
        }

        if(e.target.id === "closeReadZen"){
            destroy()
        }
    }
}

function destroy(){
    if(timer) clearTimeout(timer)
    document.removeEventListener("keydown", handleKeys)

    if(root) root.remove()
    root = null
}

init()

return {
    start: startReading
}

})()