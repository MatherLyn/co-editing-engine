import Range from "./range";
import Segment from "./segment";

export interface INode {
    subTreeRange: Range;
    parent: INode | null;
    prev: INode | null;
    next: INode | null;
    calcSubTreeRange: Range;
};

export default abstract class SplayTree {
    protected root: INode | null;

    public constructor() {
        this.root = null;
    }

    public splayNode(node: INode): void {
        if (!node) return;

        while (true) {
            if (this.isNodeLeftChild(this.getParent(node)) && this.isNodeRightChild(node)) { // zig-zag
                this.rotateNodeLeft(node);
                this.rotateNodeRight(node);
            } else if (this.isNodeRightChild(this.getParent(node)) && this.isNodeLeftChild(node)) { // zig-zag
                this.rotateNodeRight(node);
                this.rotateNodeLeft(node);
            } else if (this.isNodeLeftChild(this.getParent(node)) && this.isNodeLeftChild(node)) { // zig-zig
                this.rotateNodeRight(this.getParent(node));
                this.rotateNodeRight(node);
            } else if (this.isNodeRightChild(this.getParent(node)) && this.isNodeRightChild(node)) { // zig-zig
                this.rotateNodeLeft(this.getParent(node));
                this.rotateNodeLeft(node);
            } else { // zig
                if (this.isNodeLeftChild(node)) {
                    this.rotateNodeRight(node);
                } else if (this.isNodeRightChild(node)) {
                    this.rotateNodeLeft(node);
                }

                return;
            }
        }
    }

    protected getParent(node: INode | null): INode | null { return node ? node.parent : null; }

    protected setParent(node: INode | null, target: INode | null): INode | null { return node && (node.parent = target); }

    protected getLeft(node: INode | null): INode | null { return node ? node.prev : null; }

    protected setLeft(node: INode | null, target: INode | null): INode | null { return node && (node.prev = target); }

    protected getRight(node: INode | null): INode | null { return node ? node.next : null; }

    protected setRight(node: INode | null, target: INode | null): INode | null { return node && (node.next = target); }

    protected updateSubtreeExtent(node: INode | null) {
        if (!node) return;

        (node as Segment).updateSubTreeRange();
    }

    protected rotateNodeLeft(pivot: INode | null): void {
        const root = this.getParent(pivot);
        if (this.getParent(root)) {
            if (root === this.getLeft(this.getParent(root))) {
                this.setLeft(this.getParent(root), pivot);
            } else {
                this.setRight(this.getParent(root), pivot);
            }
        } else {
            this.root = pivot;
        }
        this.setParent(pivot, this.getParent(root));

        this.setRight(root, this.getLeft(pivot));
        if (this.getRight(root)) this.setParent(this.getRight(root), root);

        this.setLeft(pivot, root);
        this.setParent(this.getLeft(pivot), pivot);

        this.updateSubtreeExtent(root);
        this.updateSubtreeExtent(pivot);
    }

    protected rotateNodeRight(pivot: INode | null): void {
        const root = this.getParent(pivot);
        if (this.getParent(root)) {
            if (root === this.getLeft(this.getParent(root))) {
                this.setLeft(this.getParent(root), pivot);
            } else {
                this.setRight(this.getParent(root), pivot);
            }
        } else {
            this.root = pivot;
        }
        this.setParent(pivot, this.getParent(root));

        this.setLeft(root, this.getRight(pivot));
        if (this.getLeft(root)) this.setParent(this.getLeft(root), root);

        this.setRight(pivot, root);
        this.setParent(this.getRight(pivot), pivot);

        this.updateSubtreeExtent(root);
        this.updateSubtreeExtent(pivot);
    }

    protected isNodeLeftChild(node: INode | null | null): boolean {
        return node != null && this.getParent(node) != null && this.getLeft(this.getParent(node)) === node;
    }

    protected isNodeRightChild(node: INode | null | null): boolean {
        return node !== null && this.getParent(node) !== null && this.getRight(this.getParent(node)) === node;
    }

    protected getSuccessor(node: INode): INode | null {
        let res: INode | null;
        if (this.getRight(node)) {
            res = this.getRight(node);
            while (this.getLeft(node)) {
                res = this.getLeft(node);
            }
        } else {
            while (this.getParent(node) && this.getRight(this.getParent(node)) === node) {
                res = this.getParent(node);
            }
            res = this.getParent(node);
        }
        return node;
    }
}