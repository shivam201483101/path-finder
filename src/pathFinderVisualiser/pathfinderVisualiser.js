import React from "react";

// Importing Node Component to display Node on Grid
import Node from "./Node/Node";

// Array Conversion Functions
import {
    convert1Dto2DArray,
    convert2Dto1DArray,
} from "./pathfinder-utils/arrayConversions";

// Pathfinding Algorithms
import { dijkstra } from "./pathFindingAlgorithms/dijkstra";
import { bfs } from "./pathFindingAlgorithms/breadthFirstSearch";
import { dfs } from "./pathFindingAlgorithms/depthFirstSearch";
import { astar } from "./pathFindingAlgorithms/astar";
import { bidirectionalSearch } from "./pathFindingAlgorithms/bidirectionalSearch";

// Maze Generation Algorithm
import { generateMaze } from "./generateMaze";

import BackBar from "./backbar.js";

// Highlight Board Functions
import {
    highlightGrid,
    unHighlightGrid,
    highlightGridDiagonals,
    unHighlightGridDiagonals,
} from "./pathfinder-utils/highlightMazeNodes";

// Legend Component


// Complexity table
import ComplexityTable from "./pathfinder-utils/complexityTable";

//Stylesheets
import "./pathfinderVisualiser.css";

const x = 3;
const ROWS = 46 - x;
const COLS = 46 - x;

// Constants to toggle Start/Finish/Wall on Grid
const START_NODE_STATE = 1;
const END_NODE_STATE = 2;
const WALL_NODE_STATE = 3;

const SPEED = 25;

export default class PathFinderVisualiser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            grid: [],
            modifyingNodeState: 0,
            START_NODE_ROW: 2,
            START_NODE_COL: 2,
            FINISH_NODE_ROW: ROWS - 3,
            FINISH_NODE_COL: COLS - 3,
            disableMazesButton: false,
            disableNodesButton: false,
            disableClearMazeButton: false,

            highlightMazeNodes: true,
            isGridDiagonalsHighlighted: false,
            speed: SPEED,
        };
    }

    componentDidMount() {
        this.setUpGrid();
    }

    setUpGrid() {
        const grid = [];

        const gridBox = document.getElementById("grid");
        gridBox.style.setProperty("--p-grid-rows", ROWS);
        gridBox.style.setProperty("--p-grid-cols", COLS);

        for (let i = 0; i < ROWS; i++)
            for (let j = 0; j < COLS; j++) grid.push(this.createNode(i, j));

        this.setState({ grid });
    }

    clearBoard() {
        this.setUpGrid();
        const grid = this.state.grid;
        for (let i = 0; i < grid.length; i++) {
            const node = grid[i];
            document
                .getElementById(`node-${node.row}-${node.col}`)
                .classList.remove("node-visited");
            document
                .getElementById(`node-${node.row}-${node.col}`)
                .classList.remove("node-shortest-path");
        }
        this.setState({
            disableMazesButton: false,
            disableNodesButton: false,
            highlightMazeNodes: true,
        });
    }

    selectAlgorithm() {
        const algorithm = parseInt(
            document.getElementById("pathFindingAlgoDropDown").value
        );
        if (algorithm !== 0) this.visualiseAlgorithms(algorithm);
        else {
            alert("Select an Algorithm first!");
            return;
        }
    }

    visualiseAlgorithms(algorithm) {
        this.setState({
            disableNodesButton: true,
            disableMazesButton: true,
            disableClearMazeButton: true,
            modifyingNodeState: 0,
        });
        const {
            grid,
            START_NODE_COL,
            START_NODE_ROW,
            FINISH_NODE_COL,
            FINISH_NODE_ROW,
        } = this.state;

        const d2Grid = convert1Dto2DArray(grid, ROWS, COLS);

        const STARTNODE = d2Grid[START_NODE_ROW][START_NODE_COL];
        const FINISHNODE = d2Grid[FINISH_NODE_ROW][FINISH_NODE_COL];

        var visitedNodesInOrder, nodesInShortestPathOrder;

        switch (algorithm) {
            case 0:
                alert("Select an algorithm first!");
                this.setState({
                    disableMazesButton: false,
                    disableNodesButton: false,
                });
                return;
            case 1:
                [visitedNodesInOrder, nodesInShortestPathOrder] = dijkstra(
                    d2Grid,
                    STARTNODE,
                    FINISHNODE
                );
                break;
            case 2:
                [visitedNodesInOrder, nodesInShortestPathOrder] = bfs(
                    d2Grid,
                    STARTNODE,
                    FINISHNODE
                );
                break;
            case 3:
                [visitedNodesInOrder, nodesInShortestPathOrder] = astar(
                    d2Grid,
                    STARTNODE,
                    FINISHNODE
                );
                break;
            case 4:
                const [
                    source_visited,
                    dest_visited,
                    sPathNodes,
                    dPathNodes,
                ] = bidirectionalSearch(d2Grid, STARTNODE, FINISHNODE);

                this.animatePath(
                    source_visited,
                    sPathNodes
                );
                this.animatePath(dest_visited, dPathNodes);

                return;
            case 5:
                [visitedNodesInOrder, nodesInShortestPathOrder] = dfs(
                    d2Grid,
                    STARTNODE,
                    FINISHNODE
                );
                break;
            default:
                return;
        }

        this.animatePath(visitedNodesInOrder, nodesInShortestPathOrder);
    }

    highlightNodes(row, col) {
        if (this.state.highlightMazeNodes) {
            highlightGrid(row, col, ROWS, COLS);
        }
    }

    unHighlightNodes(row, col) {
        if (this.state.highlightMazeNodes) {
            unHighlightGrid(row, col, ROWS, COLS);
        }
    }

    // change `isGridDiagonalsHighlighted` to true in state
    // to highlight diagonals on board

    highlightDiagonals() {
        if (this.state.isGridDiagonalsHighlighted) {
            const nodes = convert1Dto2DArray(
                this.state.grid.slice(),
                ROWS,
                COLS
            );
            highlightGridDiagonals(nodes, ROWS, COLS);
        }
    }

    unHighlightDiagonals() {
        if (this.state.isGridDiagonalsHighlighted) {
            const nodes = convert1Dto2DArray(
                this.state.grid.slice(),
                ROWS,
                COLS
            );
            unHighlightGridDiagonals(nodes, ROWS, COLS);
        }
    }

    toggleStartOrFinish(grid = [], row, col, NODE_ROW, NODE_COL, nodeType) {
        const newGrid = grid.slice();

        const currentNode = newGrid[ROWS * NODE_ROW + NODE_COL];
        const newNode = newGrid[ROWS * row + col];

        if (nodeType === "START") {
            if (newNode.isWall || newNode.isFinish) {
                return false;
            } else {
                currentNode.isStart = false;
                newNode.isStart = true;
                this.setState({
                    grid: newGrid,
                });
                return true;
            }
        } else if (nodeType === "FINISH") {
            if (newNode.isWall || newNode.isStart) {
                return false;
            } else {
                currentNode.isFinish = false;
                newNode.isFinish = true;
                this.setState({
                    grid: newGrid,
                });
                return true;
            }
        } else {
            return false;
        }
    }

    toggleWall(grid, row, col) {
        const newGrid = grid.slice();
        const currentNode = newGrid[ROWS * row + col];
        if (!currentNode.isFinish && !currentNode.isStart) {
            currentNode.isWall = !currentNode.isWall;
            this.setState({ grid: newGrid });
        }
    }

    handleNodeOperations(row, col, NODE_STATE) {
        const {
            START_NODE_ROW,
            START_NODE_COL,
            FINISH_NODE_ROW,
            FINISH_NODE_COL,
            grid,
        } = this.state;
        switch (NODE_STATE) {
            case 1:
                if (
                    this.toggleStartOrFinish(
                        grid,
                        row,
                        col,
                        START_NODE_ROW,
                        START_NODE_COL,
                        "START"
                    )
                ) {
                    this.setState({
                        START_NODE_ROW: row,
                        START_NODE_COL: col,
                    });
                }
                break;
            case 2:
                if (
                    this.toggleStartOrFinish(
                        grid,
                        row,
                        col,
                        FINISH_NODE_ROW,
                        FINISH_NODE_COL,
                        "FINISH"
                    )
                ) {
                    this.setState({
                        FINISH_NODE_ROW: row,
                        FINISH_NODE_COL: col,
                    });
                }
                break;
            case 3:
                this.toggleWall(grid, row, col);
                break;
            default:
                break;
        }
    }

    createNode(row, col) {
        const {
            START_NODE_ROW,
            START_NODE_COL,
            FINISH_NODE_ROW,
            FINISH_NODE_COL,
        } = this.state;
        return {
            row,
            col,
            isStart: row === START_NODE_ROW && col === START_NODE_COL,
            isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
            distance: Infinity,
            isVisited: false,
            isWall: false,
            previousNode: null,
            cost: {
                F: Infinity,
                G: Infinity,
                H: Infinity,
            },
        };
    }

    modifyNodeState(STATE) {
        this.setState({ modifyingNodeState: STATE });
    }

    generateMaze(grid) {
        this.setState({
            disableMazesButton: true,
            disableClearMazeButton: false,
        });
        const twoDArray = convert1Dto2DArray(grid, ROWS, COLS);
        const mazeGrid = generateMaze(twoDArray, ROWS, COLS);
        const OneDArray = convert2Dto1DArray(mazeGrid);
        this.setState({ grid: OneDArray });
    }

    animatePath(visitedNodesInOrder, nodesInShortestPathOrder) {
        this.setState({ disableNodesButton: true, highlightMazeNodes: false });
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === visitedNodesInOrder.length) {
                setTimeout(() => {
                    this.animateShortestPath(nodesInShortestPathOrder);
                }, this.state.speed * i);
                return;
            }
            setTimeout(() => {
                const node = visitedNodesInOrder[i];
                if (!node.isStart && !node.isFinish && !node.isWall) {
                    document.getElementById(
                        `node-${node.row}-${node.col}`
                    ).className = "node node-visited";
                }
            }, this.state.speed * i);
        }
    }

    animateShortestPath(nodesInShortestPathOrder) {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            setTimeout(() => {
                const node = nodesInShortestPathOrder[i];
                if (!node.isStart && !node.isFinish && !node.isWall) {
                    document.getElementById(
                        `node-${node.row}-${node.col}`
                    ).classList = "node node-shortest-path";
                }
                if (node.isFinish) {
                    setTimeout(() => {
                        this.setState({
                            disableClearMazeButton: false,
                        });
                    }, 1000);
                }
            }, this.state.speed * i);
        }
    }

    render() {
        const {
            grid,
            modifyingNodeState,
            disableMazesButton,
            disableNodesButton,
            disableClearMazeButton,
        } = this.state;
        return (
            <div>
                <BackBar />
          
                    <div className="roww">
                        <div className="column1">
                            <div className="box shadowT mb-2">
                                <div
                                    onMouseOut={() =>
                                        this.unHighlightDiagonals()
                                    }
                                    onMouseOver={() =>
                                        this.highlightDiagonals()
                                    }
                                    id="grid"
                                    className="grid"
                                >
                                    {grid.map((node, idx) => {
                                        const {
                                            row,
                                            col,
                                            isStart,
                                            isFinish,
                                            isWall,
                                        } = node;
                                        return (
                                            <Node
                                                key={idx}
                                                col={col}
                                                isFinish={isFinish}
                                                isStart={isStart}
                                                isWall={isWall}
                                                row={row}
                                                onNodeClick={(row, col) =>
                                                    this.handleNodeOperations(
                                                        row,
                                                        col,
                                                        modifyingNodeState
                                                    )
                                                }
                                                onNodeOver={(row, col) =>
                                                    this.highlightNodes(
                                                        row,
                                                        col
                                                    )
                                                }
                                                onNodeOut={(row, col) =>
                                                    this.unHighlightNodes(
                                                        row,
                                                        col
                                                    )
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="column1">
                            <table><tr>
                                <td>
                                <button
                                    type="button"
                                    disabled={disableNodesButton}
                                    className="custom-btn btn-7"
                                    onClick={() =>
                                        this.modifyNodeState(START_NODE_STATE)
                                    }
                                ><span> Place Source</span>
                                   
                                </button>
                                </td>
                                <td>
                                <button
                                    type="button"
                                    disabled={disableNodesButton}
                                    className="custom-btn btn-4"
                                    onClick={() =>
                                        this.modifyNodeState(END_NODE_STATE)
                                    }
                                >
                                   <span>Place Destination</span> 
                                </button>
                                </td><td>
                                <button
                                    type="button"
                                    disabled={disableNodesButton}
                                    className="custom-btn btn-1"
                                    onClick={() =>
                                        this.modifyNodeState(WALL_NODE_STATE)
                                    }
                                >
                                   <span>Place Wall</span> 
                                </button>
                                </td>
                                </tr>
                                </table>
                            <div className="btn-group btn-block mt-2">
                               <table><tr><td> <button
                                    type="button"
                                    disabled={disableMazesButton}
                                    className="custom-btn btn-8"
                                    onClick={() => this.generateMaze(grid)}
                                >
                                    Form-Maze
                                </button></td><td>
                                <button
                                    type="button"
                                    disabled={disableClearMazeButton}
                                    className="custom-btn btn-10"
                                    onClick={() => this.clearBoard()}
                                >
                                    Clear Maze
                                </button>
                               </td> 
                               <td><a href="https://shivam201483101.github.io/mini-proj/"><button className="custom-btn btn-3"><span>Refresh Page</span></button></a></td></tr></table>
                            </div>
                            <div className="btn-group btn-block mt-2">
                                <div className="input-group">
                                    <select
                                        disabled={disableNodesButton}
                                        id="pathFindingAlgoDropDown"
                                        className="custom-select"
                                        defaultValue="0"
                                    >
                                        <option disabled value="0">
                                            Select Algorithm
                                        </option>
                                        <option value="1">Dijkstras</option>
                                        <option value="2">
                                            Breadth First Search
                                        </option>
                                        <option value="5">
                                            Depth First Search
                                        </option>
                                        <option value="3">A* Search</option>
                                        <option value="4">
                                            Bi-Directional Search
                                        </option>
                                    </select>
                                    <div className="input-group-append">
                                        <table><tr><td><button
                                            disabled={disableNodesButton}
                                            onClick={() =>
                                                this.selectAlgorithm()
                                            }
                                            className="custom-btn btn-15"
                                        >
                                            <span>Perform Search</span>
                                            
                                        </button>
                                        </td></tr>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            
                            
 <div>
        <table><tr>
            <th>Sr.no</th>
            <th>colors</th>
            <th>Indicates</th>
            </tr>
            <tr>
                <td>1.</td>
                <td><div className="input-color">
    <input type="text" style={{ backgroundColor: "#f81245" }} />
    
  </div></td>
<td>Source</td></tr>
<tr><td>2.</td>
<td><div className="input-color">
<input type="text" style={{ backgroundColor: "#262626" }} /></div></td>

<td>Wall</td>
    </tr>
    <tr><td>3.</td>
<td><div className="input-color">
<input type="text" style={{ backgroundColor: "#8a2be2" }} />
  </div></td>     
<td>Visited</td>   </tr>
<tr>
    <td>4.</td>
    <td><div className="input-color">
    <input type="text" style={{ backgroundColor: "#12f893" }} />

  </div></td>
<td>Destination</td></tr>
<tr>
    <td>5.</td>
    <td><div className="input-color">
    <input type="text" style={{ backgroundColor: "#ddd" }} />
   
  </div></td>
<td>Path/Unvisted</td></tr>
<tr><td>6.</td>
<td><div className="input-color">
<input type="text" style={{ backgroundColor: "#ffff00" }} />
  </div></td>
<td>Shortest Path</td></tr>
</table>
    </div>
                            
                            
                            
<ComplexityTable />
                        </div>
                    </div>
  </div>
         
        );
    }
}