const STORAGE_KEY = "ticTacToeState";

const cells = document.querySelectorAll(".cell");
const board = document.getElementById("board");
const firstPlayer = document.getElementById("firstPlayer");
const playerXName = document.getElementById("playerXName");
const playerOName = document.getElementById("playerOName");
const clearConfigBtn = document.getElementById("clearConfigBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const replayBtn = document.getElementById("replayBtn");
const turnInfo = document.getElementById("turnInfo");
const historyBody = document.getElementById("historyBody");
const emptyHistory = document.getElementById("emptyHistory");
const playerXLabel = document.getElementById("playerXLabel");
const playerOLabel = document.getElementById("playerOLabel");
const nextTurn = document.getElementById("nextTurn");

const resultModal = document.getElementById("resultModal");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");
const newGameBtn = document.getElementById("newGameBtn");

const WINNING_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

let state = {
    board: Array(9).fill(""),
    currentPlayer: "X",
    firstPlayer: "X",
    playerXName: "Player 1",
    playerOName: "Player 2",
    started: false,
    finished: false,
    history: [],
    nextMatchNo: 1
};

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        state.currentPlayer = state.firstPlayer;
        return;
    }

    try {
        const savedState = JSON.parse(saved);
        state = { ...state, ...savedState };

        state.board = Array.isArray(state.board) && state.board.length === 9
            ? state.board
            : Array(9).fill("");

        state.history = Array.isArray(state.history) ? state.history : [];

        if (!Number.isInteger(state.nextMatchNo)) {
            state.nextMatchNo = state.history.length + 1;
        }
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        state.currentPlayer = state.firstPlayer;
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
    cells.forEach((cell, index) => {
        const value = state.board[index];

        cell.textContent = value;
        cell.classList.remove("x", "o");

        if (value) {
            cell.classList.add(value.toLowerCase());
        }

        cell.disabled = Boolean(value) || state.finished;
    });

    firstPlayer.value = state.firstPlayer;
    playerXName.value = state.playerXName;
    playerOName.value = state.playerOName;

    const configDisabled = state.started || state.finished;
    firstPlayer.disabled = configDisabled;
    playerXName.disabled = configDisabled;
    playerOName.disabled = configDisabled;

    playerXLabel.textContent = `${state.playerXName} (X)`;
    playerOLabel.textContent = `${state.playerOName} (O)`;

    nextTurn.classList.remove("x", "o", "draw");

    if (!state.started) {
        turnInfo.textContent = `${state.firstPlayer} sẽ đi trước`;
        nextTurn.textContent = state.firstPlayer;
        nextTurn.classList.add(state.firstPlayer.toLowerCase());
    } else if (!state.finished) {
        turnInfo.textContent = `Lượt của ${getPlayerName(state.currentPlayer)} (${state.currentPlayer})`;
        nextTurn.textContent = state.currentPlayer;
        nextTurn.classList.add(state.currentPlayer.toLowerCase());
    } else {
        nextTurn.textContent = "—";
        nextTurn.classList.add("draw");
    }

    renderHistory();
}

function getPlayerName(symbol) {
    return symbol === "X" ? state.playerXName : state.playerOName;
}

function makeMove(index) {
    if (state.finished || state.board[index]) {
        return;
    }

    state.started = true;
    state.board[index] = state.currentPlayer;
    state.currentPlayer = state.currentPlayer === "X" ? "O" : "X";

    checkGameResult();
    saveState();
    render();
}

function checkGameResult() {
    const winner = getWinner();

    if (winner) {
        const winnerName = getPlayerName(winner);

        state.finished = true;
        state.history.unshift({
            matchNo: state.nextMatchNo++,
            endedAt: new Date().toISOString(),
            xName: state.playerXName,
            oName: state.playerOName,
            result: winner
        });

        showResult(
            "Có người chiến thắng!",
            `${winnerName} thắng với ký tự ${winner}.`
        );

        return;
    }

    if (state.board.every(cell => cell !== "")) {
        state.finished = true;
        state.history.unshift({
            matchNo: state.nextMatchNo++,
            endedAt: new Date().toISOString(),
            xName: state.playerXName,
            oName: state.playerOName,
            result: "Hòa"
        });

        showResult("Ván đấu hòa", "Không có người chiến thắng trong ván này.");
    }
}

function getWinner() {
    for (const [a, b, c] of WINNING_LINES) {
        if (
            state.board[a] &&
            state.board[a] === state.board[b] &&
            state.board[a] === state.board[c]
        ) {
            return state.board[a];
        }
    }

    return null;
}

function resetBoard() {
    state.board = Array(9).fill("");
    state.currentPlayer = state.firstPlayer;
    state.started = false;
    state.finished = false;

    closeModal();
    saveState();
    render();
}

function showResult(title, message) {
    resultTitle.textContent = title;
    resultMessage.textContent = message;
    resultModal.classList.remove("hidden");
}

function closeModal() {
    resultModal.classList.add("hidden");
}

function updateConfig() {
    if (state.started || state.finished) {
        return;
    }

    state.firstPlayer = firstPlayer.value;
    state.playerXName = playerXName.value.trim() || "Player 1";
    state.playerOName = playerOName.value.trim() || "Player 2";
    state.currentPlayer = state.firstPlayer;

    saveState();
    render();
}

function clearConfig() {
    if (state.started || state.finished) {
        return;
    }

    state.firstPlayer = "X";
    state.playerXName = "Player 1";
    state.playerOName = "Player 2";
    state.currentPlayer = "X";

    saveState();
    render();
}

function clearHistory() {
    state.history = [];
    state.nextMatchNo = 1;

    saveState();
    render();
}

function formatDate(isoDate) {
    const date = new Date(isoDate);

    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${hh}:${mm} - ${dd}/${month}/${yyyy}`;
}

function renderHistory() {
    historyBody.innerHTML = "";
    emptyHistory.style.display = state.history.length ? "none" : "block";

    state.history.forEach(item => {
        const row = document.createElement("tr");

        const resultClass = item.result === "X"
            ? "result-x"
            : item.result === "O"
                ? "result-o"
                : "result-draw";

        row.innerHTML = `
            <td>${item.matchNo}</td>
            <td>${formatDate(item.endedAt)}</td>
            <td>${escapeHtml(item.xName)}</td>
            <td>${escapeHtml(item.oName)}</td>
            <td class="${resultClass}">${item.result}</td>
        `;

        historyBody.appendChild(row);
    });
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

cells.forEach(cell => {
    cell.addEventListener("click", () => {
        makeMove(Number(cell.dataset.index));
    });
});

[firstPlayer, playerXName, playerOName].forEach(input => {
    input.addEventListener("change", updateConfig);
});

[playerXName, playerOName].forEach(input => {
    input.addEventListener("blur", updateConfig);
});

clearConfigBtn.addEventListener("click", clearConfig);
clearHistoryBtn.addEventListener("click", clearHistory);
replayBtn.addEventListener("click", resetBoard);
newGameBtn.addEventListener("click", resetBoard);

loadState();
render();
