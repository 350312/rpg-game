package ai;

/**
 * ============================================================================
 * CLASS: Node
 * ============================================================================
 * ROLE: Represents a single tile cell in the A* pathfinding search space.
 * 
 * KEY FIELDS TO EXPLAIN TO YOUR SUPERVISOR:
 * - parent: Pointer to the previous node on the shortest path (for backtracking).
 * - col, row: Grid tile coordinates on the map.
 * - gCost: Accumulated travel cost from start node.
 * - hCost: Heuristic estimate (Manhattan distance) to destination.
 * - fCost: Total evaluated cost (gCost + hCost).
 * - solid: Whether this tile blocks movement (water, wall, tree, etc.).
 * - open: Whether this node is currently in the exploration priority queue.
 * - checked: Whether this node has already been evaluated and closed.
 * ============================================================================
 */
public class Node {

    Node parent;
    public int col;
    public int row;
    int gCost;
    int hCost;
    int fCost;
    boolean solid;
    boolean open;
    boolean checked;

    public Node(int col, int row) {
        this.col = col;
        this.row = row;
    }
}
