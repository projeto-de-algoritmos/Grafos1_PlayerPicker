// globals
let editmode = "start";
let startPoint = null;
let endPoint = null;
let walls = new Set();

const ROW_SIZE = 20;
const TOTAL_SIZE = ROW_SIZE * ROW_SIZE;
const delay = ms => new Promise(res => setTimeout(res, ms));

// defining node
class Node {
    constructor(element) {
        this.element = element;
        this.parent = null;
    }
}

// starter function
document.addEventListener("DOMContentLoaded", () => {
    loadGrid();
    document.querySelector("#start-button").addEventListener("click", () => { editmode = "start"; });
    document.querySelector("#end-button").addEventListener("click", () => { editmode = "end"; });
    document.querySelector("#block-button").addEventListener("click", () => { editmode = "wall"; });
    document.querySelector("#start-search-button").addEventListener("click", () => startSearch());
    document.querySelector("#reset-button").addEventListener("click", () => loadGrid());
});

// load grid function 
function loadGrid() {
    main = document.querySelector("#main");
    main.innerHTML = "";
    startPoint = null;
    endPoint = null;
    walls.clear();
    editmode = "start";

    message = document.querySelector("#messages");
    message.innerHTML = "";

    document.querySelector("#end-button").disabled = true;
    document.querySelector("#block-button").disabled = true;
    document.querySelector("#start-search-button").disabled = true;

    document.querySelector("#start-button").classList.remove("btn-success");;
    document.querySelector("#end-button").classList.remove("btn-success");;
    document.querySelector("#block-button").classList.remove("btn-success");;
    document.querySelector("#start-search-button").classList.remove("btn-success");;
    document.querySelector("#reset-button").classList.remove("btn-success");;

    document.querySelector("#start-button").style.display = "inline-block";
    document.querySelector("#end-button").style.display = "inline-block";
    document.querySelector("#block-button").style.display = "inline-block";
    document.querySelector("#start-search-button").style.display = "inline-block";
    document.querySelector("#reset-button").style.display = "none";

    for (let i = 0; i < TOTAL_SIZE; i++) {
        let grid_div = document.createElement("div")
        grid_div.id = `hive_${i}`;
        grid_div.classList = "block";
        grid_div.addEventListener("click", () => addToList(grid_div));
        main.append(grid_div);
    }
}

// grid construction function
function addToList(grid_div) {
    let item = parseInt(grid_div.id.split("_")[1]);
    let message = document.querySelector("#messages");
    if (editmode === "start") {
        if (startPoint === null) {
            if (walls.has(item)) {
                message.innerHTML = "ponto de partida não pode ser uma barreira.";
            } else {
                grid_div.classList.toggle("block-closed-start");
                message.innerHTML = "ponto de partida marcado!";
                startPoint = item;
                document.querySelector("#start-button").classList.add("btn-success");
                document.querySelector("#end-button").disabled = false;
            }
        } else if (startPoint === item) {
            message.innerHTML = "ponto de partida removido!";
            grid_div.classList.toggle("block-closed-start");
            startPoint = null;
        } else {
            message.innerHTML = "ponto de partida já marcado!"
        }
    } else if (editmode === "end") {
        if (endPoint === null) {
            if (walls.has(item)) {
                message.innerHTML = "ponto de chegada não pode ser uma barreira!";
                document.querySelector("#end-button").classList.remove("btn-success");
            } else {
                grid_div.classList.toggle("block-closed-end");
                message.innerHTML = "ponto de chegada marcado!"
                endPoint = item;
                document.querySelector("#end-button").classList.add("btn-success");
                document.querySelector("#block-button").disabled = false;
            }
        } else if (endPoint === item) {
            message.innerHTML = "ponto de chegada removido!";
            grid_div.classList.toggle("block-closed-end");
            endPoint = null;
            document.querySelector("#end-button").classList.remove("btn-success");
        } else {
            message.innerHTML = "ponto de chegada já marcado!"
        }
    } else if (editmode === "wall") {
        if (item === startPoint || item === endPoint) {
            message.innerHTML = "ponto de partida nao pode ser uma barreira!";
        } else if (walls.has(item)) {
            grid_div.classList.toggle("block-closed-wall");
            walls.delete(item);
        } else {
            grid_div.classList.toggle("block-closed-wall");
            walls.add(item);
            document.querySelector("#block-button").classList.add("btn-success");
            document.querySelector("#start-search-button").disabled = false;
        }
    }
}

// neighbour finders
function neighbors(x) {
    let neigh = [];
    // cima 
    if (x - ROW_SIZE > -1) {
        neigh.push(x - ROW_SIZE);
    }
    // baixo
    if (x + ROW_SIZE < TOTAL_SIZE) {
        neigh.push(x + ROW_SIZE);
    }
    // esquerda
    if (parseInt((x + 1) / ROW_SIZE) === parseInt(x / ROW_SIZE) && ((x + 1) > -1 && (x + 1) < TOTAL_SIZE)) {
        neigh.push(x + 1);
    }
    // direita
    if (parseInt((x - 1) / ROW_SIZE) === parseInt(x / ROW_SIZE) && ((x - 1) > -1 && (x - 1) < TOTAL_SIZE)) {
        neigh.push(x - 1);
    }
    return neigh;
}

// dfs search function
function startDFS() {
    let query = [];
    let visited = new Set();
    let start = new Node(startPoint);
    query.push(start);
    visited.add(startPoint)
    let sol = null
    while (query.length !== 0) {
        let e = query.shift();
        if (e.element === endPoint) {
            sol = e;
            break;
        }
        let nig = neighbors(e.element);
        nig.forEach(element => {
            if (!visited.has(element) && !walls.has(element)) {
                let z = new Node(element);
                z.parent = e;
                query.push(z);
                visited.add(element);
            }
        })
    }
    if (sol !== null) {
        printSolution(sol)
    } else {
        document.querySelector("#messages").innerHTML = "Não dá pra driblar isso aí!";
    }
}

// path printer function
async function printSolution(sol) {
    document.querySelector("#messages").innerHTML = "Driblei geral!";

    document.querySelector("#start-button").style.display = "none";
    document.querySelector("#end-button").style.display = "none";
    document.querySelector("#block-button").style.display = "none";
    document.querySelector("#start-search-button").style.display = "none";
    document.querySelector("#reset-button").style.display = "inline-block";

    let solution = [];
    while (sol.parent !== null) {
        solution.push(sol.element);
        sol = sol.parent;
    }
    for (let i = solution.length - 1; i > 0; i--) {
        await delay(50);
        document.querySelector(`#hive_${solution[i]}`).classList = "path";
    }
    document.querySelector(`#hive_${endPoint}`).classList = "block-closed-end";
}

// check function 
function checkRequirements() {
    return startPoint === null || endPoint === null ? false : true;
}

// search driver function.
function startSearch() {
    editmode = 'none';
    if (checkRequirements() === true) {
        document.querySelector("#messages").innerHTML = "Calculando drible...";
        startDFS();
    }
}