const ReadZen = (function(){

let words = []
let index = 0
let timer = null
let speed = 300
let exampleTexts = []

let root, overlay, menu, reader

// 🔹 INICIALIZAÇÃO
function init(){
    loadTexts()

    const btn = document.getElementById("openReadZen")
    if(btn){
        btn.addEventListener("click", openMenu)
    }
}

// 🔹 CARREGAR JSON
async function loadTexts(){
    try{
        const res = await fetch("texto.json")
        const data = await res.json()
        exampleTexts = data.texts || []
    }catch(e){
        console.error("Erro ao carregar textos", e)
    }
}

// 🔹 CRIAR ROOT
function createRoot(){
    root = document.createElement("div")
    root.id = "readzen-root"
    document.body.appendChild(root)
}

// 🔹 INJETAR CSS (PROTEGIDO)
function injectCSS(){
    if(document.getElementById("readzen-style")) return

    const link = document.createElement("link")
    link.id = "readzen-style"
    link.rel = "stylesheet"
    link.href = "readzen.css"
    document.head.appendChild(link)
}

// 🔹 OVERLAY BASE
function createOverlay(){
    overlay = document.createElement("div")
    overlay.id = "readzen-overlay"
    root.appendChild(overlay)
}

// 🔹 MENU INICIAL
function openMenu(){
    if(!root){
        createRoot()
        injectCSS()
        createOverlay()
    }

    overlay.innerHTML = ""

    menu = document.createElement("div")
    menu.id = "readzen-menu"

    menu.innerHTML = `
        <h2>ReadZen - Como deseja ler?</h2>

        <div class="rz-actions">
            <button data-mode="page">Esta Página</button>
            <button data-mode="example">Texto de Exemplo</button>
            <button data-mode="custom">Texto Personalizado</button>
        </div>

        <button id="closeReadZen">Fechar</button>
    `

    overlay.appendChild(menu)

    menu.onclick = handleMenu
}

// 🔹 AÇÕES DO MENU
function handleMenu(e){
    const mode = e.target.dataset.mode

    if(mode === "page"){
        const text = getPageText()
        startReading(text)
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

    if(e.target.id === "closeReadZen"){
        destroy()
    }
}

// 🔹 INPUT PERSONALIZADO
function openCustomInput(){
    overlay.innerHTML = ""

    const box = document.createElement("div")
    box.id = "readzen-input"

    box.innerHTML = `
        <h2>Digite seu texto</h2>
        <textarea id="rz-text"></textarea>
        <br><br>
        <button id="startCustom">Iniciar</button>
        <button id="backMenu">Voltar</button>
    `

    overlay.appendChild(box)

    box.onclick = function(e){
        if(e.target.id === "startCustom"){
            const text = document.getElementById("rz-text").value
            startReading(text)
        }

        if(e.target.id === "backMenu"){
            openMenu()
        }
    }
}

// 🔹 PEGAR TEXTO DA PÁGINA (SÓ PARÁGRAFOS)
function getPageText(){
    const content = document.querySelector(".rz-content")

    if(!content) return ""

    const paragraphs = content.querySelectorAll("p")

    let text = ""
    paragraphs.forEach(p => {
        text += p.innerText + " "
    })

    return text
}

// 🔹 TEMPO DINÂMICO (PAUSAS)
function getDelay(word){
    let base = speed

    if(/[,]/.test(word)) return base * 1.5
    if(/[.!?]/.test(word)) return base * 2.2
    if(/[:;]/.test(word)) return base * 1.8

    return base
}

// 🔹 INICIAR LEITURA
function startReading(text){
    if(!text || text.trim() === "") return

    words = text.split(/\s+/)
    index = 0
    speed = 60000 / 300

    overlay.innerHTML = ""

    reader = document.createElement("div")
    reader.id = "readzen-reader"
    overlay.appendChild(reader)

    runReader()

    // fechar ao clicar no fundo
    overlay.onclick = function(e){
        if(e.target.id === "readzen-overlay"){
            destroy()
        }
    }
}

// 🔹 LOOP DE LEITURA (NOVO)
function runReader(){
    if(index >= words.length){
        clearTimeout(timer)
        return
    }

    const word = words[index]
    reader.textContent = word

    const delay = getDelay(word)

    index++

    timer = setTimeout(runReader, delay)
}

// 🔹 FECHAR TUDO
function destroy(){
    if(timer) clearTimeout(timer)
    if(root) root.remove()
    root = null
}

// 🔹 AUTO INIT
init()

return {
    start: startReading
}

})()