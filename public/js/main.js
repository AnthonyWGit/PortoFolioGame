const grid = document.querySelector('.grid')
// Grid of 50*50 set in a 800px square
const player = document.createElement('div')
player.style.top = '400px' // Initial position (row)
player.style.left = '400px'  // Initial position (col)
let preventingArrows = true //Need to prevent default behaviour of arrow keys
if (preventingArrows)
{
    document.addEventListener("keydown", (event) => {
        const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"]
        if (arrowKeys.includes(event.code)) {
            event.preventDefault()
        }
    })
    preventingArrows = false
}
//Creating all the cells 
for (let i = 0; i < 50; i++) {
    for (let j = 0; j < 50; j++) {
        const cell = document.createElement('div')
        cell.classList.add('cell')
        cell.dataset.row = i
        cell.dataset.col = j
        grid.appendChild(cell)
    }
}
const cells = Array.from(document.querySelectorAll('.cell'))
//Constructing the visualization of the grid in an array 
const gridArray = [];
for (let i = 0; i < 50; i++) {
    const row = [];
    for (let j = 0; j < 50; j++) {
        row.push({
            walkable: true,  // Change this based on your game's logic
            x: i,
            y: j
        });
    }
    gridArray.push(row)
}

for (let j = 20; j <= 23; j++) {
    gridArray[16][j].walkable = false
}

console.log(gridArray)
// Iterate over each cell
cells.forEach(cell => {
    // Get the row and column of the cell
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    // Check if the cell is in row 16 and columns 20 to 23
    if (row === 16 && col >= 20 && col <= 23) {
        // If it is, add the 'blocked' class
        cell.classList.add('blocked')
    }
});


grid.appendChild(player)
player.classList.add('player')

//Controls
document.addEventListener("keydown", (event) => {
    // Calculate currentRow and currentCol based on player's current position
    let currentRow = parseInt(player.style.top) / 16
    let currentCol = parseInt(player.style.left) / 16
    let nextRow = currentRow
    let nextCol = currentCol
    if (event.code == "ArrowRight") {
        nextCol = currentCol + 1
    }
    if (event.code == "ArrowLeft") {
        nextCol = currentCol - 1
    }
    if (event.code == "ArrowUp") {
        nextRow = currentRow - 1
    }
    if (event.code == "ArrowDown") {
        nextRow = currentRow + 1
    }
    let nextCell = document.querySelector(`.cell[data-row='${nextRow}'][data-col='${nextCol}']`) //anti out of boundaries
    if (nextCell && !nextCell.classList.contains('blocked')) {
        // Calculate the new position of the player
        let newPositionTop = nextRow * 16 + 'px'
        let newPositionLeft = nextCol * 16 + 'px'
        // Move the player to the new position
        player.style.top = newPositionTop
        player.style.left = newPositionLeft
    }
})
grid.addEventListener("click", (event) => {
    if(event.target.classList.contains('cell')) {
        event.stopPropagation() //Remove this line and it"s a click on grid that is registered
        // Calculate the new position of the player
        const targetRow = parseInt(event.target.dataset.row)
        const targetCol = parseInt(event.target.dataset.col)
        const start = [parseInt(player.style.top) / 16, parseInt(player.style.left) / 16]
        const target = [targetRow, targetCol]
        const path = findPath(start, target, gridArray)
        if (path) {
            movePlayer(path)
        }
    }
})

function findPath(start, target, gridArray) {
    const queue = [[start]];
    const visited = new Set([start.join(',')]) //Object allowing to store unique values 

    while (queue.length > 0) {
        const path = queue.shift()
        const pos = path[path.length - 1]
        if (pos[0] === target[0] && pos[1] === target[1]) {
            return path
        }
        const neighbors = getNeighbors(pos, gridArray)
        for (const neighbor of neighbors) {
            const neighborKey = neighbor.join(',')
            if (!visited.has(neighborKey)) {
                visited.add(neighborKey)
                queue.push([...path, neighbor])
            }
        }
    }
    return null
}

function getNeighbors(pos, gridArray) {
    const x = pos[0], y = pos[1]
    const neighbors = []
//check walkable stats to not walk on blocked tiles 
    if (x - 1 >= 0 && gridArray[x - 1][y].walkable) {
        neighbors.push([x - 1, y])
    }
    if (x + 1 < gridArray.length && gridArray[x + 1][y].walkable) {
        neighbors.push([x + 1, y])
    }
    if (y - 1 >= 0 && gridArray[x][y - 1].walkable) {
        neighbors.push([x, y - 1])
    }
    if (y + 1 < gridArray[0].length && gridArray[x][y + 1].walkable) {
        neighbors.push([x, y + 1])
    }
    return neighbors;
}


function movePlayer(path) {
    let i = 0
    const intervalId = setInterval(() => {
        if (i < path.length) {
            const [x, y] = path[i]
            player.style.top = `${x * 16}px`
            player.style.left = `${y * 16}px`
            i++
        } else {
            clearInterval(intervalId)
        }
    }, 100) //Sync this this interval with animation CSS 
}
