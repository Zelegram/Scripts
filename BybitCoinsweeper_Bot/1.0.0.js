// ==TeleModScript==
// @name            Bybit Coinsweeper
// @version         1.0.0
// @description     Auto Play Bybit Coinsweeper!!
// @icon            https://raw.githubusercontent.com/Zelegram/Scripts/main/BybitCoinsweeper_Bot/icon.jpg
// @author          xFlaem
// @run-at          load-done
// ==/TeleModScript==

(async function () {
    function waitForGameBoard() {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          const gameBoardXPath = '/html/body/div[2]/section';
          const gameBoardResult = document.evaluate(
            gameBoardXPath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          );
          const gameBoard = gameBoardResult.singleNodeValue;
  
          if (gameBoard) {
            clearInterval(checkInterval);
            setTimeout(() => {
              resolve(gameBoard);
            }, 200);
          }
        }, 150);
      });
    }
  
    function parseGameBoard() {
      const gameBoardXPath = '/html/body/div[2]/section';
      const gameBoardResult = document.evaluate(
        gameBoardXPath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      const gameBoard = gameBoardResult.singleNodeValue;
  
      if (!gameBoard) {
        return [];
      }
  
      const cellSelector = './/div[contains(@class, "_field_")]';
      const cellsSnapshot = document.evaluate(
        cellSelector,
        gameBoard,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
  
      const totalCells = cellsSnapshot.snapshotLength;
      const totalRows = 9;
      const totalColumns = 6;
  
      if (totalCells !== totalRows * totalColumns) {
        return [];
      }
  
      let boardState = [];
  
      for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
        let currentRowData = [];
        for (let colIndex = 0; colIndex < totalColumns; colIndex++) {
          const cellIndex = rowIndex * totalColumns + colIndex;
          const cell = cellsSnapshot.snapshotItem(cellIndex);
          let currentCellData = {};
          const cellClass = cell.getAttribute('class');
          const isOpen = cellClass.includes('open');
  
          if (isOpen) {
            const img = cell.querySelector('img');
            if (img) {
              const altText = img.getAttribute('alt');
              if (altText) {
                if (altText.startsWith('Coin')) {
                  const minesAround = parseInt(altText.replace('Coin ', ''));
                  currentCellData = { type: 'number', value: minesAround };
                } else if (altText === 'Block') {
                  currentCellData = { type: 'closed' };
                } else {
                  currentCellData = { type: 'empty' };
                }
              } else {
                currentCellData = { type: 'empty' };
              }
            } else {
              currentCellData = { type: 'empty' };
            }
          } else {
            currentCellData = { type: 'closed' };
          }
  
          currentRowData.push(currentCellData);
        }
        boardState.push(currentRowData);
      }
  
      return boardState;
    }
  
  let isClicking = false;
  
  function clickPlayNowButton() {
    const interval = setInterval(() => {
      const playNowButton = document.querySelector('button.btn.primary-btn._button_1a7vv_65');
  
      if (playNowButton && playNowButton.textContent.trim() === 'Play Now') {
        playNowButton.click();
        console.log('The button is pressed "Play Now".');
        clearInterval(interval);
      }
    }, Math.random() * (3000 - 2000) + 2000);
  }
  
  clickPlayNowButton();
  
  function searchAndClickCoin() {
    const coinElement = document.querySelector('div img[src^="/assets/MNT"]');
    
    if (coinElement) {
      console.log('Coin found:', coinElement.src);
      try {
        const delay = Math.random() * (5000 - 3000) + 3000;
        setTimeout(() => {
          coinElement.click();
          console.log('Click on the coin after pause', delay, 'мс');
        }, delay);
      } catch (error) {
        console.error('Error while trying to click:', error);
      }
    } else {
    }
  }
  
  setInterval(searchAndClickCoin, 1000);
  
  function clickCell(row, col) {
      if (isClicking) {
          return;
      }
  
      isClicking = true;
  
      const gameBoardXPath = '/html/body/div[2]/section';
      const gameBoardResult = document.evaluate(
          gameBoardXPath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
      );
      const gameBoard = gameBoardResult.singleNodeValue;
  
      if (!gameBoard) {
          isClicking = false;
          return;
      }
  
      const cellSelector = './/div[contains(@class, "_field_")]';
      const cellsSnapshot = document.evaluate(
          cellSelector,
          gameBoard,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
      );
  
      const totalRows = 9;
      const totalColumns = 6;
      const totalCells = cellsSnapshot.snapshotLength;
  
      if (totalCells !== totalRows * totalColumns) {
          isClicking = false;
          return;
      }
  
      const cellIndex = row * totalColumns + col;
      const cell = cellsSnapshot.snapshotItem(cellIndex);
      const randomDelay = Math.floor(Math.random() * (5000 - 300 + 1) + 300);
  
      if (cell) {
          setTimeout(() => {
              cell.click();
              isClicking = false;
          }, randomDelay);
      } else {
          isClicking = false;
      }
  }
  
  function solve_minesweeper(field) {
    field = JSON.parse(JSON.stringify(field));
    const rows = field.length;
    const cols = field[0].length;
  
    let changed = true;
    while (changed) {
      changed = false;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          let cell = field[row][col];
          if (cell['type'] === 'number') {
            let minesAround = cell['value'];
            let neighbors = get_neighbors(field, row, col);
            let closedNeighbors = neighbors.filter(
              (n) =>
                field[n[0]][n[1]]['type'] === 'closed' &&
                !field[n[0]][n[1]].hasOwnProperty('flagged')
            );
            let flaggedNeighbors = neighbors.filter((n) =>
              field[n[0]][n[1]].hasOwnProperty('flagged')
            );
  
            if (minesAround === flaggedNeighbors.length + closedNeighbors.length) {
              for (let n of closedNeighbors) {
                if (!field[n[0]][n[1]].hasOwnProperty('flagged')) {
                  field[n[0]][n[1]]['flagged'] = true;
                  changed = true;
                }
              }
            } else if (minesAround === flaggedNeighbors.length) {
              for (let n of closedNeighbors) {
                if (!field[n[0]][n[1]].hasOwnProperty('safe')) {
                  field[n[0]][n[1]]['safe'] = true;
                  changed = true;
                }
              }
            }
          }
        }
      }
    }
  
    let safeCells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let cell = field[row][col];
        if (cell.hasOwnProperty('safe') && cell['type'] === 'closed') {
          safeCells.push({ row: row, col: col });
        }
      }
    }
  
    if (safeCells.length > 0) {
      return { action: 'click', row: safeCells[0].row, col: safeCells[0].col };
    }
  
    let minProbability = 1.0;
    let minCell = null;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (field[row][col]['type'] === 'closed' && !field[row][col].hasOwnProperty('flagged')) {
          let prob = estimate_mine_probability(field, row, col);
          if (prob < minProbability) {
            minProbability = prob;
            minCell = { row: row, col: col };
          }
        }
      }
    }
  
    if (minCell) {
      return { action: 'click', row: minCell.row, col: minCell.col };
    }
  
    return { action: 'finish' };
  }
  
  function get_neighbors(field, row, col) {
    let neighbors = [];
    for (let i = Math.max(0, row - 1); i <= Math.min(field.length - 1, row + 1); i++) {
      for (let j = Math.max(0, col - 1); j <= Math.min(field[0].length - 1, col + 1); j++) {
        if (i !== row || j !== col) {
          neighbors.push([i, j]);
        }
      }
    }
    return neighbors;
  }
  
  function estimate_mine_probability(field, row, col) {
    let total_prob = 0;
    let count = 0;
    let neighbors = get_neighbors(field, row, col);
  
    for (let n of neighbors) {
      let n_row = n[0];
      let n_col = n[1];
      let neighbor = field[n_row][n_col];
      if (neighbor['type'] === 'number') {
        let minesAround = neighbor['value'];
        let closedNeighbors = get_neighbors(field, n_row, n_col).filter(
          (nn) =>
            field[nn[0]][nn[1]]['type'] === 'closed' &&
            !field[nn[0]][nn[1]].hasOwnProperty('flagged')
        );
        let flaggedNeighbors = get_neighbors(field, n_row, n_col).filter((nn) =>
          field[nn[0]][nn[1]].hasOwnProperty('flagged')
        );
        total_prob +=
          (minesAround - flaggedNeighbors.length) / closedNeighbors.length;
        count++;
      }
    }
    if (count > 0) {
      return total_prob / count;
    } else {
      return 0.5;
    }
  }
  
  await waitForGameBoard();
  setInterval(() => {
    let field = parseGameBoard();
    let action = solve_minesweeper(field);
  
    if (action.action === 'click') {
      clickCell(action.row, action.col);
    }
  }, 1000);
  })();