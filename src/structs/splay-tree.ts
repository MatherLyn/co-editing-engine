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

    protected abstract updateSubTreeRange(node: INode | null): void;
    
    protected abstract updateRange(node: INode | null): void;

    protected getParent(node: INode | null): INode | null { return node ? node.parent : null; }

    protected setParent(node: INode | null, target: INode | null): INode | null { return node && (node.parent = target); }

    protected getLeft(node: INode | null): INode | null { return node ? node.prev : null; }

    protected setLeft(node: INode | null, target: INode | null): INode | null { return node && (node.prev = target); }

    protected getRight(node: INode | null): INode | null { return node ? node.next : null; }

    protected setRight(node: INode | null, target: INode | null): INode | null { return node && (node.next = target); }

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
    }

    protected isNodeLeftChild(node: INode | null | null): boolean {
        return node !== null && this.getParent(node) !== null && this.getLeft(this.getParent(node)) === node;
    }

    protected isNodeRightChild(node: INode | null | null): boolean {
        return node !== null && this.getParent(node) !== null && this.getRight(this.getParent(node)) === node;
    }

    public getSuccessor(node: INode): INode | null {
        let res: INode | null;
        if (this.getRight(node)) {
            res = this.getRight(node);
            while (this.getLeft(res)) {
                res = this.getLeft(res);
            }
        } else {
            res = node;
            while (this.getParent(res) && this.getRight(this.getParent(res)) === res) {
                res = this.getParent(res);
            }
            res = this.getParent(res);
        }
        return res;
    }

    public getPredecessor(node: INode): INode | null {
        let res: INode | null;
        if (this.getLeft(node)) {
            res = this.getLeft(node);
            while (this.getRight(res)) {
                res = this.getRight(res);
            }
        } else {
            res = node;
            while (this.getParent(res) && this.getLeft(this.getParent(res)) === res) {
                res = this.getParent(res);
            }
            res = this.getParent(res);
        }
        return res;
    }
}