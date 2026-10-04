package ai;

import java.util.ArrayList;
import main.GamePanel;

/**
 * ============================================================================
 * CLASS: PathFinder (A* Search Pathfinding Algorithm)
 * ============================================================================
 * ROLE: Calculates the optimal grid path from any entity (monster or NPC)
 *       to any target tile (such as the Player).
 *
 * KEY CONCEPTS TO EXPLAIN TO YOUR SUPERVISOR:
 * 1. A* ALGORITHM FOUNDATION:
 *    - An informed search algorithm that uses both actual cost from the origin (G)
 *      and an admissible heuristic estimate to the goal (H).
 * 
 * 2. COST FORMULAS:
 *    - G Cost: The distance from the starting node to the current node.
 *    - H Cost (Heuristic): Manhattan distance to the destination:
 *      H = |current.col - goal.col| + |current.row - goal.row|
 *    - F Cost: Total estimated cost of path through node:
 *      F = G + H
 * 
 * 3. NODE EXPANSION:
 *    - Evaluates 4-directional adjacent neighbors (up, left, down, right).
 *    - Always picks the node with the lowest F cost (or lowest G on tie).
 * 
 * 4. PATH RECONSTRUCTION (Backtracking):
 *    - Once goalNode is reached, it traces back each node's `parent` pointer
 *      to construct the step-by-step path backwards to the start.
 * ============================================================================
 */
public class PathFinder {

    GamePanel gp;
    Node[][] node;
    // Nodes currently discovered and awaiting evaluation
    ArrayList<Node> openList = new ArrayList<>();
    // The final step-by-step solution path
    public ArrayList<Node> pathList = new ArrayList<>();
    Node startNode, goalNode, currentNode;
    boolean goalReached = false;
    int step = 0;

    public PathFinder(GamePanel gp) {
        this.gp = gp;
        instantiateNodes();
    }

    /**
     * Creates the 2D grid of search nodes matching the world map tile dimensions.
     */
    public void instantiateNodes() {
        node = new Node[gp.maxWorldCol][gp.maxWorldRow];
        int col = 0;
        int row = 0;
        while (col < gp.maxWorldCol && row < gp.maxWorldRow) {
            node[col][row] = new Node(col, row);
            col++;
            if (col == gp.maxWorldCol) {
                col = 0;
                row++;
            }
        }
    }

    /**
     * Resets previous search data (costs, open/checked flags, path list).
     */
    public void resetNodes() {
        int col = 0;
        int row = 0;
        while (col < gp.maxWorldCol && row < gp.maxWorldRow) {
            node[col][row].open = false;
            node[col][row].checked = false;
            node[col][row].solid = false;
            col++;
            if (col == gp.maxWorldCol) {
                col = 0;
                row++;
            }
        }
        openList.clear();
        pathList.clear();
        goalReached = false;
        step = 0;
    }

    /**
     * ========================================================================
     * METHOD: setNodes()
     * ========================================================================
     * Initializes start and goal positions, marks solid collision tiles and
     * obstacles, and calculates initial G, H, and F costs for the grid.
     * ========================================================================
     */
    public void setNodes(int startCol, int startRow, int goalCol, int goalRow) {
        resetNodes();

        startNode = node[startCol][startRow];
        currentNode = startNode;
        goalNode = node[goalCol][goalRow];
        openList.add(currentNode);

        int col = 0;
        int row = 0;

        while (col < gp.maxWorldCol && row < gp.maxWorldRow) {
            // Check solid impassable map terrain tiles (water, walls, trees)
            int tileNum = gp.tileM.mapTileNum[gp.currentMap][col][row];
            if (gp.tileM.tile[tileNum].collision) {
                node[col][row].solid = true;
            }

            // Check interactive destructible tiles
            for (int i = 0; i < gp.iTile[1].length; i++) {
                if (gp.iTile[gp.currentMap][i] != null && gp.iTile[gp.currentMap][i].destructible) {
                    int itCol = gp.iTile[gp.currentMap][i].worldX / gp.tileSize;
                    int itRow = gp.iTile[gp.currentMap][i].worldY / gp.tileSize;
                    node[itCol][itRow].solid = true;
                }
            }

            // Calculate heuristic costs
            getCost(node[col][row]);
            col++;
            if (col == gp.maxWorldCol) {
                col = 0;
                row++;
            }
        }
    }

    /**
     * Calculates G cost, H cost (Manhattan Distance), and F cost.
     */
    public void getCost(Node node) {
        // G Cost: Distance from start node
        int xDistance = Math.abs(node.col - startNode.col);
        int yDistance = Math.abs(node.row - startNode.row);
        node.gCost = xDistance + yDistance;

        // H Cost: Manhattan distance heuristic to goal node
        xDistance = Math.abs(node.col - goalNode.col);
        yDistance = Math.abs(node.row - goalNode.row);
        node.hCost = xDistance + yDistance;

        // F Cost: Total estimated evaluation score
        node.fCost = node.gCost + node.hCost;
    }

    /**
     * ========================================================================
     * METHOD: search() - THE CORE A* LOOP
     * ========================================================================
     * Iteratively explores lowest-cost nodes until goalNode is found or step limit
     * (500 iterations) is exceeded to guarantee steady frame rates.
     * ========================================================================
     */
    public boolean search() {
        while (!goalReached && step < 500) {
            int col = currentNode.col;
            int row = currentNode.row;

            currentNode.checked = true;
            openList.remove(currentNode);

            // Explore 4-directional adjacent neighbors
            if (row - 1 >= 0) openNode(node[col][row - 1]); // UP
            if (col - 1 >= 0) openNode(node[col - 1][row]); // LEFT
            if (row + 1 < gp.maxWorldRow) openNode(node[col][row + 1]); // DOWN
            if (col + 1 < gp.maxWorldCol) openNode(node[col + 1][row]); // RIGHT

            // Select the open node with the lowest F cost
            int bestNodeIndex = 0;
            int bestNodefCost = 999;

            for (int i = 0; i < openList.size(); i++) {
                if (openList.get(i).fCost < bestNodefCost) {
                    bestNodeIndex = i;
                    bestNodefCost = openList.get(i).fCost;
                } else if (openList.get(i).fCost == bestNodefCost) {
                    // Tie-breaker: prioritize node closer to start (lower G)
                    if (openList.get(i).gCost < openList.get(bestNodeIndex).gCost) {
                        bestNodeIndex = i;
                    }
                }
            }

            if (openList.size() == 0) break;

            currentNode = openList.get(bestNodeIndex);
            if (currentNode == goalNode) {
                goalReached = true;
                trackThePath();
            }
            step++;
        }
        return goalReached;
    }

    /**
     * Marks candidate neighbor nodes as open and sets their parent link.
     */
    public void openNode(Node node) {
        if (!node.open && !node.checked && !node.solid) {
            node.open = true;
            node.parent = currentNode;
            openList.add(node);
        }
    }

    /**
     * ========================================================================
     * METHOD: trackThePath()
     * ========================================================================
     * Backtracks from the goal node via parent pointers to build pathList.
     * ========================================================================
     */
    public void trackThePath() {
        Node current = goalNode;
        while (current != startNode) {
            pathList.add(0, current);
            current = current.parent;
        }
    }
}
