let words=[]
let index=0
let timer=null
let paused=false
let speed=400
let readingMode=false

function startReading(){
    const text=document.getElementById("textInput").value.trim()
    if(text===""){
        alert("Insira um texto para iniciar a leitura.")
        return
    }
    words=text.split(/\s+/)
    index=0
    speed=parseFloat(document.getElementById("speedInput").value)*1000
    readingMode=true
    document.getElementById("editorContainer").classList.add("hidden")
    document.getElementById("controlPanel").classList.remove("hidden")
    document.getElementById("speedPanel").classList.remove("hidden")
    updateSpeedLabel()
    paused=false
    showWord()
    restartTimer()
}

function restartTimer(){
    if(timer) clearInterval(timer)
    timer=setInterval(nextWord,speed)
}

function showWord(){
    if(index<0) index=0
    if(index>=words.length) index=words.length-1
    document.getElementById("wordDisplay").textContent=words[index]
    document.getElementById("progress").textContent =
        (index+1) + " / " + words.length

}

function nextWord(){

    if(paused) return
    index++
    if(index>=words.length){
        clearInterval(timer)
        return
    }

    showWord()
    let delay = speed
    if(/[.,;:!?]$/.test(words[index])){
        delay = speed * 2
    }
    clearInterval(timer)
    timer=setInterval(nextWord,delay)
}


function togglePlay(){
    if(!readingMode) return
    paused=!paused
    document.getElementById("playBtn").textContent = paused ? "⏯️" : "⏸️"
}


function back1(){
    index--
    showWord()
}

function forward1(){
    index++
    showWord()
}

function back10(){
    index-=10
    showWord()
}


function forward10(){
    index+=10
    showWord()
}


function changeSpeed(delta){
    let seconds=speed/1000
    seconds+=delta
    if(seconds<0.1) seconds=0.1
    speed=seconds*1000
    updateSpeedLabel()
    restartTimer()
}

function updateSpeedLabel(){
    document.getElementById("speedValue").textContent=(speed/1000).toFixed(1)+"s"
}

function showEditor(){
    readingMode=false
    document.getElementById("editorContainer").classList.remove("hidden")
    document.getElementById("editorContainer").classList.add("overlay")
}

document.addEventListener("keydown",function(e){
    if(!readingMode) return
    if(e.code==="Space"){
        e.preventDefault()
        togglePlay()
    }
    if(e.code==="ArrowRight"){
        forward1()
    }
    if(e.code==="ArrowLeft"){
        back1()
    }
    if(e.code==="ArrowUp"){
        changeSpeed(-0.1)
    }
    if(e.code==="ArrowDown"){
        changeSpeed(0.1)
    }
})

function fillExampleText(){
    const exampleText = `Era uma manhã serena, e o sol começava a dourar a copa das árvores. 
Os pássaros cantavam em harmonia e cada folha parecia brilhar com sua própria luz. 
Era o momento perfeito para deixar a mente viajar, explorar pensamentos e descobrir novas ideias. 
A simplicidade da natureza lembrava que, às vezes, a verdadeira grandeza está nos detalhes mais sutis.`
    document.getElementById("textInput").value = exampleText
}

function clearText(){
    document.getElementById("textInput").value = ""
}