import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={props.square_type} 
            onClick={props.onClick}>
      {props.value}
    </button>
    );
}

class Board extends React.Component {
  renderSquare(i) {
    return <Square value={this.props.squares[i]}
                   onClick={() => this.props.onClick(i)} 
                   square_type = {this.get_square_type(i)} />;
  }
  
  get_square_type(i) {
    if (this.props.winner && this.props.winner.line.includes(i))  {
      return 'square highlight';
    } else {
      return 'square';
    }
  }

render() {
  let squares = [];
  for(let row of [0, 1, 2]) {
    let col_array = []
    for(let col of [0, 1, 2]) {
      col_array.push(this.renderSquare(row * 3 + col))
    }
    squares.push(<div className="board-row">{col_array}</div>);
  }

  return (
     <div>
      {squares}
     </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        current_move: null
        }],
      stepNumber: 0,
      xIsNext: true,
      ascending: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length-1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{squares: squares, current_move: i}]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }  

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  } 

  reverseHistory() {
    this.setState({
      ascending: !this.state.ascending,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner_obj = calculateWinner(current.squares);
    const winner = winner_obj ? winner_obj.winner : winner_obj;
    const moves = history.map((step, move) => { 
      const desc = move ?
      'go to move #' + move + ' ' + convert_index(step.current_move):
      'go to game start';
      const bold = move == this.state.stepNumber ? 'bold' : ''
      return (
        <li key={move}>
          <button className={bold} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    let ascending_button_name = (this.state.ascending) ? 'ascending' : 'descending'; 
    if (this.state.ascending) {
      moves.sort((a, b) => a.key - b.key);
    } else {
      moves.sort((b, a) => a.key - b.key);
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares} 
            onClick={(i) => this.handleClick(i)}
            winner={winner_obj}  />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <button onClick={() => this.reverseHistory()} >{ascending_button_name}</button>

        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a]===squares[b] && squares[a]===squares[c]){
      return { winner: squares[a], line: lines[i] }
    }
  }
  if (squares.filter(x => !Boolean(x)).length === 0) 
    return { winner: 'Draw'
           , line: [] };

  return null;
}

function convert_index(index) {
  const row = Math.floor(index / 3) + 1;
  const col = index % 3 + 1;
  return `(${col}, ${row})`
}
 
